/* eslint-disable no-console */
const db = require('./database.js');
const { logLine } = require('./logger.js');
const { regexes } = require('./regexes.js');
const crypto = require('crypto');

async function create(newsurvey, ClientID) {
  const safesurvey = {};

  const safeID = ClientID?.replace(regexes.sanitize, '').trim();
  if (!regexes.hex.test(safeID)) {return { status:'error', error:'Cookies are required to use this app' };}
  safesurvey.ClientID = safeID;

  const question = newsurvey?.question?.replace(regexes.sanitize, '').trim();
  if (!regexes.alphanum.test(question)) {return { status:'error', error:'Invalid question' };}
  safesurvey.question = question;

  const points = Number(newsurvey?.points);
  if (!regexes.int.test(points)) {return { status:'error', error:'Invalid points' };}
  safesurvey.points = points;

  safesurvey.answers = [];
  let answerindex = 0;
  if (!Array.isArray(newsurvey.answers)) {return { status:'error', error:'Invalid answer array' };}
  if (!newsurvey.answers.length) {return { status:'error', error:'You need to have at least one answer' };}
  for (const answer of newsurvey.answers) {
    const safeanswer = answer?.replace(regexes.sanitize, '').trim();
    if (!regexes.alphanum.test(safeanswer)) {return { status:'error', error: `Invalid answer (#${answerindex + 1})` };}
    safesurvey.answers.push(safeanswer);
    answerindex++;
  }

  const name = Boolean(newsurvey?.namecheck);
  safesurvey.name = name;

  const email = Boolean(newsurvey?.emailcheck);
  safesurvey.email = email;

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
  return { status:'success', value: id, secret: secret };
}
exports.create = create;

async function response(newresponse, ClientID) {
  const safequery = {};
  const safedata = {};

  const id = newresponse?.survey?.id?.replace(regexes.sanitize, '').trim();
  if (!regexes.hex.test(id)) {return { status:'error', error:'Invalid survey ID' };}
  safequery.id = id;

  const safeID = ClientID?.replace(regexes.sanitize, '').trim();
  if (!regexes.hex.test(safeID)) {return { status:'error', error:'Cookies are required to use this app' };}
  safedata.ClientID = safeID;

  const safeResponses = [];
  const points = [];
  if (!Array.isArray(newresponse.votes)) {return { status:'error', error:'Invalid vote array' };}
  let answerindex = 0;
  for (const vote of newresponse.votes) {
    const safevote = Number(vote);
    if (!regexes.int.test(safevote)) {return { status:'error', error: `Invalid vote (#${answerindex + 1})` };}
    safeResponses.push(safevote);
    points.push(safevote ** 2);
    answerindex++;
  }
  safedata.votes = safeResponses;
  safedata.points = points;

  safedata.remaining = newresponse?.survey?.points - safedata.votes.reduce((previousValue, currentValue) => previousValue + (currentValue ** 2), 0);

  const safeName = newresponse?.name?.replace(regexes.sanitize, '').trim();
  if (!regexes.alphanum.test(safeName) && (safeName != '')) {return { status:'error', error:'Name field only allows alphanumeric characters' };}
  safedata.name = safeName;

  const email = newresponse?.email;
  if (!regexes.email.test(email) && (email != '')) {return { status:'error', error:'That doesn\'t look like a valid email address' };}
  safedata.email = email;

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