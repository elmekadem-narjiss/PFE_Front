'use client';

import { useState, useEffect, useRef } from 'react'; // Added useRef
import {
  fetchLatestPrice,
  fetchSoc,
  executeManualTrade,
  fetchTransactions,
} from '../../services/energyService';
import Chart from 'chart.js/auto'; // Added Chart.js import
import styles from './page.module.css';

interface Transaction {
  id: number;
  type: string;
  quantity: number;
  price: number;
  profit?: number;
}

export default function FournisseurPage() {
  const [price, setPrice] = useState<number | null>(null);
  const [soc, setSoc] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [quantity, setQuantity] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Refs for chart instances
  const buySellChartRef = useRef<Chart | null>(null);
  const trendsChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const latestPrice = await fetchLatestPrice();
        const socValue = await fetchSoc();
        const transactionData = await fetchTransactions();
        setPrice(latestPrice);
        setSoc(socValue);
        setTransactions(transactionData);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData(); // Moved inside useEffect
  }, []);

  const handleManualTrade = async (type: 'buy' | 'sell') => {
    try {
      setError(null);
      setLoading(true);
      await executeManualTrade(type, quantity);
      const updatedTransactions = await fetchTransactions();
      setTransactions(updatedTransactions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalTransactions = transactions.length;
  const buyCount = transactions.filter((tx) => tx.type === 'buy').length;
  const sellCount = transactions.filter((tx) => tx.type === 'sell').length;

  // Chart setup
  useEffect(() => {
    const ctxBuySell = document.getElementById('buySellChart') as HTMLCanvasElement;
    const ctxTrends = document.getElementById('trendsChart') as HTMLCanvasElement;

    // Destroy existing charts to prevent memory leaks
    if (buySellChartRef.current) {
      buySellChartRef.current.destroy();
    }
    if (trendsChartRef.current) {
      trendsChartRef.current.destroy();
    }

    if (ctxBuySell && ctxTrends) {
      // Buy vs Sell Distribution (Pie Chart)
      buySellChartRef.current = new Chart(ctxBuySell, {
        type: 'pie',
        data: {
          labels: ['Buy', 'Sell'],
          datasets: [{
            data: [buyCount, sellCount],
            backgroundColor: ['#34d399', '#ef4444'],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });

      // Transaction Trends (Line Chart) - Using transaction IDs as a proxy for time
      const transactionIds = transactions.map(tx => `Transaction ${tx.id}`);
      const counts = transactions.reduce((acc, tx) => {
        acc[`Transaction ${tx.id}`] = (acc[`Transaction ${tx.id}`] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      trendsChartRef.current = new Chart(ctxTrends, {
        type: 'line',
        data: {
          labels: transactionIds,
          datasets: [{
            label: 'Transactions',
            data: Object.values(counts),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            fill: true,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    // Cleanup on unmount
    return () => {
      if (buySellChartRef.current) buySellChartRef.current.destroy();
      if (trendsChartRef.current) trendsChartRef.current.destroy();
    };
  }, [transactions, buyCount, sellCount]); // Dependencies updated to match definition order

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Fournisseur Management</h1>
      {loading && <p className={styles.loading}>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <h3>Total Transactions</h3>
          <p className={styles.cardValue}>{totalTransactions}</p>
        </div>
        <div className={styles.card}>
          <h3>Buy Transactions</h3>
          <p className={styles.cardValue}>{buyCount}</p>
        </div>
        <div className={styles.card}>
          <h3>Sell Transactions</h3>
          <p className={styles.cardValue}>{sellCount}</p>
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.leftSection}>
          <div className={styles.chartCard}>
            <h2 className={styles.sectionTitle}>Buy vs Sell Distribution</h2>
            <canvas id="buySellChart" style={{ height: '200px' }}></canvas>
          </div>
          <div className={styles.chartCard}>
            <h2 className={styles.sectionTitle}>Transaction Trends</h2>
            <canvas id="trendsChart" style={{ height: '200px' }}></canvas>
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.infoCard}>
            <h2 className={styles.sectionTitle}>Current Market Price</h2>
            <p className={styles.infoText}>
              {price !== null ? `€${price.toFixed(2)}/kWh` : 'N/A'}
            </p>
          </div>
          <div className={styles.infoCard}>
            <h2 className={styles.sectionTitle}>State of Charge (SOC)</h2>
            <p className={styles.infoText}>{soc !== null ? `${soc}%` : 'N/A'}</p>
          </div>
          <div className={styles.tradeControls}>
            <h2 className={styles.sectionTitle}>Manual Trade</h2>
            <div className={styles.inputGroup}>
              <label htmlFor="quantity">Quantity (kWh):</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                className={styles.quantityInput}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button
                onClick={() => handleManualTrade('buy')}
                className={styles.buyButton}
                disabled={loading}
              >
                Buy
              </button>
              <button
                onClick={() => handleManualTrade('sell')}
                className={styles.sellButton}
                disabled={loading}
              >
                Sell
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}