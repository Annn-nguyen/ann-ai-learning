import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
///import the model
import { ChatOpenAI } from "@langchain/openai";
const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0
});
import { z } from "zod";
(async () => {
    const joke = z.object({
        setup: z.string().describe("The setup of the joke"),
        punchline: z.string().describe("The punchline to the joke"),
        rating: z.number().optional().describe("How funny the joke is, from 1 to 10"),
    });
    console.log("Schema defined");
    const structuredLlm = model.withStructuredOutput(joke);
    console.log("Model created");
    try {
        const result = await structuredLlm.invoke("Tell me a joke about cats");
        console.log(result);
    }
    catch (error) {
        console.error("Error invoking the model:", error);
    }
})();
