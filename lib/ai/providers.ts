import { createOpenAI } from "@ai-sdk/openai";
import { customProvider } from "ai";
import { isTestEnvironment } from "../constants";

// 创建4个独立的OpenAI客户端实例
const chatModel1Client = createOpenAI({
  baseURL: process.env.CHAT_MODEL_1_BASE_URL,
  apiKey: process.env.CHAT_MODEL_1_API_KEY,
});

const chatModel2Client = createOpenAI({
  baseURL: process.env.CHAT_MODEL_2_BASE_URL,
  apiKey: process.env.CHAT_MODEL_2_API_KEY,
});

const titleModelClient = createOpenAI({
  baseURL: process.env.TITLE_MODEL_BASE_URL,
  apiKey: process.env.TITLE_MODEL_API_KEY,
});

const artifactModelClient = createOpenAI({
  baseURL: process.env.ARTIFACT_MODEL_BASE_URL,
  apiKey: process.env.ARTIFACT_MODEL_API_KEY,
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
        // 主聊天模型1
        "chat-model-1": chatModel1Client(
          process.env.CHAT_MODEL_1_NAME || "gpt-4"
        ),

        // 主聊天模型2
        "chat-model-2": chatModel2Client(
          process.env.CHAT_MODEL_2_NAME || "gpt-3.5-turbo"
        ),

        // 默认聊天模型(指向模型1)
        "chat-model": chatModel1Client(
          process.env.CHAT_MODEL_1_NAME || "gpt-4"
        ),

        // 推理模型(可选,如果不需要可以指向模型1或2)
        "chat-model-reasoning": chatModel2Client(
          process.env.CHAT_MODEL_2_NAME || "gpt-4"
        ),

        // 标题生成模型
        "title-model": titleModelClient(
          process.env.TITLE_MODEL_NAME || "gpt-3.5-turbo"
        ),

        // Artifact生成模型
        "artifact-model": artifactModelClient(
          process.env.ARTIFACT_MODEL_NAME || "gpt-4"
        ),
      },
    });
