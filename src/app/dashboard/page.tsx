'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import PredictionsTable from '../../components/PredictionsTable';
import { Prediction } from '../../types/prediction';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hiddenTables, setHiddenTables] = useState<Record<number, boolean>>({});

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
  }, []);

  // Group predictions by month
  const groupedByMonth = predictions.reduce((acc, prediction) => {
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

  // Map month number to name for chart titles
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

  if (loading)
    return (
      <p
        style={{
          color: '#333333',
          animation: 'pulse 1.5s infinite, shine 2s infinite',
          textShadow: '0 0 4px rgba(33,150,243,0.3)',
        }}
      >
        Chargement des données...
      </p>
    );
  if (error)
    return (
      <p
        style={{
          color: '#D32F2F',
          animation: 'fadeIn 0.5s ease-in-out',
          textShadow: '0 0 4px rgba(211,47,47,0.3)',
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
        background: 'linear-gradient(180deg, #E3F2FD, #F5F5F5)',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          color: '#2196F3',
          marginBottom: '20px',
          animation: 'fadeIn 0.7s ease-in-out, shine 3s infinite',
          textShadow: '0 0 4px rgba(33,150,243,0.3)',
        }}
      >
        Energy Predictions Dashboard
      </h1>
      {months.length === 0 ? (
        <p
          style={{
            color: '#333333',
            animation: 'fadeIn 0.5s ease-in-out',
            textShadow: '0 0 4px rgba(0,0,0,0.2)',
          }}
        >
          Aucune donnée disponible pour le moment.
        </p>
      ) : (
        months.map((month) => {
          const monthData = groupedByMonth[month];
          const monthName = monthNames[month - 1] || `Month ${month}`;
          const isTableHidden = hiddenTables[month] || false;

          // Prepare chart data
          const chartData = {
            labels: monthData.map((p) =>
              new Date(p.prediction_day).toLocaleDateString()
            ),
            datasets: [
              {
                label: 'Energy Produced (kWh)',
                data: monthData.map((p) => p.energyproduced),
                borderColor: '#FFC107',
                backgroundColor: 'rgba(255, 193, 7, 0.3)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#FFC107',
                pointBorderColor: '#FFFFFF',
                pointHoverBackgroundColor: '#FFA000',
                pointHoverBorderColor: '#FFFFFF',
                pointRadius: 4,
                pointHoverRadius: 6,
                pointStyle: 'circle',
                pointShadow: '0 0 8px rgba(255,193,7,0.5)', // Reflective glow
              },
            ],
          };

          const chartOptions: ChartOptions<'line'> = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: { color: '#333333', font: { size: 12 } },
              },
              title: {
                display: true,
                text: `Energy Produced in ${monthName}`,
                color: '#2196F3',
                font: { size: 16 },
                padding: { top: 10, bottom: 10 },
              },
              tooltip: {
                backgroundColor: 'rgba(33, 150, 243, 0.8)',
                titleColor: '#FFFFFF',
                bodyColor: '#FFFFFF',
                borderColor: '#2196F3',
                borderWidth: 1,
              },
            },
            scales: {
              x: {
                title: { display: true, text: 'Prediction Day', color: '#333333' },
                grid: { color: '#E0E0E0' },
              },
              y: {
                title: { display: true, text: 'Energy Produced (kWh)', color: '#333333' },
                grid: { color: '#E0E0E0' },
              },
            },
            animation: {
              duration: 1000,
              easing: 'easeOutQuart' as const,
            },
            hover: {
              mode: 'point',
              intersect: true,
            },
          };

          return (
            <div
              key={month}
              style={{
                marginBottom: '20px',
                padding: '15px',
                border: '1px solid rgba(224,224,224,0.5)',
                borderRadius: '8px',
                background: 'linear-gradient(145deg, #FFFFFF, #F1F8E9)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 0 8px rgba(76,175,80,0.2)',
                display: 'flex',
                flexDirection: 'row',
                gap: '20px',
                alignItems: 'flex-start',
                animation: 'fadeInScale 0.6s ease-in-out',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  flex: '1',
                  maxWidth: '50%',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}
              >
                <button
                  onClick={() => toggleTable(month)}
                  style={{
                    marginBottom: '10px',
                    padding: '8px 16px',
                    background: 'linear-gradient(45deg, #388E3C, #4CAF50)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2), 0 0 8px rgba(76,175,80,0.3)',
                    animation: 'shine 3s infinite ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3), 0 0 12px rgba(76,175,80,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2), 0 0 8px rgba(76,175,80,0.3)';
                  }}
                >
                  {isTableHidden ? 'Show Table' : 'Hide Table'}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                      animation: 'shineOverlay 2s infinite ease-in-out',
                    }}
                  />
                </button>
                {isTableHidden ? (
                  <div
                    style={{
                      padding: '12px',
                      background: 'linear-gradient(180deg, #E8F5E9, #F1F8E9)',
                      border: '1px solid rgba(76,175,80,0.5)',
                      borderRadius: '6px',
                      color: '#333333',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1), 0 0 8px rgba(76,175,80,0.3)',
                      animation: 'fadeInScale 0.4s ease-in-out',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: '#388E3C',
                        marginBottom: '8px',
                        transition: 'color 0.3s ease, text-shadow 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#2196F3';
                        e.currentTarget.style.textShadow = '0 0 4px rgba(33,150,243,0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#388E3C';
                        e.currentTarget.style.textShadow = 'none';
                      }}
                    >
                      About the Chart
                    </h3>
                    <p>
                      This chart visualizes predicted energy production (in kWh) for {monthName}.
                      The x-axis shows prediction dates, while the y-axis displays energy output.
                      Use this to identify trends and optimize renewable energy systems like solar or wind power.
                    </p>
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        animation: 'shineOverlay 3s infinite ease-in-out',
                      }}
                    />
                  </div>
                ) : (
                  <PredictionsTable data={monthData} month={month} />
                )}
              </div>
              <div style={{ flex: '1', maxWidth: '50%', height: '300px', position: 'relative' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          );
        })
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
      `}</style>
    </div>
  );
}