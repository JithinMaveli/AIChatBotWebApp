declare var require: any

var React = require('react');
var ReactDOM = require('react-dom');

export class Hello extends React.Component {
    render() {
        return (
            <div>
                <h1>Welcome to React!!!</h1>
                <h2>First ChatBox AI application!!</h2>
            </div>
        );
    }
}

ReactDOM.render(<Hello />, document.getElementById('root'));