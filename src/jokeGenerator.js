var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import path from "path";
import dotenv from "dotenv";
dotenv.config({
    path: path.resolve(__dirname, '../', '.env'),
});
import { END, START, StateGraph, Annotation, Send } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
(async () => {
    var _a, e_1, _b, _c;
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
        topic: (Annotation),
        subjects: (Annotation),
        jokes: Annotation({
            reducer: (state, update) => state.concat(update),
        }),
        bestSelectedJoke: (Annotation),
    });
    ;
    const generateTopics = async (state) => {
        const prompt = subjectsPrompt.replace("{topic}", state.topic);
        const response = await llm.withStructuredOutput(Subjects, { name: "subjects" }).invoke(prompt);
        return { subjects: response.subjects };
    };
    const generateJoke = async (state) => {
        const prompt = jokePrompt.replace("subject", state.subject);
        const response = await llm.withStructuredOutput(Joke, { name: "joke" }).invoke(prompt);
        return { jokes: [response.joke] };
    };
    const continueToJokes = (state) => {
        return state.subjects.map((subject) => new Send("generateJoke", { subject }));
    };
    const bestJoke = async (state) => {
        const jokes = state.jokes.join("\n\n");
        const prompt = bestJokePrompt
            .replace("jokes", jokes)
            .replace("{topic}", state.topic);
        const response = await llm.withStructuredOutput(BestJoke, { name: "best_joke" }).invoke(prompt);
        return { bestSelectedJoke: state.jokes[response.id] };
    };
    const graph = new StateGraph(OverallState)
        .addNode("generateTopics", generateTopics)
        .addNode("generateJoke", generateJoke)
        .addNode("bestJoke", bestJoke)
        .addEdge(START, "generateTopics")
        .addConditionalEdges("generateTopics", continueToJokes)
        .addEdge("generateJoke", "bestJoke")
        .addEdge("bestJoke", END);
    const app = graph.compile();
    try {
        for (var _d = true, _e = __asyncValues(await app.stream({ topic: "dogs" })), _f; _f = await _e.next(), _a = _f.done, !_a; _d = true) {
            _c = _f.value;
            _d = false;
            const s = _c;
            console.log(s);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = _e.return)) await _b.call(_e);
        }
        finally { if (e_1) throw e_1.error; }
    }
})();
