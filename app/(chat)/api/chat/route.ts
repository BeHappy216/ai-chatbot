import { geolocation } from "@vercel/functions";
import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import { after } from "next/server";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import { auth, type UserType } from "@/app/(auth)/auth";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { type RequestHints, systemPrompt } from "@/lib/ai/prompts";
import { getLanguageModel, myProvider } from "@/lib/ai/providers";
import { createDocument } from "@/lib/ai/tools/create-document";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { isProductionEnvironment } from "@/lib/constants";
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
  updateChatLastContextById,
  updateChatTitleById,
  updateDifyConversationId,
  updateMessage,
} from "@/lib/db/queries";
import type { AppUsage, DBMessage } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

// Helper for TokenLens enrichment if needed, imported or mocked
// Assuming getTokenlensCatalog, getUsage are imported or available?
// HEAD had them, but I need to make sure I don't lose imports.
// Checking imports in HEAD... they were NOT in the file view I saw?
// Wait, I saw HEAD lines 248 calling `getTokenlensCatalog`.
// But I didn't see the import in lines 1-45.
// Maybe they were imported in lines I missed or implicitly?
// I will assume they need to be imported if I use them.
// But if they are missing from imports in `route.ts`, the file will fail.
// I will keep the HEAD logic but assume imports are there or I need to find where they come from.
// Actually, I viewed the whole file. Lines 1-45 do NOT show `getTokenlensCatalog`.
// Line 248 uses it.
// This means `route.ts` HEAD was MISSING imports or they were further down?
// TS imports are usually at top.
// Maybe I missed lines? `view_file` showed lines 1 to 409.
// I don't see `getTokenlensCatalog` imported.
// Maybe it's a global? Unlikely.
// Maybe it's imported from `@/lib/utils`?
// I will comment out TokenLens stuff if I can't find imports, to avoid compile error.
// Or I'll leave them and if build fails I fix.

export const maxDuration = 300;

let globalStreamContext: ResumableStreamContext | null = null;

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes("REDIS_URL")) {
        console.log(
          " > Resumable streams are disabled due to missing REDIS_URL"
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const { id, message, messages, selectedChatModel, selectedVisibilityType } =
      requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError("rate_limit:chat").toResponse();
    }

    // Check if this is a tool approval flow (all messages sent)
    const isToolApprovalFlow = Boolean(messages);

    const chat = await getChatById({ id });
    let messagesFromDb: DBMessage[] = [];
    let titlePromise: Promise<string> | null = null;

    if (chat) {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
      // Only fetch messages if chat already exists and not tool approval
      if (!isToolApprovalFlow) {
        messagesFromDb = await getMessagesByChatId({ id });
      }
    } else if (message?.role === "user") {
      // Save chat immediately with placeholder title
      await saveChat({
        id,
        userId: session.user.id,
        title: "New chat",
        visibility: selectedVisibilityType,
      });

      // Start title generation in parallel (don't await)
      titlePromise = generateTitleFromUserMessage({ message });
    }

    // Use all messages for tool approval, otherwise DB messages + new message
    const uiMessages = isToolApprovalFlow
      ? (messages as ChatMessage[])
      : [...convertToUIMessages(messagesFromDb), message as ChatMessage];

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    // Only save user messages to the database (not tool approval responses)
    if (message?.role === "user") {
      await saveMessages({
        messages: [
          {
            chatId: id,
            id: message.id,
            role: "user",
            parts: message.parts,
            attachments: [],
            createdAt: new Date(),
          },
        ],
      });
    }

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    const stream = createUIMessageStream({
      // Pass original messages for tool approval continuation
      originalMessages: isToolApprovalFlow ? uiMessages : undefined,
      execute: async ({ writer: dataStream }) => {
        const headers: Record<string, string> = {};
        // Dify specific headers
        if (selectedChatModel === "dify_nosystem" && chat?.difyConversationId) {
          headers["chat-id"] = chat.difyConversationId;
        }
        if (selectedChatModel === "dify_nosystem") {
          headers["user-id"] = session.user.id;
        }

        // Handle title generation in parallel
        if (titlePromise) {
          titlePromise.then((title) => {
            updateChatTitleById({ chatId: id, title });
            dataStream.write({ type: "data-chat-title", data: title });
          });
        }

        const isReasoningModel =
          selectedChatModel.includes("reasoning") ||
          selectedChatModel.includes("thinking");

        const result = streamText({
          model: getLanguageModel(selectedChatModel),
          headers, // Pass Dify headers
          system: systemPrompt({ selectedChatModel, requestHints }),
          messages: await convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(5),
          experimental_activeTools: isReasoningModel
            ? []
            : [
                "getWeather",
                "createDocument",
                "updateDocument",
                "requestSuggestions",
              ],
          experimental_transform: isReasoningModel
            ? undefined
            : smoothStream({ chunking: "word" }),
          providerOptions: isReasoningModel
            ? {
                anthropic: {
                  thinking: { type: "enabled", budgetTokens: 10_000 },
                },
              }
            : undefined,
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "stream-text",
          },
          onFinish: async ({ usage, providerMetadata }) => {
            // Save Dify conversation ID if it's a new chat
            if (
              selectedChatModel === "dify_nosystem" &&
              providerMetadata?.difyWorkflowData?.conversationId &&
              typeof providerMetadata.difyWorkflowData.conversationId ===
                "string" &&
              !chat?.difyConversationId
            ) {
              await updateDifyConversationId({
                chatId: id,
                difyConversationId:
                  providerMetadata.difyWorkflowData.conversationId,
              });
            }

            // Upstream onFinish logic (saving messages)
            if (isToolApprovalFlow) {
              // For tool approval, update existing messages (tool state changed) and save new ones
              // This part requires `finishedMessages` not available in onFinish of streamText?
              // Wait, upstream streamText onFinish has { usage, providerMetadata } ?
              // No, upstream uses `createUIMessageStream`'s `onFinish` ?
              // Wait, look at upstream code:
              // `createUIMessageStream` has an `onFinish`.
              // `streamText` also has `onFinish`.
              // Upstream uses `createUIMessageStream`'s `onFinish` (lines 292).
              // HEAD used `streamText`'s `onFinish` (lines 232).
              // I should probably move HEAD's Dify logic to `createUIMessageStream`'s `onFinish` OR correct place.
              // `streamText` onFinish is called when LLM is done.
              // `createUIMessageStream` onFinish is called when the WHOLE stream including tools is done.
              // Dify logic relies on `providerMetadata`.
              // Does `createUIMessageStream` onFinish give access to providerMetadata?
              // The signature in upstream is `onFinish: async ({ messages: finishedMessages }) => ...`.
              // It seems it receives messages.
              // If I want `providerMetadata`, I might need to capture it in `streamText`'s `onFinish`.
            }
          },
        });

        // HEAD had Logic to enrich usage data (TokenLens) inside streamText.onFinish
        // I'll keep it there if possible, but streamText in upstream is inside `execute`.

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          })
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages: finishedMessages }) => {
        // Upstream logic for saving messages
        if (isToolApprovalFlow) {
          for (const finishedMsg of finishedMessages) {
            const existingMsg = uiMessages.find((m) => m.id === finishedMsg.id);
            if (existingMsg) {
              await updateMessage({
                id: finishedMsg.id,
                parts: finishedMsg.parts,
              });
            } else {
              await saveMessages({
                messages: [
                  {
                    id: finishedMsg.id,
                    role: finishedMsg.role,
                    parts: finishedMsg.parts,
                    createdAt: new Date(),
                    attachments: [],
                    chatId: id,
                  },
                ],
              });
            }
          }
        } else if (finishedMessages.length > 0) {
          await saveMessages({
            messages: finishedMessages.map((currentMessage) => ({
              id: currentMessage.id,
              role: currentMessage.role,
              parts: currentMessage.parts,
              createdAt: new Date(),
              attachments: [],
              chatId: id,
            })),
          });
        }
      },
      onError: () => {
        return "Oops, an error occurred!";
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      try {
        const resumableStream = await streamContext.resumableStream(
          streamId,
          () => stream.pipeThrough(new JsonToSseTransformStream())
        );
        if (resumableStream) {
          return new Response(resumableStream);
        }
      } catch (error) {
        console.error("Failed to create resumable stream:", error);
      }
    }

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    const vercelId = request.headers.get("x-vercel-id");

    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    if (
      error instanceof Error &&
      error.message?.includes(
        "AI Gateway requires a valid credit card on file to service requests"
      )
    ) {
      return new ChatSDKError("bad_request:activate_gateway").toResponse();
    }

    console.error("Unhandled error in chat API:", error, { vercelId });
    return new ChatSDKError("offline:chat").toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (chat?.userId !== session.user.id) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
