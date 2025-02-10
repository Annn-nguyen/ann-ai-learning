var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
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
const extractCountryNames = (inputs) => {
    if (!Array.isArray(inputs.countries)) {
        return "";
    }
    return JSON.stringify(inputs.countries.map((country) => country.name));
};
const chain = model.pipe(new JsonOutputParser()).pipe(extractCountryNames);
(async () => {
    var _a, e_1, _b, _c;
    const stream = await chain.stream(`Output a list of countries france, spain and jpana and their populations in json format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have a key "name" and "population".`);
    try {
        for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = await stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
            _c = stream_1_1.value;
            _d = false;
            const chunk = _c;
            console.log(chunk);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = stream_1.return)) await _b.call(stream_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    ;
})();
