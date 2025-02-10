import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0
});

(async () => {
    const stream = await model.stream("Hello, tell me a joke about cats");
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
        console.log(`${chunk.content}`);
    };
    console.log("Raw chunks: ", chunks);
})();

