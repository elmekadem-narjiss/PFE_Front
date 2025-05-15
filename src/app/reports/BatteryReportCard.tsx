'use client';

import { useRef, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useInView } from 'react-intersection-observer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSolarPanel } from '@fortawesome/free-solid-svg-icons';
import { Battery } from '@/types';
import { TEMPERATURE_THRESHOLD } from '@/lib/batteryMonitoring';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BatteryReportCardProps {
  batteries: Battery[];
  theme: 'solar' | 'wind' | 'hydro';
  highContrast: boolean;
  determineStatus: (temperature: number) => 'Operational' | 'Failed';
}

const BatteryReportCard: React.FC<BatteryReportCardProps> = ({ batteries, theme, highContrast, determineStatus }) => {
  const chartRef = useRef<ChartJS<"bar", number[], string> | null>(null);
  const { ref, inView } = useInView({ triggerOnce: false });

  // Theme colors
  const themes = {
    solar: { primary: '#FFC107', secondary: '#4CAF50', accent: '#2196F3' },
    wind: { primary: '#2196F3', secondary: '#4CAF50', accent: '#FFC107' },
    hydro: { primary: '#26A69A', secondary: '#4CAF50', accent: '#2196F3' },
  };
  const currentTheme = themes[theme];

  // Chart data
  const totalCapacity = batteries.reduce((sum, battery) => sum + (battery.capacity ?? 0), 0);
  const avgStateOfCharge =
    batteries.reduce((sum, battery) => sum + (battery.stateOfCharge ?? 0), 0) / batteries.length;
  const numBatteries = batteries.length;

  const chartData = {
    labels: ['Total Capacity (kWh)', 'Avg State of Charge (%)', 'Number of Batteries'],
    datasets: [
      {
        label: 'Battery Summary',
        data: [totalCapacity, avgStateOfCharge, numBatteries],
        backgroundColor: [currentTheme.primary, currentTheme.secondary, currentTheme.accent],
        borderWidth: 0,
        barPercentage: 0.8,
        categoryPercentage: 0.8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value',
          color: highContrast ? '#FFFFFF' : '#333333',
        },
        ticks: {
          color: highContrast ? '#FFFFFF' : '#333333',
        },
        grid: { color: highContrast ? '#555555' : '#E0E0E0' },
      },
      x: {
        title: {
          display: true,
          text: 'Categories',
          color: highContrast ? '#FFFFFF' : '#333333',
        },
        ticks: {
          color: highContrast ? '#FFFFFF' : '#333333',
        },
        grid: { color: highContrast ? '#555555' : '#E0E0E0' },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: highContrast ? '#FFFFFF' : '#333333',
          font: { size: 14 },
        },
      },
      title: {
        display: true,
        text: 'Global Battery Characteristics',
        color: highContrast ? '#FFFFFF' : currentTheme.accent,
        font: { size: 16 },
      },
      tooltip: {
        backgroundColor: `${currentTheme.accent}CC`,
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: currentTheme.accent,
        borderWidth: 2,
        callbacks: {
          label: (tooltipItem: TooltipItem<'bar'>) => {
            const label = tooltipItem.label || '';
            const value = tooltipItem.raw as number;
            if (label.includes('Total Capacity')) {
              return `${label}: ${value.toFixed(2)} kWh`;
            } else if (label.includes('Avg State of Charge')) {
              return `${label}: ${value.toFixed(1)}%`;
            } else if (label.includes('Number of Batteries')) {
              return `${label}: ${value}`;
            }
            return `${label}: ${value}`;
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const,
    },
  };

  // Clean up chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        marginBottom: '20px',
        padding: '15px',
        border: `1px solid ${highContrast ? '#555555' : 'rgba(224,224,224,0.5)'}`,
        borderRadius: '8px',
        background: highContrast
          ? '#222222'
          : `linear-gradient(145deg, #FFFFFF, ${currentTheme.primary}11)`,
        boxShadow: `0 4px 12px rgba(0,0,0,0.15), 0 0 8px ${currentTheme.secondary}33`,
        animation: 'fadeInScale 0.6s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '20px',
          alignItems: 'flex-start',
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
          <div
            style={{
              padding: '12px',
              background: highContrast
                ? '#333333'
                : `linear-gradient(180deg, ${currentTheme.primary}11, ${currentTheme.primary}22)`,
              border: `1px solid ${highContrast ? '#555555' : currentTheme.secondary}80`,
              borderRadius: '6px',
              color: highContrast ? '#FFFFFF' : '#333333',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              boxShadow: `0 2px 6px rgba(0,0,0,0.1), 0 0 8px ${currentTheme.secondary}33`,
              animation: 'fadeInScale 0.4s ease-in-out',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: highContrast ? '#FFFFFF' : currentTheme.secondary,
                marginBottom: '8px',
                transition: 'color 0.3s ease, text-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = highContrast ? '#DDDDDD' : currentTheme.accent;
                e.currentTarget.style.textShadow = `0 0 4px ${currentTheme.accent}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = highContrast ? '#FFFFFF' : currentTheme.secondary;
                e.currentTarget.style.textShadow = 'none';
              }}
            >
              <FontAwesomeIcon
                icon={faSolarPanel}
                style={{
                  marginRight: '8px',
                  color: highContrast ? '#FFFFFF' : currentTheme.secondary,
                  filter: `drop-shadow(0 0 2px ${currentTheme.secondary}80)`,
                }}
              />
              About the Chart
            </h3>
            <p>
              This chart visualizes key battery metrics: total capacity (kWh), average state of charge (%), and number of
              batteries. Use this to assess the overall health and performance of the battery system.
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
        </div>
        <div
          style={{
            flex: '1',
            maxWidth: '50%',
            height: '400px',
            position: 'relative',
            filter: `drop-shadow(0 0 4px ${currentTheme.primary}33)`,
          }}
        >
          {inView ? (
            <Bar ref={chartRef} data={chartData} options={chartOptions} />
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: highContrast ? '#FFFFFF' : '#333333',
                animation: 'pulse 1.5s infinite',
              }}
            >
              Loading Chart...
            </div>
          )}
        </div>
      </div>
      {batteries.length > 0 && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            background: highContrast
              ? '#333333'
              : `linear-gradient(180deg, ${currentTheme.primary}11, ${currentTheme.primary}22)`,
            border: `1px solid ${highContrast ? '#555555' : currentTheme.secondary}80`,
            borderRadius: '6px',
            boxShadow: `0 2px 6px rgba(0,0,0,0.1), 0 0 8px ${currentTheme.secondary}33`,
            animation: 'fadeInScale 0.4s ease-in-out',
          }}
        >
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: highContrast ? '#FFFFFF' : currentTheme.secondary,
              marginBottom: '12px',
            }}
          >
            Battery Details
          </h3>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              color: highContrast ? '#FFFFFF' : '#333333',
              fontSize: '0.9rem',
            }}
            role="grid"
          >
            <thead>
              <tr
                style={{
                  background: `linear-gradient(45deg, ${currentTheme.secondary}, ${currentTheme.secondary}cc)`,
                  color: '#FFFFFF',
                }}
              >
                {['ID', 'Name', 'Capacity (kWh)', 'Voltage (V)', 'Temp (°C)', 'SoC (%)', 'Chemistry', 'Cycles', 'Status', 'Last Checked'].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    style={{ padding: '8px', textAlign: 'left', borderBottom: `1px solid ${highContrast ? '#555555' : '#E0E0E0'}` }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batteries.map((battery) => {
                const status = battery.status ?? determineStatus(battery.temperature ?? 0);
                return (
                  <tr
                    key={battery.id}
                    style={{
                      background:
                        status === 'Failed'
                          ? highContrast
                            ? '#7F1D1D'
                            : '#EF4444'
                          : (battery.temperature ?? 0) > TEMPERATURE_THRESHOLD
                          ? highContrast
                            ? '#854D0E'
                            : '#FFD700'
                          : 'transparent',
                      color: status === 'Failed' || (battery.temperature ?? 0) > TEMPERATURE_THRESHOLD ? (highContrast ? '#FFFFFF' : '#000000') : highContrast ? '#FFFFFF' : '#333333',
                    }}
                  >
                    <td style={{ padding: '8px', borderBottom: `1px solid ${highContrast ? '#555555' : '#E0E0E0'}` }}>{battery.id}</td>
                    <td style={{ padding: '8px', borderBottom: `1px solid ${highContrast ? '#555555' : '#E0E0E0'}` }}>{battery.name ?? 'Unknown'}</td>
                    <td style={{ padding: '8px', borderBottom: `1px solid ${highContrast ? '#555555' : '#E0E0E0'}` }}>{(battery.capacity ?? 0).toFixed(2)}</td>
                    <td style={{ padding: '8px', borderBottom: `1px solid ${highContrast ? '#555555' : '#E0E0E0'}` }}>{(battery.voltage ?? 0).toFixed(2)}</td>
                    <td style={{ padding: '8px', borderBottom: `1px solid ${highContrast ? '#555555' : '#E0E0E0'}` }}>{(battery.temperature ?? 0).toFixed(1)}</td>
                    <td style={{ padding: '8px', borderBottom: `1px solid ${highContrast ? '#555555' : '#E0E0E0'}` }}>{(battery.stateOfCharge ?? 0).toFixed(1)}</td>
                    <td style={{ padding: '8px', borderBottom: `1px solid ${highContrast ? '#555555' : '#E0E0E0'}` }}>{battery.chemistry ?? 'Unknown'}</td>
                    <td style={{ padding: '8px', borderBottom: `1px solid ${highContrast ? '#555555' : '#E0E0E0'}` }}>{battery.cycleCount ?? 0}</td>
                    <td style={{ padding: '8px', borderBottom: `1px solid ${highContrast ? '#555555' : '#E0E0E0'}` }}>{status}</td>
                    <td style={{ padding: '8px', borderBottom: `1px solid ${highContrast ? '#555555' : '#E0E0E0'}` }}>
                      {new Date(battery.lastChecked ?? new Date()).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BatteryReportCard;