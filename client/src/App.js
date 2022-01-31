import './App.css';
import FormGenerator from './FormGenerator';
import React from 'react';
import SurveyForm from './SurveyForm';
import ResultsForm from './ResultsForm';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      path: window.location.pathname,
    };
    this.mainDisplay = this.mainDisplay.bind(this);
  }

  mainDisplay(option) {
    const match = option.match(/(?:\/quad\/|\/)?(\w*)?(?:-)?([\da-f]{20})?(?:-)?([\da-f]{20})?/);
    switch (match[1]) {

    case 'new':
      return (<FormGenerator />);

    case 'survey':
      return (<SurveyForm path={this.state.path} />);

    case 'results':
      return (<ResultsForm path={this.state.path} />);

    default:
      return (<FormGenerator />);
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {this.mainDisplay(this.state.path)}
        </header>
      </div>
    );
  }
}

export default App;