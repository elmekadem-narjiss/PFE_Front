export interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
  }
  
  export interface Column {
    name: string;
    items: Task[];
  }