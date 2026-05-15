import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MatchScoreChart({ results }) {
  if (!results || results.length === 0) return null;

  const data = {
    labels: results.map(c => c.name),
    datasets: [{
      label: 'Match Score (%)',
      data: results.map(c => c.matchScore),
      backgroundColor: results.map(c => {
        if (c.matchScore >= 70) return 'rgba(99, 102, 241, 0.7)';
        if (c.matchScore >= 40) return 'rgba(251, 191, 36, 0.7)';
        return 'rgba(244, 63, 94, 0.7)';
      }),
      borderColor: results.map(c => {
        if (c.matchScore >= 70) return '#6366f1';
        if (c.matchScore >= 40) return '#fbbf24';
        return '#f43f5e';
      }),
      borderWidth: 2,
      borderRadius: 6,
    }]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Candidate Match Scores',
        color: '#f1f5f9',
        font: { size: 14, weight: '700', family: 'Inter' }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: { family: 'Inter' },
        bodyFont: { family: 'Inter' },
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        max: 100,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter' } }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#f1f5f9', font: { family: 'Inter', weight: '500' } }
      }
    }
  };

  return (
    <div className="chart-container">
      <div style={{ height: Math.max(200, results.length * 50) }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
