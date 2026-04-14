'use strict';

// ---------------------------------------------------------------------------
// analysisEngine.js
// Deterministic GCSP leadership review engine.
// No external API calls — pure keyword/phrase scoring against the framework.
// ---------------------------------------------------------------------------

const RATINGS = ['Needs Improvement', 'Meets Expectations', 'Differentiating', 'Strategic Impact'];

// Maps display label → performanceBands JSON key
const BAND_KEY = {
  'Needs Improvement':  'NeedsImprovement',
  'Meets Expectations': 'MeetsExpectations',
  'Differentiating':    'Differentiating',
  'Strategic Impact':   'StrategicImpact',
};

// ── helpers ────────────────────────────────────────────────────────────────

function countMatches(text, signals) {
  const lower = text.toLowerCase();
  return signals.reduce((n, s) => n + (lower.includes(s.toLowerCase()) ? 1 : 0), 0);
}

function extractSnippets(text, signals, maxSnippets = 4) {
  const snippets = [];
  for (const sig of signals) {
    if (snippets.length >= maxSnippets) break;
    const idx = text.toLowerCase().indexOf(sig.toLowerCase());
    if (idx === -1) continue;
    const start = Math.max(0, idx - 40);
    const end   = Math.min(text.length, idx + sig.length + 60);
    const raw   = text.slice(start, end).replace(/\s+/g, ' ').trim();
    snippets.push((start > 0 ? '…' : '') + raw + (end < text.length ? '…' : ''));
  }
  return snippets;
}

/**
 * Score corpus against performance band signals for a single dimension.
 * Returns { hits, total, matchedSignals }
 */
function scoreAgainstBand(text, dimension, bandKey) {
  const signals = (dimension.performanceBands[bandKey] || {}).signals || [];
  const lower   = text.toLowerCase();
  const matched = signals.filter(s => lower.includes(s.toLowerCase()));
  return { hits: matched.length, total: signals.length, matchedSignals: matched };
}

/**
 * Determine strength label from hit ratio and absolute hit count.
 * Strong  >= 40 % of signals OR >= 3 hits
 * Thin    0 hits
 * Moderate otherwise
 */
function toStrength(hits, total) {
  if (hits === 0)                                        return 'Thin';
  if (hits >= 3 || (total > 0 && hits / total >= 0.4))  return 'Strong';
  return 'Moderate';
}

function alignedAttributes(text, dimension) {
  const lower = text.toLowerCase();
  return dimension.attributes.filter(attr => {
    const words = attr.name.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    return words.some(w => lower.includes(w));
  }).map(attr => ({ id: attr.id, name: attr.name }));
}

// ── main export ────────────────────────────────────────────────────────────

/**
 * @param {object} input
 * @param {string} input.gcspName
 * @param {string} input.narrative
 * @param {string} input.accomplishments
 * @param {string} input.suggestedRating  - one of: Needs Improvement | Meets Expectations | Differentiating | Strategic Impact
 * @param {string} input.reviewerObservations
 * @param {object} framework              - parsed attributeFramework.json
 * @returns {object} full analysis output
 */
function analyze(input, framework) {
  const {
    gcspName             = 'Unknown',
    narrative            = '',
    accomplishments      = '',
    suggestedRating      = 'Meets Expectations',
    reviewerObservations = '',
  } = input;

  // -- corpus
  const corpus = [narrative, accomplishments, reviewerObservations].join(' ');

  // -- validate suggested rating
  const effectiveSuggested = RATINGS.includes(suggestedRating) ? suggestedRating : 'Meets Expectations';
  const suggestedBandKey   = BAND_KEY[effectiveSuggested];

  // -- dimension calibration
  const dimensionCalibration = framework.dimensions.map(dim => {
    // Score against the suggested band
    const { hits, total, matchedSignals } = scoreAgainstBand(corpus, dim, suggestedBandKey);
    const strength = toStrength(hits, total);
    const snippets = extractSnippets(corpus, matchedSignals);
    const aligned  = alignedAttributes(corpus, dim);

    // Find which band the evidence most closely aligns to (highest ratio)
    let bestRatio = -1;
    let evidenceBand = effectiveSuggested;
    for (const rating of RATINGS) {
      const bk = BAND_KEY[rating];
      const { hits: bHits, total: bTotal } = scoreAgainstBand(corpus, dim, bk);
      const ratio = bTotal > 0 ? bHits / bTotal : 0;
      if (ratio > bestRatio) { bestRatio = ratio; evidenceBand = rating; }
    }

    const notes = [];
    if (strength === 'Thin')
      notes.push(`No clear evidence of ${effectiveSuggested}-level performance in ${dim.name}.`);
    if (strength === 'Strong')
      notes.push(`${hits} of ${total} performance signals found — solid evidence for ${effectiveSuggested}.`);
    if (strength === 'Moderate')
      notes.push(`Partial evidence (${hits}/${total} signals) — some proof points present, more would strengthen the case.`);

    // What proof points would strengthen the case for the suggested rating
    const bandSignals    = (dim.performanceBands[suggestedBandKey] || {}).signals || [];
    const missingSignals = bandSignals.filter(s => !corpus.toLowerCase().includes(s.toLowerCase()));
    const whatWouldStrengthen = missingSignals.slice(0, 3).map(s => `Provide evidence of: "${s}"`);
    if (whatWouldStrengthen.length === 0)
      whatWouldStrengthen.push(`Evidence is already well-documented for ${effectiveSuggested} in ${dim.name}.`);

    return {
      dimension          : dim.name,
      strength,
      evidenceBand,
      evidenceSnippets   : snippets,
      alignedAttributes  : aligned,
      notes,
      whatWouldStrengthen,
    };
  });

  // -- assessment
  const strongCount   = dimensionCalibration.filter(d => d.strength === 'Strong').length;
  const thinCount     = dimensionCalibration.filter(d => d.strength === 'Thin').length;
  const moderateCount = dimensionCalibration.filter(d => d.strength === 'Moderate').length;

  let assessment;
  if      (thinCount >= 3)                     assessment = 'Does Not Support';
  else if (strongCount >= 3 && thinCount <= 1) assessment = 'Supports';
  else                                         assessment = 'Partially Supports';

  // Which rating band does the majority of evidence land in?
  const bandVotes = {};
  for (const dc of dimensionCalibration)
    bandVotes[dc.evidenceBand] = (bandVotes[dc.evidenceBand] || 0) + 1;
  const evidenceAligns = Object.entries(bandVotes).sort((a, b) => b[1] - a[1])[0]?.[0] || effectiveSuggested;

  // Highest band where majority (>=3) of dimensions reach Moderate or Strong
  let supportedRating = 'Needs Improvement';
  for (const rating of [...RATINGS].reverse()) {
    const bk = BAND_KEY[rating];
    const qualifyingDims = dimensionCalibration.filter(dc => {
      const { hits, total } = scoreAgainstBand(corpus, framework.dimensions.find(d => d.name === dc.dimension), bk);
      return toStrength(hits, total) !== 'Thin';
    }).length;
    if (qualifyingDims >= 3) { supportedRating = rating; break; }
  }

  // Confidence: evidence-based, no artificial floor
  // Strong dims contribute 0.20 each, Moderate 0.08 each, capped at 0.95
  const confidence = parseFloat(
    Math.min(0.95, (strongCount * 0.20) + (moderateCount * 0.08)).toFixed(2)
  );

  const suggestedIdx  = RATINGS.indexOf(effectiveSuggested);
  const supportedIdx  = RATINGS.indexOf(supportedRating);
  const levelGap      = suggestedIdx - supportedIdx;

  const why = [];
  if (strongCount   > 0) why.push(`${strongCount} dimension(s) show Strong evidence consistent with the ${effectiveSuggested} rating.`);
  if (thinCount     > 0) why.push(`${thinCount} dimension(s) lack sufficient proof points to support a ${effectiveSuggested} rating.`);
  if (moderateCount > 0) why.push(`${moderateCount} dimension(s) show partial evidence — additional specific examples would strengthen the case.`);
  if (assessment === 'Supports')
    why.push(`Overall, the evidence supports the suggested rating of ${effectiveSuggested}.`);
  if (assessment === 'Partially Supports')
    why.push(`The evidence partially supports ${effectiveSuggested} — some dimensions need stronger proof points.`);
  if (assessment === 'Does Not Support')
    why.push(`The evidence does not yet sufficiently support the suggested rating of ${effectiveSuggested}.`);
  if (levelGap >= 1)
    why.push(`The documented evidence most fully supports ${supportedRating}${levelGap >= 2 ? ` — a gap of ${levelGap} level${levelGap > 1 ? 's' : ''} below the suggestion` : ''}.`);

  const verdict = {
    assessment,
    suggestedRating : effectiveSuggested,
    supportedRating,
    evidenceAligns,
    confidence,
    why,
  };

  // -- critical gaps
  const criticalGaps = [];

  dimensionCalibration.forEach((dc, i) => {
    if (dc.strength !== 'Thin') return;
    const dim        = framework.dimensions[i];
    const bandSigs   = (dim.performanceBands[suggestedBandKey] || {}).signals || [];
    const missingSigs = bandSigs.filter(s => !corpus.toLowerCase().includes(s.toLowerCase()));
    criticalGaps.push({
      gap               : `Insufficient evidence to support ${effectiveSuggested} in ${dc.dimension}`,
      impactedDimensions: [dc.dimension],
      missingProofPoints: missingSigs.slice(0, 4),
      relatedAttributes : dim.attributes.map(a => ({ id: a.id, name: a.name })),
    });
  });

  // Flag dimensions where no attribute-level evidence found (and not already a critical gap)
  dimensionCalibration.forEach((dc, i) => {
    if (dc.alignedAttributes.length > 0) return;
    if (criticalGaps.some(g => g.impactedDimensions.includes(dc.dimension))) return;
    const dim = framework.dimensions[i];
    criticalGaps.push({
      gap               : `No attribute-level evidence found for ${dc.dimension}`,
      impactedDimensions: [dc.dimension],
      missingProofPoints: [`Narrative should reference at least one of: ${dim.attributes.map(a => a.name).join('; ')}`],
      relatedAttributes : dim.attributes.map(a => ({ id: a.id, name: a.name })),
    });
  });

  // -- goals
  const goals = [];

  // From critical gaps first
  for (const gap of criticalGaps.slice(0, 3)) {
    const dimObj = framework.dimensions.find(d => gap.impactedDimensions.includes(d.name));
    if (!dimObj) continue;
    goals.push({
      goalTitle         : `Strengthen evidence in ${dimObj.name}`,
      description       : `Build concrete proof points to better support the ${effectiveSuggested} rating in ${dimObj.name}.`,
      alignedDimensions : [dimObj.name],
      alignedAttributes : dimObj.attributes.slice(0, 2).map(a => ({ id: a.id, name: a.name })),
      proofPoints       : gap.missingProofPoints.slice(0, 3),
      timeframe         : 'This review cycle',
    });
  }

  // Supplement with moderate dimensions when fewer than 3 gaps
  if (goals.length < 3) {
    for (const dc of dimensionCalibration) {
      if (goals.length >= 5) break;
      if (dc.strength !== 'Moderate') continue;
      if (criticalGaps.some(g => g.impactedDimensions.includes(dc.dimension))) continue;
      const dimObj  = framework.dimensions.find(d => d.name === dc.dimension);
      if (!dimObj) continue;
      const bandSigs   = (dimObj.performanceBands[suggestedBandKey] || {}).signals || [];
      const missingSigs = bandSigs.filter(s => !corpus.toLowerCase().includes(s.toLowerCase())).slice(0, 3);
      if (missingSigs.length === 0) continue;
      goals.push({
        goalTitle         : `Deepen evidence in ${dimObj.name}`,
        description       : `Add more specific proof points that clearly demonstrate ${effectiveSuggested}-level performance in ${dimObj.name}.`,
        alignedDimensions : [dimObj.name],
        alignedAttributes : dimObj.attributes.slice(0, 2).map(a => ({ id: a.id, name: a.name })),
        proofPoints       : missingSigs.map(s => `Provide evidence of: "${s}"`),
        timeframe         : 'Ongoing',
      });
    }
  }

  // -- talking points
  const strongDims   = dimensionCalibration.filter(d => d.strength === 'Strong').map(d => d.dimension);
  const thinDims     = dimensionCalibration.filter(d => d.strength === 'Thin').map(d => d.dimension);
  const moderateDims = dimensionCalibration.filter(d => d.strength === 'Moderate').map(d => d.dimension);

  const talkingPoints = {
    open: [
      `I'd like to review whether the performance evidence this cycle supports the suggested ${effectiveSuggested} rating for ${gcspName}.`,
      `I'll walk through each of the five dimensions and share where the documented proof points align with this rating — and where additional evidence would be helpful.`,
    ],
    strengths: strongDims.length
      ? strongDims.map(d => `${gcspName} demonstrates strong, well-documented evidence in ${d} that is consistent with a ${effectiveSuggested} rating.`)
      : [`The narrative provides a foundation; I'll highlight where evidence is strongest across the dimensions.`],
    developmentalFeedback: thinDims.length
      ? thinDims.map(d => `${d} currently lacks sufficient proof points to fully support the ${effectiveSuggested} rating. More specific, documented examples are needed.`)
      : moderateDims.map(d => `${d} is partially evidenced — additional, specific examples would make the case more compelling for ${effectiveSuggested}.`),
    pushback: [
      {
        scenario : `Reviewer questions whether the evidence truly merits ${effectiveSuggested}.`,
        response : strongDims.length
          ? `${strongDims.length} dimension(s) — ${strongDims.join(', ')} — show clear, documented evidence that aligns with a ${effectiveSuggested} rating.`
          : `I agree the evidence is mixed. I recommend focusing on the development actions to build a stronger, more consistent case next cycle.`,
      },
      {
        scenario : `Pushback on gaps in ${thinDims[0] || moderateDims[0] || 'weaker dimensions'}.`,
        response : `I agree the documentation in this area needs strengthening. The development actions I've outlined target exactly these proof point gaps to ensure a stronger submission next cycle.`,
      },
    ],
    close: [
      `In summary, the evidence ${assessment.toLowerCase()} the ${effectiveSuggested} rating with ${Math.round(confidence * 100)}% confidence.`,
      `I recommend focusing on building stronger proof points in the identified dimensions to sustain this rating consistently going forward.`,
    ],
  };

  // -- export summary
  const exportSummary = {
    header             : `GCSP Review Summary — ${gcspName}`,
    verdictLine        : `Suggested: ${effectiveSuggested} | Evidence Supports: ${supportedRating} | Assessment: ${assessment} | Confidence: ${Math.round(confidence * 100)}%`,
    dimensionHighlights: dimensionCalibration.map(d => `${d.dimension}: ${d.strength}`),
    criticalGaps       : criticalGaps.map(g => g.gap),
    talkingPointsHighlights: [
      ...talkingPoints.strengths.slice(0, 2),
      ...talkingPoints.developmentalFeedback.slice(0, 2),
    ],
    goals              : goals.map(g => `${g.goalTitle} (${g.timeframe})`),
  };

  return {
    verdict,
    dimensionCalibration,
    criticalGaps,
    talkingPoints,
    goals,
    exportSummary,
  };
}

module.exports = { analyze };