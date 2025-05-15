'use client';

import { useSettings } from '../../context/SettingsContext';
import styles from './Settings.module.css';

const Settings = () => {
  const { settings, setSettings } = useSettings();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleSave = () => {
    localStorage.setItem('apiUrl', settings.apiUrl);
    localStorage.setItem('influxDbOrg', settings.influxDbOrg);
    localStorage.setItem('influxDbBucket', settings.influxDbBucket);
    alert('Settings saved!');
  };

  return (
    <div className={styles.container}>
      <h1>Settings</h1>
      <div className={styles.form}>
        <label>
          API URL:
          <input
            type="text"
            name="apiUrl"
            value={settings.apiUrl}
            onChange={handleChange}
            className={styles.input}
          />
        </label>
        <label>
          InfluxDB Org:
          <input
            type="text"
            name="influxDbOrg"
            value={settings.influxDbOrg}
            onChange={handleChange}
            className={styles.input}
          />
        </label>
        <label>
          InfluxDB Bucket:
          <input
            type="text"
            name="influxDbBucket"
            value={settings.influxDbBucket}
            onChange={handleChange}
            className={styles.input}
          />
        </label>
        <button onClick={handleSave} className={styles.saveButton}>
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;