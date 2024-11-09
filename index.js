const { Command } = require('commander');
const express = require('express');
const fs = require('fs');
const path = require('path');

const program = new Command();
program
    .option('-h, --host <type>', 'server address')
    .option('-p, --port <number>', 'server port')
    .option('-c, --cache <path>', 'path to the cache directory');

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
app.use(express.json());

const cacheDir = path.resolve(options.cache);
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}

// Функція для отримання шляху до файлу нотатки
const getNotePath = (noteName) => path.join(cacheDir, `${noteName}.txt`);

app.get('/notes/:name', (req, res) => {
    const notePath = getNotePath(req.params.name);
    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Not found');
    }
    const noteText = fs.readFileSync(notePath, 'utf-8');
    res.send(noteText);
});

// PUT /notes/<ім’я нотатки>
app.put('/notes/:name', (req, res) => {
    const notePath = getNotePath(req.params.name);
    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Not found');
    }
    fs.writeFileSync(notePath, req.body.text || '');
    res.send('Note updated');
});

// DELETE /notes/<ім’я нотатки>
app.delete('/notes/:name', (req, res) => {
    const notePath = getNotePath(req.params.name);
    if (!fs.existsSync(notePath)) {
        return res.status(404).send('Not found');
    }
    fs.unlinkSync(notePath);
    res.send('Note deleted');
});

// GET /notes
app.get('/notes', (req, res) => {
    const files = fs.readdirSync(cacheDir);
    const notes = files.map((file) => {
        const noteName = path.basename(file, '.txt');
        const noteText = fs.readFileSync(getNotePath(noteName), 'utf-8');
        return { name: noteName, text: noteText };
    });
    res.json(notes);
});

// POST /write
app.post('/write', (req, res) => {
    const { note_name, note } = req.body;
    const notePath = getNotePath(note_name);
    if (fs.existsSync(notePath)) {
        return res.status(400).send('Note already exists');
    }
    fs.writeFileSync(notePath, note || '');
    res.status(201).send('Note created');
});

// GET /UploadForm.html
app.get('/UploadForm.html', (req, res) => {
    const htmlContent = `
<html>
   <body>
      <h2>Upload Form</h2>
      <form method="post" action="/write" enctype="multipart/form-data">
         <label for="note_name_input">Note Name:</label><br>
         <input type="text" id="note_name_input" name="note_name"><br><br>
         <label for="note_input">Note:</label><br>
         <textarea id="note_input" name="note" rows="4" cols="50"></textarea><br><br>
         <button>Upload</button>
      </form>
      <p>If you click the "Submit" button, the form-data will be sent to a page called "/upload".</p>
   </body>
</html>
  `;
    res.send(htmlContent);
});

app.listen(options.port, options.host, () => {
    console.log(`Server is running at http://${options.host}:${options.port}`);
    console.log(`Cache directory: ${options.cache}`);
});