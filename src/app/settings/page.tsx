'use client';

import { useState, useEffect } from 'react';
import { Box, Tabs, Tab, TextField, Button, Slider, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Typography, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import styles from './Settings.module.css';

// Interface for settings data
interface SettingsData {
  pipeline: {
    ciCdEnabled: boolean;
    retrainFrequency: string;
    modelVersion: string;
  };
  energy: {
    demandThreshold: number;
    optimizationMode: string;
  };
  battery: {
    healthThreshold: number;
    alertOnDegradation: boolean;
  };
  kafka: {
    broker: string;
    topic: string;
    groupId: string;
  };
  user: {
    notificationsEnabled: boolean;
    theme: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrainLoading, setRetrainLoading] = useState(false); // Add loading state for retraining
  const [error, setError] = useState<string | null>(null);

  // Fetch initial settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/saveSettings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        setSettings(data);
      } catch (err) {
        setError('Error loading settings');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle form changes
  const handleChange = (section: keyof SettingsData, key: string, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        [section]: { ...settings[section], [key]: value },
      });
    }
  };

  // Validate modelVersion format (vX.X)
  const validateModelVersion = (version: string): boolean => {
    const regex = /^v\d+\.\d+$/;
    return regex.test(version);
  };

  // Save settings
  const saveSettings = async () => {
    if (!settings) return;
    // Validate Kafka settings
    if (!settings.kafka.broker.trim() || !settings.kafka.topic.trim() || !settings.kafka.groupId.trim()) {
      setError('Kafka settings cannot be empty');
      return;
    }
    // Validate modelVersion
    if (!validateModelVersion(settings.pipeline.modelVersion)) {
      setError('Model Version must be in the format vX.X (e.g., v1.0)');
      return;
    }
    try {
      const response = await fetch('/api/saveSettings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      alert('Settings saved successfully');
      setError(null); // Clear error on success
    } catch (err) {
      setError('Error saving settings');
    }
  };

  // Reset to defaults
  const resetSettings = () => {
    setSettings({
      pipeline: { ciCdEnabled: true, retrainFrequency: 'daily', modelVersion: 'v1.0' },
      energy: { demandThreshold: 100, optimizationMode: 'balanced' },
      battery: { healthThreshold: 80, alertOnDegradation: true },
      kafka: { broker: 'localhost:9092', topic: 'team-messages', groupId: 'message-fetcher-group' },
      user: { notificationsEnabled: true, theme: 'light' },
    });
    setError(null); // Clear error on reset
  };

  // Trigger retraining
  const triggerRetrain = async () => {
    if (!settings?.pipeline.ciCdEnabled) {
      setError('CI/CD must be enabled to trigger retraining');
      return;
    }
    setRetrainLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/retrain', { // Updated to /api/retrain
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error('Failed to trigger retraining');
      const data = await response.json();
      alert(`Retraining triggered successfully: ${data.message}`);
      setError(null);
      const updatedSettings = await fetch('/api/saveSettings').then(res => res.json());
      setSettings(updatedSettings);
    } catch (err) {
      setError('Error triggering retraining');
    } finally {
      setRetrainLoading(false);
    }
  };
  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  if (error) return <Typography className={styles.error}>{error}</Typography>;
  if (!settings) return null;

  return (
    <Box className={styles.container}>
      <Typography variant="h4" gutterBottom>
        Platform Settings
      </Typography>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        sx={{
          mb: 3,
          '& .MuiTab-root': { color: '#333333' },
          '& .Mui-selected': { color: '#28a745' },
          width: '100%',
          maxWidth: '800px',
        }}
      >
        <Tab label="Pipeline" />
        <Tab label="Energy Optimization" />
        <Tab label="Battery Monitoring" />
        <Tab label="Kafka Integration" />
        <Tab label="User Preferences" />
      </Tabs>
      <Box className={styles.form}>
        {tabValue === 0 && (
          <>
            <FormControlLabel
              control={<Switch checked={settings.pipeline.ciCdEnabled} onChange={(e) => handleChange('pipeline', 'ciCdEnabled', e.target.checked)} />}
              label="Enable CI/CD Pipeline"
            />
            <FormControl fullWidth>
              <InputLabel>Retrain Frequency</InputLabel>
              <Select
                value={settings.pipeline.retrainFrequency}
                onChange={(e) => handleChange('pipeline', 'retrainFrequency', e.target.value)}
                className={styles.input}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Model Version"
              value={settings.pipeline.modelVersion}
              onChange={(e) => handleChange('pipeline', 'modelVersion', e.target.value)}
              className={styles.input}
            />
            <Button
              className={styles.retrainButton}
              onClick={triggerRetrain}
              disabled={retrainLoading || !settings.pipeline.ciCdEnabled}
              sx={{ mt: 2 }}
            >
              {retrainLoading ? <CircularProgress size={24} /> : 'Trigger Retraining'}
            </Button>
          </>
        )}
        {tabValue === 1 && (
          <>
            <Typography>Demand Threshold (kWh)</Typography>
            <Slider
              value={settings.energy.demandThreshold}
              onChange={(e, value) => handleChange('energy', 'demandThreshold', value as number)}
              min={0}
              max={1000}
              valueLabelDisplay="auto"
              sx={{ color: '#28a745', width: '100%', maxWidth: '400px' }}
            />
            <FormControl fullWidth>
              <InputLabel>Optimization Mode</InputLabel>
              <Select
                value={settings.energy.optimizationMode}
                onChange={(e) => handleChange('energy', 'optimizationMode', e.target.value)}
                className={styles.input}
              >
                <MenuItem value="balanced">Balanced</MenuItem>
                <MenuItem value="aggressive">Aggressive</MenuItem>
                <MenuItem value="conservative">Conservative</MenuItem>
              </Select>
            </FormControl>
          </>
        )}
        {tabValue === 2 && (
          <>
            <Typography>Health Threshold (%)</Typography>
            <Slider
              value={settings.battery.healthThreshold}
              onChange={(e, value) => handleChange('battery', 'healthThreshold', value as number)}
              min={0}
              max={100}
              valueLabelDisplay="auto"
              sx={{ color: '#28a745', width: '100%', maxWidth: '400px' }}
            />
            <FormControlLabel
              control={<Switch checked={settings.battery.alertOnDegradation} onChange={(e) => handleChange('battery', 'alertOnDegradation', e.target.checked)} />}
              label="Alert on Battery Degradation"
            />
          </>
        )}
        {tabValue === 3 && (
          <>
            <TextField
              label="Kafka Broker"
              value={settings.kafka.broker}
              onChange={(e) => handleChange('kafka', 'broker', e.target.value)}
              className={styles.input}
            />
            <TextField
              label="Topic"
              value={settings.kafka.topic}
              onChange={(e) => handleChange('kafka', 'topic', e.target.value)}
              className={styles.input}
            />
            <TextField
              label="Consumer Group ID"
              value={settings.kafka.groupId}
              onChange={(e) => handleChange('kafka', 'groupId', e.target.value)}
              className={styles.input}
            />
          </>
        )}
        {tabValue === 4 && (
          <>
            <FormControlLabel
              control={<Switch checked={settings.user.notificationsEnabled} onChange={(e) => handleChange('user', 'notificationsEnabled', e.target.checked)} />}
              label="Enable Notifications"
            />
            <FormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                value={settings.user.theme}
                onChange={(e) => handleChange('user', 'theme', e.target.value)}
                className={styles.input}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </FormControl>
          </>
        )}
      </Box>
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button className={styles.saveButton} onClick={saveSettings}>
          Save Settings
        </Button>
        <Button className={styles.resetButton} onClick={resetSettings}>
          Reset to Defaults
        </Button>
      </Box>
    </Box>
  );
}