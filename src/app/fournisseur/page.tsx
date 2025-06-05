'use client';

import { useState, useEffect } from 'react';
import {
  fetchLatestPrice,
  fetchSoc,
  executeManualTrade,
  fetchTransactions,
} from '../../services/energyService';
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
    loadData();
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

  // Calculate buy and sell counts
  const buyCount = transactions.filter((tx) => tx.type === 'buy').length;
  const sellCount = transactions.filter((tx) => tx.type === 'sell').length;

  return (
    // Line ~66: container div
    <div className={styles.container}>
      <h1 className={styles.title}>Fournisseur Management</h1>

      {loading && <p className={styles.loading}>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      // Line ~72: mainLayout div
      <div className={styles.mainLayout}>
        // Line ~74: leftSection div
        <div className={styles.leftSection}>
          // Line ~76: transactionList div
          <div className={styles.transactionList}>
            <h2 className={styles.sectionTitle}>Transaction History</h2>
            {transactions.length > 0 ? (
              <ul>
                {transactions.map((tx) => (
                  <li key={tx.id} className={styles.transactionItem}>
                    <span>
                      {tx.type.toUpperCase()} - {tx.quantity} kWh at €{tx.price.toFixed(2)}
                    </span>
                    {tx.profit !== undefined && tx.profit > 0 && (
                      <span className={styles.profit}>(Profit: €{tx.profit.toFixed(2)})</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noTransactions}>No transactions yet.</p>
            )}
          </div>
          // End transactionList div

          // Line ~95: chartContainer div (replaced with text display)
          <div className={styles.chartContainer}>
            <h2 className={styles.sectionTitle}>Buy vs Sell Overview</h2>
            <p>Buy Transactions: {buyCount}</p>
            <p>Sell Transactions: {sellCount}</p>
          </div>
          // End chartContainer div
        </div>
        // End leftSection div

        // Line ~105: rightSection div
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
              pumps<label htmlFor="quantity">Quantity (kWh):</label>
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
        // End rightSection div
      </div>
      // End mainLayout div
    </div>
    // End container div
  );
}