const db = require('./database.js');
const helmet = require('helmet');
// const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const express = require('express');
const path = require('path');
const { logLine, logDebug } = require('./logger.js');
const injest = require('./injest.js');
const chalk = require('chalk');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
const port = 3001;

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use('/quad', express.static(path.resolve(__dirname, '../client/build/')));
app.use(express.static(path.resolve(__dirname, '../client/build/')));


app.get('/*', (req, res) => {
  logLine('get', [`Endpoint ${chalk.blue('/')}, Client ID: ${chalk.green(req?.cookies?.ClientID)}`]);
  if (!req?.cookies?.ClientID) {
    const newid = crypto.randomBytes(10).toString('hex'); // gen an ID to use for cookie that expires in 10 years
    res.cookie('ClientID', newid, { maxAge: 525600000000 }).sendFile(path.resolve(__dirname, '../client/build/', 'index.html'));
  } else {
    res.sendFile(path.resolve(__dirname, '../client/build/', 'index.html'));
  }
});

app.post('/create', async (req, res) => {
  logLine('post', [`Endpoint ${chalk.blue('/create')}, Client ID: ${chalk.green(req?.cookies?.ClientID)}`]);
  const result = await injest.create(req.body, req?.cookies?.ClientID, req.socket.remoteAddress);
  res.json(result);
});

app.post('/results', async (req, res) => { // yes this should just be a get that I urlencode
  if (/^(?:\/quad\/|\/)?([a-z]*)(?:-){1}([\da-f]{20}){1}(?:-){1}([\da-f]{20}){1}/.test(req.body.path)) {
    const match = req.body.path.match(/^(?:\/quad\/|\/)?([a-z]*)(?:-){1}([\da-f]{20}){1}(?:-){1}([\da-f]{20}){1}/);
    logLine('post', [`Endpoint ${chalk.blue('/results')}, code ${chalk.green(match[2])}, Client ID: ${chalk.green(req?.cookies?.ClientID)}`]);
    const result = await db.get({ $and: [{ id:match[2] }, { secret:match[3] }] }, 'responses');
    if (result) {
      const result2 = await db.get({ $and: [{ id:match[2] }, { secret:match[3] }] }, 'surveys');
      if (result2) {
        const response = {
          survey: result2,
          responses: result,
          status:'success',
        };
        res.json(response);
      }
    } else {res.json({ status:'error', error:'Invalid access code' });}
  } else {res.json({ status:'error', error:'Invalid access code' });}
});

app.post('/response', async (req, res) => {
  logLine('post', [`Endpoint ${chalk.blue('/response')}`]);
  const result = await injest.response(req.body, req?.cookies?.ClientID, req.socket.remoteAddress);
  res.json(result);
});

app.post('/load', async (req, res) => { // yes this should just be a get that I urlencode
  if (/^(?:\/quad\/|\/)?([a-z]*)(?:-){1}([\da-f]{20}){1}/.test(req.body.path)) {
    const match = req.body.path.match(/^(?:\/quad\/|\/)?([a-z]*)(?:-){1}([\da-f]{20}){1}/);
    logLine('post', [`Endpoint ${chalk.blue('/load')}, code ${chalk.green(match[2])}, Client ID: ${chalk.green(req?.cookies?.ClientID)}`]);
    const result = await db.get({ id:match[2] }, 'surveys');
    if (result) {
      const result2 = await db.get({ $and: [{ id:match[2] }, { 'responses.ClientID':req?.cookies?.ClientID }] }, 'responses');
      if (result2) {
        const entry = result2.responses.filter(response => {return response.ClientID === req.cookies.ClientID; });
        result.votes = entry[0].votes;
        result.nameentry = entry[0].name || '';
        result.emailentry = entry[0].email || '';
      }
      res.json(result);
    } else {res.json({ question:'invalid access code' });}
  } else {res.json({ question:'invalid access code' });}
});

app.listen(port, () => {
  logLine('info', [`Backend listening at http://localhost:${port}, Node version: ${process.version}`]);
  logDebug(chalk.red.bold('DEBUG MODE ACTIVE'));
});