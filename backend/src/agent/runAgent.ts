import OpenAI from "openai";
import type { Context } from "../types";
import { elasticMCP } from "./tools";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources.js";
import { SYSTEM_PROMPT } from "./prompt";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});
const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
const mcp_tools = await elasticMCP.listTools();

const tools: ChatCompletionTool[] = mcp_tools.map((tool) => ({
  type: "function",
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema,
    strict: true,
  },
}));
export async function runAgent(context: any) {
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: JSON.stringify(context) },
  ];
  while (true) {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages,
      tools,
    });
    const choice = await response.choices[0];

    if (!choice || !choice.message) {
      throw Error("something wents wrong");
    }
    messages.push(choice?.message);
    if (choice?.finish_reason === "stop") return choice.message.content;

    if (choice?.finish_reason === "tool_calls") {
      for (const tool of choice.message.tool_calls ?? []) {
        if (tool && "function" in tool) {
          const { name, arguments: args } = tool.function;
          console.log(`calling a tool: ${name}`);

          let toolResult;
          try {
            const parsed = JSON.parse(args);
            toolResult = await elasticMCP.callTool(name, parsed);
          } catch (error) {
            toolResult = `error calling tool: ${name}  - ${error instanceof Error ? error.message : String(error)}`;
          }
          console.log(toolResult);
          messages.push({
            role: "tool",
            tool_call_id: tool.id,
            content: toolResult,
          });
        }
      }
    }
  }
}
