const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const { analyze } = require('./engine/analysisEngine');

const framework = require('./framework/attributeFramework.json');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/**
 * POST /api/analyze
 * Body: { gcspName, narrative, accomplishments, suggestedRating, reviewerObservations }
 * suggestedRating must be one of: Needs Improvement | Meets Expectations | Differentiating | Strategic Impact
 * Returns the full deterministic analysis object.
 */
app.post('/api/analyze', (req, res) => {
  try {
    const result = analyze(req.body, framework);
    res.json(result);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Analysis failed', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
