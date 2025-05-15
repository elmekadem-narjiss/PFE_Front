'use client';

import { useState, useEffect } from 'react';
import { fetchEquipmentData, simulateEquipmentData } from '../../../services/equipmentApi';
import { StoredEquipmentData, EquipmentMetrics } from '../../../types/equipment';
import { useSettings } from '../../../context/SettingsContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaSort, FaSun, FaMoon } from 'react-icons/fa';
import styles from './Monitoring.module.css';

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchEquipmentData(settings.apiUrl);
      console.log('Fetched equipment data:', data);
      setEquipmentData(data);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load equipment data');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    try {
      await simulateEquipmentData(settings.apiUrl);
      await fetchData();
    } catch (err) {
      console.error('Simulate error:', err);
      setError('Failed to simulate data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [settings.apiUrl]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  const materialEquipment = equipmentData.filter((equip) =>
    equip.metrics.some((m) => m.metrics.cpuUsage || m.metrics.ramUsage || m.metrics.storageUsed)
  );
  const panelEquipment = equipmentData.filter((equip) =>
    equip.metrics.some((m) => m.metrics.energyProduced)
  );
  const sensorEquipment = equipmentData.filter((equip) =>
    equip.metrics.some((m) => m.metrics.temperature || m.metrics.humidity)
  );

  console.log('Material Equipment (with CPU/RAM/Storage):', materialEquipment);
  console.log('Panel Equipment (with Energy):', panelEquipment);
  console.log('Sensor Equipment (with Temp/Humidity):', sensorEquipment);

  const getChartData = (equip: StoredEquipmentData, metric: keyof EquipmentMetrics, label: string) => {
    return equip.metrics.map((m) => ({
      timestamp: new Date(m.timestamp).toLocaleDateString(),
      [label]: m.metrics[metric] ?? 0,
    }));
  };

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
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Monitoring Dashboard</h1>
        <button onClick={() => setDarkMode(!darkMode)} className={styles.themeToggle}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
      <button onClick={handleSimulate} className={styles.simulateButton}>
        Simulate New Data
      </button>

      <div className={styles.sectionsContainer}>
        {/* Material Management Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Material Management</h2>
          <div className={styles.toggles}>
            <label>
              <input
                type="checkbox"
                checked={metricVisibility.cpuUsage}
                onChange={() => handleMetricToggle('cpuUsage')}
              />
              CPU Usage
            </label>
            <label>
              <input
                type="checkbox"
                checked={metricVisibility.ramUsage}
                onChange={() => handleMetricToggle('ramUsage')}
              />
              RAM Usage
            </label>
            <label>
              <input
                type="checkbox"
                checked={metricVisibility.storageUsed}
                onChange={() => handleMetricToggle('storageUsed')}
              />
              Storage Used
            </label>
          </div>
          {materialEquipment.length === 0 ? (
            <div className={styles.noData}>No equipment with CPU, RAM, or Storage data available</div>
          ) : (
            <div className={styles.grid}>
              {materialEquipment.map((equip) => (
                <div key={equip.equipmentId} className={styles.card}>
                  <h3>{equip.equipmentId} ({equip.type})</h3>
                  <div className={styles.chartContainer}>
                    {metricVisibility.cpuUsage && equip.metrics.some((m) => m.metrics.cpuUsage) && (
                      <div className={styles.chart}>
                        <h4>CPU Usage (%)</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={getChartData(equip, 'cpuUsage', 'cpuUsage')} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="timestamp" stroke="#122a43" />
                            <YAxis domain={[0, 100]} stroke="#122a43" />
                            <Tooltip
                              formatter={(value: number) => `${value.toFixed(2)} %`}
                              labelFormatter={(label) => `Date: ${label}`}
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
                    {metricVisibility.ramUsage && equip.metrics.some((m) => m.metrics.ramUsage) && (
                      <div className={styles.chart}>
                        <h4>RAM Usage (%)</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={getChartData(equip, 'ramUsage', 'ramUsage')} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="timestamp" stroke="#122a43" />
                            <YAxis domain={[0, 100]} stroke="#122a43" />
                            <Tooltip
                              formatter={(value: number) => `${value.toFixed(2)} %`}
                              labelFormatter={(label) => `Date: ${label}`}
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
                    {metricVisibility.storageUsed && equip.metrics.some((m) => m.metrics.storageUsed) && (
                      <div className={styles.chart}>
                        <h4>Storage Used (GB)</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={getChartData(equip, 'storageUsed', 'storageUsed')} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="timestamp" stroke="#122a43" />
                            <YAxis stroke="#122a43" />
                            <Tooltip
                              formatter={(value: number) => `${value.toFixed(2)} GB`}
                              labelFormatter={(label) => `Date: ${label}`}
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

        {/* Equipment Management Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Equipment Management</h2>
          <div className={styles.toggles}>
            <label>
              <input
                type="checkbox"
                checked={metricVisibility.energyProduced}
                onChange={() => handleMetricToggle('energyProduced')}
              />
              Energy Produced
            </label>
            <label>
              <input
                type="checkbox"
                checked={metricVisibility.temperature}
                onChange={() => handleMetricToggle('temperature')}
              />
              Temperature
            </label>
            <label>
              <input
                type="checkbox"
                checked={metricVisibility.humidity}
                onChange={() => handleMetricToggle('humidity')}
              />
              Humidity
            </label>
          </div>
          <div className={styles.grid}>
            {panelEquipment.map((equip) => (
              <div key={equip.equipmentId} className={styles.card}>
                <h3>{equip.equipmentId} ({equip.type})</h3>
                {metricVisibility.energyProduced && equip.metrics.some((m) => m.metrics.energyProduced) && (
                  <div className={styles.chart}>
                    <h4>Energy Produced (kWh)</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={getChartData(equip, 'energyProduced', 'energyProduced')} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="timestamp" stroke="#122a43" />
                        <YAxis domain={[0, 60]} stroke="#122a43" label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                          formatter={(value: number) => `${value.toFixed(2)} kWh`}
                          labelFormatter={(label) => `Date: ${label}`}
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
              </div>
            ))}
            {sensorEquipment.map((equip) => (
              <div key={equip.equipmentId} className={styles.card}>
                <h3>{equip.equipmentId} ({equip.type})</h3>
                <div className={styles.chartContainer}>
                  {metricVisibility.temperature && equip.metrics.some((m) => m.metrics.temperature) && (
                    <div className={styles.chart}>
                      <h4>Temperature (°C)</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={getChartData(equip, 'temperature', 'temperature')} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="timestamp" stroke="#122a43" />
                          <YAxis domain={[0, 100]} stroke="#122a43" />
                          <Tooltip
                            formatter={(value: number) => `${value.toFixed(2)} °C`}
                            labelFormatter={(label) => `Date: ${label}`}
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
                  {metricVisibility.humidity && equip.metrics.some((m) => m.metrics.humidity) && (
                    <div className={styles.chart}>
                      <h4>Humidity (%)</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={getChartData(equip, 'humidity', 'humidity')} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="timestamp" stroke="#122a43" />
                          <YAxis domain={[0, 100]} stroke="#122a43" />
                          <Tooltip
                            formatter={(value: number) => `${value.toFixed(2)} %`}
                            labelFormatter={(label) => `Date: ${label}`}
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

          {/* Equipment Table */}
          <div className={styles.tableContainer}>
            <h3>All Equipment Data</h3>
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
                      <td>{latestMetric?.timestamp || 'N/A'}</td>
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