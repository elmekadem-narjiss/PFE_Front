export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'done' | 'links';
  priority: 'high' | 'medium' | 'low';
}

export interface Column {
  name: string;
  items: Task[];
}

//just test to declanche pipeline