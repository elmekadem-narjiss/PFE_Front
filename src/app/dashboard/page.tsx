'use client';

import { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Parser } from 'json2csv';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable, faInfoCircle, faSolarPanel, faDownload, faCompress, faExpand } from '@fortawesome/free-solid-svg-icons';
import MonthSection from './MonthSection';
import { Prediction } from '../../types/prediction';

// Register Chart.js components (safe for SSR)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  {
    id: 'linePulse',
    beforeDraw(chart) {
      const ctx = chart.ctx;
      const dataset = chart.data.datasets[0];
      const meta = chart.getDatasetMeta(0);
      if (meta.type === 'line') {
        ctx.save();
        const gradient = ctx.createLinearGradient(0, 0, chart.width, 0);
        gradient.addColorStop(0, (dataset.borderColor as string) || '#FFC107');
        gradient.addColorStop(0.5, 'rgba(255,193,7,0.7)');
        gradient.addColorStop(1, (dataset.borderColor as string) || '#FFC107');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = (typeof dataset.borderWidth === 'number' ? dataset.borderWidth : 2);
        ctx.beginPath();
        meta.data.forEach((point, index) => {
          const x = point.x;
          const y = point.y;
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.restore();
      }
    },
  }
);

export default function Dashboard() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hiddenTables, setHiddenTables] = useState<Record<number, boolean>>({});
  const [collapsedMonths, setCollapsedMonths] = useState<Record<number, boolean>>({});
  const [filters, setFilters] = useState<{ hour: number | null }>({ hour: null });
  const [theme, setTheme] = useState<'solar' | 'wind' | 'hydro'>('solar');
  const [highContrast, setHighContrast] = useState(false);
  const chartRefs = useRef<Record<number, any>>({});
  const [zoomPluginLoaded, setZoomPluginLoaded] = useState(false);

  // Theme colors
  const themes = {
    solar: { primary: '#FFC107', secondary: '#4CAF50', accent: '#2196F3' },
    wind: { primary: '#2196F3', secondary: '#4CAF50', accent: '#FFC107' },
    hydro: { primary: '#26A69A', secondary: '#4CAF50', accent: '#2196F3' },
  };
  const currentTheme = themes[theme];

  // Dynamically load chartjs-plugin-zoom on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('chartjs-plugin-zoom').then((zoomPlugin) => {
        ChartJS.register(zoomPlugin.default);
        setZoomPluginLoaded(true);
      }).catch((err) => {
        console.error('Failed to load chartjs-plugin-zoom:', err);
      });
    }
  }, []);

  // Fetch predictions with polling
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/predictions');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }
        const data = await response.json();
        setPredictions(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
    const interval = setInterval(fetchPredictions, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter and group predictions
  const filteredData = predictions.filter(
    (p) => filters.hour === null || p.hour === filters.hour
  );
  const groupedByMonth = filteredData.reduce((acc, prediction) => {
    const month = prediction.month;
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(prediction);
    return acc;
  }, {} as Record<number, Prediction[]>);

  // Sort months and exclude May (5) and August (8)
  const months = Object.keys(groupedByMonth)
    .map(Number)
    .filter((month) => month !== 5 && month !== 8)
    .sort((a, b) => a - b);

  // Map month number to name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Toggle table visibility
  const toggleTable = (month: number) => {
    setHiddenTables((prev) => ({
      ...prev,
      [month]: !prev[month],
    }));
  };

  // Toggle collapse
  const toggleCollapse = (month: number) => {
    setCollapsedMonths((prev) => ({
      ...prev,
      [month]: !prev[month],
    }));
  };

  // Export to CSV
  const exportToCSV = (data: Prediction[], monthName: string) => {
    const parser = new Parser();
    const csv = parser.parse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predictions_${monthName}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Reset zoom
  const resetZoom = (month: number) => {
    if (chartRefs.current[month]) {
      chartRefs.current[month].resetZoom();
    }
  };

  if (loading)
    return (
      <p
        style={{
          color: highContrast ? '#FFFFFF' : '#333333',
          background: highContrast ? '#000000' : 'transparent',
          animation: 'pulse 1.5s infinite, shine 2s infinite',
          textShadow: `0 0 4px ${currentTheme.accent}33`,
          padding: '10px',
          textAlign: 'center',
        }}
      >
        Chargement des données...
      </p>
    );
  if (error)
    return (
      <p
        style={{
          color: highContrast ? '#FF5555' : '#D32F2F',
          background: highContrast ? '#000000' : 'transparent',
          animation: 'fadeIn 0.5s ease-in-out',
          textShadow: `0 0 4px ${highContrast ? '#FF5555' : '#D32F2F'}33`,
          padding: '10px',
          textAlign: 'center',
        }}
      >
        Erreur : {error}
      </p>
    );

  return (
    <div
      style={{
        padding: '15px',
        maxWidth: '1400px',
        margin: '0 auto',
        background: highContrast
          ? '#000000'
          : `linear-gradient(180deg, ${currentTheme.accent}22, #F5F5F5)`,
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle, ${currentTheme.secondary}11 0%, transparent 70%)`,
          animation: 'energyWave 10s infinite ease-in-out',
          pointerEvents: 'none',
          opacity: highContrast ? 0 : 0.5,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: highContrast ? '#FFFFFF' : currentTheme.accent,
            animation: 'fadeIn 0.7s ease-in-out, shine 3s infinite',
            textShadow: `0 0 4px ${currentTheme.accent}33`,
          }}
        >
          Energy Predictions Dashboard
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            onChange={(e) => setTheme(e.target.value as 'solar' | 'wind' | 'hydro')}
            style={{
              padding: '8px',
              background: `linear-gradient(45deg, ${currentTheme.secondary}, ${currentTheme.secondary}cc)`,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              animation: 'shine 3s infinite ease-in-out',
            }}
            aria-label="Select theme"
          >
            <option value="solar">Solar Theme</option>
            <option value="wind">Wind Theme</option>
            <option value="hydro">Hydro Theme</option>
          </select>
          <button
            onClick={() => setHighContrast((prev) => !prev)}
            onKeyDown={(e) => e.key === 'Enter' && setHighContrast((prev) => !prev)}
            style={{
              padding: '8px',
              background: highContrast ? '#FFFFFF' : `linear-gradient(45deg, ${currentTheme.accent}, ${currentTheme.accent}cc)`,
              color: highContrast ? '#000000' : '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              animation: 'shine 3s infinite ease-in-out',
            }}
            aria-label={highContrast ? 'Switch to normal mode' : 'Switch to high contrast mode'}
          >
            {highContrast ? 'Normal Mode' : 'High Contrast'}
          </button>
        </div>
      </div>
      <div
        style={{
          marginBottom: '20px',
          padding: '10px',
          background: highContrast ? '#222222' : `linear-gradient(180deg, #FFFFFF, ${currentTheme.primary}11)`,
          borderRadius: '8px',
          boxShadow: `0 2px 6px rgba(0,0,0,0.1), 0 0 8px ${currentTheme.secondary}33`,
        }}
      >
        <label
          style={{
            fontSize: '0.9rem',
            color: highContrast ? '#FFFFFF' : '#333333',
            marginRight: '10px',
          }}
        >
          Filter by Hour:
        </label>
        <select
          onChange={(e) => setFilters({ hour: e.target.value ? Number(e.target.value) : null })}
          style={{
            padding: '8px',
            background: `linear-gradient(45deg, ${currentTheme.secondary}, ${currentTheme.secondary}cc)`,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            animation: 'shine 3s infinite ease-in-out',
          }}
          aria-label="Filter by hour"
        >
          <option value="">All Hours</option>
          {[...Array(24)].map((_, i) => (
            <option key={i} value={i}>
              {i}:00
            </option>
          ))}
        </select>
      </div>
      {months.length === 0 ? (
        <p
          style={{
            color: highContrast ? '#FFFFFF' : '#333333',
            background: highContrast ? '#000000' : 'transparent',
            animation: 'fadeIn 0.5s ease-in-out',
            textShadow: `0 0 4px rgba(0,0,0,${highContrast ? 0.5 : 0.2})`,
            padding: '10px',
            textAlign: 'center',
          }}
        >
          Aucune donnée disponible pour le moment.
        </p>
      ) : (
        months.map((month) => (
          <MonthSection
            key={month}
            month={month}
            monthData={groupedByMonth[month]}
            monthName={monthNames[month - 1] || `Month ${month}`}
            theme={theme}
            highContrast={highContrast}
            isTableHidden={hiddenTables[month] || false}
            isCollapsed={collapsedMonths[month] || false}
            zoomPluginLoaded={zoomPluginLoaded}
            toggleTable={toggleTable}
            toggleCollapse={toggleCollapse}
            exportToCSV={exportToCSV}
            resetZoom={() => resetZoom(month)}
          />
        ))
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes shineOverlay {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
        @keyframes energyWave {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.5; }
          100% { transform: scale(1); opacity: 0.3; }
        }
        @media (max-width: 768px) {
          div[style*="flex-direction: row"] {
            flex-direction: column;
          }
          div[style*="max-width: 50%"] {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}