"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, Column } from "../../types/task";
import {
  fetchTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  updateTask,
  clearTasks,
} from "../../services/taskService";
import { Pie } from "react-chartjs-2";
import {
  Chart,
  ArcElement, // Import ArcElement
  PieController, // Import PieController
  Tooltip, // Import Tooltip
  Legend, // Import Legend
  ChartOptions,
} from "chart.js"; // Import from chart.js directly
import "./todolist.css";

// Register the required components for Pie chart
Chart.register(ArcElement, PieController, Tooltip, Legend);

const initialColumns: Record<string, Column> = {
  todo: { name: "Task Planning", items: [] },
  inprogress: { name: "Task Projects", items: [] },
  done: { name: "Completed Task", items: [] },
  links: { name: "Task Resources", items: [] },
};

// Define type for newTask
type TaskInput = {
  title: string;
  description: string;
  status: "todo" | "inprogress" | "done" | "links";
  priority: "high" | "medium" | "low";
};

// Sortable item component
function SortableItem({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
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
        <p className="priority" data-priority={task.priority}>
          Priority: {task.priority}
        </p>
      </div>
      <div className="btn-group">
        <button onClick={() => onEdit(task)} className="edit-btn">
          Edit
        </button>
        <button onClick={() => onDelete(task.id)} className="delete-btn">
          Delete
        </button>
      </div>
    </div>
  );
}

export default function TodoListPage() {
  const [columns, setColumns] = useState(initialColumns);
  const [newTask, setNewTask] = useState<TaskInput>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
  });
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editedTask, setEditedTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "high" | "medium" | "low",
  });
  const [addingTask, setAddingTask] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>("all");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasks = await fetchTasks();
        const updatedColumns = { ...initialColumns };
        tasks.forEach((task) => {
          if (filterPriority === "all" || task.priority === filterPriority) {
            updatedColumns[task.status].items.push(task);
          }
        });
        setColumns(updatedColumns);
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    };
    loadTasks();
  }, [filterPriority]);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      console.log("Task title cannot be empty");
      return;
    }

    try {
      const addedTask = await createTask(
        newTask.title,
        newTask.description || "",
        newTask.status,
        newTask.priority
      );
      if (addedTask && (filterPriority === "all" || addedTask.priority === filterPriority)) {
        setColumns((prev) => ({
          ...prev,
          [newTask.status]: {
            ...prev[newTask.status],
            items: [...prev[newTask.status].items, addedTask],
          },
        }));
        setNewTask({ title: "", description: "", status: "todo", priority: "medium" });
        setAddingTask(false);
      } else {
        console.error("Failed to add task: No response from createTask");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
    }
  };

  const handleStartAdding = () => {
    setAddingTask(true);
    setNewTask({ title: "", description: "", status: "todo", priority: "medium" });
  };

  const handleCancelAdding = () => {
    setAddingTask(false);
    setNewTask({ title: "", description: "", status: "todo", priority: "medium" });
  };

  const handleEditTask = async () => {
    if (!editTask || !editedTask.title) return;

    try {
      const updatedTask = await updateTask(
        editTask.id,
        editedTask.title,
        editedTask.description,
        editTask.status,
        editedTask.priority
      );
      setColumns((prev) => {
        const newColumns = { ...prev };
        newColumns[updatedTask.status].items = newColumns[updatedTask.status].items.map(
          (t) => (t.id === updatedTask.id ? updatedTask : t)
        );
        return newColumns;
      });
      setEditTask(null);
      setEditedTask({ title: "", description: "", priority: "medium" as "high" | "medium" | "low" });
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditTask(task);
    setEditedTask({
      title: task.title,
      description: task.description || "",
      priority: task.priority || "medium",
    });
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      setColumns((prev) => {
        const newColumns = { ...prev };
        Object.keys(newColumns).forEach((key) => {
          newColumns[key].items = newColumns[key].items.filter((t) => t.id !== id);
        });
        return newColumns;
      });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleClearTasks = async () => {
    if (confirm("Are you sure you want to delete all tasks?")) {
      try {
        await clearTasks();
        const updatedColumns = { ...initialColumns };
        setColumns(updatedColumns);
      } catch (error) {
        console.error("Error clearing tasks:", error);
        alert(`Failed to clear tasks: ${(error as Error).message}`);
      }
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const sourceColumnId = Object.keys(columns).find((key) =>
      columns[key].items.some((item) => item.id.toString() === active.id)
    );
    const destColumnId = Object.keys(columns).find((key) =>
      columns[key].items.some((item) => item.id.toString() === over.id)
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
        sourceItems.findIndex((item) => item.id.toString() === over.id)
      );
      setColumns({
        ...columns,
        [sourceColumnId]: { ...sourceColumn, items: newItems },
      });
    } else {
      sourceItems.splice(
        sourceItems.findIndex((item) => item.id.toString() === active.id),
        1
      );
      destItems.splice(
        destItems.findIndex((item) => item.id.toString() === over.id) || 0,
        0,
        movedTask
      );
      setColumns({
        ...columns,
        [sourceColumnId]: { ...sourceColumn, items: sourceItems },
        [destColumnId]: { ...destColumn, items: destItems },
      });

      try {
        await updateTaskStatus(movedTask.id, destColumnId);
      } catch (error) {
        console.error("Error updating task status:", error);
        const tasks = await fetchTasks();
        const updatedColumns = { ...initialColumns };
        tasks.forEach((task) => {
          if (filterPriority === "all" || task.priority === filterPriority) {
            updatedColumns[task.status].items.push(task);
          }
        });
        setColumns(updatedColumns);
      }
    }
  };

  const totalTasks = Object.values(columns).reduce(
    (sum, column) => sum + column.items.length,
    0
  );
  const completedTasks = columns.done.items.length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Chart data configuration
  const chartData = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [completedTasks, totalTasks - completedTasks],
        backgroundColor: ["#4c6096", "#c5dfed"],
        borderWidth: 1,
        borderColor: "#ffffff",
      },
    ],
  };

  // Explicitly type chartOptions as ChartOptions<"pie">
  const chartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#19203d",
        },
      },
      title: {
        display: true,
        text: "Task Completion Status",
        color: "#19203d",
        font: { size: 14 },
      },
    },
  };

  return (
    <div>
      <h1 className="color3">Energy Management Dashboard</h1>
      <div className="filter-section">
        <label className="color2">Filter by Priority: </label>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="filter-select"
        >
          <option value="all">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button onClick={handleStartAdding} className="add-btn">
          Ajouter une tâche
        </button>
      </div>

      {addingTask && (
        <div className="add-form global-add-form">
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
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="add-input"
          />
          <select
            value={newTask.status}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                status: e.target.value as "todo" | "inprogress" | "done" | "links",
              })
            }
            className="add-input"
          >
            <option value="todo">Energy Planning</option>
            <option value="inprogress">Energy Projects</option>
            <option value="done">Completed Energy</option>
            <option value="links">Energy Resources</option>
          </select>
          <select
            value={newTask.priority}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                priority: e.target.value as "high" | "medium" | "low",
              })
            }
            className="add-input"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="add-actions">
            <button onClick={handleAddTask} className="add-btn">
              Add Task
            </button>
            <button onClick={handleCancelAdding} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="main-container">
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
                    <SortableItem
                      key={task.id}
                      task={task}
                      onEdit={handleStartEdit}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </SortableContext>
              </div>
            ))}
          </div>
        </DndContext>

        <div className="stats-section">
          <h3 className="color2">Statistics</h3>
          <p>Total Tasks: {totalTasks}</p>
          <p>
            Completed Tasks: {completedTasks} ({completionPercentage.toFixed(1)}%)
          </p>
          <div style={{ height: "200px", marginBottom: "1rem" }}>
            <Pie data={chartData} options={chartOptions} />
          </div>
          <button onClick={handleClearTasks} className="clear-btn">
            Clear All Tasks
          </button>
        </div>
      </div>

      {editTask && (
        <div className="modal">
          <div className="modal-content">
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Energy task title"
                value={editedTask.title}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, title: e.target.value })
                }
                className="color3"
              />
              <input
                type="text"
                placeholder="Energy task description (optional)"
                value={editedTask.description}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, description: e.target.value })
                }
                className="color3"
              />
              <select
                value={editedTask.priority}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    priority: e.target.value as "high" | "medium" | "low",
                  })
                }
                className="color3"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <div className="flex space-x-3">
                <button onClick={handleEditTask} className="save-btn color4">
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditTask(null);
                    setEditedTask({
                      title: "",
                      description: "",
                      priority: "medium" as "high" | "medium" | "low",
                    });
                  }}
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