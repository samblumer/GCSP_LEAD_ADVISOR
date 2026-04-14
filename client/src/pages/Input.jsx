import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Sarah Mitchell sample data ──────────────────────────────────────────────
const SAMPLE = {
  gcspName: 'Sarah Mitchell',
  narrative:
    'This year I served as the lead client relationship partner on a Fortune 500 financial services engagement, ' +
    'deepening our executive relationship to the C-suite and earning a renewed three-year contract extension. ' +
    'I grew the account by $2.4M through identifying and closing two new workstreams, and I acted as a trusted ' +
    'strategic advisor to the client\'s CFO on their digital transformation roadmap. In parallel, I led a ' +
    'business development pursuit for a new logo in the insurance sector, resulting in a signed engagement. ' +
    'I authored a white paper on AI-driven financial risk modeling that was cited in two industry publications ' +
    'and presented at the national Risk Management Association conference as a keynote speaker. I also built ' +
    'and managed a high-performing cross-functional team of eight, providing talent development, succession ' +
    'planning conversations, and sponsoring two staff members for promotion. Throughout the year I led our ' +
    'office\'s DE&I initiative and co-chaired the firm\'s cross-practice knowledge management committee.',
  accomplishments:
    'Closed a $2.4M account expansion through two new workstreams on the flagship financial services client. ' +
    'Secured a new logo in the insurance vertical — full proposal lead through contract execution. ' +
    'Keynote speaker at the Risk Management Association national conference; white paper cited in Bloomberg ' +
    'Risk and the Journal of Financial Compliance. ' +
    'Built a team of eight; sponsored two direct reports for promotion through talent development conversations. ' +
    'Co-chaired the firm-wide knowledge management committee and led the office DE&I inclusion initiative. ' +
    'Managed client expectations through a critical regulatory change, maintaining client retention and trust.',
  suggestedRating: 'Differentiating',
  reviewerObservations:
    'Sarah has clearly established an executive relationship with the client CFO and demonstrated strong ' +
    'client retention and revenue growth. Her eminence work is notable for this level. ' +
    'Development area: succession planning depth and firmwide program leadership could be more explicit.',
};

// ── styles ──────────────────────────────────────────────────────────────────
const card = {
  background: '#fff',
  border: '1px solid #D7D7DC',
  borderRadius: '2px',
  padding: '2rem 2.25rem',
  marginBottom: '1.5rem',
  boxShadow: '0 2px 6px rgba(46,46,56,0.07)',
};

const cardSectionHead = {
  fontSize: '0.6875rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#747480',
  marginTop: 0,
  marginBottom: '1.375rem',
  paddingBottom: '0.75rem',
  borderBottom: '2px solid #FFE600',
  display: 'inline-block',
};

const fieldLabel = {
  display: 'block',
  fontWeight: '700',
  fontSize: '0.8125rem',
  color: '#2E2E38',
  marginBottom: '0.35rem',
  letterSpacing: '0.01em',
};

const helperText = {
  fontSize: '0.8125rem',
  color: '#747480',
  margin: '0 0 0.5rem',
  lineHeight: '1.5',
};

const optionalBadge = {
  fontWeight: '400',
  fontSize: '0.75rem',
  color: '#9F9FAD',
  marginLeft: '0.4rem',
};

const inputBase = {
  width: '100%',
  padding: '0.625rem 0.75rem',
  border: '1px solid #D7D7DC',
  borderRadius: '2px',
  fontSize: '0.9375rem',
  color: '#2E2E38',
  background: '#fff',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
};

const textareaBase = { ...inputBase, resize: 'vertical', lineHeight: '1.65' };

const btnPrimary = {
  padding: '0.7rem 1.875rem',
  background: '#FFE600',
  color: '#1A1A24',
  border: 'none',
  borderRadius: '2px',
  fontSize: '0.9375rem',
  fontWeight: '700',
  cursor: 'pointer',
  letterSpacing: '0.02em',
};

const btnSecondary = {
  padding: '0.7rem 1.25rem',
  background: '#fff',
  color: '#2E2E38',
  border: '1px solid #2E2E38',
  borderRadius: '2px',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
};

const btnGhost = {
  padding: '0.7rem 1rem',
  background: 'transparent',
  color: '#9F9FAD',
  border: '1px solid #D7D7DC',
  borderRadius: '2px',
  fontSize: '0.875rem',
  cursor: 'pointer',
};

const RATINGS = [
  'Strategic Impact',
  'Differentiating',
  'Meets Expectation',
  'Needs Improvement',
];

const EMPTY = {
  gcspName: '',
  narrative: '',
  accomplishments: '',
  suggestedRating: '',
  reviewerObservations: '',
};

// ── component ───────────────────────────────────────────────────────────────
export default function Input({ setAnalysisResult, setIsLoading, setAnalysisError }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleAnalyze = async () => {
    if (!form.gcspName.trim() || !form.narrative.trim() || !form.accomplishments.trim() || !form.suggestedRating) {
      setError('Please complete all required fields before analyzing.');
      return;
    }
    setError(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsLoading(true);
    navigate('/analysis');       // go immediately — skeleton shows on Screen 2
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gcspName            : form.gcspName,
          narrative           : form.narrative,
          accomplishments     : form.accomplishments,
          suggestedRating     : form.suggestedRating,
          reviewerObservations: form.reviewerObservations,
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      setAnalysisError(`Analysis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2E2E38', margin: 0, letterSpacing: '-0.01em' }}>
          Review Input
        </h1>
        <p style={{ color: '#747480', marginTop: '0.4rem', fontSize: '0.9375rem' }}>
          Enter the GCSP’s self-assessment details to generate a calibrated analysis.
        </p>
      </div>

      {/* Card 1: Identity */}
      <div style={card}>
        <div style={cardSectionHead}>Identity &amp; Rating</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div>
            <label style={fieldLabel}>
              GCSP Name <span style={{ color: '#C4313A' }}>*</span>
            </label>
            <input
              type="text"
              value={form.gcspName}
              onChange={set('gcspName')}
              placeholder="e.g. Sarah Mitchell"
              style={inputBase}
            />
          </div>
          <div>
            <label style={fieldLabel}>
              Suggested Rating <span style={{ color: '#C4313A' }}>*</span>
            </label>
            <select
              value={form.suggestedRating}
              onChange={set('suggestedRating')}
              style={{ ...inputBase, appearance: 'auto' }}
            >
              <option value="">Select a rating…</option>
              {RATINGS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Card 2: Self-Assessment */}
      <div style={card}>
        <div style={cardSectionHead}>Self-Assessment</div>

        <div style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
          <label style={fieldLabel}>
            Self-Assessment Narrative <span style={{ color: '#C4313A' }}>*</span>
          </label>
          <p style={helperText}>
            Provide a narrative summary of performance, behaviors, and impact this review period.
          </p>
          <textarea
            rows={7}
            value={form.narrative}
            onChange={set('narrative')}
            placeholder="Describe your overall performance, key behaviors, and the impact you delivered this year…"
            style={textareaBase}
          />
        </div>

        <div>
          <label style={fieldLabel}>
            Key Accomplishments This Year <span style={{ color: '#C4313A' }}>*</span>
          </label>
          <p style={helperText}>
            List specific, measurable accomplishments. Include numbers, outcomes, and scope where possible.
          </p>
          <textarea
            rows={6}
            value={form.accomplishments}
            onChange={set('accomplishments')}
            placeholder="e.g. Grew account by $X, led proposal that won new logo, keynote at industry conference…"
            style={textareaBase}
          />
        </div>
      </div>

      {/* Card 3: Reviewer Observations */}
      <div style={card}>
        <div style={cardSectionHead}>Reviewer Context</div>
        <div style={{ marginTop: '1.5rem' }}>
        <label style={fieldLabel}>
          Reviewer’s Initial Observations
          <span style={optionalBadge}>(optional)</span>
        </label>
        <p style={helperText}>
          Notes on strengths, concerns, or context the reviewer wants the engine to factor in.
        </p>
        <textarea
          rows={4}
          value={form.reviewerObservations}
          onChange={set('reviewerObservations')}
          placeholder="e.g. Strong client relationships noted. Question whether eminence evidence is sufficient at this level…"
          style={textareaBase}
        />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#FFF1F1', border: '1px solid #F5A5A5',
          borderLeft: '4px solid #C4313A', borderRadius: '2px',
          color: '#C4313A', fontSize: '0.875rem', marginBottom: '1.25rem', fontWeight: '500' }}>
          {error}
        </div>
      )}      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button style={btnPrimary} onClick={handleAnalyze}>
          Analyze →
        </button>
        <button style={btnSecondary} onClick={() => setForm(SAMPLE)}>
          Load Sample Data
        </button>
        <button style={btnGhost} onClick={() => { setForm(EMPTY); setError(null); }}>
          Clear
        </button>
      </div>

      {/* Footer */}
      <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#9F9FAD',
        borderTop: '1px solid #EBEBEF', paddingTop: '1rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ display: 'inline-block', width: '8px', height: '8px',
          borderRadius: '50%', background: '#168736' }} />
        Framework loaded · 5 dimensions · Deterministic engine v1.0
      </p>
    </div>
  );
}

