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
  TextField,
  Typography,
  CircularProgress,
  TableSortLabel,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { fetchEvaluation, EvaluationResponse, EvaluationResult } from '../services/google_api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const EvaluationDisplay: React.FC = () => {
  const [data, setData] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterAction, setFilterAction] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof EvaluationResult>('Step');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchEvaluation();
      setData(response);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property: keyof EvaluationResult) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredAndSortedResults = useMemo(() => {
    if (!data) return [];
    let results = [...data.results];
    if (filterAction) {
      results = results.filter((row) =>
        row.Action.toLowerCase().includes(filterAction.toLowerCase())
      );
    }
    return results.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, filterAction, order, orderBy]);

  const paginatedResults = filteredAndSortedResults.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
  if (error) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={fetchData} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }
  if (!data) return null;

  const chartData = {
    labels: data.results.map((r: EvaluationResult) => r.Step),
    datasets: [
      {
        label: 'SOC (%)',
        data: data.results.map((r: EvaluationResult) => r['SOC (%)']),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.2)',
        fill: true,
      },
      {
        label: 'Future Production (%)',
        data: data.results.map((r: EvaluationResult) => r['Future Production (%)']),
        borderColor: '#388e3c',
        backgroundColor: 'rgba(56, 142, 60, 0.2)',
        fill: true,
      },
      {
        label: 'Actions',
        data: data.results.map((r: EvaluationResult) =>
          r.Action === 'Charger' ? 1 : r.Action === 'Décharger' ? 2 : 0
        ),
        borderColor: '#d32f2f',
        backgroundColor: 'rgba(211, 47, 47, 0.2)',
        fill: false,
        stepped: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Evaluation Data Over Time' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Battery Evaluation Dashboard
      </Typography>
      <Button
        variant="contained"
        onClick={fetchData}
        disabled={loading}
        sx={{ mb: 3 }}
      >
        Refresh Data
      </Button>

      {/* Metrics Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Total Reward', value: data.metrics.total_reward.toFixed(2) },
          { label: 'Cycle Count', value: data.metrics.cycle_count.toFixed(1) },
          { label: 'Accuracy', value: `${data.metrics.accuracy.toFixed(1)}%` },
          { label: 'Final SOC', value: `${data.metrics.soc_final.toFixed(1)}%` },
        ].map((metric) => (
          <Grid item={true} xs={12} sm={6} md={3} key={metric.label} {...({} as any)}>
            <Card>
              <CardContent>
                <Typography variant="h6">{metric.label}</Typography>
                <Typography variant="h5">{metric.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Data Visualization
          </Typography>
          <Line data={chartData} options={chartOptions} />
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Results
          </Typography>
          <TextField
            label="Filter by Action"
            variant="outlined"
            value={filterAction}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterAction(e.target.value)}
            sx={{ mb: 2, width: 200 }}
          />
          <Table>
            <TableHead>
              <TableRow>
                {['Step', 'Action', 'SOC (%)', 'Future Production (%)', 'Reward'].map((head) => (
                  <TableCell key={head}>
                    <TableSortLabel
                      active={orderBy === (head as keyof EvaluationResult)}
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
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default EvaluationDisplay;