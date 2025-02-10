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

import { StringOutputParser } from "@langchain/core/output_parsers";   
import { ChatPromptTemplate } from "@langchain/core/prompts";

// const prompt = ChatPromptTemplate.fromTemplate("Tell me a joke about {topic}");

// const parser = new StringOutputParser();

// const chain = prompt.pipe(model).pipe(parser);

// (async () => {
//     const stream = await chain.stream({
//         topic: "cats",
//     });
//     for await (const chunk of stream) {
//         console.log(`${chunk}|`);
//     };
// })();


//json no streaming

// import { JsonOutputParser } from "@langchain/core/output_parsers";
// const chain = model.pipe(new JsonOutputParser());

// (async() => {
//     const stream = await chain.stream( `Output a list of countries france, spain and jpana and their populations in json format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have a key "name" and "population".`);
//     for await (const chunk of stream) {
//         console.log(chunk);
//     }
// })();


//  A function that operates on finalized inputs 
// rather than on an input_stream

// A function that does not operate on input streams and breaks streaming

import { JsonOutputParser } from "@langchain/core/output_parsers";

const extractCountryNames = (inputs: Record<string, any>) => {
    if (!Array.isArray(inputs.countries)) {
      return "";
    }
    return JSON.stringify(inputs.countries.map((country) => country.name));
  };

const chain = model.pipe(new JsonOutputParser()).pipe(extractCountryNames);

(async() => {
    const stream = await chain.stream( `Output a list of countries france, spain and jpana and their populations in json format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have a key "name" and "population".`);
    for await (const chunk of stream) {
        console.log(chunk);
    };
})();
