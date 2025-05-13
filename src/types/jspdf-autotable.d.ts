import { jsPDF } from 'jspdf';

interface CellStyles {
  fillColor?: [number, number, number] | string;
  textColor?: [number, number, number] | string;
  fontSize?: number;
  halign?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
}

interface TableCell {
  styles: CellStyles; // Corrected from 'settings' to 'styles'
}

interface TableRow {
  cells: Record<number, TableCell>;
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
  styles?: {
    fontSize: number;
    cellPadding: number;
    halign: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
  };
  headStyles?: {
    fillColor: [number, number, number];
    textColor: [number, number, number];
    fontStyle: string;
    lineWidth?: number;
  };
  alternateRowStyles?: { fillColor: [number, number, number] };
  rowStyles?: { lineWidth: number; lineColor: [number, number, number] };
  didParseCell?: (data: TableData) => void;
  didDrawPage?: (data: { pageNumber: number; doc: jsPDF }) => void;
  didDrawTable?: () => void;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
    internal: {
      events: any;
      scaleFactor: number;
      pageSize: {
        width: number;
        getWidth: () => number;
        height: number;
        getHeight: () => number;
      };
      pages: number[];
      getEncryptor(objectId: number): (data: string) => string;
    };
  }
}