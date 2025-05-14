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
  month: number;
}

const PredictionsTable: React.FC<PredictionsTableProps> = ({ data, month }) => {
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
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value ? new Date(value).toLocaleDateString() : 'N/A';
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Map month number to name for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[month - 1] || `Month ${month}`;

  return (
    <div
      style={{
        marginBottom: '20px',
        maxWidth: '100%',
        animation: 'fadeIn 0.5s ease-in-out',
      }}
    >
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#388E3C',
          marginBottom: '8px',
          transition: 'color 0.3s ease',
        }}
      >
        Predictions for {monthName}
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            border: '1px solid #E0E0E0',
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem',
            background: 'linear-gradient(180deg, #FFFFFF, #F1F8E9)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      border: '1px solid #E0E0E0',
                      padding: '8px',
                      background: 'linear-gradient(45deg, #4CAF50, #388E3C)',
                      color: '#FFFFFF',
                      textAlign: 'left',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'background 0.3s ease',
                      animation: 'shine 3s infinite ease-in-out',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'linear-gradient(45deg, #66BB6A, #4CAF50)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'linear-gradient(45deg, #4CAF50, #388E3C)')
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shineOverlay 2s infinite ease-in-out',
                      }}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                style={{
                  transition: 'transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
                  animation: 'slideIn 0.3s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      border: '1px solid #E0E0E0',
                      padding: '8px',
                      background: '#FFFFFF',
                      color: '#333333',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = '#E8F5E9')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = '#FFFFFF')
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes shineOverlay {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default PredictionsTable;