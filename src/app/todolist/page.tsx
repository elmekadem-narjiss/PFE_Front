'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Column } from '../../types/task';
import { fetchTasks, createTask, updateTaskStatus, deleteTask, updateTask } from '../../services/taskService';
import './todolist.css';

const initialColumns: Record<string, Column> = {
  todo: { name: 'Energy Planning', items: [] },
  inprogress: { name: 'Energy Projects', items: [] },
  done: { name: 'Completed Energy', items: [] },
  links: { name: 'Energy Resources', items: [] },
};

// Sortable item component
function SortableItem({ task, onEdit, onDelete }: { task: Task; onEdit: (task: Task) => void; onDelete: (id: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
      data-status={task.status}
    >
      <div className="task-content">
        <h3>{task.title}</h3>
        <p>{task.description}</p>
      </div>
      <div className="btn-group">
        <button onClick={() => onEdit(task)} className="edit-btn">Edit</button>
        <button onClick={() => onDelete(task.id)} className="delete-btn">Delete</button>
      </div>
    </div>
  );
}

export default function TodoListPage() {
  const [columns, setColumns] = useState(initialColumns);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo' as const });
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editedTask, setEditedTask] = useState({ title: '', description: '' });
  const [addingInColumn, setAddingInColumn] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasks = await fetchTasks();
        const updatedColumns = { ...initialColumns };
        tasks.forEach((task) => {
          updatedColumns[task.status].items.push(task);
        });
        setColumns(updatedColumns);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };
    loadTasks();
  }, []);

  const handleAddTask = async (status: string) => {
    if (!newTask.title.trim()) {
      console.log('Task title cannot be empty');
      return;
    }

    try {
      const addedTask = await createTask(newTask.title, newTask.description || '', status);
      if (addedTask) {
        setColumns((prev) => ({
          ...prev,
          [status]: {
            ...prev[status],
            items: [...prev[status].items, addedTask],
          },
        }));
        setNewTask({ title: '', description: '', status: 'todo' as const });
        setAddingInColumn(null);
      } else {
        console.error('Failed to add task: No response from createTask');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  };

  const handleStartAdding = (columnId: string) => {
    setAddingInColumn(columnId);
    setNewTask({ title: '', description: '', status: columnId as any });
  };

  const handleCancelAdding = () => {
    setAddingInColumn(null);
    setNewTask({ title: '', description: '', status: 'todo' as const });
  };

  const handleEditTask = async () => {
    if (!editTask || !editedTask.title) return;

    try {
      const updatedTask = await updateTask(editTask.id, editedTask.title, editedTask.description, editTask.status);
      setColumns((prev) => {
        const newColumns = { ...prev };
        newColumns[updatedTask.status].items = newColumns[updatedTask.status].items.map(t =>
          t.id === updatedTask.id ? updatedTask : t
        );
        return newColumns;
      });
      setEditTask(null);
      setEditedTask({ title: '', description: '' });
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditTask(task);
    setEditedTask({ title: task.title, description: task.description || '' });
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      setColumns((prev) => {
        const newColumns = { ...prev };
        Object.keys(newColumns).forEach((key) => {
          newColumns[key].items = newColumns[key].items.filter(t => t.id !== id);
        });
        return newColumns;
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const sourceColumnId = Object.keys(columns).find((key) =>
      columns[key].items.some((item) => item.id.toString() === active.id),
    );
    const destColumnId = Object.keys(columns).find((key) =>
      columns[key].items.some((item) => item.id.toString() === over.id),
    );

    if (!sourceColumnId || !destColumnId) return;

    const sourceColumn = columns[sourceColumnId];
    const destColumn = columns[destColumnId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const movedTask = sourceItems.find((item) => item.id.toString() === active.id)!;

    if (sourceColumnId === destColumnId) {
      const newItems = arrayMove(
        sourceItems,
        sourceItems.findIndex((item) => item.id.toString() === active.id),
        sourceItems.findIndex((item) => item.id.toString() === over.id),
      );
      setColumns({
        ...columns,
        [sourceColumnId]: { ...sourceColumn, items: newItems },
      });
    } else {
      sourceItems.splice(
        sourceItems.findIndex((item) => item.id.toString() === active.id),
        1,
      );
      destItems.splice(
        destItems.findIndex((item) => item.id.toString() === over.id) || 0,
        0,
        movedTask,
      );
      setColumns({
        ...columns,
        [sourceColumnId]: { ...sourceColumn, items: sourceItems },
        [destColumnId]: { ...destColumn, items: destItems },
      });

      try {
        await updateTaskStatus(movedTask.id, destColumnId);
      } catch (error) {
        console.error('Error updating task status:', error);
        const tasks = await fetchTasks();
        const updatedColumns = { ...initialColumns };
        tasks.forEach((task) => {
          updatedColumns[task.status].items.push(task);
        });
        setColumns(updatedColumns);
      }
    }
  };

  return (
    <div>
      <h1 className="color3">Energy Management Dashboard</h1>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="board">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="column" data-column={columnId}>
              <h2 className="color2">{column.name}</h2>
              <SortableContext
                id={columnId}
                items={column.items.map((item) => item.id.toString())}
                strategy={verticalListSortingStrategy}
              >
                {column.items.map((task) => (
                  <SortableItem key={task.id} task={task} onEdit={handleStartEdit} onDelete={handleDeleteTask} />
                ))}
              </SortableContext>
              <div className="add-card">
                {addingInColumn === columnId ? (
                  <div className="add-form">
                    <input
                      type="text"
                      placeholder="Energy task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="add-input"
                    />
                    <input
                      type="text"
                      placeholder="Energy task description (optional)"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className="add-input"
                    />
                    <div className="add-actions">
                      <button onClick={() => handleAddTask(columnId)} className="add-btn">Add Task</button>
                      <button onClick={handleCancelAdding} className="cancel-btn">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => handleStartAdding(columnId)} className="add-btn">Ajouter une tâche</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </DndContext>

      {editTask && (
        <div className="modal">
          <div className="modal-content">
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Energy task title"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="color3"
              />
              <input
                type="text"
                placeholder="Energy task description (optional)"
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="color3"
              />
              <div className="flex space-x-3">
                <button onClick={handleEditTask} className="save-btn color4">Save</button>
                <button
                  onClick={() => { setEditTask(null); setEditedTask({ title: '', description: '' }); }}
                  className="cancel-btn color2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}