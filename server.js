const express = require('express');
const path = require('path');
const FIRMS = require('./data/firms');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic sanity check on the id shape (Airtable record ids: "rec" + 14 alphanumeric chars).
// This isn't a security boundary by itself, just avoids doing lookups on garbage input.
const ID_PATTERN = /^rec[a-zA-Z0-9]{14,}$/;

function findFirm(id) {
  if (!ID_PATTERN.test(id)) return null;
  return FIRMS.find(f => f.airtableId === id) || null;
}

// The ONLY data endpoint. Given a valid id, returns exactly one firm's public profile data.
// There is no endpoint anywhere in this server that returns the full FIRMS list.
app.get('/api/firm/:id', (req, res) => {
  const firm = findFirm(req.params.id);
  if (!firm) {
    return res.status(404).json({ error: 'not_found' });
  }
  res.json(firm);
});

// Every other route (the bare root, or /firm/:id) serves the same static shell.
// The shell contains no firm data — it fetches from /api/firm/:id client-side
// based on the URL path, and shows a "link not valid" state if there's no id
// or the id doesn't resolve to a real firm.
app.use(express.static(path.join(__dirname, 'public')));

app.get(['/', '/firm/:id'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
