import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── design tokens ─────────────────────────────────────────────────────────
const EY_YELLOW   = '#FFE600';
const EY_CHARCOAL = '#2E2E38';
const EY_GRAY     = '#747480';
const EY_RED      = '#C4313A';
const EY_GREEN    = '#168736';

const STRENGTH_COLORS = {
  Strong:   { bg: '#E8F5EC', text: EY_GREEN,    border: '#A3D8AF' },
  Moderate: { bg: '#FFF9E6', text: '#7C5500',   border: '#F5D76A' },
  Thin:     { bg: '#FFF1F1', text: EY_RED,      border: '#F5A5A5' },
};

const ASSESSMENT_COLORS = {
  'Supports':           { bg: '#E8F5EC', text: EY_GREEN  },
  'Partially Supports': { bg: '#FFF9E6', text: '#7C5500' },
  'Does Not Support':   { bg: '#FFF1F1', text: EY_RED    },
};

// ── shared helpers ────────────────────────────────────────────────────────
function SectionHeader({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
      <span style={{ display: 'inline-block', width: '3px', height: '14px',
        background: EY_YELLOW, borderRadius: '1px', flexShrink: 0 }} />
      <h3 style={{ fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase',
        letterSpacing: '0.1em', color: EY_GRAY, margin: 0 }}>
        {children}
      </h3>
    </div>
  );
}

function Badge({ label, bg, text, border }) {
  return (
    <span style={{ display: 'inline-block', padding: '0.2rem 0.75rem',
      background: bg, color: text, border: `1px solid ${border || bg}`,
      borderRadius: '2px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.04em' }}>
      {label}
    </span>
  );
}

function AttrChip({ id, name, bg = '#F6F6FA', border = '#D7D7DC', text = '#2E2E38', idColor = '#9F9FAD' }) {
  return (
    <span style={{ background: bg, border: `1px solid ${border}`, borderRadius: '2px',
      padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: text, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      <span style={{ color: idColor, fontWeight: '600' }}>{id}</span>{name}
    </span>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────
function SkeletonBox({ w = '100%', h = '1rem', mb = '0.5rem', radius = '2px' }) {
  return (
    <div style={{ width: w, height: h, marginBottom: mb, borderRadius: radius,
      background: 'linear-gradient(90deg,#EBEBEF 25%,#D7D7DC 50%,#EBEBEF 75%)',
      backgroundSize: '400% 100%', animation: 'skpulse 1.4s ease infinite' }} />
  );
}

function LoadingSkeleton() {
  return (
    <>
      <style>{`@keyframes skpulse{0%,100%{background-position:100% 0}50%{background-position:0 0}}`}</style>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <SkeletonBox w="220px" h="1.75rem" mb="0" />
          <SkeletonBox w="130px" h="1.5rem" mb="0" radius="6px" />
        </div>
        {/* Verdict card */}
        <div style={{ background: '#fff', border: '1px solid #D7D7DC', borderLeft: `4px solid ${EY_YELLOW}`, borderRadius: '2px', padding: '1.5rem', marginBottom: '1.75rem' }}>
          <SkeletonBox w="35%" h="0.875rem" mb="1.25rem" />
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem' }}>
            <SkeletonBox w="90px" h="2rem" mb="0" radius="6px" />
            <SkeletonBox w="130px" h="2rem" mb="0" radius="6px" />
            <SkeletonBox w="80px" h="2rem" mb="0" radius="6px" />
          </div>
          <SkeletonBox w="85%" mb="0.5rem" />
          <SkeletonBox w="72%" mb="0.5rem" />
          <SkeletonBox w="60%" mb="0" />
        </div>
        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: `2px solid #D7D7DC`, paddingBottom: '0.75rem' }}>
          {['140px','120px','100px'].map((w, i) => <SkeletonBox key={i} w={w} h="1rem" mb="0" />)}
        </div>
        {/* Dimension cards */}
        {[1,2,3].map(i => (
          <div key={i} style={{ background: '#fff', border: '1px solid #D7D7DC', borderRadius: '2px', padding: '1.25rem 1.5rem', marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <SkeletonBox w="170px" h="1.1rem" mb="0" />
              <SkeletonBox w="70px" h="1.4rem" mb="0" radius="999px" />
            </div>
            <SkeletonBox w="90%" mb="0.4rem" />
            <SkeletonBox w="70%" mb="0" />
          </div>
        ))}
      </div>
    </>
  );
}

// ── Dimension card ────────────────────────────────────────────────────────
function DimensionCard({ dim }) {
  const [open, setOpen] = useState(false);
  const sc = STRENGTH_COLORS[dim.strength] || STRENGTH_COLORS.Moderate;

  return (
    <div style={{ background: '#fff', border: '1px solid #D7D7DC', borderRadius: '2px',
      padding: '1.25rem 1.5rem', marginBottom: '0.875rem',
      boxShadow: '0 1px 4px rgba(46,46,56,0.06)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
        <span style={{ fontWeight: '700', fontSize: '0.9375rem', color: EY_CHARCOAL }}>{dim.dimension}</span>
        <Badge label={dim.strength} bg={sc.bg} text={sc.text} border={sc.border} />
      </div>

      {/* Notes */}
      {dim.notes?.length > 0 && (
        <ul style={{ margin: '0 0 0.875rem', paddingLeft: '1.25rem', color: '#505060', fontSize: '0.875rem', lineHeight: '1.65' }}>
          {dim.notes.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      )}

      {/* Aligned attributes */}
      {dim.alignedAttributes?.length > 0 && (
        <div style={{ marginBottom: '0.875rem' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: EY_GRAY, margin: '0 0 0.4rem' }}>Aligned attributes</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {dim.alignedAttributes.map(a => <AttrChip key={a.id} id={a.id} name={a.name} />)}
          </div>
        </div>
      )}

      {/* What would strengthen */}
      {dim.whatWouldStrengthen?.length > 0 && (
        <div style={{ background: '#F6F6FA', border: '1px solid #EBEBEF', borderRadius: '2px',
          padding: '0.75rem 1rem', marginBottom: '0.875rem' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase',
            letterSpacing: '0.08em', color: EY_GRAY, margin: '0 0 0.4rem' }}>What would strengthen this</p>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#505060', fontSize: '0.8125rem', lineHeight: '1.65' }}>
            {dim.whatWouldStrengthen.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Collapsible evidence */}
      {dim.evidenceSnippets?.length > 0 && (
        <>
          <button onClick={() => setOpen(o => !o)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: '0.8125rem', color: '#1558CC', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>{open ? '▾' : '▸'}</span> Evidence details ({dim.evidenceSnippets.length})
          </button>
          {open && (
            <div style={{ marginTop: '0.625rem', borderLeft: `3px solid ${EY_YELLOW}`, paddingLeft: '0.875rem' }}>
              {dim.evidenceSnippets.map((s, i) => (
                <p key={i} style={{ fontSize: '0.8125rem', color: EY_GRAY, fontStyle: 'italic',
                  margin: '0 0 0.35rem', lineHeight: '1.55' }}>“{s}”</p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Critical gaps ─────────────────────────────────────────────────────────
function CriticalGapsSection({ gaps }) {
  if (!gaps?.length) return null;
  return (
    <div style={{ marginTop: '2rem' }}>
      <SectionHeader>⚠ Critical Gaps ({gaps.length})</SectionHeader>
      {gaps.map((g, i) => (
        <div key={i} style={{ background: '#FFF8F0', border: '1px solid #FBCF97',
          borderLeft: `4px solid #E07B1A`,
          borderRadius: '2px', padding: '1rem 1.25rem', marginBottom: '0.875rem' }}>
          <p style={{ fontWeight: '600', color: '#9a3412', fontSize: '0.875rem', margin: '0 0 0.6rem' }}>{g.gap}</p>
          {g.impactedDimensions?.length > 0 && (
            <p style={{ fontSize: '0.8125rem', color: '#7c2d12', margin: '0 0 0.5rem' }}>
              <strong>Impacted:</strong> {g.impactedDimensions.join(', ')}
            </p>
          )}
          {g.missingProofPoints?.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#c2410c', margin: '0 0 0.3rem' }}>Missing proof points</p>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8125rem', color: '#7c2d12', lineHeight: '1.65' }}>
                {g.missingProofPoints.map((p, j) => <li key={j}>{p}</li>)}
              </ul>
            </div>
          )}
          {g.relatedAttributes?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
              {g.relatedAttributes.map(a => (
                <AttrChip key={a.id} id={a.id} name={a.name}
                  bg="#ffedd5" border="#fed7aa" text="#c2410c" idColor="#9a3412" />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Talking points tab ────────────────────────────────────────────────────
function TalkingPointsTab({ tp }) {
  const plain = [
    { key: 'open',                icon: '◎', title: 'How to open the conversation', items: tp.open },
    { key: 'strengths',           icon: '✦', title: 'Strengths to acknowledge',     items: tp.strengths },
    { key: 'developmentalFeedback', icon: '↑', title: 'Developmental feedback',    items: tp.developmentalFeedback },
    { key: 'close',               icon: '✓', title: 'Closing statement',            items: tp.close },
  ];

  return (
    <div>
      {plain.map(s => s.items?.length > 0 && (
        <div key={s.key} style={{ background: '#fff', border: '1px solid #D7D7DC',
          borderRadius: '2px', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
          <p style={{ fontWeight: '700', fontSize: '0.875rem', color: EY_CHARCOAL, margin: '0 0 0.75rem' }}>
            <span style={{ marginRight: '0.45rem', color: EY_GRAY }}>{s.icon}</span>{s.title}
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#505060', fontSize: '0.875rem', lineHeight: '1.7' }}>
            {s.items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      ))}

      {/* Pushback */}
      {tp.pushback?.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #D7D7DC',
          borderRadius: '2px', padding: '1.25rem 1.5rem' }}>
          <p style={{ fontWeight: '700', fontSize: '0.875rem', color: EY_CHARCOAL, margin: '0 0 1rem' }}>
            <span style={{ marginRight: '0.45rem', color: EY_GRAY }}>⚡</span>Handling pushback
          </p>
          {tp.pushback.map((pb, i) => (
            <div key={i} style={{
              marginBottom: i < tp.pushback.length - 1 ? '1.25rem' : 0,
              paddingBottom: i < tp.pushback.length - 1 ? '1.25rem' : 0,
              borderBottom: i < tp.pushback.length - 1 ? '1px solid #EBEBEF' : 'none',
            }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#5E3FA0', margin: '0 0 0.35rem' }}>
                Scenario: {pb.scenario}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#505060', margin: 0, lineHeight: '1.65' }}>{pb.response}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Goals tab ─────────────────────────────────────────────────────────────
function GoalsTab({ goals }) {
  const total = goals?.length || 0;
  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: EY_GRAY, marginBottom: '1.5rem' }}>
        {total} development action{total !== 1 ? 's' : ''} focused on strengthening evidence in dimensions that need stronger proof points.
      </p>
      {(goals || []).map((g, i) => (
        <div key={i} style={{ background: '#fff', border: '1px solid #D7D7DC',
          borderRadius: '2px', padding: '1.25rem 1.5rem', marginBottom: '1rem',
          boxShadow: '0 1px 4px rgba(46,46,56,0.06)' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '700', fontSize: '0.9375rem', color: EY_CHARCOAL, flex: 1 }}>
              Goal {i + 1} / {total} &mdash; {g.goalTitle}
            </span>
            <span style={{ background: '#E8F5EC', border: `1px solid #A3D8AF`, color: EY_GREEN,
              borderRadius: '2px', padding: '0.15rem 0.65rem', fontSize: '0.75rem',
              fontWeight: '700', whiteSpace: 'nowrap', marginLeft: '1rem', flexShrink: 0 }}>
              {g.timeframe}
            </span>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#505060', margin: '0 0 0.875rem', lineHeight: '1.65' }}>
            {g.description}
          </p>

          {g.alignedDimensions?.length > 0 && (
            <p style={{ fontSize: '0.8125rem', color: EY_GRAY, margin: '0 0 0.6rem' }}>
              <strong style={{ color: EY_CHARCOAL }}>Dimensions: </strong>
              {g.alignedDimensions.join(', ')}
            </p>
          )}

          {g.alignedAttributes?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.875rem' }}>
              {g.alignedAttributes.map(a => (
                <AttrChip key={a.id} id={a.id} name={a.name}
                  bg="#E8F0FB" border="#BDD2F5" text="#1558CC" idColor="#6B9EE8" />
              ))}
            </div>
          )}

          {g.proofPoints?.length > 0 && (
            <div style={{ background: '#F6F6FA', border: '1px solid #EBEBEF', borderRadius: '2px', padding: '0.625rem 0.875rem' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase',
                letterSpacing: '0.08em', color: EY_GRAY, margin: '0 0 0.35rem' }}>
                Suggested proof points
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8125rem', color: '#505060', lineHeight: '1.65' }}>
                {g.proofPoints.map((p, j) => <li key={j}>{p}</li>)}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function Analysis({ analysisResult, isLoading, analysisError }) {
  const [activeTab, setActiveTab] = useState('calibration');
  const navigate = useNavigate();

  if (isLoading && !analysisResult) {
    return (
      <div>
        <p style={{ color: EY_GRAY, fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Running calibration analysis&hellip;
        </p>
        <LoadingSkeleton />
      </div>
    );
  }

  if (analysisError) {
    return (
      <div style={{ padding: '2.5rem 0' }}>
        <div style={{ background: '#FFF1F1', border: '1px solid #F5A5A5',
          borderLeft: `4px solid ${EY_RED}`,
          borderRadius: '2px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: '700', color: EY_RED, margin: '0 0 0.4rem', fontSize: '0.9375rem' }}>
            Analysis could not be completed
          </p>
          <p style={{ color: '#7C2020', fontSize: '0.875rem', margin: 0 }}>{analysisError}</p>
        </div>
        <p style={{ fontSize: '0.875rem', color: EY_GRAY, marginBottom: '1.25rem' }}>
          The server may be unavailable or the input may have caused an error.
          Go back to Input to review your data and try again.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/')}
            style={{ padding: '0.65rem 1.75rem', background: EY_YELLOW, color: '#1A1A24',
              border: 'none', borderRadius: '2px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9375rem' }}>
            ← Back to Input &amp; Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: EY_GRAY }}>
        <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>No analysis available yet.</p>
        <button onClick={() => navigate('/')}
          style={{ padding: '0.65rem 1.75rem', background: EY_YELLOW, color: '#1A1A24',
            border: 'none', borderRadius: '2px', cursor: 'pointer', fontWeight: '700' }}>
          ← Go to Input
        </button>
      </div>
    );
  }

  const { verdict, dimensionCalibration, criticalGaps, talkingPoints, goals } = analysisResult;
  const gcspName = analysisResult.exportSummary?.header?.replace('GCSP Review Summary \u2014 ', '') ?? 'GCSP';
  const ac = ASSESSMENT_COLORS[verdict.assessment] || ASSESSMENT_COLORS['Partially Supports'];

  const TABS = [
    { id: 'calibration', label: 'Calibration' },
    { id: 'talking',     label: 'Talking Points' },
    { id: 'goals',       label: `Goals (${goals?.length || 0})` },
  ];

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: EY_CHARCOAL,
            margin: 0, letterSpacing: '-0.01em' }}>{gcspName}</h1>
          <p style={{ color: EY_GRAY, margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
            Review Calibration Analysis
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignSelf: 'flex-start' }}>
          <span style={{ background: '#F6F6FA', border: '1px solid #D7D7DC',
            borderTop: `3px solid ${ac.text}`,
            color: EY_CHARCOAL, borderRadius: '2px',
            padding: '0.4rem 0.9rem', fontSize: '0.875rem',
            fontWeight: '700' }}>
            Suggested: {verdict.suggestedRating}
          </span>
          {verdict.supportedRating && verdict.supportedRating !== verdict.suggestedRating && (
            <span style={{ background: '#FFF9E6', border: '1px solid #F5D76A',
              borderTop: '3px solid #7C5500',
              color: '#7C5500', borderRadius: '2px',
              padding: '0.4rem 0.9rem', fontSize: '0.8rem',
              fontWeight: '700' }}>
              Evidence Supports: {verdict.supportedRating}
            </span>
          )}
        </div>
      </div>

      {/* Verdict card */}
      <div style={{ background: '#fff', border: '1px solid #D7D7DC',
        borderLeft: `4px solid ${EY_YELLOW}`,
        borderRadius: '2px',
        padding: '1.5rem', marginBottom: '1.75rem',
        boxShadow: '0 2px 6px rgba(46,46,56,0.07)' }}>
        <SectionHeader>Evidence Assessment</SectionHeader>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: EY_GRAY, margin: '0 0 0.35rem' }}>Assessment</p>
            <span style={{ background: ac.bg, color: ac.text, borderRadius: '2px',
              padding: '0.3rem 0.9rem', fontWeight: '700', fontSize: '1rem', letterSpacing: '0.01em' }}>
              {verdict.assessment}
            </span>
          </div>
          <div style={{ width: '1px', height: '38px', background: '#D7D7DC' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: EY_GRAY, margin: '0 0 0.35rem' }}>Evidence Supports</p>
            <span style={{ fontWeight: '700', fontSize: '1rem',
              color: verdict.supportedRating !== verdict.suggestedRating ? '#7C5500' : EY_GREEN }}>
              {verdict.supportedRating}
            </span>
          </div>
          <div style={{ width: '1px', height: '38px', background: '#D7D7DC' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: EY_GRAY, margin: '0 0 0.35rem' }}>Evidence Aligns To</p>
            <span style={{ fontWeight: '700', fontSize: '1rem', color: EY_CHARCOAL }}>{verdict.evidenceAligns}</span>
          </div>
          <div style={{ width: '1px', height: '38px', background: '#D7D7DC' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: EY_GRAY, margin: '0 0 0.35rem' }}>Confidence</p>
            <span style={{ fontWeight: '700', fontSize: '1rem', color: EY_CHARCOAL }}>
              {Math.round((verdict.confidence || 0) * 100)}%
            </span>
          </div>
        </div>

        {verdict.why?.length > 0 && (
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#505060', fontSize: '0.875rem', lineHeight: '1.7' }}>
            {verdict.why.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: `2px solid #D7D7DC`, marginBottom: '1.5rem' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ background: 'none', border: 'none', padding: '0.625rem 1.375rem',
              borderBottom: activeTab === tab.id ? `3px solid ${EY_YELLOW}` : '3px solid transparent',
              marginBottom: '-2px', cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '700' : '500',
              fontSize: '0.875rem',
              color: activeTab === tab.id ? EY_CHARCOAL : EY_GRAY,
              fontFamily: 'inherit',
              letterSpacing: activeTab === tab.id ? '0.01em' : '0' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'calibration' && (
        <div>
          {(dimensionCalibration || []).map((dim, i) => <DimensionCard key={i} dim={dim} />)}
          <CriticalGapsSection gaps={criticalGaps} />
        </div>
      )}
      {activeTab === 'talking' && <TalkingPointsTab tp={talkingPoints || {}} />}
      {activeTab === 'goals'   && <GoalsTab goals={goals} />}

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2.5rem',
        paddingTop: '1.5rem', borderTop: '1px solid #EBEBEF' }}>
        <button onClick={() => navigate('/')}
          style={{ padding: '0.65rem 1.5rem', background: '#fff', color: EY_CHARCOAL,
            border: `1px solid ${EY_CHARCOAL}`, borderRadius: '2px', fontSize: '0.9375rem',
            fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
          &larr; Back
        </button>
        <button onClick={() => navigate('/export')}
          style={{ padding: '0.65rem 1.875rem', background: EY_YELLOW, color: '#1A1A24',
            border: 'none', borderRadius: '2px', fontSize: '0.9375rem',
            fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
          Continue to Export &rarr;
        </button>
      </div>
    </div>
  );
}
