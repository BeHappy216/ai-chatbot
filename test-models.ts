import { resolve } from "node:path";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { config } from "dotenv";

const envPath = resolve(process.cwd(), ".env");
console.log("Loading env from:", envPath);
const result = config({ path: envPath });

if (result.error) {
  console.error("Failed to load .env:", result.error);
} else {
  console.log("✅ .env loaded successfully");
}

async function testModels() {
  console.log("\n=== 测试模型配置 ===\n");

  console.log("1. 环境变量检查:");
  console.log("CHAT_MODEL_1_BASE_URL:", process.env.CHAT_MODEL_1_BASE_URL);
  console.log(
    "CHAT_MODEL_1_API_KEY:",
    process.env.CHAT_MODEL_1_API_KEY ? "✅ 已设置" : "❌ 未设置"
  );
  console.log("CHAT_MODEL_1_NAME:", process.env.CHAT_MODEL_1_NAME);
  console.log();

  // 测试模型1
  console.log("2. 测试聊天模型1...");
  try {
    const client1 = createOpenAICompatible({
      name: "test-model-1",
      baseURL: process.env.CHAT_MODEL_1_BASE_URL || "",
      apiKey: process.env.CHAT_MODEL_1_API_KEY || "",
    });

    const result1 = await generateText({
      model: client1.chatModel(process.env.CHAT_MODEL_1_NAME || "gpt-4"),
      prompt: "Say hello in 3 words",
    });

    console.log("✅ 模型1成功!");
    console.log("   响应:", result1.text);
  } catch (error: any) {
    console.log("❌ 模型1失败!");
    console.log("   错误:", error.message);
  }
  console.log();

  // 测试模型2
  console.log("3. 测试聊天模型2...");
  try {
    const client2 = createOpenAICompatible({
      name: "test-model-2",
      baseURL: process.env.CHAT_MODEL_2_BASE_URL || "",
      apiKey: process.env.CHAT_MODEL_2_API_KEY || "",
    });

    const result2 = await generateText({
      model: client2.chatModel(
        process.env.CHAT_MODEL_2_NAME || "gpt-3.5-turbo"
      ),
      prompt: "Say hello in 3 words",
    });

    console.log("✅ 模型2成功!");
    console.log("   响应:", result2.text);
  } catch (error: any) {
    console.log("❌ 模型2失败!");
    console.log("   错误:", error.message);
  }
  console.log();

  // 测试标题模型
  console.log("4. 测试标题模型...");
  try {
    const titleClient = createOpenAICompatible({
      name: "test-title-model",
      baseURL: process.env.TITLE_MODEL_BASE_URL || "",
      apiKey: process.env.TITLE_MODEL_API_KEY || "",
    });

    const result3 = await generateText({
      model: titleClient.chatModel(
        process.env.TITLE_MODEL_NAME || "gpt-3.5-turbo"
      ),
      prompt: "Say hello in 3 words",
    });

    console.log("✅ 标题模型成功!");
    console.log("   响应:", result3.text);
  } catch (error: any) {
    console.log("❌ 标题模型失败!");
    console.log("   错误:", error.message);
  }
  console.log();

  console.log("=== 测试完成 ===");
}

testModels().catch(console.error);

//npx tsx test-models.ts
