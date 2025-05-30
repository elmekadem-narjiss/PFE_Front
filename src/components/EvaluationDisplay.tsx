'use client';

import React, { useState, useEffect } from 'react';
import { fetchEvaluation, EvaluationResponse } from '../services/google_api';
import styles from './EvaluationDisplay.module.css';

const EvaluationDisplay: React.FC = () => {
  const [data, setData] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchEvaluation();
        setData(response);
        setLoading(false);
      } catch (err) {
        setError('Failed to load evaluation data');
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div className={styles.container}>
      <h2>Battery Evaluation Results</h2>

      {/* Metrics */}
      <div className={styles.metrics}>
        <h3>Metrics</h3>
        <ul>
          <li>Total Reward: {data.metrics.total_reward.toFixed(2)}</li>
          <li>Cycle Count: {data.metrics.cycle_count.toFixed(1)}</li>
          <li>Accuracy: {data.metrics.accuracy.toFixed(1)}%</li>
          <li>Final SOC: {data.metrics.soc_final.toFixed(1)}%</li>
        </ul>
      </div>

      {/* Results Table */}
      <div className={styles.results}>
        <h3>Results</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Step</th>
              <th>Action</th>
              <th>SOC (%)</th>
              <th>Future Production (%)</th>
              <th>Reward</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map((result) => (
              <tr key={result.Step}>
                <td>{result.Step}</td>
                <td>{result.Action}</td>
                <td>{result['SOC (%)'].toFixed(1)}</td>
                <td>{result['Future Production (%)'].toFixed(1)}</td>
                <td>{result.Reward.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Graph */}
      <div className={styles.graph}>
        <h3>Evaluation Graphs</h3>
        <img
          src={`data:image/png;base64,${data.graph_data}`}
          alt="Evaluation Graphs"
          className={styles.graphImage}
        />
      </div>
    </div>
  );
};

export default EvaluationDisplay;