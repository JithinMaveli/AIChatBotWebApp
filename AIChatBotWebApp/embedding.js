// require("dotenv").config();
import express from 'express';
import OpenAI from "openai";

const router = express.Router();
router.post("/ask", async (req, res) => {
    res.render("/ask")
});

const app = express();
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Getting key from local system environment variables
});

const port = process.env.PORT || 3000;

app.post("/ask", async (req, res) => {
    const prompt = req.body.prompt;

    try {
        if (prompt == null) {
            throw new Error("Uh oh, no prompt was provided");
        }

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt,
            max_tokens: 64,
        });

        const completion = response.data.choices[0].text;

        return res.status(200).json({
            success: true,
            message: completion,
        });
    } catch (error) {
        console.log(error.message);
    }
});

//async function main() {
//    console.log(router.stack);
//}

//main();

app.listen(port, () => console.log(`Server is running on port ${port}!!`));
