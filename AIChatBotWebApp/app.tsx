declare var require: any

var React = require('react');
var ReactDOM = require('react-dom');

export class Hello extends React.Component {
    render() {
        //const [chats, setChats] = React.useState([]);
        const chats = "What is IT ?";
        var msg;

        const fetchData = async () => {
            try {

                console.log("inside fetcdata");

                const response = await fetch("/", {
                    method: "post",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        content: chats
                    })
                }).then((response) => response.json())
                    .then((data) => {
                        console.log("inside then response :" + data.output);
                        msg = data.output;
                    });
            }
            catch {

            }
        }

        //fetchData();

        //fetch("home", {
        //    method: "post",
        //    headers: {
        //        "Content-Type": "application/json"
        //    },
        //    body: JSON.stringify({
        //        "chats": chats
        //    })
        //}).then((response) => response.json())
        //    .then((data) => {
        //        msg = data.output;
        //    })

        return (
            <div>
                <h2>First ChatBox AI application!!</h2>
                <h3>Student Details:</h3>
                <h3>ID: 2022MT12292</h3>
                <h3>Name: Jithin M P</h3>
                {/*<div>{chats}</div>*/}
                {/*<div>{msg}</div>*/}
            </div>
        );
    }
}

ReactDOM.render(<Hello />, document.getElementById('root'));