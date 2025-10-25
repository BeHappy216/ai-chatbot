export const DEFAULT_CHAT_MODEL: string = "chat-model-1";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
  multimodal: boolean;
  suggestions?: readonly string[];
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model-1",
    name: "聊天模型 1",
    description: "主要聊天模型,适合复杂对话",
    multimodal: true,
    suggestions: [
      "什么是四念住？",
      "什么是不死之心？",
      "解脱道修行的次第",
      "如何应用我是觉知",
    ] as const,
  },
  {
    id: "chat-model-2",
    name: "聊天模型 2",
    description: "快速响应模型,适合简单对话",
    multimodal: false,
    suggestions: [
      "如何提高工作效率？",
      "推荐一些学习资源",
      "解释一下这个概念",
      "帮我分析这个问题",
    ] as const,
  },
];
