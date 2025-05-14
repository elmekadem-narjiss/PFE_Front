// src/types/chart.d.ts
declare var Chart: {
    new <TType = string, TData = number[], TLabel = string>(
      context: CanvasRenderingContext2D,
      config: {
        type: TType;
        data: {
          labels: TLabel[];
          datasets: Array<{
            label?: string;
            data: TData;
            backgroundColor?: string[];
            borderColor?: string[];
            borderWidth?: number;
          }>;
        };
        options?: {
          responsive?: boolean;
          maintainAspectRatio?: boolean;
          plugins?: {
            legend?: { position: string };
            title?: { display: boolean; text: string };
            tooltip?: {
              callbacks?: {
                label: (item: { label: string; raw: number }) => string;
              };
            };
          };
        };
      }
    ): any; // Use 'any' for the instance type as a fallback
    prototype: any;
  };
  
  export {};