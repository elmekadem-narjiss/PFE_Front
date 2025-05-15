'use client';

import { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { useInView } from 'react-intersection-observer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable, faInfoCircle, faSolarPanel, faDownload, faCompress, faExpand } from '@fortawesome/free-solid-svg-icons';
import PredictionsTable from '../../components/PredictionsTable';
import { Prediction } from '../../types/prediction';

interface MonthSectionProps {
  month: number;
  monthData: Prediction[];
  monthName: string;
  theme: 'solar' | 'wind' | 'hydro';
  highContrast: boolean;
  isTableHidden: boolean;
  isCollapsed: boolean;
  zoomPluginLoaded: boolean;
  toggleTable: (month: number) => void;
  toggleCollapse: (month: number) => void;
  exportToCSV: (data: Prediction[], monthName: string) => void;
  resetZoom: (month: number) => void;
}

const MonthSection: React.FC<MonthSectionProps> = ({
  month,
  monthData,
  monthName,
  theme,
  highContrast,
  isTableHidden,
  isCollapsed,
  zoomPluginLoaded,
  toggleTable,
  toggleCollapse,
  exportToCSV,
  resetZoom,
}) => {
  const chartRef = useRef<any>(null);
  const { ref, inView } = useInView({ triggerOnce: false });

  // Theme colors
  const themes = {
    solar: { primary: '#FFC107', secondary: '#4CAF50', accent: '#2196F3' },
    wind: { primary: '#2196F3', secondary: '#4CAF50', accent: '#FFC107' },
    hydro: { primary: '#26A69A', secondary: '#4CAF50', accent: '#2196F3' },
  };
  const currentTheme = themes[theme];

  // Prepare chart data
  const chartData = {
    labels: monthData.map((p) => new Date(p.prediction_day).toLocaleDateString()),
    datasets: [
      {
        label: 'Energy Produced (kWh)',
        data: monthData.map((p) => p.energyproduced),
        custom: monthData.map((p) => ({
          temperature: p.temperature,
          humidity: p.humidity,
        })),
        borderColor: currentTheme.primary,
        backgroundColor: `${currentTheme.primary}4D`,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: currentTheme.primary,
        pointBorderColor: '#FFFFFF',
        pointHoverBackgroundColor: `${currentTheme.primary}CC`,
        pointHoverBorderColor: '#FFFFFF',
        pointRadius: 4,
        pointHoverRadius: 6,
        pointStyle: 'circle',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: highContrast ? '#FFFFFF' : '#333333',
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: `Energy Produced in ${monthName}`,
        color: highContrast ? '#FFFFFF' : currentTheme.accent,
        font: { size: 16 },
        padding: { top: 10, bottom: 10 },
      },
      tooltip: {
        backgroundColor: `${currentTheme.accent}CC`,
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: currentTheme.accent,
        borderWidth: 2,
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const dataset = context.dataset as any;
            const custom = dataset.custom?.[index];
            return [
              `Energy: ${context.parsed.y} kWh`,
              `Temperature: ${custom?.temperature ?? 'N/A'} °C`,
              `Humidity: ${custom?.humidity ?? 'N/A'} %`,
            ];
          },
        },
      },
      zoom: zoomPluginLoaded
        ? {
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'xy',
            },
            pan: {
              enabled: true,
              mode: 'xy',
            },
          }
        : undefined,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Prediction Day',
          color: highContrast ? '#FFFFFF' : '#333333',
        },
        grid: { color: highContrast ? '#555555' : '#E0E0E0' },
      },
      y: {
        title: {
          display: true,
          text: 'Energy Produced (kWh)',
          color: highContrast ? '#FFFFFF' : '#333333',
        },
        grid: { color: highContrast ? '#555555' : '#E0E0E0' },
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
      ref={ref}
      style={{
        marginBottom: '20px',
        padding: isCollapsed ? '10px' : '15px',
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
      <button
        onClick={() => toggleCollapse(month)}
        onKeyDown={(e) => e.key === 'Enter' && toggleCollapse(month)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '4px 8px',
          background: `linear-gradient(45deg, ${currentTheme.secondary}, ${currentTheme.secondary}cc)`,
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.8rem',
          animation: 'shine 3s infinite ease-in-out',
          zIndex: 10,
        }}
        aria-label={isCollapsed ? `Expand ${monthName} section` : `Collapse ${monthName} section`}
      >
        <FontAwesomeIcon icon={isCollapsed ? faExpand : faCompress} />
      </button>
      {!isCollapsed && (
        <>
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
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button
                  onClick={() => toggleTable(month)}
                  onKeyDown={(e) => e.key === 'Enter' && toggleTable(month)}
                  style={{
                    padding: '8px 16px',
                    background: `linear-gradient(45deg, ${currentTheme.secondary}, ${currentTheme.secondary}cc)`,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: `0 2px 6px rgba(0,0,0,0.2), 0 0 8px ${currentTheme.secondary}33`,
                    animation: 'shine 3s infinite ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = `0 4px 10px rgba(0,0,0,0.3), 0 0 12px ${currentTheme.secondary}66`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = `0 2px 6px rgba(0,0,0,0.2), 0 0 8px ${currentTheme.secondary}33`;
                  }}
                  aria-label={isTableHidden ? `Show table for ${monthName}` : `Show chart explanation for ${monthName}`}
                >
                  <FontAwesomeIcon
                    icon={isTableHidden ? faTable : faInfoCircle}
                    style={{ marginRight: '8px', filter: `drop-shadow(0 0 2px ${currentTheme.secondary}80)` }}
                  />
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
                <button
                  onClick={() => exportToCSV(monthData, monthName)}
                  onKeyDown={(e) => e.key === 'Enter' && exportToCSV(monthData, monthName)}
                  style={{
                    padding: '8px 16px',
                    background: `linear-gradient(45deg, ${currentTheme.accent}, ${currentTheme.accent}cc)`,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: `0 2px 6px rgba(0,0,0,0.2), 0 0 8px ${currentTheme.accent}33`,
                    animation: 'shine 3s infinite ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = `0 4px 10px rgba(0,0,0,0.3), 0 0 12px ${currentTheme.accent}66`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = `0 2px 6px rgba(0,0,0,0.2), 0 0 8px ${currentTheme.accent}33`;
                  }}
                  aria-label={`Export ${monthName} data as CSV`}
                >
                  <FontAwesomeIcon
                    icon={faDownload}
                    style={{ marginRight: '8px', filter: `drop-shadow(0 0 2px ${currentTheme.accent}80)` }}
                  />
                  Export CSV
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
              </div>
              {isTableHidden ? (
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
                    This chart visualizes predicted energy production (in kWh) for {monthName}.
                    The x-axis shows prediction dates, while the y-axis displays energy output.
                    Use this to identify trends and optimize renewable energy systems like solar or wind power.
                    {zoomPluginLoaded ? ' Zoom and pan are enabled for detailed exploration.' : ' Zoom functionality is loading...'}
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
                <PredictionsTable data={monthData} month={month} theme={theme} />
              )}
            </div>
            <div
              style={{
                flex: '1',
                maxWidth: '50%',
                height: '300px',
                position: 'relative',
                filter: `drop-shadow(0 0 4px ${currentTheme.primary}33)`,
              }}
            >
              {inView ? (
                <>
                  <Line
                    ref={chartRef}
                    data={chartData}
                    options={chartOptions}
                  />
                  {zoomPluginLoaded && (
                    <button
                      onClick={() => resetZoom(month)}
                      onKeyDown={(e) => e.key === 'Enter' && resetZoom(month)}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '4px 8px',
                        background: `linear-gradient(45deg, ${currentTheme.accent}, ${currentTheme.accent}cc)`,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        animation: 'shine 3s infinite ease-in-out',
                      }}
                      aria-label={`Reset zoom for ${monthName} chart`}
                    >
                      Reset Zoom
                    </button>
                  )}
                </>
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
        </>
      )}
    </div>
  );
};

export default MonthSection;