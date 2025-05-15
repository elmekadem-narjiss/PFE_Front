import { Chart } from 'chart.js';

declare module 'chart.js' {
  interface PluginOptionsByType<TType extends ChartType> {
    datalabels?: {
      color?: string;
      formatter?: (
        value: number,
        ctx: { chart: Chart; dataIndex: number }
      ) => string;
    };
  }
}