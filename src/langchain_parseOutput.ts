import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path: path.resolve(__dirname, "../.env")});

import { ChatOpenAI } from "@langchain/openai";
const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0
});


import {JsonOutputParser} from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

type Person = {
    name: string;
    height_in_cm: number;
};

type People = {
    people: Person[];
};

const formatInstructions = `Respond only in valid json. the json object you return should match this schema: {{people: [{{name: string, height_in_cm: number}}]}}
Where people is an array of objects, each with a name and height_in_cm field.`;

const parser = new JsonOutputParser<People>();

    const prompt = await ChatPromptTemplate.fromMessages([
       ["system",
        "Answer the user query. Wrap the output in json tag \n{format_instructions}",],
        ["human","{query}"],
    ]).partial({
        format_instructions: formatInstructions,
    });

const query = "Cara is 27 yo and she is 5 feet tall";
(async () => {
    ///const result = await prompt.format({query});
    ///console.log(result).toString();
    console.log((await prompt.format({ query })).toString());


})();
