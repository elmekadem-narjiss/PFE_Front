'use client';

import { useEffect, useState } from 'react';
import { useBatteryContext } from '@/context/BatteryContext';
import { Battery } from '@/types';
import { TEMPERATURE_THRESHOLD } from '@/lib/batteryMonitoring';
import { getBatteries } from '@/services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import BatteryReportCard from './BatteryReportCard';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';

export default function Reports() {
  const { batteries: monitoredBatteries, setBatteries } = useBatteryContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'solar' | 'wind' | 'hydro'>('solar');
  const [highContrast, setHighContrast] = useState(false);

  // Theme colors
  const themes = {
    solar: { primary: '#FFC107', secondary: '#4CAF50', accent: '#2196F3' },
    wind: { primary: '#2196F3', secondary: '#4CAF50', accent: '#FFC107' },
    hydro: { primary: '#26A69A', secondary: '#4CAF50', accent: '#2196F3' },
  };
  const currentTheme = themes[theme];

  // Fetch batteries if empty
  useEffect(() => {
    if (monitoredBatteries.length === 0) {
      const fetchBatteries = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await getBatteries();
          const updatedBatteries = data.map((battery: Battery) => ({
            ...battery,
            status: determineStatus(battery.temperature ?? 0),
          }));
          setBatteries(updatedBatteries);
        } catch (err) {
          console.error('Erreur lors de la récupération des batteries:', err);
          setError('Failed to load batteries. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchBatteries();
    }
  }, [monitoredBatteries.length, setBatteries]);

  const determineStatus = (temperature: number): 'Operational' | 'Failed' =>
    temperature > TEMPERATURE_THRESHOLD ? 'Failed' : 'Operational';

  const downloadPDF = () => {
    try {
      console.log('jsPDF:', jsPDF);
      if (!jsPDF || typeof jsPDF !== 'function') {
        throw new Error('Invalid jsPDF constructor');
      }

      const doc = new jsPDF();
      console.log('jsPDF instance created:', doc);
      if (!doc || typeof doc.setFontSize !== 'function') {
        throw new Error('Failed to initialize jsPDF instance');
      }

      console.log('jspdf-autotable applyPlugin:', applyPlugin);
      applyPlugin(jsPDF);
      console.log('Applied jspdf-autotable plugin, doc.autoTable:', doc.autoTable);
      if (!doc.autoTable) {
        throw new Error('autoTable method is not available after applying the plugin');
      }

      const date = new Date()
        .toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
        .replace(',', '');

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Battery Status Report', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('xAI Energy Solutions', 105, 30, { align: 'center' });
      doc.text(`Generated on: ${date}`, 105, 40, { align: 'center' });
      doc.line(20, 50, 190, 50);

      const totalCapacity = monitoredBatteries.reduce((sum, b) => sum + (b.capacity ?? 0), 0);
      const avgStateOfCharge =
        monitoredBatteries.reduce((sum, b) => sum + (b.stateOfCharge ?? 0), 0) /
        monitoredBatteries.length;

      doc.setFontSize(14);
      doc.text('Summary', 20, 60);
      doc.setFontSize(12);
      doc.text(`Total Capacity: ${totalCapacity.toFixed(2)} kWh`, 20, 70);
      doc.text(`Average State of Charge: ${avgStateOfCharge.toFixed(1)}%`, 20, 80);
      doc.text(`Number of Batteries: ${monitoredBatteries.length}`, 20, 90);
      doc.line(20, 100, 190, 100);

      const tableData = monitoredBatteries.map((b) => [
        b.id,
        b.name ?? 'Unknown',
        (b.capacity ?? 0).toFixed(2),
        (b.voltage ?? 0).toFixed(2),
        (b.temperature ?? 0).toFixed(1),
        (b.stateOfCharge ?? 0).toFixed(1),
        b.chemistry ?? 'Unknown',
        b.cycleCount ?? 0,
        b.status ?? determineStatus(b.temperature ?? 0),
        new Date(b.lastChecked ?? new Date()).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      ]);

      doc.autoTable({
        head: [['ID', 'Name', 'Capacity (kWh)', 'Voltage (V)', 'Temp (°C)', 'SoC (%)', 'Chemistry', 'Cycles', 'Status', 'Last Checked']],
        body: tableData,
        startY: 110,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3, halign: 'left', valign: 'middle' },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontStyle: 'bold', lineWidth: 0.2 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        rowStyles: { lineWidth: 0.1, lineColor: [200, 200, 200] },
        didParseCell: (data: any) => {
          const battery = monitoredBatteries[data.row.index];
          const status = battery.status ?? determineStatus(battery.temperature ?? 0);
          if (status === 'Failed') {
            Object.values(data.row.cells).forEach((cell: any) => {
              cell.styles.fillColor = [239, 68, 68];
              cell.styles.textColor = [255, 255, 255];
            });
          } else if ((battery.temperature ?? 0) > TEMPERATURE_THRESHOLD) {
            Object.values(data.row.cells).forEach((cell: any) => {
              cell.styles.fillColor = [255, 215, 0];
              cell.styles.textColor = [0, 0, 0];
            });
          }
        },
        didDrawPage: () => {
          const pageCount = (doc.internal as any).getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: 'right' });
          }
        },
      });

      const finalY = (doc as any).lastAutoTable?.finalY || 110;
      doc.setFontSize(12);
      doc.text(
        'This report was generated automatically by xAI Energy Solutions. For inquiries, contact support@xai.energy.',
        20,
        finalY + 20
      );

      doc.save(`Battery_Status_Report_${date}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF.');
    }
  };

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
          Battery Status Report -{' '}
          {new Date()
            .toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
            .replace(',', '')}
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
      {loading ? (
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
          Loading batteries...
        </p>
      ) : error ? (
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
          {error}
        </p>
      ) : monitoredBatteries.length === 0 ? (
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
          No batteries to report.
        </p>
      ) : (
        <>
          <BatteryReportCard
            batteries={monitoredBatteries}
            theme={theme}
            highContrast={highContrast}
            determineStatus={determineStatus}
          />
          <button
            onClick={downloadPDF}
            onKeyDown={(e) => e.key === 'Enter' && downloadPDF()}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: highContrast
                ? loading
                  ? '#666666'
                  : '#FFFFFF'
                : `linear-gradient(45deg, ${currentTheme.accent}, ${currentTheme.accent}cc)`,
              color: highContrast ? (loading ? '#999999' : '#000000') : '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: `0 2px 6px rgba(0,0,0,0.2), 0 0 8px ${currentTheme.accent}33`,
              animation: loading ? 'none' : 'shine 3s infinite ease-in-out',
              position: 'relative',
              overflow: 'hidden',
              display: 'block',
              margin: '20px auto',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 4px 10px rgba(0,0,0,0.3), 0 0 12px ${currentTheme.accent}66`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = `0 2px 6px rgba(0,0,0,0.2), 0 0 8px ${currentTheme.accent}33`;
            }}
            aria-label="Download battery status report as PDF"
          >
            <FontAwesomeIcon
              icon={faDownload}
              style={{ marginRight: '8px', filter: `drop-shadow(0 0 2px ${currentTheme.accent}80)` }}
            />
            {loading ? 'Loading...' : 'Download PDF'}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: loading ? 'none' : 'shineOverlay 2s infinite ease-in-out',
              }}
            />
          </button>
        </>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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


//testt