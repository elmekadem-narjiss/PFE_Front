import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { Prediction } from '../types/prediction';

interface PredictionsTableProps {
  data: Prediction[];
}

const PredictionsTable: React.FC<PredictionsTableProps> = ({ data }) => {
  const columns: ColumnDef<Prediction>[] = React.useMemo(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Energy Produced', accessorKey: 'energyproduced' },
      { header: 'Temperature', accessorKey: 'temperature' },
      { header: 'Humidity', accessorKey: 'humidity' },
      { header: 'Month', accessorKey: 'month' },
      { header: 'Week of Year', accessorKey: 'week_of_year' },
      { header: 'Hour', accessorKey: 'hour' },
      {
        header: 'Prediction Day',
        accessorKey: 'prediction_day',
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ border: '1px solid black', width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{ border: '1px solid black', padding: '10px', background: '#f4f4f4' }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{ border: '1px solid gray', padding: '10px' }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PredictionsTable;