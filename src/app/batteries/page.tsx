'use client';

import { useState, useEffect } from 'react';
import { Battery } from '@/types';
import { useBatteryContext } from '@/context/BatteryContext';
import { addBattery, updateBatteryInMock, deleteBatteryFromMock } from '@/lib/batteryMonitoring';
import styles from './page.module.css';

export default function Batteries() {
  const { batteries: monitoredBatteries, setBatteries } = useBatteryContext();
  const [newBattery, setNewBattery] = useState({
    name: '',
    capacity: 0,
    stateOfCharge: 100,
    chemistry: 'Li-ion',
    cycleCount: 0,
    temperature: 25,
    manufacturedDate: '',
  });
  const [editingBattery, setEditingBattery] = useState<Battery | null>(null);
  const [loading, setLoading] = useState<string | null>(null); // Track loading state for buttons

  const fetchBatteries = () => {
    // For now, we're using the monitoredBatteries from BatteryContext
    // In a real app, you’d fetch from the backend and sync with the monitoring service
  };

  const handleCreate = async () => {
    if (
      !newBattery.name.trim() ||
      newBattery.name.trim().length < 3 ||
      newBattery.capacity <= 10 ||
      newBattery.stateOfCharge < 0 ||
      newBattery.stateOfCharge > 100 ||
      !newBattery.chemistry.trim() ||
      newBattery.cycleCount < 0
    ) {
      alert(
        'Veuillez remplir tous les champs obligatoires avec des valeurs valides:\n- Le nom doit contenir au moins 3 caractères.\n- La capacité doit être supérieure à 10.\n- L\'état de charge doit être entre 0 et 100.\n- La chimie ne peut pas être vide.\n- Le nombre de cycles ne peut pas être négatif.'
      );
      return;
    }

    const batteryData = {
      name: newBattery.name.trim(),
      capacity: Number(newBattery.capacity),
      voltage: 3.7,
      stateOfCharge: Number(newBattery.stateOfCharge),
      chemistry: newBattery.chemistry.trim(),
      cycleCount: Number(newBattery.cycleCount),
      temperature: newBattery.temperature ? Number(newBattery.temperature) : 25,
      manufacturedDate: newBattery.manufacturedDate || null,
      lastMaintenance: null,
    };

    try {
      setLoading('create');
      await addBattery(batteryData);
      setNewBattery({
        name: '',
        capacity: 0,
        stateOfCharge: 100,
        chemistry: 'Li-ion',
        cycleCount: 0,
        temperature: 25,
        manufacturedDate: '',
      });
    } catch (error) {
      console.error('Erreur lors de la création de la batterie:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Battery>) => {
    try {
      setLoading(`update-${id}`);
      await updateBatteryInMock(id, updates);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la batterie:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleEdit = (battery: Battery) => {
    setEditingBattery(battery);
  };

  const handleSaveEdit = async () => {
    if (!editingBattery) return;

    if (
      !editingBattery.name.trim() ||
      editingBattery.name.trim().length < 3 ||
      editingBattery.capacity <= 10 ||
      editingBattery.stateOfCharge < 0 ||
      editingBattery.stateOfCharge > 100 ||
      !editingBattery.chemistry.trim() ||
      editingBattery.cycleCount < 0
    ) {
      alert(
        'Veuillez remplir tous les champs obligatoires avec des valeurs valides:\n- Le nom doit contenir au moins 3 caractères.\n- La capacité doit être supérieure à 10.\n- L\'état de charge doit être entre 0 et 100.\n- La chimie ne peut pas être vide.\n- Le nombre de cycles ne peut pas être négatif.'
      );
      return;
    }

    try {
      setLoading(`save-${editingBattery.id}`);
      const updates: Partial<Battery> = {
        name: editingBattery.name.trim(),
        capacity: Number(editingBattery.capacity),
        stateOfCharge: Number(editingBattery.stateOfCharge),
        chemistry: editingBattery.chemistry.trim(),
        cycleCount: Number(editingBattery.cycleCount),
        temperature: editingBattery.temperature ? Number(editingBattery.temperature) : 25,
        manufacturedDate: editingBattery.manufacturedDate || null,
      };
      await handleUpdate(editingBattery.id, updates);
      setEditingBattery(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la batterie:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingBattery(null);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(`delete-${id}`);
      await deleteBatteryFromMock(id);
    } catch (error) {
      console.error('Erreur lors de la suppression de la batterie:', error);
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    fetchBatteries();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestion des Batteries BESS Lithium</h1>

      {/* Formulaire de création */}
      <div className={styles.formContainer}>
        <h2 className={styles.formTitle}>Formulaire de création</h2>
        <div className={styles.formGrid}>
          <div>
            <label className={styles.label}>Nom *</label>
            <input
              type="text"
              placeholder="Nom"
              value={newBattery.name}
              onChange={(e) => setNewBattery({ ...newBattery, name: e.target.value })}
              className={styles.input}
            />
          </div>
          <div>
            <label className={styles.label}>Capacité (kWh) *</label>
            <input
              type="number"
              placeholder="Capacité (kWh)"
              value={newBattery.capacity}
              onChange={(e) => setNewBattery({ ...newBattery, capacity: Number(e.target.value) })}
              className={styles.input}
            />
          </div>
          <div>
            <label className={styles.label}>État de charge (%) *</label>
            <input
              type="number"
              placeholder="État de charge (%)"
              value={newBattery.stateOfCharge}
              onChange={(e) => setNewBattery({ ...newBattery, stateOfCharge: Number(e.target.value) })}
              className={styles.input}
            />
          </div>
          <div>
            <label className={styles.label}>Chimie (ex: Li-ion) *</label>
            <input
              type="text"
              placeholder="Chimie (ex: Li-ion)"
              value={newBattery.chemistry}
              onChange={(e) => setNewBattery({ ...newBattery, chemistry: e.target.value })}
              className={styles.input}
            />
          </div>
          <div>
            <label className={styles.label}>Nombre de cycles *</label>
            <input
              type="number"
              placeholder="Nombre de cycles"
              value={newBattery.cycleCount}
              onChange={(e) => setNewBattery({ ...newBattery, cycleCount: Number(e.target.value) })}
              className={styles.input}
            />
          </div>
          <div>
            <label className={styles.label}>Température (°C)</label>
            <input
              type="number"
              placeholder="Température (°C)"
              value={newBattery.temperature || ''}
              onChange={(e) => setNewBattery({ ...newBattery, temperature: Number(e.target.value) })}
              className={styles.input}
            />
          </div>
          <div>
            <label className={styles.label}>Date de fabrication</label>
            <input
              type="date"
              placeholder="Date de fabrication"
              value={newBattery.manufacturedDate}
              onChange={(e) => setNewBattery({ ...newBattery, manufacturedDate: e.target.value })}
              className={styles.input}
            />
          </div>
          <div className={styles.buttonWrapper}>
            <button
              onClick={handleCreate}
              className={`${styles.addButton} ${loading === 'create' ? styles.loading : ''}`}
              disabled={loading === 'create'}
            >
              Ajouter Batterie
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire de modification */}
      {editingBattery && (
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Formulaire de modification</h2>
          <div className={styles.formGrid}>
            <div>
              <label className={styles.label}>Nom *</label>
              <input
                type="text"
                placeholder="Nom"
                value={editingBattery.name}
                onChange={(e) => setEditingBattery({ ...editingBattery, name: e.target.value })}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>Capacité (kWh) *</label>
              <input
                type="number"
                placeholder="Capacité (kWh)"
                value={editingBattery.capacity}
                onChange={(e) => setEditingBattery({ ...editingBattery, capacity: Number(e.target.value) })}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>État de charge (%) *</label>
              <input
                type="number"
                placeholder="État de charge (%)"
                value={editingBattery.stateOfCharge}
                onChange={(e) => setEditingBattery({ ...editingBattery, stateOfCharge: Number(e.target.value) })}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>Chimie (ex: Li-ion) *</label>
              <input
                type="text"
                placeholder="Chimie (ex: Li-ion)"
                value={editingBattery.chemistry}
                onChange={(e) => setEditingBattery({ ...editingBattery, chemistry: e.target.value })}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>Nombre de cycles *</label>
              <input
                type="number"
                placeholder="Nombre de cycles"
                value={editingBattery.cycleCount}
                onChange={(e) => setEditingBattery({ ...editingBattery, cycleCount: Number(e.target.value) })}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>Température (°C)</label>
              <input
                type="number"
                placeholder="Température (°C)"
                value={editingBattery.temperature || ''}
                onChange={(e) => setEditingBattery({ ...editingBattery, temperature: Number(e.target.value) })}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>Date de fabrication</label>
              <input
                type="date"
                placeholder="Date de fabrication"
                value={editingBattery.manufacturedDate || ''}
                onChange={(e) => setEditingBattery({ ...editingBattery, manufacturedDate: e.target.value })}
                className={styles.input}
              />
            </div>
            <div className={styles.buttonWrapper}>
              <div className={styles.buttonGroup}>
                <button
                  onClick={handleSaveEdit}
                  className={`${styles.saveButton} ${loading === `save-${editingBattery.id}` ? styles.loading : ''}`}
                  disabled={loading === `save-${editingBattery.id}`}
                >
                  Enregistrer
                </button>
                <button
                  onClick={handleCancelEdit}
                  className={styles.cancelButton}
                  disabled={loading !== null}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des batteries */}
      <div className={styles.batteryGrid}>
        {monitoredBatteries.map((battery) => (
          <div
            key={battery.id}
            className={`${styles.batteryCard} ${battery.status === 'Failed' ? styles.failed : ''}`}
          >
            <h2 className={styles.batteryTitle}>{battery.name}</h2>
            <p className={styles.batteryInfo}>ID: {battery.id}</p>
            <p className={styles.batteryInfo}>Capacité: {battery.capacity} kWh</p>
            <p className={styles.batteryInfo}>Voltage: {battery.voltage} V</p>
            <p className={styles.batteryInfo}>Température: {battery.temperature}°C</p>
            <p className={styles.batteryInfo}>État de charge: {battery.stateOfCharge}%</p>
            <p className={styles.batteryInfo}>Chimie: {battery.chemistry}</p>
            <p className={styles.batteryInfo}>Nombre de cycles: {battery.cycleCount}</p>
            <p className={styles.batteryInfo}>Status: {battery.status}</p>
            {battery.manufacturedDate && (
              <p className={styles.batteryInfo}>
                Date de fabrication: {new Date(battery.manufacturedDate).toLocaleDateString()}
              </p>
            )}
            {battery.lastMaintenance && (
              <p className={styles.batteryInfo}>
                Dernière maintenance: {new Date(battery.lastMaintenance).toLocaleDateString()}
              </p>
            )}
            <p className={styles.batteryInfo}>
              Dernière vérification: {new Date(battery.lastChecked).toLocaleString()}
            </p>
            <div className={styles.buttonGroup}>
              <button
                onClick={() =>
                  handleUpdate(battery.id, { stateOfCharge: battery.stateOfCharge + 10 })
                }
                className={`${styles.chargeButton} ${loading === `update-${battery.id}` ? styles.loading : ''}`}
                disabled={loading === `update-${battery.id}`}
              >
                Augmenter charge (+10%)
              </button>
              <button
                onClick={() => handleEdit(battery)}
                className={styles.editButton}
                disabled={loading !== null}
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(battery.id)}
                className={`${styles.deleteButton} ${loading === `delete-${battery.id}` ? styles.loading : ''}`}
                disabled={loading === `delete-${battery.id}`}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}