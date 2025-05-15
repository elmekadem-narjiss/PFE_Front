// src/types/jspdf-autotable.d.ts
declare module 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable(options: any): void;
  }
}

declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';
  function applyPlugin(jspdf: typeof jsPDF): void;
  export default applyPlugin;
}