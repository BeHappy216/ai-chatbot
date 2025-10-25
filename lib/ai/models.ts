export const DEFAULT_CHAT_MODEL: string = "chat-model-1";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
  multimodal: boolean;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model-1",
    name: "聊天模型 1", // 根据您的实际模型命名
    description: "主要聊天模型,适合复杂对话",
    multimodal: true,
  },
  {
    id: "chat-model-2",
    name: "聊天模型 2", // 根据您的实际模型命名
    description: "快速响应模型,适合简单对话",
    multimodal: false,
  },
];
