'use strict';
import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'node:path';
import cors from 'cors';
import bodyParser from "body-parser";
import fs from "fs";
import PDFParser from "pdf2json";
import OpenAI from "openai";
import readline from 'readline';

const router = express.Router();
router.post("/embed", async (req, res) => {
    res.render("/embed")
});
router.post("/completion", async (req, res) => {
    res.render("/completion")
});

const __dirname = dirname(fileURLToPath(import.meta.url));
var staticPath = path.join(__dirname, '/');
const pdfParser = new PDFParser(this, 1);

var app = express();
app.use(express.static(staticPath));
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(cors());

var server = app.listen(app.get('port'), function () {
    console.log('listening to home');
});

var pdfFilePath = "D:\\AIChatBot\\InputDocument1.pdf";
var outputPath = "D:\\AIChatBot\\InputDocument1.txt";
var vectorJsonPath = "D:\\AIChatBot\\InputDocument1.json";
const vectorValues = {};

function cosineSimilarity(A, B) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < A.length; i++) {
        dotProduct += A[i] * B[i];
        normA += A[i] * A[i];
        normB += B[i] * B[i];
    }
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    return dotProduct / (normA * normB);
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function getSimilarityScore(docEmbedded, promptEmbedded) {
    const similarityScoreHash = {};
    console.log("Inside getSimilarity");
    Object.keys(docEmbedded).forEach((text) => {
        // console.log(docEmbedded[text]);
        similarityScoreHash[text] = cosineSimilarity(
            promptEmbedded,
            docEmbedded[text]
        );
    });
    // console.log(similarityScoreHash);
    // console.log("End getSimilarity");
    return similarityScoreHash;
}

app.post("/", async (request, response) => {
    //const { chats } = request.body.chats;

    var chats = request.body;

    console.log("inside api");

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY // Getting key from local system environment variables
    });

    var completion;
    await openai.chat.completions.create({
        messages: [{ "role": "user", "content": chats.content }],
        model: "gpt-3.5-turbo",
    }).then((result) => {
        //console.log(result.choices);
        completion = result.choices;
    }).catch((error) => {
        console.log(error);
    });

    response.json({
        output: completion[0].message.content
    })
});

app.post("/embed", async (req, res) => {
    console.log("inside embed");

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY // Getting key from local system environment variables
    });

    try {
        console.log("Start PDFExtractor");
        var documentArray = [];
        //documentArray.push("Hello. Rohit Sharma is the captain of Indian cricket team.");
        //documentArray.push("My Name in Jithin.");
        //documentArray.push("My Name in Jithin and I am coming from Kerala, known as God's Own country.");

        // Extract the PDF
        pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
            fs.writeFile(outputPath, pdfParser.getRawTextContent(), () => { console.log("Done."); });
        });
        pdfParser.loadPDF(pdfFilePath);

        var text;
        await sleep(3000);
        text = fs.readFileSync(outputPath, 'utf8', function (err, data) {
            // Display the file content 
            // console.log(data); 
            text = data;
        });

        var textArray = text.split(". ");
        textArray.forEach(element => {
            documentArray.push(element.toString());
        });

        console.log(documentArray);
        console.log("End PDFExtractor");

        // Embedded contents in PDF through OpenAI
        const embeddedDocument = await openai.embeddings.create({
            input: documentArray,
            model: "text-embedding-ada-002",
            encoding_format: "float",
            // max_tokens: 1,
        });

        for (var i = 0; i < embeddedDocument.data.length; i++) {
            vectorValues[documentArray[i]] = embeddedDocument.data[i].embedding;
        };

        fs.writeFileSync(vectorJsonPath, JSON.stringify(vectorValues));
        fs.writeFileSync(outputPath, JSON.stringify(vectorValues)); 

        res.json({
            output: JSON.stringify(vectorValues)
        })
    } catch (error) {
        console.log(error.message);
    }
});

app.post("/completion", async (request, response) => {
    //const { chats } = request.body.chats;

    var promptQuestion = request.body;
    var completion;
    var vectorKnowledge;

    console.log("inside completion");

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY // Getting key from local system environment variables
    });

    try {
        const embeddedPrompt = await openai.embeddings.create({
            input: promptQuestion.content,
            model: "text-embedding-ada-002",
            encoding_format: "float",
            // max_tokens: 1,
        })

        //// Retrieve vectors knowledge of the AI.
        //vectorKnowledge = fs.readFileSync(outputPath, 'utf8', function (err, data) {
        //    // Display the file content 
        //    // console.log(data); 
        //    //text = data;
        //});

        //vectorKnowledge = JSON.stringify(vectorKnowledge);

        //vectorHash = JSON.parse(vectorKnowledge);

        // console.log(embeddedDocument.data[0].embedding);
        // console.log(embeddedPrompt.data[0].embedding);

        // create map of text against similarity score
        const similarityScoreHash = getSimilarityScore(
            vectorValues,
            embeddedPrompt.data[0].embedding
        );

        // console.log("Hello");
        // console.log(similarityScoreHash);

        // get text (i.e. key) from score map that has highest similarity score
        const textWithHighestScore = Object.keys(similarityScoreHash).reduce(
            (a, b) => (similarityScoreHash[a] > similarityScoreHash[b] ? a : b)
        );

        console.log(textWithHighestScore);

        const finalPrompt = `
            Info: ${textWithHighestScore}
            Question: ${promptQuestion.content}
            Answer:
        `;

        await openai.completions.create({
            model: "text-davinci-003",
            prompt: finalPrompt,
            max_tokens: 30,
        }).then((result) => {
            //console.log(result.choices);
            completion = result;
        });
    } catch (error) {
        console.log(error.message);
    }

    response.json({
        output: completion.choices[0].text
    })
});

async function main() {
    console.log(router.stack);

    //const commandInterface = readline.createInterface({
    //    input: process.stdin,
    //    output: process.stdout
    //});

    //const openai = new OpenAI({
    //    apiKey: process.env.OPENAI_API_KEY // Getting key from local system environment variables
    //});

    //commandInterface.on('line', async (input) => {
    //    await openai.chat.completions.create({
    //        messages: [{ "role": "user", "content": input }],
    //        model: "gpt-3.5-turbo",
    //    }).then((result) => {
    //        //console.log("H1");
    //        console.log(result.choices);
    //        commandInterface.prompt();
    //    }).catch((error) => {
    //        console.log(error);
    //        //console.log("H2");
    //    });
    //});
}

//main();