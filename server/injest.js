/* eslint-disable no-console */
const db = require('./database.js');
const { logLine } = require('./logger.js');
const { regexes } = require('./regexes.js');
const crypto = require('crypto');

async function create(newsurvey) {
  const safesurvey = {};

  const question = newsurvey?.question?.replace(regexes.sanitize, '').trim();
  if (!regexes.alphanum.test(question)) {return { status:'error', value:'Invalid question' };}
  safesurvey.question = question;

  const points = Number(newsurvey?.points);
  if (!regexes.int.test(points)) {return { status:'error', value:'Invalid points' };}
  safesurvey.points = points;

  safesurvey.answers = [];
  let answerindex = 0;
  if (!Array.isArray(newsurvey.answers)) {return { status:'error', value:'Invalid answer array' };}
  for (const answer of newsurvey.answers) {
    const safeanswer = answer?.replace(regexes.sanitize, '').trim();
    if (!regexes.alphanum.test(safeanswer)) {return { status:'error', value: `Invalid answer (#${answerindex + 1})` };}
    safesurvey.answers.push(safeanswer);
    answerindex++;
  }

  logLine('INFO', ['Data is good - generating new ID and secret']);
  let id = crypto.randomBytes(10).toString('hex');
  while (await db.get({ 'id': id }, 'surveys')) {
    id = crypto.randomBytes(10).toString('hex');
  }
  safesurvey.id = id;

  let secret = crypto.randomBytes(10).toString('hex');
  while (await db.get({ 'secret': secret }, 'surveys')) {
    secret = crypto.randomBytes(10).toString('hex');
  }
  safesurvey.secret = secret;

  const saferesponse = {
    id: id,
    secret: secret,
    responses: [],
  };

  await db.insert(saferesponse, 'id', 'responses');
  await db.insert(safesurvey, 'id', 'surveys');
  return { status:'success', value: id };
}
exports.create = create;

async function response(newresponse, ClientID) {
  const safequery = {};
  const safedata = {};

  const id = newresponse?.survey?.id?.replace(regexes.sanitize, '').trim();
  if (!regexes.hex.test(id)) {return { status:'error', value:'Invalid survey ID' };}
  safequery.id = id;

  const safeID = ClientID?.replace(regexes.sanitize, '').trim();
  if (!regexes.hex.test(safeID)) {return { status:'error', value:'Cookies are required to use this app' };}
  safedata.ClientID = safeID;

  const safeResponses = [];
  if (!Array.isArray(newresponse.votes)) {return { status:'error', value:'Invalid vote array' };}
  let answerindex = 0;
  for (const vote of newresponse.votes) {
    const safevote = Number(vote);
    if (!regexes.int.test(safevote)) {return { status:'error', value: `Invalid vote (#${answerindex + 1})` };}
    safeResponses.push(safevote);
    answerindex++;
  }
  safedata.votes = safeResponses;
  const test = await db.get({ $and: [{ id:id }, { 'responses.ClientID':safeID }] }, 'responses');
  if (!test) {
    await db.update(safequery, { $addToSet: { responses:safedata } }, 'responses');
    logLine('info', ['New response - adding to db']);
  } else {
    await db.update({ $and: [{ id:id }, { 'responses.ClientID':safeID }] }, { $set: { 'responses.$':safedata } }, 'responses');
    logLine('info', ['Existing response - updating db']);
  }
  return { status:'success', value: id };
}
exports.response = response;