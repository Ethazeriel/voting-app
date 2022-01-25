const MongoClient = require('mongodb').MongoClient;
const { logLine } = require('./logger.js');
const chalk = require('chalk');
const { mongo } = require('./config.json');
// Connection URL
const url = mongo.url;
const dbname = mongo.database;
let db;
let con;
MongoClient.connect(url, function(err, client) {
  if (err) throw err;
  con = client;
  db = client.db(dbname);
  logLine('database', [`Connected to database: ${dbname}`]);
});

async function closeDB() {
  // we should really only be doing this when the program exits
  try {
    logLine('database', [`Closing connection: ${dbname}`]);
    await con.close();
  } catch (error) {
    logLine('error', ['database error:', error.message]);
    return error;
  }
}

async function get(query, collection) { // arc v1
  // returns the first item that matches the query
  try {
    const tracks = db.collection(collection);
    const track = await tracks.findOne(query, { projection: { _id: 0, secret: 0 } });
    return track;
  } catch (error) {
    logLine('error', ['database error:', error.stack]);
  }
}
// get track by youtubeID: await getTrack({'youtube.id': 'mdh6upXZL6c'});


async function insert(thing, query, collection) { // arc v1
  // inserts a single thing into the database
  if (query == null) {query = 'id';} // what do we compare against to avoid dulicates
  try {
    const tracks = db.collection(collection);
    // check if we already have this url
    const test = await tracks.findOne({ [query]: thing[query] });
    if (test == null || test[query] != thing[query]) {
      // we don't have this in our database yet, so
      const result = await tracks.insertOne(thing);
      logLine('database', [`Adding: ${chalk.green(thing[query])} to database ${chalk.blue(collection)}`]);
      return result;
    } else { throw new Error(`Code ${thing[query]} already exists! (${collection})`);}
    // console.log(track);
  } catch (error) {
    logLine('error', ['database error:', error.message]);
  }
}

async function update(query, changes, collection) { // arc v1
  // generic update function; basically just a wrapper for updateOne
  try {
    const tracks = db.collection(collection);
    await tracks.updateOne(query, changes);
    logLine('database', [`Updating: ${chalk.blue(JSON.stringify(query, '', 2))} with data ${chalk.green(JSON.stringify(changes, '', 2))}`]);
  } catch (error) {
    logLine('error', ['database error:', error.stack]);
  }
}

async function remove(query, collection) { // arc v1
  // removes the track with the specified youtube id - USE WITH CAUTION
  // returns 1 if successful, 0 otherwise
  try {
    const tracks = db.collection(collection);
    const track = await tracks.deleteOne(query);
    if (track.deletedCount === 1) {
      logLine('database', [`Removed track ${chalk.red(query)} from DB.`]);
    } else {
      logLine('database', [`Removing track ${chalk.red(query)} failed - was not in the DB or something else went wrong`]);
    }
    return track.deletedCount;
  } catch (error) {
    logLine('error', ['database error:', error.stack]);
  }
}


async function printCount(collection) {
  // returns the number of objects we have
  try {
    const tracks = db.collection(collection);
    const number = await tracks.count();
    logLine('database', [`We currently have ${chalk.green(number)} tracks in the ${dbname} database, collection ${collection}.`]);
    return number;
  } catch (error) {
    logLine('error', ['database error:', error.stack]);
  }
}

async function list(query, collection) {
  // returns all the unique values of a field
  try {
    const tracks = db.collection(collection);
    const uniques = await tracks.distinct(query);
    return uniques;
  } catch (error) {
    logLine('error', ['database error:', error.stack]);
  }
}


exports.get = get;
exports.insert = insert;
exports.printCount = printCount;
exports.closeDB = closeDB;
exports.remove = remove;
exports.update = update;
exports.list = list;