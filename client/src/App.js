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
        <TopBar />
        {this.mainDisplay(this.state.path)}

      </div>
    );
  }
}

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onChange(event);
  }

  render() {
    return (
      <div className="TopBar">
        <div className="TopBar-item">

        </div>
        <div className="TopBar-item"><h1 className="TopBar-title">QUADRATIC SURVEY</h1></div>
        <div className="TopBar-item"><Clock /></div>
      </div>
    );
  }
}

class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = { date: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) };
    this.tock = false;
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    if (this.tock) {
      this.setState({
        date: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      });
      this.tock = false;
    } else {
      this.setState({
        date: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(':', ' '),
      });
      this.tock = true;
    }
  }

  render() {
    return (
      <div className="Clock">
        <h2>{this.state.date}</h2>
      </div>
    );
  }
}

export default App;