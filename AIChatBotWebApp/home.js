'use strict';
import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'node:path';
import cors from 'cors';
import bodyParser from "body-parser";

import OpenAI from "openai";
import readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
var app = express();
var staticPath = path.join(__dirname, '/');

app.use(express.static(staticPath));
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(cors());

var server = app.listen(app.get('port'), function () {
    console.log('listening to home');
});

app.post("/", async (request, response) => {
    //const { chats } = request.body.chats;

    var chats = request.body;

    console.log("inside api");

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY // Getting key from local system environment variables
    });

    var completion;
    await openai.chat.completions.create({
        messages: [{ "role": "user", "content": chats.chats }],
        model: "gpt-3.5-turbo",
    }).then((result) => {
        console.log(result.choices);
        completion = result.choices;
    }).catch((error) => {
        console.log(error);
    });

    response.json({
        output: completion[0].message.content
    })
});

async function main() {
    const commandInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY // Getting key from local system environment variables
    });

    commandInterface.on('line', async (input) => {
        await openai.chat.completions.create({
            messages: [{ "role": "user", "content": input }],
            model: "gpt-3.5-turbo",
        }).then((result) => {
            //console.log("H1");
            console.log(result.choices);
            commandInterface.prompt();
        }).catch((error) => {
            console.log(error);
            //console.log("H2");
        });
    });
}

//main();