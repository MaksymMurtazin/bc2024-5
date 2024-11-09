const { Command } = require('commander');
const express = require('express');

const program = new Command();
program
    .option('-h, --host <type>', 'адреса сервера')
    .option('-p, --port <number>', 'порт сервера')
    .option('-c, --cache <path>', 'шлях до кеш-директорії');

program.parse(process.argv);
const options = program.opts();

const host = options.host;
const port = options.port;
const cache = options.cache;

if (!host || !port || !cache) {
    console.error('Error: required parameters not specified --host, --port and --cache.');
    process.exit(1);
}

const app = express();

app.listen(options.port, options.host, () => {
    console.log(`Server is running at http://${options.host}:${options.port}`);
    console.log(`Cache directory: ${options.cache}`);
});