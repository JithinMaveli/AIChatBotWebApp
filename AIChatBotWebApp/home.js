'use strict';
import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'node:path';

import OpenAI from "openai";
import readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
var app = express();
var staticPath = path.join(__dirname, '/');

app.use(express.static(staticPath));
// Allows you to set port in the project properties.
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    console.log('listening to home');
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Getting key from local system environment variables
});

// async function main() {
//   const completion = await openai.chat.completions.create({
//     messages: [{"role": "system", "content": "You are a helpful assistant."},
//         {"role": "user", "content": "Who won the world series in 2020?"},
//         {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
//         {"role": "user", "content": "Where was it played?"}],
//     model: "gpt-3.5-turbo",
//   });

// console.log(completion);
// console.log(completion.choices);
// console.log(completion.choices[0]);

const commandInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    commandInterface.on('line', async (input) => {
        await openai.chat.completions.create({
            messages: [{ "role": "user", "content": input }],
            model: "gpt-3.5-turbo",
        }).then((result) => {
            console.log(result.choices);
            commandInterface.prompt();
        }).catch((error) => {
            console.log(error);
        });
    });
}

main();