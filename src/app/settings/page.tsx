'use client';

import { useState } from 'react';

interface BatteryProfile {
  id: string;
  capacity: number; // kWh
  maxChargeRate: number; // kW
  maxDischargeRate: number; // kW
  efficiency: number; // %
}

interface Settings {
  platformName: string;
  language: string;
  dateFormat: string;
  timezone: string;
  currency: string;
  batteryProfiles: BatteryProfile[];
  chargeSchedule: { start: string; end: string; action: 'charge' | 'discharge' }[];
  optimizationGoal: string;
  alertThresholds: { minSoC: number; maxTemp: number };
  apiUrl: string;
  refreshInterval: number;
  displayedMetrics: string[];
  excludedMonths: number[];
  theme: string;
  chartColor: string;
  animationsEnabled: boolean;
  notificationsEnabled: boolean;
  marketApiUrl: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    platformName: 'Energy & Battery Management',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'UTC',
    currency: 'EUR',
    batteryProfiles: [{ id: 'BAT1', capacity: 100, maxChargeRate: 50, maxDischargeRate: 50, efficiency: 95 }],
    chargeSchedule: [{ start: '02:00', end: '06:00', action: 'charge' }],
    optimizationGoal: 'cost-minimization',
    alertThresholds: { minSoC: 20, maxTemp: 40 },
    apiUrl: 'http://localhost:5000/api/predictions',
    refreshInterval: 5,
    displayedMetrics: ['energyproduced', 'batterySoC', 'temperature', 'prediction_day'],
    excludedMonths: [5, 8],
    theme: 'energy-green',
    chartColor: '#FFC107',
    animationsEnabled: true,
    notificationsEnabled: false,
    marketApiUrl: '',
  });

  const handleSave = async () => {
    // Save to localStorage or backend
    localStorage.setItem('energySettings', JSON.stringify(settings));
    console.log('Settings saved:', settings);
  };

  const handleReset = () => {
    setSettings({
      platformName: 'Energy & Battery Management',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      timezone: 'UTC',
      currency: 'EUR',
      batteryProfiles: [{ id: 'BAT1', capacity: 100, maxChargeRate: 50, maxDischargeRate: 50, efficiency: 95 }],
      chargeSchedule: [{ start: '02:00', end: '06:00', action: 'charge' }],
      optimizationGoal: 'cost-minimization',
      alertThresholds: { minSoC: 20, maxTemp: 40 },
      apiUrl: 'http://localhost:5000/api/predictions',
      refreshInterval: 5,
      displayedMetrics: ['energyproduced', 'batterySoC', 'temperature', 'prediction_day'],
      excludedMonths: [5, 8],
      theme: 'energy-green',
      chartColor: '#FFC107',
      animationsEnabled: true,
      notificationsEnabled: false,
      marketApiUrl: '',
    });
  };

  const addBatteryProfile = () => {
    setSettings({
      ...settings,
      batteryProfiles: [
        ...settings.batteryProfiles,
        { id: `BAT${settings.batteryProfiles.length + 1}`, capacity: 100, maxChargeRate: 50, maxDischargeRate: 50, efficiency: 95 },
      ],
    });
  };

  return (
    <div
      style={{
        padding: '15px',
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'linear-gradient(180deg, #E3F2FD, #F5F5F5)',
        minHeight: '100vh',
        animation: 'fadeIn 0.7s ease-in-out',
      }}
    >
      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          color: '#2196F3',
          marginBottom: '20px',
        }}
      >
        Energy & Battery Management Settings
      </h1>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* General Settings */}
        <div
          style={{
            padding: '15px',
            background: '#FFFFFF',
            border: '1px solid #E0E0E0',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.5s ease-in-out',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#388E3C',
              marginBottom: '10px',
            }}
          >
            General Settings
          </h2>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Platform Name:
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) =>
                setSettings({ ...settings, platformName: e.target.value })
              }
              style={{
                marginLeft: '10px',
                padding: '8px',
                border: '1px solid #E0E0E0',
                borderRadius: '4px',
                fontSize: '0.9rem',
                width: '300px',
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Language:
            <select
              value={settings.language}
              onChange={(e) =>
                setSettings({ ...settings, language: e.target.value })
              }
              style={{
                marginLeft: '10px',
                padding: '8px',
                border: '1px solid #E0E0E0',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
            </select>
          </label>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Currency:
            <select
              value={settings.currency}
              onChange={(e) =>
                setSettings({ ...settings, currency: e.target.value })
              }
              style={{
                marginLeft: '10px',
                padding: '8px',
                border: '1px solid #E0E0E0',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </select>
          </label>
        </div>

        {/* Energy and Battery Management */}
        <div
          style={{
            padding: '15px',
            background: '#FFFFFF',
            border: '1px solid #E0E0E0',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.5s ease-in-out',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#388E3C',
              marginBottom: '10px',
            }}
          >
            Battery Management
          </h2>
          <div style={{ marginBottom: '10px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#333333' }}>Battery Profiles</h3>
            {settings.batteryProfiles.map((profile, index) => (
              <div key={profile.id} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                <input
                  type="text"
                  value={profile.id}
                  onChange={(e) => {
                    const newProfiles = [...settings.batteryProfiles];
                    newProfiles[index].id = e.target.value;
                    setSettings({ ...settings, batteryProfiles: newProfiles });
                  }}
                  placeholder="Battery ID"
                  style={{ padding: '8px', border: '1px solid #E0E0E0', borderRadius: '4px', fontSize: '0.9rem' }}
                />
                <input
                  type="number"
                  value={profile.capacity}
                  onChange={(e) => {
                    const newProfiles = [...settings.batteryProfiles];
                    newProfiles[index].capacity = Number(e.target.value);
                    setSettings({ ...settings, batteryProfiles: newProfiles });
                  }}
                  placeholder="Capacity (kWh)"
                  style={{ padding: '8px', border: '1px solid #E0E0E0', borderRadius: '4px', fontSize: '0.9rem' }}
                />
              </div>
            ))}
            <button
              onClick={addBatteryProfile}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(45deg, #388E3C, #4CAF50)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Add Battery
            </button>
          </div>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Optimization Goal:
            <select
              value={settings.optimizationGoal}
              onChange={(e) =>
                setSettings({ ...settings, optimizationGoal: e.target.value })
              }
              style={{
                marginLeft: '10px',
                padding: '8px',
                border: '1px solid #E0E0E0',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            >
              <option value="cost-minimization">Cost Minimization</option>
              <option value="battery-longevity">Battery Longevity</option>
              <option value="grid-stability">Grid Stability</option>
            </select>
          </label>
        </div>

        {/* Data Settings */}
        <div
          style={{
            padding: '15px',
            background: '#FFFFFF',
            border: '1px solid #E0E0E0',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.5s ease-in-out',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#388E3C',
              marginBottom: '10px',
            }}
          >
            Data Settings
          </h2>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            API Endpoint:
            <input
              type="text"
              value={settings.apiUrl}
              onChange={(e) =>
                setSettings({ ...settings, apiUrl: e.target.value })
              }
              style={{
                marginLeft: '10px',
                padding: '8px',
                border: '1px solid #E0E0E0',
                borderRadius: '4px',
                fontSize: '0.9rem',
                width: '300px',
              }}
            />
            <button
              onClick={() => console.log('Test API:', settings.apiUrl)}
              style={{
                marginLeft: '10px',
                padding: '8px 16px',
                background: 'linear-gradient(45deg, #388E3C, #4CAF50)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Test Connection
            </button>
          </label>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Refresh Interval (minutes):
            <input
              type="number"
              value={settings.refreshInterval}
              onChange={(e) =>
                setSettings({ ...settings, refreshInterval: Number(e.target.value) })
              }
              min="1"
              style={{
                marginLeft: '10px',
                padding: '8px',
                border: '1px solid #E0E0E0',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            />
          </label>
        </div>

        {/* Save and Reset Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(45deg, #388E3C, #4CAF50)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            }}
          >
            Save Settings
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(45deg, #D32F2F, #EF5350)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            }}
          >
            Reset to Defaults
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}