import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
    path: path.resolve(__dirname, '../', '.env'),
});

import { END, START, StateGraph, Annotation, Send } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import {z} from "zod";

(async () => {
    const llm = new ChatOpenAI( {
        model: "gpt-4o-mini",
        temperature: 0
    });

    const defineDeckPrompt = "Based on the {question}, define the deck: positions (3-5 cards user can draw to get the answer), greeting (greet the user and explain the cards to draw) and call function getCardsDrawn";
    const getCardsDrawn = "Generate card for each position in {positions}";
    const readCardsdPrompt = "Based on the {question} and {cardsDrawn}, provide the tarot reading for each card drawn";

    const DeckDefine = z.object({
        positions: z.array(z.string()).describe("Array of positions for the tarot reading, based on the question of the user"),
        greeting: z.string().describe("Greeting message to the user, explaining the positions and cards to draw"),
    });

    const CardsDrawn = z.array(z.object({
        position: z.string().describe("Position of the card drawn"),
        card: z.string().describe("Name of the card drawn"),
    }));

    const CardReading = z.array(z.object({
            card: z.string().describe("Name of the card drawn"),
            position: z.string().describe("Position of the card drawn"),
            reading: z.string().describe("Reading of the card drawn"),
        }),
    );

    const OverallState = Annotation.Root({
        question: Annotation<string>,
        positions: Annotation<string[]>,
        cardsDrawn: Annotation<object[]>,
        reading: Annotation<object[]>,
    });

    interface ReadingState {
        state: string;
    };


    //define node to define cards to draw based on question
    const defineCards = async(state: typeOf OverallState.State) : Promise<Partial<typeOf OverallState.State>> => {
        const prompt = defineCardsPrompt.replace("{question}", State.question);
        const response = await llm.withStructuredOutput(CardDefined, { name : "positions"} ).invoke(prompt);
        console.log("Output of defineCards node",response);
        return { positions: response.positions};
    } ;

    //define a node to automatically draw cards based on question and cards to draw
    const getCardsDrawn = async(state: DrawingCard) : Promise<{cardsDrawn: object[]}> => {
        const prompt = generateCardsDrawn.replace("{positions}", state.positions);
        const response = await llm.withStructuredOutput(CardsDrawn, {name: "cardsDrawn"}).invoke(prompt);
        console.log("Output of getCardsDrawn node", response);
        return { cardsDrawn: response };
    };

    //define node to read cards based on question and cards drawn
    const readCards = async(state: ReadingState) : Promise<{reading: object[]}> => {
        const prompt = readCardsPrompt.replace("{cardsDrawn}", state.cardsDrawn);
        const response = await llm.withStructuredOutput(CardReading, {name: "reading"}).invoke(prompt);
        return { reading: response };
    };

})