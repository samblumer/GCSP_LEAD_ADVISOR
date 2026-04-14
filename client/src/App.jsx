import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Input from './pages/Input.jsx';
import Analysis from './pages/Analysis.jsx';
import Export from './pages/Export.jsx';

const EY_YELLOW = '#FFE600';
const EY_CHARCOAL = '#2E2E38';

const navStyle = {
  padding: '0 2rem',
  display: 'flex',
  background: EY_CHARCOAL,
  alignItems: 'stretch',
  minHeight: '56px',
  borderBottom: `3px solid ${EY_YELLOW}`,
};

const brandStyle = {
  color: '#fff',
  fontWeight: '700',
  fontSize: '0.9375rem',
  letterSpacing: '0.03em',
  marginRight: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const navDivider = {
  width: '1px',
  height: '20px',
  background: 'rgba(255,255,255,0.2)',
  alignSelf: 'center',
  margin: '0 0.25rem',
};

const linkStyle = ({ isActive }) => ({
  textDecoration: 'none',
  fontWeight: isActive ? '700' : '400',
  fontSize: '0.8125rem',
  letterSpacing: '0.02em',
  color: isActive ? EY_YELLOW : '#9F9FAD',
  padding: '0 1.125rem',
  display: 'flex',
  alignItems: 'center',
  borderBottom: isActive ? `3px solid ${EY_YELLOW}` : '3px solid transparent',
  marginBottom: '-3px',
});

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading]           = useState(false);
  const [analysisError, setAnalysisError]   = useState(null);

  return (
    <BrowserRouter>
      <nav style={navStyle}>
        <div style={brandStyle}>
          <img src="/EY_logo.png" alt="EY" style={{ height: '30px', display: 'block' }} />
          <div style={navDivider} />
          <span>GCSP Lead Advisor</span>
        </div>
        <NavLink to="/" end style={linkStyle}>1 · Input</NavLink>
        <NavLink to="/analysis" style={linkStyle}>2 · Analysis</NavLink>
        <NavLink to="/export" style={linkStyle}>3 · Export</NavLink>
      </nav>
      <main style={{ padding: '2.5rem 2rem', maxWidth: '880px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={
            <Input
              setAnalysisResult={setAnalysisResult}
              setIsLoading={setIsLoading}
              setAnalysisError={setAnalysisError}
            />
          } />
          <Route path="/analysis" element={
            <Analysis
              analysisResult={analysisResult}
              isLoading={isLoading}
              analysisError={analysisError}
            />
          } />
          <Route path="/export" element={
            <Export
              analysisResult={analysisResult}
              onReset={() => {
                setAnalysisResult(null);
                setIsLoading(false);
                setAnalysisError(null);
              }}
            />
          } />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

