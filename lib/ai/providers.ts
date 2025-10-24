import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { customProvider } from "ai";
import { isTestEnvironment } from "../constants";

// 创建4个独立的OpenAI兼容客户端实例
const chatModel1Client = createOpenAICompatible({
  name: "chat-model-1",
  baseURL: process.env.CHAT_MODEL_1_BASE_URL || "",
  apiKey: process.env.CHAT_MODEL_1_API_KEY || "",
});

const chatModel2Client = createOpenAICompatible({
  name: "chat-model-2",
  baseURL: process.env.CHAT_MODEL_2_BASE_URL || "",
  apiKey: process.env.CHAT_MODEL_2_API_KEY || "",
});

const titleModelClient = createOpenAICompatible({
  name: "title-model",
  baseURL: process.env.TITLE_MODEL_BASE_URL || "",
  apiKey: process.env.TITLE_MODEL_API_KEY || "",
});

const artifactModelClient = createOpenAICompatible({
  name: "artifact-model",
  baseURL: process.env.ARTIFACT_MODEL_BASE_URL || "",
  apiKey: process.env.ARTIFACT_MODEL_API_KEY || "",
});

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        "chat-model-1": chatModel1Client.chatModel(
          process.env.CHAT_MODEL_1_NAME || "gpt-4"
        ),
        "chat-model-2": chatModel2Client.chatModel(
          process.env.CHAT_MODEL_2_NAME || "gpt-3.5-turbo"
        ),
        "chat-model": chatModel1Client.chatModel(
          process.env.CHAT_MODEL_1_NAME || "gpt-4"
        ),
        "chat-model-reasoning": chatModel2Client.chatModel(
          process.env.CHAT_MODEL_2_NAME || "gpt-4"
        ),
        "title-model": titleModelClient.chatModel(
          process.env.TITLE_MODEL_NAME || "gpt-3.5-turbo"
        ),
        "artifact-model": artifactModelClient.chatModel(
          process.env.ARTIFACT_MODEL_NAME || "gpt-4"
        ),
      },
    });
