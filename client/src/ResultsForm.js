import './App.css';
import React from 'react';
import { CSVLink } from 'react-csv';

class ResultsForm extends React.Component {
  constructor(props) {
    super(props);
    this.initialState = {
      response: {},
      ClientID: null,
    };
    this.state = this.initialState;
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

  render() {
    const answers = [];
    const maincsv = [['index', 'answer', 'votes', 'points']];
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
            <td>{this.state.response.survey.answers[i]}</td>
            <td>{vote}</td>
            <td>{point}</td>
          </tr>,
        );
        maincsv.push([(i + 1), this.state.response.survey.answers[i], vote, point]);
      }
    }
    return (
      <div>
        <ResponseDisplay response={this.state.response} />
        <h1 className="Results-question">{this.state.response?.survey?.question}</h1>
        <div>
          <h3>Responses: {this.state.response?.responses?.responses?.length}</h3>
          <h4 className="Results-title">Totals: <CSVLink data={maincsv} filename={'survey_stats.csv'}>csv</CSVLink></h4>
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
        <ResponseTable responses={this.state.response?.responses?.responses || []} />
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
  const digits = [];
  const csvdig = [];
  for (let i = 0; i < props.responses[0].votes.length; i++) {
    digits.push(<td key={i}>{i + 1}</td>);
    csvdig.push(i + 1);
  }
  const rows = [];
  const indcsv = [['IP', 'name', 'email', 'leftover points', ''].concat(csvdig, [''], csvdig)];
  for (const response of props.responses) {
    const votes = [];
    const points = [];
    const csvvotes = [];
    const csvpoints = [];
    for (const [i, vote] of response.votes.entries()) {
      votes.push(<td key={i}>{vote}</td>);
      csvvotes.push(vote);
    }
    for (const [i, point] of response.points.entries()) {
      points.push(<td key={i}>{point}</td>);
      csvpoints.push(point);
    }
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
    indcsv.push([response.ClientIP, response.name, response.email, response.remaining, ''].concat(csvvotes, [''], csvpoints));
  }
  return (
    <div>
      <h4 className="Results-title">Individual Responses: <CSVLink data={indcsv} filename={'survey_responses.csv'}>csv</CSVLink></h4>
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
    </div>
  );
}

export default ResultsForm;