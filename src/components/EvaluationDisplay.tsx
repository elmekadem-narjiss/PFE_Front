'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  CircularProgress,
  TableSortLabel,
  Slider,
  Alert,
  TextField,
  Tooltip,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { fetchEvaluation, EvaluationResponse, EvaluationResult } from '../services/google_api';
import styles from './page.module.css';

// Import GridProps from @mui/material
import { GridProps as MuiGridProps } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  Title,
  ChartTooltip,
  Legend,
  zoomPlugin
);

// Correctly typed GridItem component
interface CustomGridProps extends MuiGridProps {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

const GridItem: React.FC<CustomGridProps> = (props) => <Grid component="div" {...props} />;

const EvaluationDisplay: React.FC = () => {
  const [data, setData] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [filterAction, setFilterAction] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof EvaluationResult>('Step');
  const [socRange, setSocRange] = useState<[number, number]>([0, 100]);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [inputData, setInputData] = useState<{ soc: string; production: string }>({ soc: '', production: '' });

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: darkMode ? '#20dad0' : '#703250' },
      background: { default: darkMode ? '#121212' : '#f8efe3' },
    },
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchEvaluation();
      setData(response);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec du chargement des données');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePageChange = (_event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property: keyof EvaluationResult): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSocRangeChange = (event: Event, newValue: number | number[]) => {
    setSocRange(newValue as [number, number]);
  };

  const handleExportCSV = () => {
    if (!data) return;
    const csvContent = [
      ['Step', 'Action', 'SOC (%)', 'Future Production (%)', 'Reward'],
      ...filteredAndSortedResults.map((row) => [
        row.Step,
        row.Action,
        row['SOC (%)'].toFixed(1),
        row['Future Production (%)'].toFixed(1),
        row.Reward.toFixed(2),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'battery_evaluation_results.csv';
    link.click();
  };

  const handleExportJSON = () => {
    if (!data) return;
    const jsonContent = JSON.stringify(data.results, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'battery_evaluation_results.json';
    link.click();
  };

  const handlePredict = async () => {
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soc: parseFloat(inputData.soc),
          production: parseFloat(inputData.production),
        }),
      });
      const result = await response.json();
      setError(null);
      alert(`Prédiction: ${result.action} avec une récompense de ${result.reward}`);
    } catch (err) {
      setError('Erreur lors de la prédiction. Vérifiez les données saisies.');
    }
  };

  const filteredAndSortedResults = useMemo(() => {
    if (!data) return [];
    let results = [...data.results];
    if (filterAction) {
      results = results.filter((row) =>
        row.Action.toLowerCase().includes(filterAction.toLowerCase())
      );
    }
    results = results.filter(
      (row) => row['SOC (%)'] >= socRange[0] && row['SOC (%)'] <= socRange[1]
    );
    return results.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, filterAction, socRange, order, orderBy]);

  const alerts = useMemo(() => {
    if (!data) return [];
    const lowSoc = data.results.filter((row) => row['SOC (%)'] < 20);
    return lowSoc.map((row) => ({
      message: `SOC critique détecté à l'étape ${row.Step}: ${row['SOC (%)'].toFixed(1)}%`,
      severity: 'warning',
    }));
  }, [data]);

  const paginatedResults = filteredAndSortedResults.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const insights = useMemo(() => {
    if (!data) return [];
    const highRewardStep = data.results.reduce(
      (prev: EvaluationResult, curr: EvaluationResult) =>
        curr.Reward > prev.Reward ? curr : prev
    );
    return [
      {
        text: `Meilleure décision: ${highRewardStep.Action} à l'étape ${highRewardStep.Step} avec une récompense de ${highRewardStep.Reward.toFixed(2)}.`,
        className: 'black-text',
      },
      {
        text: `SOC final: ${data.metrics.soc_final.toFixed(1)}%, optimisé pour une performance durable.`,
        className: 'black-text',
      },
    ];
  }, [data]);

  const lineChartData = {
    labels: data?.results.map((r: EvaluationResult) => r.Step) || [],
    datasets: [
      {
        label: 'SOC (%)',
        data: data?.results.map((r: EvaluationResult) => r['SOC (%)']) || [],
        borderColor: '#20dad0',
        backgroundColor: 'rgba(32, 218, 208, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Future Production (%)',
        data: data?.results.map((r: EvaluationResult) => r['Future Production (%)']) || [],
        borderColor: '#f8efe3',
        backgroundColor: 'rgba(248, 239, 227, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'État de Charge et Production Future' },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`,
        },
      },
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'xy',
        },
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Pourcentage (%)' } },
      x: { title: { display: true, text: 'Étape' } },
    },
  };

  const barChartData = {
    labels: data?.results.map((r: EvaluationResult) => r.Step) || [],
    datasets: [
      {
        label: 'Actions',
        data: data?.results.map((r: EvaluationResult) =>
          r.Action === 'Charger' ? 1 : r.Action === 'Décharger' ? 2 : 0
        ) || [],
        backgroundColor: '#703250',
        borderColor: '#220e26',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Actions du Modèle' },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
            const value = context.parsed.y;
            if (value === 0) return 'Aucune';
            if (value === 1) return 'Charger';
            if (value === 2) return 'Décharger';
            return '';
          },
        },
      },
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'xy',
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        title: { display: true, text: 'Action' },
        ticks: {
          callback: (value: string | number) => {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (numValue === 0) return 'Aucune';
            if (numValue === 1) return 'Charger';
            if (numValue === 2) return 'Décharger';
            return '';
          },
        },
      },
      x: { title: { display: true, text: 'Étape' } },
    },
  };

  const metrics = data
    ? [
        {
          label: 'Récompense totale',
          value: data.metrics.total_reward.toFixed(2),
          color: '#20dad0',
          tooltip: 'Somme des récompenses obtenues pour chaque décision.',
        },
        {
          label: 'Nombre de cycles',
          value: data.metrics.cycle_count.toFixed(1),
          color: '#20b4d8',
          tooltip: 'Nombre total de cycles de charge/décharge effectués.',
        },
        {
          label: 'Précision',
          value: `${data.metrics.accuracy.toFixed(1)}%`,
          color: '#f8efe3',
          tooltip: 'Pourcentage de décisions correctes du modèle.',
        },
        {
          label: 'SOC final',
          value: `${data.metrics.soc_final.toFixed(1)}%`,
          color: '#703250',
          tooltip: 'État de charge final de la batterie.',
        },
      ]
    : [];

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}
        className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}
      >
        <Box sx={{ position: 'relative', minHeight: '100%' }}>
          <Box
            sx={{
              display: loading ? 'flex' : 'none',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              background: 'rgba(248, 239, 227, 0.8)',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />
              <Typography variant="body1" sx={{ color: '#220e26' }}>
                Chargement des résultats du modèle...
              </Typography>
            </Box>
          </Box>
          <Box sx={{ opacity: loading ? 0 : 1, transition: 'opacity 0.3s ease' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography variant="h4" gutterBottom className={styles.title}>
                  Tableau de bord d'évaluation
                </Typography>
                <Typography variant="body1" className={styles.subtitle}>
                  Optimisation intelligente de la charge et décharge des batteries
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => setDarkMode(!darkMode)}
                className={styles.buyButton}
              >
                Mode {darkMode ? 'clair' : 'sombre'}
              </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, gap: 2 }}>
              <Button
                variant="contained"
                onClick={fetchData}
                disabled={loading}
                className={styles.buyButton}
                aria-label="Rafraîchir les données"
              >
                Rafraîchir
              </Button>
              <Button
                variant="outlined"
                onClick={handleExportCSV}
                disabled={loading || !data}
                className={styles.exportButton}
                aria-label="Exporter les résultats en CSV"
              >
                Exporter en CSV
              </Button>
              <Button
                variant="outlined"
                onClick={handleExportJSON}
                disabled={loading || !data}
                className={styles.exportButton}
                aria-label="Exporter les résultats en JSON"
              >
                Exporter en JSON
              </Button>
            </Box>

            {error && (
              <Box sx={{ textAlign: 'center', my: 4, p: 2, backgroundColor: 'rgba(112, 50, 80, 0.1)' }}>
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => fetchData()}
                  className={styles.buyButton}
                  aria-label="Réessayer le chargement des données"
                >
                  Réessayer
                </Button>
              </Box>
            )}

            {alerts.map((alert, index) => (
              <Alert key={index} severity={alert.severity as any} sx={{ mb: 2 }}>
                {alert.message}
              </Alert>
            ))}

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Prédiction en temps réel
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="SOC actuel (%)"
                  value={inputData.soc}
                  onChange={(e) => setInputData({ ...inputData, soc: e.target.value })}
                  type="number"
                  sx={{ minWidth: 200 }}
                />
                <TextField
                  label="Production prévue (%)"
                  value={inputData.production}
                  onChange={(e) => setInputData({ ...inputData, production: e.target.value })}
                  type="number"
                  sx={{ minWidth: 200 }}
                />
                <Button
                  variant="contained"
                  onClick={handlePredict}
                  disabled={!inputData.soc || !inputData.production}
                  className={styles.buyButton}
                >
                  Prédire
                </Button>
              </Box>
            </Box>

            <Card className={styles.insightsCard}>
              <CardContent>
                <Typography variant="h6" className={styles.sectionTitle}>
                  Insights du Modèle
                </Typography>
                <ul>
                  {insights.map((insight, index) => (
                    <li key={index} className={insight.className}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {insight.text}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Grid container spacing={2} sx={{ mb: 4 }} className={styles.summaryCards}>
              {metrics.map((metric, index) => (
                <GridItem key={index} xs={12} sm={6} md={3}>
                  <Card sx={{ backgroundColor: metric.color }} className={styles.card}>
                    <CardContent>
                      <Tooltip title={metric.tooltip}>
                        <Typography variant="h6" sx={{ color: '#220e26' }}>
                          {metric.label}
                        </Typography>
                      </Tooltip>
                      <Typography variant="h5" sx={{ color: '#220e26', fontWeight: 'bold' }}>
                        {metric.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </GridItem>
              ))}
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4, maxWidth: '100%', flexWrap: 'nowrap' }}>
              <GridItem xs={6} sm={6} md={6} lg={6}>
                <Card className={styles.chartCard} sx={{ height: '100%' }}>
                  <CardContent sx={{ height: '700px', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" className={styles.sectionTitle} sx={{ mb: 2 }}>
                      SOC et Production Future
                    </Typography>
                    <Box sx={{ flexGrow: 1, position: 'relative' }}>
                      <Line
                        data={lineChartData}
                        options={lineChartOptions}
                        aria-label="Graphique linéaire montrant l'état de charge et la production future"
                        height={600}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </GridItem>
              <GridItem xs={6} sm={6} md={6} lg={6}>
                <Card className={styles.chartCard} sx={{ height: '100%' }}>
                  <CardContent sx={{ height: '700px', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" className={styles.sectionTitle} sx={{ mb: 2 }}>
                      Actions du Modèle
                    </Typography>
                    <Box sx={{ flexGrow: 1, position: 'relative' }}>
                      <Bar
                        data={barChartData}
                        options={barChartOptions}
                        aria-label="Graphique à barres montrant les actions de charge et décharge"
                        height={600}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </GridItem>
            </Grid>

            <Card className={styles.chartCard}>
              <CardContent>
                <Typography variant="h6" className={styles.sectionTitle}>
                  Résultats Détaillés
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <FormControl sx={{ minWidth: 200 }} className={styles.actionSelect}>
                    <InputLabel id="action-filter-label">Filtrer par action</InputLabel>
                    <Select
                      labelId="action-filter-label"
                      value={filterAction}
                      label="Filtrer par action"
                      onChange={(e) => setFilterAction(e.target.value)}
                      aria-label="Filtrer les résultats par action"
                    >
                      <MenuItem value="">Toutes</MenuItem>
                      <MenuItem value="Charger">Charger</MenuItem>
                      <MenuItem value="Décharger">Décharger</MenuItem>
                      <MenuItem value="Aucune">Aucune</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 300 }}>
                    <Typography id="soc-range-slider" gutterBottom>
                      Plage SOC (%)
                    </Typography>
                    <Slider
                      value={socRange}
                      onChange={handleSocRangeChange}
                      valueLabelDisplay="auto"
                      min={0}
                      max={100}
                      aria-labelledby="soc-range-slider"
                    />
                  </FormControl>
                </Box>
                <Table aria-label="Tableau des résultats d'évaluation">
                  <TableHead>
                    <TableRow>
                      {['Step', 'Action', 'SOC (%)', 'Future Production (%)', 'Reward'].map((head) => (
                        <TableCell key={head}>
                          <TableSortLabel
                            active={orderBy === head}
                            direction={orderBy === head ? order : 'asc'}
                            onClick={() => handleRequestSort(head as keyof EvaluationResult)}
                          >
                            {head}
                          </TableSortLabel>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedResults.map((row) => (
                      <TableRow key={row.Step}>
                        <TableCell>{row.Step}</TableCell>
                        <TableCell>{row.Action}</TableCell>
                        <TableCell>{row['SOC (%)'].toFixed(1)}</TableCell>
                        <TableCell>{row['Future Production (%)'].toFixed(1)}</TableCell>
                        <TableCell>{row.Reward.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredAndSortedResults.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  labelRowsPerPage="Lignes par page"
                  labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EvaluationDisplay;