import { useState } from "react";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Getting key from local system environment variables
});

function App() {
    const [message, setMessage] = useState("");
    const [chats, setChats] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    //const completion = openai.chat.completions.create({
    //    messages: [{ "role": "user", "content": input }],
    //    model: "gpt-3.5-turbo",
    //}).then((result) => {
    //    console.log(result.choices);
    //    commandInterface.prompt();
    //}).catch((error) => {
    //    console.log(error);
    //});

    return (
        <main>
            <h1>ChatBot in React</h1>
        </main>
        )
}

export default App;