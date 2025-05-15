'use client';

import { useState, useEffect } from 'react';
import { StoredEquipmentData, EquipmentMetrics } from '../../../types/equipment';
import { useSettings } from '../../../context/SettingsContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaSort, FaSun, FaMoon, FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';
import styles from './Monitoring.module.css';

interface Alert {
  message: string;
  sent: boolean;
  error?: string;
  timestamp: string;
}

const Monitoring = () => {
  const { settings } = useSettings();
  const [equipmentData, setEquipmentData] = useState<StoredEquipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [metricVisibility, setMetricVisibility] = useState({
    cpuUsage: true,
    ramUsage: true,
    storageUsed: true,
    energyProduced: true,
    temperature: true,
    humidity: true,
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'equipmentId', direction: 'asc' });
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    setLoading(true);
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/monitor');
        if (!response.ok) {
          const text = await response.text();
          console.error('Non-JSON response received:', text);
          throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const equipmentId = 'local-server';
        const newMetricEntry = {
          timestamp: new Date().toISOString(),
          metrics: {
            cpuUsage: data.metrics.cpuUsage,
            ramUsage: data.metrics.ramUsage,
            storageUsed: data.metrics.storageUsed,
            energyProduced: 0,
            temperature: data.metrics.temperature,
            humidity: 0,
          } as EquipmentMetrics,
        };

        setEquipmentData((prev) => {
          const existingIndex = prev.findIndex((equip) => equip.equipmentId === equipmentId);
          if (existingIndex !== -1) {
            const updatedMetrics = [...prev[existingIndex].metrics, newMetricEntry].slice(-5);
            return [
              ...prev.slice(0, existingIndex),
              { ...prev[existingIndex], metrics: updatedMetrics },
              ...prev.slice(existingIndex + 1),
            ].slice(-20);
          } else {
            return [
              ...prev,
              { equipmentId, type: 'server', metrics: [newMetricEntry] },
            ].slice(-20);
          }
        });

        if (data.alerts.length > 0) {
          const newAlerts = data.alerts.map((msg: string) => ({
            message: msg,
            sent: true,
            timestamp: new Date().toLocaleString(),
          }));
          setAlerts((prev) => [...prev, ...newAlerts].slice(-10));
        }
      } catch (err) {
        setError(`Monitoring Error: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMetricToggle = (metric: keyof typeof metricVisibility) => {
    setMetricVisibility((prev) => ({ ...prev, [metric]: !prev[metric] }));
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedEquipment = [...equipmentData].sort((a, b) => {
    const key = sortConfig.key as keyof StoredEquipmentData;
    const aValue = a[key] || '';
    const bValue = b[key] || '';
    return sortConfig.direction === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
  });

  const getChartData = (equip: StoredEquipmentData, metric: keyof EquipmentMetrics, label: string) => {
    return equip.metrics.map((m) => ({
      timestamp: new Date(m.timestamp).toLocaleTimeString(),
      [label]: m.metrics[metric] ?? 0,
    }));
  };

  const materialEquipment = equipmentData.filter((equip) =>
    equip.metrics.some((m) => m.metrics.cpuUsage || m.metrics.ramUsage || m.metrics.storageUsed)
  );
  const panelEquipment = equipmentData.filter((equip) =>
    equip.metrics.some((m) => m.metrics.energyProduced)
  );
  const sensorEquipment = equipmentData.filter((equip) =>
    equip.metrics.some((m) => m.metrics.temperature || m.metrics.humidity)
  );

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Monitoring Dashboard</h1>
        <button onClick={() => setDarkMode(!darkMode)} className={styles.themeToggle}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      {alerts.length > 0 && (
        <div className={styles.alertsContainer}>
          <h3>Alerts</h3>
          <ul>
            {alerts.map((alert, index) => (
              <li key={index} className={styles.alert}>
                <FaExclamationTriangle className={styles.alertIcon} /> {alert.message} (at {alert.timestamp})
                {alert.sent ? <FaCheck className={styles.successIcon} title="Email sent" /> : null}
                {alert.error && <FaTimes className={styles.errorIcon} title={alert.error} />}
              </li>
            ))}
          </ul>
          <button onClick={() => setAlerts([])} className={styles.clearAlertsButton}>
            Clear Alerts
          </button>
        </div>
      )}

      <div className={styles.sectionsContainer}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Material Management</h2>
          <div className={styles.toggles}>
            {['cpuUsage', 'ramUsage', 'storageUsed'].map((metric) => (
              <label key={metric}>
                <input
                  type="checkbox"
                  checked={metricVisibility[metric as keyof typeof metricVisibility]}
                  onChange={() => handleMetricToggle(metric as keyof typeof metricVisibility)}
                />
                {metric.split(/(?=[A-Z])/).join(' ')}
              </label>
            ))}
          </div>
          {materialEquipment.length === 0 ? (
            <div className={styles.noData}>No equipment with CPU, RAM, or Storage data available</div>
          ) : (
            <div className={styles.grid}>
              {materialEquipment.map((equip) => (
                <div key={equip.equipmentId} className={styles.card}>
                  <h3>{equip.equipmentId} ({equip.type})</h3>
                  <div className={styles.chartContainer}>
                    {metricVisibility.cpuUsage && equip.metrics.some((m) => m.metrics.cpuUsage !== null) && (
                      <div className={styles.chart}>
                        <h4>CPU Usage (%)</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={getChartData(equip, 'cpuUsage', 'cpuUsage')} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="timestamp" stroke="#122a43" />
                            <YAxis domain={[0, 100]} stroke="#122a43" />
                            <Tooltip
                              formatter={(value: number) => `${value.toFixed(2)} %`}
                              labelFormatter={(label) => `Time: ${label}`}
                            />
                            <Line
                              type="monotone"
                              dataKey="cpuUsage"
                              stroke="#20a1d9"
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 8, fill: '#14608d' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {metricVisibility.ramUsage && equip.metrics.some((m) => m.metrics.ramUsage !== null) && (
                      <div className={styles.chart}>
                        <h4>RAM Usage (%)</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={getChartData(equip, 'ramUsage', 'ramUsage')} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="timestamp" stroke="#122a43" />
                            <YAxis domain={[0, 100]} stroke="#122a43" />
                            <Tooltip
                              formatter={(value: number) => `${value.toFixed(2)} %`}
                              labelFormatter={(label) => `Time: ${label}`}
                            />
                            <Line
                              type="monotone"
                              dataKey="ramUsage"
                              stroke="#73a0e9"
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 8, fill: '#14608d' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {metricVisibility.storageUsed && equip.metrics.some((m) => m.metrics.storageUsed !== null) && (
                      <div className={styles.chart}>
                        <h4>Storage Used (GB)</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={getChartData(equip, 'storageUsed', 'storageUsed')} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="timestamp" stroke="#122a43" />
                            <YAxis stroke="#122a43" />
                            <Tooltip
                              formatter={(value: number) => `${value.toFixed(2)} GB`}
                              labelFormatter={(label) => `Time: ${label}`}
                            />
                            <Line
                              type="monotone"
                              dataKey="storageUsed"
                              stroke="#ff9800"
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 8, fill: '#14608d' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Equipment Management</h2>
          <div className={styles.toggles}>
            {['energyProduced', 'temperature', 'humidity'].map((metric) => (
              <label key={metric}>
                <input
                  type="checkbox"
                  checked={metricVisibility[metric as keyof typeof metricVisibility]}
                  onChange={() => handleMetricToggle(metric as keyof typeof metricVisibility)}
                />
                {metric.split(/(?=[A-Z])/).join(' ')}
              </label>
            ))}
          </div>
          <div className={styles.grid}>
            {equipmentData.map((equip) => (
              <div key={equip.equipmentId} className={styles.card}>
                <h3>{equip.equipmentId} ({equip.type})</h3>
                <div className={styles.chartContainer}>
                  {metricVisibility.energyProduced && equip.metrics.some((m) => m.metrics.energyProduced !== null) && (
                    <div className={styles.chart}>
                      <h4>Energy Produced (kWh)</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={getChartData(equip, 'energyProduced', 'energyProduced')} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="timestamp" stroke="#122a43" />
                          <YAxis domain={[0, 60]} stroke="#122a43" label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                          <Tooltip
                            formatter={(value: number) => `${value.toFixed(2)} kWh`}
                            labelFormatter={(label) => `Time: ${label}`}
                          />
                          <Line
                            type="monotone"
                            dataKey="energyProduced"
                            stroke="#20dad8"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 8, fill: '#14608d' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {metricVisibility.temperature && equip.metrics.some((m) => m.metrics.temperature !== null) && (
                    <div className={styles.chart}>
                      <h4>Temperature (°C)</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={getChartData(equip, 'temperature', 'temperature')} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="timestamp" stroke="#122a43" />
                          <YAxis domain={[0, 100]} stroke="#122a43" />
                          <Tooltip
                            formatter={(value: number) => `${value.toFixed(2)} °C`}
                            labelFormatter={(label) => `Time: ${label}`}
                          />
                          <Line
                            type="monotone"
                            dataKey="temperature"
                            stroke="#e91e63"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 8, fill: '#14608d' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {metricVisibility.humidity && equip.metrics.some((m) => m.metrics.humidity !== null) && (
                    <div className={styles.chart}>
                      <h4>Humidity (%)</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={getChartData(equip, 'humidity', 'humidity')} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="timestamp" stroke="#122a43" />
                          <YAxis domain={[0, 100]} stroke="#122a43" />
                          <Tooltip
                            formatter={(value: number) => `${value.toFixed(2)} %`}
                            labelFormatter={(label) => `Time: ${label}`}
                          />
                          <Line
                            type="monotone"
                            dataKey="humidity"
                            stroke="#20a1d9"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 8, fill: '#14608d' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.tableContainer}>
            <h3>All Equipment Data ({equipmentData.length} equipment{equipmentData.length !== 1 ? 's' : ''})</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th onClick={() => handleSort('equipmentId')}>
                    Equipment ID <FaSort />
                  </th>
                  <th onClick={() => handleSort('type')}>
                    Type <FaSort />
                  </th>
                  <th>Latest Metrics</th>
                  <th onClick={() => handleSort('timestamp')}>
                    Timestamp <FaSort />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedEquipment.map((equip) => {
                  const latestMetric = equip.metrics[equip.metrics.length - 1];
                  return (
                    <tr key={equip.equipmentId}>
                      <td>{equip.equipmentId}</td>
                      <td>{equip.type}</td>
                      <td>
                        {latestMetric ? (
                          <pre>{JSON.stringify(latestMetric.metrics, null, 2)}</pre>
                        ) : (
                          'No metrics'
                        )}
                      </td>
                      <td>{latestMetric?.timestamp ? new Date(latestMetric.timestamp).toLocaleString() : 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Monitoring;