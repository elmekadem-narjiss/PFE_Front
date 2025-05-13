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

    const date = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace(',', ''); // e.g., "13/05/2025 18:38"

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
      totalCapacity = monitoredBatteries.reduce((sum, battery) => sum + battery.capacity, 0);
      avgStateOfCharge = monitoredBatteries.reduce((sum, battery) => sum + battery.stateOfCharge, 0) / monitoredBatteries.length;
    }
    doc.setFontSize(14);
    doc.text('Summary', 20, 60);
    doc.setFontSize(12);
    doc.text(`Total Capacity: ${totalCapacity.toFixed(2)} kWh`, 20, 70);
    doc.text(`Average State of Charge: ${avgStateOfCharge.toFixed(1)}%`, 20, 80);
    doc.text(`Number of Batteries: ${monitoredBatteries.length}`, 20, 90);
    doc.line(20, 100, 190, 100);

    // Prepare table data with additional details
    const tableData = monitoredBatteries.map((battery) => [
      battery.id,
      battery.name,
      battery.capacity.toFixed(2),
      battery.voltage.toFixed(2),
      battery.temperature.toFixed(1),
      battery.stateOfCharge.toFixed(1),
      battery.chemistry,
      battery.cycleCount,
      battery.status,
      new Date(battery.lastChecked).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    ]);

    // Generate table with conditional row styling
    doc.autoTable({
      head: [
        ['ID', 'Name', 'Capacity (kWh)', 'Voltage (V)', 'Temp (°C)', 'SoC (%)', 'Chemistry', 'Cycles', 'Status', 'Last Checked'],
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
        if (monitoredBatteries[rowIndex].status === 'Failed') {
          Object.values(data.row.cells).forEach((cell) => {
            cell.styles.fillColor = [239, 68, 68];
            cell.styles.textColor = [255, 255, 255];
          });
        }
      },
      didDrawPage: (data: { pageNumber: number; doc: jsPDF }) => {
        // Footer with page number
        const pageCount = (doc.internal as any).getNumberOfPages(); // Type assertion to bypass TypeScript error
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
    doc.text('This report was generated automatically by xAI Energy Solutions. For inquiries, contact support@xai.energy.', 20, finalY + 20);

    // Download the PDF
    doc.save(`Battery_Status_Report_${date}.pdf`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Battery Status Report - {new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).replace(',', '')}</h1>
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
              <th>Chemistry</th>
              <th>Cycles</th>
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
                <td>{battery.capacity.toFixed(2)}</td>
                <td>{battery.voltage.toFixed(2)}</td>
                <td>{battery.temperature.toFixed(1)}</td>
                <td>{battery.stateOfCharge.toFixed(1)}</td>
                <td>{battery.chemistry}</td>
                <td>{battery.cycleCount}</td>
                <td>{battery.status}</td>
                <td>{new Date(battery.lastChecked).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}