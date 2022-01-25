import './App.css';
import React from 'react';
import * as regex from './regexes.js';
const reducer = (previousValue, currentValue) => previousValue + (currentValue ** 2);

class SurveyForm extends React.Component {
  constructor(props) {
    super(props);
    this.initialState = {
      votes: [],
      survey: {
        question: '',
        answers: [],
        points: 0,
      },
      response: {},
      ClientID: null,
    };
    this.state = this.initialState;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    fetch('/load', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.props),
    }).then((response) => response.json())
      .then((json) => {
        // console.log(json);
        this.setState({ survey: json });
        let loadvotes = [];
        let loadpoints = json.points;
        if (json.votes) {
          loadvotes = json.votes;
          loadpoints = json.points - json.votes.reduce(reducer, 0);
        } else {
          for (let i = 0; i < json.answers.length; i++) {
            loadvotes.push(0);
          }
        }
        this.setState({ votes: loadvotes, points:loadpoints });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  handleClick(event, index) {
    switch (event.target.name) {
    case 'voteUp': {
      this.setState(state => {
        const origvotes = state.votes;
        const votes = state.votes.map((vote, jndex) => {
          if (index === jndex) {
            return vote + 1;
          } else {
            return vote;
          }
        });
        const points = state.survey.points - votes.reduce(reducer, 0);
        if (points >= 0) {
          return { votes, points };
        } else { return { votes:origvotes }; }
      });
      break;
    }

    case 'voteDown': {
      this.setState(state => {
        const origvotes = state.votes;
        const votes = state.votes.map((vote, jndex) => {
          if (index === jndex && vote - 1 >= 0) {
            return vote - 1;
          } else {
            return vote;
          }
        });
        const points = state.survey.points - votes.reduce(reducer, 0);
        if (points >= 0) {
          return { votes, points };
        } else { return { votes:origvotes }; }
      });
      break;
    }

    case 'reset': {
      const loadvotes = [];
      for (let i = 0; i < this.state.survey.answers.length; i++) {
        loadvotes.push(0);
      }
      this.setState({ votes: loadvotes, points: this.state.survey.points });
      break;
    }

    default:
      break;
    }
  }

  handleChange(event, index) {
    const name = event.target.name;
    const value = event.target.value;
    switch (name) {

    case 'question':
      if (regex.alphanum.test(value)) {this.setState({ [name]: value });}
      break;

    case 'points':
      if (regex.int.test(value)) {this.setState({ [name]: value });}
      break;

    case 'answer':
      if (regex.alphanum.test(value)) {
        this.setState(state => {
          const options = state.options.map((answer, jndex) => {
            if (index === jndex) {
              return value;
            } else {
              return answer;
            }
          });
          return { options };
        });
      }
      break;
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log(this.state);
    fetch('/response', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state),
    }).then((response) => response.json())
      .then((json) => {
        console.log(json);
        this.setState({ response: json });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    const answers = [];
    for (let i = 0; i < this.state.survey.answers.length; i++) {
      answers.push(<AnswerEntry key={i} id={i} answer={this.state.survey.answers[i]} votes={this.state.votes[i]} onClick={this.handleClick} />);
    }
    return (
      <div>
        <h1>{this.state.survey.question}</h1>
        <h3>Points Left: {this.state.points}</h3>
        <div>
          <label>Answers: </label>
          <button className="Survey-rstbtn" type="button" name="reset" onClick={this.handleClick}>Reset Votes</button>
          {answers}
        </div>
        <button type="submit" name="submit" onClick={this.handleSubmit}>Submit response</button>
      </div>
    );
  }
}

class AnswerEntry extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    this.props.onClick(event, this.props.id);
  }

  render() {
    return (
      <div>
        <h4 className="Survey-answer"> {this.props.id + 1}. {this.props.answer} </h4>
        <button className="Survey-downbtn" type="button" name="voteDown" onClick={this.handleClick}>-</button>
        <button className="Survey-upbtn" type="button" name="voteUp" onClick={this.handleClick}>+</button>
        <h4 className="Survey-count"> Votes: {this.props.votes} </h4>
        <h4 className="Survey-count"> Points: {(this.props.votes) ** 2} </h4>
      </div>
    );
  }
}

export default SurveyForm;