export const DEFAULT_CHAT_MODEL: string = "dify_nosystem";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
  multimodal: boolean;
  suggestions?: readonly string[];
};

export const chatModels: ChatModel[] = [
  {
    id: "dify_nosystem",
    name: "小书童",
    description: "对讲集提问",
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
    name: "AI朱老师",
    description: "用文集训练的大语言模型",
    multimodal: false,
    suggestions: [
      "如何提高工作效率？",
      "推荐一些学习资源",
      "解释一下这个概念",
      "帮我分析这个问题",
    ] as const,
  },
];
