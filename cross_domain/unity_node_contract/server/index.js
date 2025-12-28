const express = require('express');
const cors = require('cors');
const playersRouter = require('./routes/players');
const matchesRouter = require('./routes/matches');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/players', playersRouter);
app.use('/api/matches', matchesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`Lobby server running on http://localhost:${PORT}`);
});
