/* eslint no-console:0 */
const enigma = require('enigma.js');
const schema = require('enigma.js/schemas/3.2.json');
const WebSocket = require('ws');

console.log('Connecting to QIX Engine');

const session = enigma.create({
  schema,
  url: 'ws://localhost:9076/app/engineData',
  createSocket: url => new WebSocket(url),
});

session.open().then(async (global) => {
  console.log('Connection established');
  try {
    const version = await global.engineVersion();
    console.log(`Hello, I am QIX Engine! I am running version: ${version.qComponentVersion}`);
    process.exit(0);
  } catch (error) {
    console.log(`Error when connecting to QIX Engine: ${error.message}`);
    process.exit(1);
  }});
