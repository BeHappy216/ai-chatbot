import { createDifyProvider } from "dify-ai-provider";

// 初始化 Dify Provider 工厂
// 如果设置了 DIFY_BASE_URL 环境变量，它将被用于自托管的 Dify 实例
const difyProviderFactory = createDifyProvider({
  baseURL: process.env.DIFY_BASE_URL,
});

if (!process.env.NEXT_PUBLIC_DIFY_APP_ID) {
  console.warn(
    "Dify provider is not configured, missing NEXT_PUBLIC_DIFY_APP_ID."
  );
}

// 创建并导出 Dify 语言模型实例
// DIFY_API_KEY 会被自动从环境变量中读取
export const difyLanguageModel = process.env.NEXT_PUBLIC_DIFY_APP_ID
  ? difyProviderFactory(process.env.NEXT_PUBLIC_DIFY_APP_ID, {
      // Dify 支持 'streaming' 和 'blocking' 两种模式
      responseMode: "streaming",
    })
  : undefined;
