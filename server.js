
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const dbFilePath = './db/db.json';

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// HTML Routes
app.get('/notes', (req, res) => {
   res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname, 'public/index.html'));
});

// API Routes
// GET /api/notes
app.get('/api/notes', (req, res) => {
   fs.readFile(dbFilePath, 'utf8', (err, data) => {
      if (err) return res.status(500).json({ error: 'Unable to read notes' });
      res.json(JSON.parse(data));
   });
});

// POST /api/notes
app.post('/api/notes', (req, res) => {
   const { title, text } = req.body;
   const newNote = { id: uuidv4(), title, text };

   fs.readFile(dbFilePath, 'utf8', (err, data) => {
      if (err) return res.status(500).json({ error: 'Unable to save note' });
      const notes = JSON.parse(data);
      notes.push(newNote);

      fs.writeFile(dbFilePath, JSON.stringify(notes), (writeErr) => {
         if (writeErr) return res.status(500).json({ error: 'Unable to save note' });
         res.json(newNote);
      });
   });
});

// DELETE /api/notes/:id
app.delete('/api/notes/:id', (req, res) => {
   const { id } = req.params;

   fs.readFile(dbFilePath, 'utf8', (err, data) => {
      if (err) return res.status(500).json({ error: 'Unable to delete note' });
      const notes = JSON.parse(data);
      const updatedNotes = notes.filter(note => note.id !== id);

      fs.writeFile(dbFilePath, JSON.stringify(updatedNotes), (writeErr) => {
         if (writeErr) return res.status(500).json({ error: 'Unable to delete note' });
         res.json({ message: 'Note deleted' });
      });
   });
});

// Start the server
app.listen(PORT, () => {
   console.log(`Server is running on http://localhost:${PORT}`);
});
