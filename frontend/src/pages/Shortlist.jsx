import { useState } from 'react';
import JobForm from '../components/JobForm';
import ShortlistResults from '../components/ShortlistResults';
import AIResults from '../components/AIResults';
import MatchScoreChart from '../components/MatchScoreChart';
import { matchCandidates, aiShortlist } from '../api/apiService';

export default function Shortlist() {
  const [results, setResults] = useState(null);
  const [aiResults, setAiResults] = useState(null);
  const [aiRaw, setAiRaw] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleMatch = async (data) => {
    setLoading(true);
    setResults(null);
    try {
      const res = await matchCandidates(data);
      setResults(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Match failed');
    }
    setLoading(false);
  };

  const handleAiMatch = async (data) => {
    setAiLoading(true);
    setAiResults(null);
    setAiRaw(null);
    try {
      const res = await aiShortlist(data);
      if (res.data.parsed) {
        setAiResults(res.data.data);
      } else {
        setAiRaw(res.data.rawResponse);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'AI shortlisting failed');
    }
    setAiLoading(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>🎯 Shortlist Candidates</h1>
        <p>Define job requirements and find the best matches</p>
      </div>

      <div className="split-layout">
        <JobForm onMatch={handleMatch} onAiMatch={handleAiMatch} loading={loading} aiLoading={aiLoading} />
        <div>
          {results && <MatchScoreChart results={results} />}
          <ShortlistResults results={results} />
          <AIResults results={aiResults} rawResponse={aiRaw} />
          {!results && !aiResults && !aiRaw && (
            <div className="empty-state">
              <div className="icon">🎯</div>
              <p>Add required skills and click "Basic Match" or "AI Match" to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
