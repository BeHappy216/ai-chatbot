import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { customProvider } from "ai";
import { isTestEnvironment } from "../constants";
import { difyLanguageModel } from "./dify";

// 创建独立的OpenAI兼容客户端实例

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

const THINKING_SUFFIX_REGEX = /-thinking$/;

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
        ...(difyLanguageModel && { dify_nosystem: difyLanguageModel as any }),
        "chat-model-2": chatModel2Client(
          process.env.CHAT_MODEL_2_NAME || "gpt-3.5-turbo"
        ) as any,
        "chat-model-reasoning": chatModel2Client(
          process.env.CHAT_MODEL_2_NAME || "gpt-4"
        ) as any,
        "title-model": titleModelClient(
          process.env.TITLE_MODEL_NAME || "gpt-3.5-turbo"
        ) as any,
        "artifact-model": artifactModelClient(
          process.env.ARTIFACT_MODEL_NAME || "gpt-4"
        ) as any,
      },
    });

export function getLanguageModel(modelId: string) {
  // Always use myProvider for custom setup
  return myProvider.languageModel(modelId);
}

export function getTitleModel() {
  return myProvider.languageModel("title-model");
}

export function getArtifactModel() {
  return myProvider.languageModel("artifact-model");
}
