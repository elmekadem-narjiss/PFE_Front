'use client';

import { useBatteryContext } from '@/context/BatteryContext';
import styles from './page.module.css';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
import { Battery } from '@/types';
import {  TEMPERATURE_THRESHOLD } from '@/lib/batteryMonitoring';//VOLTAGE_THRESHOLD
import { getBatteries } from '@/services/api';
import { useEffect, useState } from 'react';

// Apply the plugin to jsPDF
applyPlugin(jsPDF);

export default function Reports() {
  const { batteries: monitoredBatteries, setBatteries } = useBatteryContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to determine battery status
  const determineStatus = (voltage: number, temperature: number): 'Operational' | 'Failed' => {
    if ( temperature > TEMPERATURE_THRESHOLD) {//voltage < VOLTAGE_THRESHOLD ||
      return 'Failed';
    }
    return 'Operational';
  };

  // Fetch batteries if the context is empty
  useEffect(() => {
    if (monitoredBatteries.length === 0) {
      const fetchBatteries = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await getBatteries();
          // Update status for each battery
          const updatedBatteries = data.map((battery: Battery) => ({
            ...battery,
            status: determineStatus(battery.voltage ?? 0, battery.temperature ?? 0),
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
  }, [monitoredBatteries, setBatteries]);

  const downloadPDF = () => {
    const doc = new jsPDF();

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

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Battery Status Report', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('xAI Energy Solutions', 105, 30, { align: 'center' });
    doc.text(`Generated on: ${date}`, 105, 40, { align: 'center' });
    doc.line(20, 50, 190, 50);

    // Summary Section
    let totalCapacity = 0;
    let avgStateOfCharge = 0;
    if (monitoredBatteries.length > 0) {
      totalCapacity = monitoredBatteries.reduce(
        (sum, battery) => sum + (battery.capacity ?? 0),
        0
      );
      avgStateOfCharge =
        monitoredBatteries.reduce(
          (sum, battery) => sum + (battery.stateOfCharge ?? 0),
          0
        ) / monitoredBatteries.length;
    }
    doc.setFontSize(14);
    doc.text('Summary', 20, 60);
    doc.setFontSize(12);
    doc.text(`Total Capacity: ${totalCapacity.toFixed(2)} kWh`, 20, 70);
    doc.text(`Average State of Charge: ${avgStateOfCharge.toFixed(1)}%`, 20, 80);
    doc.text(`Number of Batteries: ${monitoredBatteries.length}`, 20, 90);
    doc.line(20, 100, 190, 100);

    // Prepare table data with additional details
    const tableData = monitoredBatteries.map((battery: Battery) => {
      console.log('Battery data:', battery);
      return [
        battery.id,
        battery.name ?? 'Unknown',
        (battery.capacity ?? 0).toFixed(2),
        (battery.voltage ?? 0).toFixed(2),
        (battery.temperature ?? 0).toFixed(1),
        (battery.stateOfCharge ?? 0).toFixed(1),
        battery.chemistry ?? 'Unknown',
        battery.cycleCount ?? 0,
        battery.status ?? determineStatus(battery.voltage ?? 0, battery.temperature ?? 0),
        new Date(battery.lastChecked ?? new Date()).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      ];
    });

    // Generate table with conditional row styling
    doc.autoTable({
      head: [
        [
          'ID',
          'Name',
          'Capacity (kWh)',
          'Voltage (V)',
          'Temp (°C)',
          'SoC (%)',
          'Chemistry',
          'Cycles',
          'Status',
          'Last Checked',
        ],
      ],
      body: tableData,
      startY: 110,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3, halign: 'left', valign: 'middle' },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        lineWidth: 0.2,
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      rowStyles: { lineWidth: 0.1, lineColor: [200, 200, 200] },
      didParseCell: (data) => {
        const rowIndex = data.row.index;
        const battery = monitoredBatteries[rowIndex];
        const status = battery.status ?? determineStatus(battery.voltage ?? 0, battery.temperature ?? 0);
        if (status === 'Failed') {
          Object.values(data.row.cells).forEach((cell) => {
            cell.styles.fillColor = [239, 68, 68];
            cell.styles.textColor = [255, 255, 255];
          });
/*
        } else if ((battery.voltage ?? 0) < VOLTAGE_THRESHOLD) {
          Object.values(data.row.cells).forEach((cell) => {
            cell.styles.fillColor = [255, 165, 0];
            cell.styles.textColor = [0, 0, 0];
          });
*/
        } else if ((battery.temperature ?? 0) > TEMPERATURE_THRESHOLD) {
          Object.values(data.row.cells).forEach((cell) => {
            cell.styles.fillColor = [255, 215, 0];
            cell.styles.textColor = [0, 0, 0];
          });
        }
      },
      didDrawPage: (data: { pageNumber: number; doc: jsPDF }) => {
        const pageCount = (doc.internal as any).getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: 'right' });
        }
      },
    });

    // Closing Note
    const finalY = (doc as any).lastAutoTable.finalY || 110;
    doc.setFontSize(12);
    doc.text(
      'This report was generated automatically by xAI Energy Solutions. For inquiries, contact support@xai.energy.',
      20,
      finalY + 20
    );

    // Download the PDF
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
      <button onClick={downloadPDF} className={styles.downloadButton} disabled={loading}>
        {loading ? 'Loading...' : 'Download PDF'}
      </button>
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
              const status = battery.status ?? determineStatus(battery.voltage ?? 0, battery.temperature ?? 0);
              return (
                <tr
                  key={battery.id}
                  className={
                    status === 'Failed'
                      ? styles.failedRow
                    //  : (battery.voltage ?? 0) < VOLTAGE_THRESHOLD
                      //? styles.warningRowVoltage
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
    </div>
  );
}