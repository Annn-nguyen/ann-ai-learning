import path from "path";
import dotenv from "dotenv";

dotenv.config({
    path: path.resolve(__dirname, '../', '.env'),
});

import { END, START, StateGraph, Annotation, Send } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

(async () => {
    const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

    const subjectsPrompt = "Generate a comma separated list of between 2 and 5 examples related to: {topic}";
    const jokePrompt = "Generate a joke about {subject}";
    const bestJokePrompt = `Below are a bunch of jokes about {topic}. Select the best one! Return the ID (index) of
        {jokes}
    `;

    const Subjects = z.object({
        subjects: z.array(z.string()),
    });

    const Joke = z.object({
        joke: z.string(),
    });

    const BestJoke = z.object({
        id: z.number(),
    });

    const OverallState = Annotation.Root({
        topic: Annotation<string>,
        subjects: Annotation<string[]>,
        jokes: Annotation<string[]>({
            reducer: (state, update) => state.concat(update),
        }),
        bestSelectedJoke: Annotation<string>,
    })

    interface JokeState {
        subject: string;
    };

    const generateTopics = async (state: typeof OverallState.State): Promise<Partial<typeof OverallState.State>> => {
        const prompt = subjectsPrompt.replace("{topic}", state.topic);
        // @ts-ignore
        const response = await llm.withStructuredOutput(Subjects, { name: "subjects" }).invoke(prompt);
        return { subjects: response.subjects };
    };

    const generateJoke = async (state: JokeState): Promise<{ jokes: string[] }> => {
        const prompt = jokePrompt.replace("subject", state.subject);
        // @ts-ignore
        const response = await llm.withStructuredOutput(Joke, { name: "joke" }).invoke(prompt);
        return { jokes: [response.joke] };
    };

    const continueToJokes = (state: typeof OverallState.State) => {
        return state.subjects.map((subject) => new Send("generateJoke", { subject }));
    }

    const bestJoke = async (state: typeof OverallState.State): Promise<Partial<typeof OverallState.State>> => {
        const jokes = state.jokes.join("\n\n");
        const prompt = bestJokePrompt
            .replace("jokes", jokes)
            .replace("{topic}", state.topic);
        // @ts-ignore
        const response = await llm.withStructuredOutput(BestJoke, { name: "best_joke" }).invoke(prompt);
        return { bestSelectedJoke: state.jokes[response.id] };
    }

    const graph = new StateGraph(OverallState)
        .addNode("generateTopics", generateTopics)
        .addNode("generateJoke", generateJoke)
        .addNode("bestJoke", bestJoke)
        .addEdge(START, "generateTopics")
        .addConditionalEdges("generateTopics", continueToJokes)
        .addEdge("generateJoke", "bestJoke")
        .addEdge("bestJoke", END);

    const app = graph.compile();

    for await (const s of await app.stream({ topic: "dogs" })) {
        console.log(s);
    }
})();
