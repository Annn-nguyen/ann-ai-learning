import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });


import { ChatOpenAI } from "@langchain/openai";
const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0
});

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { HumanMessage } from "@langchain/core/messages";

// Define the definition of tool input

const calculatorSchema = z.object({
    operation: z
        .enum(["add", "subtract", "multiply", "divide"])
        .describe("The type of operation to executre"),
    number1: z.number().describe("The first number to operate on"),
    number2: z.number().describe("The second number to operate on"),
});

const calculatorTool = tool(
    async ({ operation, number1, number2 }) => {
        switch (operation) {
            case "add":
                return number1 + number2;
            case "subtract":
                return number1 - number2;
            case "multiply":
                return number1 * number2;
            case "divide":
                return number1 / number2;
            default:
                throw new Error("Invalid operation");
        }
    },
    {
        name: "calculator",
        description: "A simple calculator tool",
        schema: calculatorSchema,
    }
);
console.log("Tool defined");

const llmWithTools = llm.bindTools([calculatorTool]);
console.log("Tool binded to model");
(async () => {

    
    const messages = [new HumanMessage("help me calculate 1546/23")];
    const aiMessage = await llmWithTools.invoke(messages);
    console.log(aiMessage);
    messages.push(aiMessage);
   
    const toolsByName = {
        calculator: calculatorTool
    };
    for (const toolCall of aiMessage.tool_calls) {
        const selectedTool = toolsByName[toolCall.name];
        const toolMessage = await selectedTool.invoke(toolCall);
        console.log("Tool msg returned: ",toolMessage);
        messages.push(toolMessage);
    };

    const newAiMessage = await llmWithTools.invoke(messages);
    console.log("Final:",newAiMessage);
})();

