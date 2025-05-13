'use client';

import { useBatteryContext } from '@/context/BatteryContext';
import styles from './page.module.css';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';

// Apply the plugin to jsPDF
applyPlugin(jsPDF);

export default function Reports() {
  const { batteries: monitoredBatteries } = useBatteryContext();

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Verify that autoTable is available
    if (!doc.autoTable) {
      console.error('autoTable method is not available after applying the plugin.');
      return;
    }

    const date = new Date().toLocaleDateString();

    // Set document title
    doc.setFontSize(18);
    doc.text('Battery Status Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 14, 30);

    // Prepare table data
    const tableData = monitoredBatteries.map((battery) => [
      battery.id,
      battery.name,
      battery.capacity,
      battery.voltage.toFixed(2),
      battery.temperature.toFixed(1),
      battery.stateOfCharge.toFixed(1),
      battery.status,
      new Date(battery.lastChecked).toLocaleString(),
    ]);

    // Generate table with conditional row styling
    doc.autoTable({
      head: [['ID', 'Name', 'Capacity (kWh)', 'Voltage (V)', 'Temperature (°C)', 'State of Charge (%)', 'Status', 'Last Checked']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2, halign: 'left' },
      headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      rowStyles: { lineWidth: 0.1, lineColor: [200, 200, 200] },
      didParseCell: (data) => {
        const rowIndex = data.row.index;
        if (monitoredBatteries[rowIndex].status === 'Failed') {
          // Iterate over the cells object using Object.values
          Object.values(data.row.cells).forEach((cell) => {
            cell.styles.fillColor = [239, 68, 68]; // Red background
            cell.styles.textColor = [255, 255, 255]; // White text for contrast
          });
        }
      },
    });

    // Download the PDF
    doc.save(`Battery_Report_${date}.pdf`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Battery Status Report - {new Date().toLocaleDateString()}</h1>
      <button onClick={downloadPDF} className={styles.downloadButton}>
        Download PDF
      </button>
      {monitoredBatteries.length === 0 ? (
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
              <th>Status</th>
              <th>Last Checked</th>
            </tr>
          </thead>
          <tbody>
            {monitoredBatteries.map((battery) => (
              <tr
                key={battery.id}
                className={battery.status === 'Failed' ? styles.failedRow : ''}
              >
                <td>{battery.id}</td>
                <td>{battery.name}</td>
                <td>{battery.capacity}</td>
                <td>{battery.voltage.toFixed(2)}</td>
                <td>{battery.temperature.toFixed(1)}</td>
                <td>{battery.stateOfCharge.toFixed(1)}</td>
                <td>{battery.status}</td>
                <td>{new Date(battery.lastChecked).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}