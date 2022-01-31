import './App.css';
import React from 'react';
import * as regex from './regexes.js';

class FormGenerator extends React.Component {
  constructor(props) {
    super(props);
    this.initialState = {
      question: '',
      points: 100,
      answers: [],
      response: {},
      namecheck: true,
      emailcheck: true,
    };
    this.state = this.initialState;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event, index) {
    this.setState(state => {
      let answers = state.answers;
      switch (event.target.name) {

      case 'addAnswer':
        answers = state.answers.concat('');
        break;

      case 'delAnswer':
        answers = state.answers.filter((option, jndex) => index !== jndex);
        break;
      }

      return { answers };
    });
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
          const answers = state.answers.map((answer, jndex) => {
            if (index === jndex) {
              return value;
            } else {
              return answer;
            }
          });
          return { answers };
        });
      }
      break;

    case 'namecheck':
    case 'emailcheck':
      console.log(name);
      console.log(this.state[name]);
      this.setState({ [name]: this.state[name] ? false : true });
      break;
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log(this.state);
    if (!Object.keys(this.state.response).length || this.state.response.status === 'error') {
      fetch('./create', {
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
    } else {this.setState({ response: { status:'error-submitted', error:'Survey already submitted', value:this.state.response.value, secret:this.state.response.secret } });}
  }

  render() {
    const answers = [];
    for (let i = 0; i < this.state.answers.length; i++) {
      answers.push(<AnswerEntry key={i} id={i} answer={this.state.answers[i]} onChange={this.handleChange} onClick={this.handleClick} />);
    }
    return (
      <div>
        <ResponseDisplay response={this.state.response} />
        <form className="Generator-form" onSubmit={this.handleSubmit}>
          <div>
            <label>Question: </label>
            <input className="Generator-question" name="question" type="text" value={this.state.question} onChange={this.handleChange} />
          </div>
          <div>
            <label>Available points:</label>
            <input className="Generator-points" name="points" type="text" value={this.state.points} onChange={this.handleChange} />
          </div>
          <div>
            <label>Answers: </label>
            <button type="button" name="addAnswer" onClick={this.handleClick}>Add</button>
            {answers}
          </div>
          <div>
            <label>Additional inputs: </label><br />
            <input type="checkbox" name="namecheck" checked={this.state.namecheck} onChange={this.handleChange} />
            <label>Name</label>
            <input type="checkbox" name="emailcheck" checked={this.state.emailcheck} onChange={this.handleChange} />
            <label>Email</label>
          </div>
          <input type="submit" value="Create" />
        </form>
      </div>
    );
  }
}

class AnswerEntry extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange(event) {
    this.props.onChange(event, this.props.id);
  }

  handleClick(event) {
    this.props.onClick(event, this.props.id);
  }

  render() {
    return (
      <div>
        <label className="Generator-answer"> {this.props.id + 1}. </label>
        <input name="answer" type="text" value={this.props.answer} onChange={this.handleChange} />
        <button className="Generator-delbtn" type="button" name="delAnswer" onClick={this.handleClick}>Remove</button>
      </div>
    );
  }
}

class ResponseDisplay extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!Object.keys(this.props.response).length) {
      return (null);
    } else if (this.props.response.status == ('error' || 'error-submitted')) {
      return (<h3 className="Form-error">Submission error: {this.props.response.error}</h3>);
    }
    return (
      <div>
        <h3 className="Form-success">Survey Created!</h3>
        <h4 className="Form-success-link"><a href={`./survey-${this.props.response.value}`}>Link for sharing</a> </h4>
        <h4 className="Form-success-link"><a href={`./results-${this.props.response.value}-${this.props.response.secret}`}>Results</a></h4>
      </div>
    );
  }
}

export default FormGenerator;