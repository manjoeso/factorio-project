const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// get command line arguments
const dirPath = path.dirname(process.argv[1]);
const fileName = process.argv[2].toString();

// set path destinations
const importedStringPath = path.join(dirPath, `blueprint_strings/${fileName}.txt`)
const existingJsonPath = path.join(dirPath, `blueprint_json/${fileName}.json`);
const newJsonPath = path.join(dirPath, `blueprint_json/${fileName}-modified.json`);
const newStringPath = path.join(dirPath, `blueprint_strings/${fileName}-modified.txt`);

// Read the JSON file and parse its contents into a variable, write it into a file
const jsonData = extract(fs.readFileSync(importedStringPath, 'utf-8'));
writeFile(existingJsonPath, JSON.stringify(jsonData))

// Remove unwanted train-entities
const removeEntities = ["train-stop", "rail-chain-signal", "rail-signal"]

const newEntities = jsonData.blueprint.entities.map(entity => {
    if(removeEntities.includes(entity.name)) {
      return;
    } else {
      return entity;
    }
})

Object.assign(jsonData.blueprint.entities, newEntities)

// Write the modified data to a JSON file
writeFile(newJsonPath, JSON.stringify(jsonData))

// encode JSON to string
const result = intract(jsonData)
writeFile(newStringPath, result)

function writeFile(path, data) {
  fs.writeFile(path, data, (err) => {
    if (err) throw err;
    console.log('The modified data has been written to the file.')
  })
}

function intract(data) {
  const def = JSON.stringify(data);
  const zip = zlib.deflateSync(def);
  const src = zip.toString('base64');
  return `0${src}`;
}

function extract(data) {
  if (!data || data.length < 3) {
    throw new Error('Input needs to be at least 3 characters long.');
  }
  const src = new Buffer.from(data.substring(1), 'base64');
  const def = zlib.unzipSync(src);
  return JSON.parse(`${def}`);
}
