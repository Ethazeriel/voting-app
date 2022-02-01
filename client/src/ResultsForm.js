import './App.css';
import React from 'react';
const reducer = (previousValue, currentValue) => previousValue + (currentValue ** 2);

class ResultsForm extends React.Component {
  constructor(props) {
    super(props);
    this.initialState = {
      response: {},
      ClientID: null,
    };
    this.state = this.initialState;
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    fetch('./results', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.props),
    }).then((response) => response.json())
      .then((json) => {
        console.log(json);
        this.setState({ response: json });
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


  handleSubmit(event) {
    event.preventDefault();
    console.log(this.state);
    fetch('./response', {
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
    if (this.state.response.status === 'success') {
      for (let i = 0; i < this.state.response.survey.answers.length; i++) {
        let vote = 0;
        let point = 0;
        for (const response of this.state.response.responses.responses) {
          vote = vote + response.votes[i];
          point = point + response.points[i];
        }
        answers.push(// <p key={i} className="Results-answer">{i + 1}. {this.state?.response?.survey?.answers[i]}</p>
          <tr key={i}>
            <td>{i + 1}</td>
            <td>{this.state?.response?.survey?.answers[i]}</td>
            <td>{vote}</td>
            <td>{point}</td>
          </tr>,
        );
      }
    }
    return (
      <div>
        <ResponseDisplay response={this.state.response} />
        <h1 className="Results-question">{this.state.response?.survey?.question}</h1>
        <div>
          <h3>Responses: {this.state.response?.responses?.responses?.length}</h3>
          <h4 className="Results-title">Totals: </h4>
          <table className="Results-raw">
            <thead>
              <tr>
                <td>Index</td>
                <td>Answer</td>
                <td>Votes</td>
                <td>Points</td>
              </tr>
            </thead>
            <tbody>
              {answers}
            </tbody>
          </table>
        </div>
        <div>
          <h4 className="Results-title">Individual Responses: </h4>
          <ResponseTable responses={this.state.response?.responses?.responses || []} />
        </div>
      </div>
    );
  }
}

function ResponseDisplay(props) {
  if (!Object.keys(props.response).length) {
    return (null);
  } else if (props.response.status == 'error') {
    return (<h3 className="Form-error">Error: {props.response.error}</h3>);
  }
  return (
    <div>
      <h3 className="Form-success">Survey Results:</h3>
    </div>
  );
}

function ResponseTable(props) {
  if (!props.responses.length) {
    return (null);
  }
  const rows = [];
  for (const response of props.responses) {
    const votes = [];
    const points = [];
    for (const [i, vote] of response.votes.entries()) { votes.push(<td key={i}>{vote}</td>); }
    for (const [i, point] of response.points.entries()) { points.push(<td key={i}>{point}</td>); }
    rows.push(
      <tr key={response.ClientID}>
        <td>{response.ClientIP}</td>
        <td>{response.name}</td>
        <td>{response.email}</td>
        <td>{response.remaining}</td>
        <td></td>
        {votes}
        <td></td>
        {points}
      </tr>,
    );
  }
  const digits = [];
  for (let i = 0; i < props.responses[0].votes.length; i++) {
    digits.push(<td key={i}>{i + 1}</td>);
  }
  return (
    <table className="Results-raw">
      <thead>
        <tr>
          <td>IP</td>
          <td>Name</td>
          <td>Email</td>
          <td>Unused points</td>
          <td>Votes:</td>
          {digits}
          <td>Points:</td>
          {digits}
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  );
}

export default ResultsForm;