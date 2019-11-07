'use strict';
var getMessages = require('./Messages.js').getMessages;
let Engine = require('json-rules-engine').Engine;
const fs = require('fs');

function getRule(fname)
{
  let rawData = fs.readFileSync("rules/" + fname +".json");
  return JSON.parse(rawData);
}

let options = {
  allowUndefinedFacts: true
};

let engine = new Engine([], options)

// exist operator
engine.addOperator('exist', (factValue, jsonValue) => {
  if (factValue !== undefined && factValue.length != 0 &&jsonValue) {
      return jsonValue;
  } else {
      return !jsonValue;
  }
});

// regex operator
engine.addOperator('regex', (factValue, jsonValue) => {
  var myRe = new RegExp(jsonValue, 'g');
  var myArray = myRe.exec(factValue);
  return myRe.lastIndex > 0;
});

// add rules
engine.addRule(getRule("asset"));
engine.addRule(getRule("http"));
engine.addRule(getRule("error"));
engine.addRule(getRule("event"));
engine.addRule(getRule("message"));

if (process.argv[2] == undefined) {
  console.log("using: node main.js [filename]");
  return;
}

// run
var facts = getMessages(process.argv[2]);
facts.forEach(function (fact) {
  engine
    .run(fact)
    .then(results => {
      if (!results.events.length) return
      // results.events.map(event => console.log(event))
      delete fact["success-events"];
      console.log(JSON.stringify(fact, null, 2));
    })
    .catch(err => console.log(err.stack))
});
