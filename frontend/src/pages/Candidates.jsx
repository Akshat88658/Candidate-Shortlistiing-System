import { useState } from 'react';
import CandidateForm from '../components/CandidateForm';
import CandidateList from '../components/CandidateList';

export default function Candidates() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="page">
      <div className="page-header">
        <h1>👥 Candidate Management</h1>
        <p>Add and manage your candidate pool</p>
      </div>
      <div className="split-layout">
        <CandidateForm onAdded={() => setRefreshKey(k => k + 1)} />
        <CandidateList refreshKey={refreshKey} />
      </div>
    </div>
  );
}
