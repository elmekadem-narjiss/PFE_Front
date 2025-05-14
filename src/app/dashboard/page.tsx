'use client';

import { useState, useEffect } from 'react';
import PredictionsTable from '../../components/PredictionsTable';
import { Prediction } from '../../types/prediction';

export default function Dashboard() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/predictions');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }
        const data = await response.json();
        setPredictions(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading) return <p>Chargement des données...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Predictions Dashboard</h1>
      {predictions.length === 0 ? (
        <p>Aucune donnée disponible pour le moment.</p>
      ) : (
        <PredictionsTable data={predictions} />
      )}
    </div>
  );
}