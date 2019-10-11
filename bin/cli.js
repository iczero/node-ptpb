#!/usr/bin/env node
const Api = require('../src/ptpb.js');
const yargs = require('yargs');
const fs = require('fs');
const EventEmitter = require('events');

let argv = yargs
  .usage('$0 [mode] [options] [<filename>]')
  .describe('create', 'create a paste (default)')
  .alias('c', 'create')
  .boolean('create')
  .describe('delete', 'delete a paste')
  .alias('d', 'delete')
  .string('delete')
  .describe('update', 'update a paste')
  .alias('u', 'update')
  .string('update')
  .describe('get', 'get a paste')
  .alias('g', 'get')
  .string('get')
  .group(['create', 'delete', 'update', 'get'], 'operating modes')

  .describe('label', 'set custom label for paste')
  .alias('l', 'label')
  .string('label')
  .describe('private', 'set paste to private')
  .alias('p', 'private')
  .boolean('private')
  .default('private', false)
  .describe('sunset', 'set expiry time for paste in seconds')
  .alias('s', 'sunset')
  .number('sunset')
  .describe('content-type', 'set content-type for paste')
  .alias('t', 'content-type')
  .string('content-type')
  .describe('filename', 'set file name for paste')
  .alias('f', 'filename')
  .string('filename')
  .describe('base-url', 'set base url for pb instance')
  .alias('a', 'base-url')
  .string('base-url')
  .default('base-url', 'https://pybin.pw')

  .example('$0 thing.txt', 'upload thing.txt')
  .example('do-stuff | $0', 'upload output of command')
  .example('$0 -d bfb8d7eb-3664-4ab8-9089-b2fa4640464c', 'delete provided paste')
  .argv;

/**
 * Process input properly
 * @return {any}
 */
async function getInput() {
  let input;
  if (argv._[0]) input = fs.createReadStream(argv._[0]);
  else {
    let buffer = [];
    process.stdin.on('data', d => buffer.push(d));
    await EventEmitter.once(process.stdin, 'end');
    input = Buffer.concat(buffer);
  }
  return input;
}

/**
 * Turn argv into options
 * @return {object}
 */
function makeOptions() {
  let options = {};
  if (argv.filename) options.fileName = argv.filename;
  if (argv['content-type']) options.contentType = argv['content-type'];
  if (argv.private) options.private = true;
  if (argv.sunset) options.sunset = argv.sunset;
  return options;
}

/** main function */
async function main() {
  let api = new Api(argv['base-url']);
  if (argv.delete) {
    console.log(await api.delete(argv.delete));
  } else if (argv.update) {
    let options = makeOptions();
    console.log(await api.update(argv.update, await getInput(), options));
  } else if (argv.get) {
    process.stdout.write(await api.get(argv.get));
  } else {
    let options = makeOptions();
    if (argv.label) options.label = argv.label;
    console.log(await api.create(await getInput(), options));
  }
}

main();
