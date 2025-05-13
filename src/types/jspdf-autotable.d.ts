import { jsPDF } from 'jspdf';

interface CellStyles {
  fillColor?: [number, number, number] | string;
  textColor?: [number, number, number] | string;
  fontSize?: number;
  halign?: 'left' | 'center' | 'right';
}

interface TableCell {
  styles: CellStyles;
}

interface TableRow {
  cells: { [key: string]: TableCell }; // Cells is an object with string keys (column indices)
  index: number;
}

interface TableData {
  row: TableRow;
}

interface AutoTableOptions {
  head: string[][];
  body: (string | number)[][];
  startY?: number;
  theme?: 'grid' | 'striped' | 'plain';
  styles?: { fontSize: number; cellPadding: number; halign: 'left' | 'center' | 'right' };
  headStyles?: { fillColor: [number, number, number]; textColor: [number, number, number]; fontStyle: string };
  alternateRowStyles?: { fillColor: [number, number, number] };
  rowStyles?: { lineWidth: number; lineColor: [number, number, number] };
  didParseCell?: (data: TableData) => void;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
  }
}