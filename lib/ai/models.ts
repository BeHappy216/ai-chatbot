export const DEFAULT_CHAT_MODEL: string = "dify_nosystem";

export type ChatModel = {
  id: string;

  name: string;
  provider: string;
  description: string;
  multimodal: boolean;
  suggestions?: readonly string[];
};

export const chatModels: ChatModel[] = [
  // User Custom Models
  {
    id: "dify_nosystem",
    name: "小书童",
    provider: "dify",
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
    provider: "openai",
    description: "用文集训练的大语言模型",
    multimodal: false,
    suggestions: [
      "如何提高工作效率？",
      "推荐一些学习资源",
      "解释一下这个概念",
      "帮我分析这个问题",
    ] as const,
  },
  // Upstream models
  {
    id: "anthropic/claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    description: "Fast and affordable, great for everyday tasks",
    multimodal: true,
  },
  {
    id: "anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    description: "Best balance of speed, intelligence, and cost",
    multimodal: true,
  },
  {
    id: "anthropic/claude-opus-4.5",
    name: "Claude Opus 4.5",
    provider: "anthropic",
    description: "Most capable Anthropic model",
    multimodal: true,
  },
  // OpenAI
  {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "openai",
    description: "Fast and cost-effective for simple tasks",
    multimodal: true,
  },
  {
    id: "openai/gpt-5.2",
    name: "GPT-5.2",
    provider: "openai",
    description: "Most capable OpenAI model",
    multimodal: true,
  },
  // Google
  {
    id: "google/gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    provider: "google",
    description: "Ultra fast and affordable",
    multimodal: true,
  },
  {
    id: "google/gemini-3-pro-preview",
    name: "Gemini 3 Pro",
    provider: "google",
    description: "Most capable Google model",
    multimodal: true,
  },
  // xAI
  {
    id: "xai/grok-4.1-fast-non-reasoning",
    name: "Grok 4.1 Fast",
    provider: "xai",
    description: "Fast with 30K context",
    multimodal: false,
  },
  // Reasoning models (extended thinking)
  {
    id: "anthropic/claude-3.7-sonnet-thinking",
    name: "Claude 3.7 Sonnet",
    provider: "reasoning",
    description: "Extended thinking for complex problems",
    multimodal: true,
  },
  {
    id: "xai/grok-code-fast-1-thinking",
    name: "Grok Code Fast",
    provider: "reasoning",
    description: "Reasoning optimized for code",
    multimodal: false,
  },
];

// Group models by provider for UI
export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
