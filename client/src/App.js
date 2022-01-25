import logo from './logo.svg';
import './App.css';
import FormGenerator from './FormGenerator';
import React from 'react';
import SurveyForm from './SurveyForm';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      path: '/',
    };
    this.mainDisplay = this.mainDisplay.bind(this);
  }

  componentDidMount() {
    this.setState({ path: window.location.pathname });
  }

  mainDisplay(option) {
    const match = option.match(/(?:\/)?(\w*)?(?:-)?([\da-f]{20})?(?:-)?([\da-f]{20})?/);
    switch (match[1]) {

    case 'new':
      return (<FormGenerator />);

    case 'survey':
      return (<SurveyForm path={this.state.path} />);

    default:
      return (<FormGenerator />);
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {this.mainDisplay(this.state.path)}
        </header>
      </div>
    );
  }
}

export default App;
