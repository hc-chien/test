const { resolve } = require('path');
const { readdir } = require('fs').promises;
var getMessages = require('./Messages.js').getMessages;
const fs = require('fs');
let Engine = require('json-rules-engine').Engine;

// get files from dir
async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

if (process.argv[2] == undefined) {
  console.log("using: node main.js [filename]");
  return;
}

let options = {
  allowUndefinedFacts: true
};

let engine = new Engine([], options);

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

(async () => {
  for await (const f of getFiles('rules')) {
    let rawData = fs.readFileSync(f);
    engine.addRule(JSON.parse(rawData));
    console.log(f);
  }
})().then(exec => {
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
});
