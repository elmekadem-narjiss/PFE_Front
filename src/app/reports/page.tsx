'use client';

import { useBatteryContext } from '@/context/BatteryContext';
import styles from './page.module.css';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
import { Battery } from '@/types';
import { TEMPERATURE_THRESHOLD } from '@/lib/batteryMonitoring';
import { getBatteries } from '@/services/api';
import { useEffect, useState, useRef } from 'react';
import { Chart as ChartJS, TooltipItem, Chart } from 'chart.js/auto';

const ChartComponent = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const { batteries: monitoredBatteries } = useBatteryContext();
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    const ctx = chartRef.current?.getContext('2d');

    if (!ctx || monitoredBatteries.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const totalCapacity = monitoredBatteries.reduce((sum, battery) => sum + (battery.capacity ?? 0), 0);
    const avgStateOfCharge =
      monitoredBatteries.reduce((sum, battery) => sum + (battery.stateOfCharge ?? 0), 0) /
      monitoredBatteries.length;
    const numBatteries = monitoredBatteries.length;

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: ['Total Capacity (kWh)', 'Avg State of Charge (%)', 'Number of Batteries'],
        datasets: [
          {
            label: 'Battery Summary',
            data: [totalCapacity, avgStateOfCharge, numBatteries],
            backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
            borderWidth: 0,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Value',
              color: '#fff',
            },
            ticks: {
              color: '#fff',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Categories',
              color: '#fff',
            },
            ticks: {
              color: '#fff',
            },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#fff',
              font: { size: 14 },
            },
          },
          title: {
            display: true,
            text: 'Global Battery Characteristics',
            color: '#fff',
            font: { size: 16 },
          },
          tooltip: {
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
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [monitoredBatteries]);

  return <canvas ref={chartRef} style={{ maxWidth: '600px', height: '400px', margin: '0 auto' }} />;
};

export default function Reports() {
  const { batteries: monitoredBatteries, setBatteries } = useBatteryContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const determineStatus = (temperature: number): 'Operational' | 'Failed' =>
    temperature > TEMPERATURE_THRESHOLD ? 'Failed' : 'Operational';

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

  const downloadPDF = () => {
    const doc = new jsPDF();
    applyPlugin(jsPDF);

    if (!doc.autoTable) {
      console.error('autoTable method is not available after applying the plugin.');
      return;
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
      didParseCell: (data) => {
        const battery = monitoredBatteries[data.row.index];
        const status = battery.status ?? determineStatus(battery.temperature ?? 0);
        if (status === 'Failed') {
          Object.values(data.row.cells).forEach((cell) => {
            cell.styles.fillColor = [239, 68, 68];
            cell.styles.textColor = [255, 255, 255];
          });
        } else if ((battery.temperature ?? 0) > TEMPERATURE_THRESHOLD) {
          Object.values(data.row.cells).forEach((cell) => {
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

    const finalY = (doc as any).lastAutoTable.finalY || 110;
    doc.setFontSize(12);
    doc.text(
      'This report was generated automatically by xAI Energy Solutions. For inquiries, contact support@xai.energy.',
      20,
      finalY + 20
    );

    doc.save(`Battery_Status_Report_${date}.pdf`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
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
      <div className={styles.chartContainer}>
        <ChartComponent />
      </div>
      {loading ? (
        <p className={styles.noData}>Loading batteries...</p>
      ) : error ? (
        <p className={styles.noData}>{error}</p>
      ) : monitoredBatteries.length === 0 ? (
        <p className={styles.noData}>No batteries to report.</p>
      ) : (
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Capacity (kWh)</th>
              <th>Voltage (V)</th>
              <th>Temperature (°C)</th>
              <th>State of Charge (%)</th>
              <th>Chemistry</th>
              <th>Cycles</th>
              <th>Status</th>
              <th>Last Checked</th>
            </tr>
          </thead>
          <tbody>
            {monitoredBatteries.map((battery: Battery) => {
              const status = battery.status ?? determineStatus(battery.temperature ?? 0);
              return (
                <tr
                  key={battery.id}
                  className={
                    status === 'Failed'
                      ? styles.failedRow
                      : (battery.temperature ?? 0) > TEMPERATURE_THRESHOLD
                      ? styles.warningRowTemp
                      : ''
                  }
                >
                  <td>{battery.id}</td>
                  <td>{battery.name ?? 'Unknown'}</td>
                  <td>{(battery.capacity ?? 0).toFixed(2)}</td>
                  <td>{(battery.voltage ?? 0).toFixed(2)}</td>
                  <td>{(battery.temperature ?? 0).toFixed(1)}</td>
                  <td>{(battery.stateOfCharge ?? 0).toFixed(1)}</td>
                  <td>{battery.chemistry ?? 'Unknown'}</td>
                  <td>{battery.cycleCount ?? 0}</td>
                  <td>{status}</td>
                  <td>
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
      )}
      <button onClick={downloadPDF} className={styles.downloadButton} disabled={loading}>
        {loading ? 'Loading...' : 'Download PDF'}
      </button>
    </div>
  );
}