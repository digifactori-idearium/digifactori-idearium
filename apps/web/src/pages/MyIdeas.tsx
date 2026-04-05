import React, { useState } from 'react';


type Priority = 0 | 1 | 2 | 3;

type Task = {
  id: string;
  content: string;
  priority: Priority;
  days: number;
};

type ColumnType = 'draft' | 'todo' | 'progress' | 'review' | 'done';

const initialData: Record<ColumnType, Task[]> = {
  draft: [],
  todo: [],
  progress: [],
  review: [],
  done: [],
};


const MyIdeas: React.FC = () => {
  const [columns, setColumns] = useState(initialData);
  const [inputs, setInputs] = useState<Record<ColumnType, string>>({
    draft: '',
    todo: '',
    progress: '',
    review: '',
    done: '',
  });

  // ➕ Ajouter tâche
  const addTask = (column: ColumnType) => {
    if (!inputs[column].trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      content: inputs[column],
      priority: 0,
      days: 1,
    };

    setColumns(prev => ({
      ...prev,
      [column]: [...prev[column], task],
    }));

    setInputs(prev => ({ ...prev, [column]: '' }));
  };


  const editTask = (column: ColumnType, id: string) => {
    const newText = prompt('Modifier le texte :');
    if (!newText) return;

    setColumns(prev => ({
      ...prev,
      [column]: prev[column].map(t =>
        t.id === id ? { ...t, content: newText } : t
      ),
    }));
  };


  const changePriority = (column: ColumnType, id: string) => {
    const value = prompt('Priorité (0-3)');
    if (!value) return;

    setColumns(prev => ({
      ...prev,
      [column]: prev[column].map(t =>
        t.id === id ? { ...t, priority: Number(value) as Priority } : t
      ),
    }));
  };


  const changeDays = (column: ColumnType, id: string) => {
    const value = prompt('Durée en jours');
    if (!value) return;

    setColumns(prev => ({
      ...prev,
      [column]: prev[column].map(t =>
        t.id === id ? { ...t, days: Number(value) } : t
      ),
    }));
  };


  const deleteTask = (column: ColumnType, id: string) => {
    if (!confirm('Supprimer cette idée ?')) return;

    setColumns(prev => ({
      ...prev,
      [column]: prev[column].filter(t => t.id !== id),
    }));
  };


  const onDragStart = (e: React.DragEvent, task: Task, from: ColumnType) => {
    e.dataTransfer.setData('task', JSON.stringify({ task, from }));
  };

  const onDrop = (e: React.DragEvent, to: ColumnType) => {
    const data = JSON.parse(e.dataTransfer.getData('task'));
    const { task, from } = data;

    if (from === to) return;

    setColumns(prev => ({
      ...prev,
      [from]: prev[from].filter(t => t.id !== task.id),
      [to]: [...prev[to], task],
    }));
  };


  const Column = ({
    title,
    columnKey,
  }: {
    title: string;
    columnKey: ColumnType;
  }) => (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, columnKey)}
      className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl min-h-[500px]"
    >
      <h2 className="text-lg font-bold mb-3 dark:text-white">
        {title} ({columns[columnKey].length})
      </h2>

      {/* tâches */}
      <div className="flex flex-col gap-3 flex-1">
        {columns[columnKey].map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => onDragStart(e, task, columnKey)}
            className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow cursor-grab active:cursor-grabbing"
          >
            <div className="flex justify-between items-start">
              <span
                onClick={() => editTask(columnKey, task.id)}
                className="cursor-pointer dark:text-white"
              >
                {task.content}
              </span>
              <span className="text-xs">⭐{task.priority}</span>
            </div>

            <div className="text-xs mt-1 dark:text-gray-300">
              ⏱ {task.days} jours
            </div>

            <div className="flex gap-2 mt-2 text-xs">
              <button onClick={() => changePriority(columnKey, task.id)}>
                prio
              </button>
              <button onClick={() => changeDays(columnKey, task.id)}>
                temps
              </button>
              <button onClick={() => deleteTask(columnKey, task.id)}>
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ajout */}
      <div className="mt-3">
        <textarea
          value={inputs[columnKey]}
          onChange={(e) =>
            setInputs(prev => ({
              ...prev,
              [columnKey]: e.target.value,
            }))
          }
          placeholder="Nouvelle idée..."
          className="w-full p-2 rounded text-black"
        />
        <button
          onClick={() => addTask(columnKey)}
          className="w-full mt-2 bg-blue-500 text-white py-1 rounded"
        >
          Ajouter
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">
        Mes idées
      </h1>

      <div className="flex gap-4">
        <Column title="📝 Draft" columnKey="draft" />
        <Column title="📌 To Do" columnKey="todo" />
        <Column title="🚧 In Progress" columnKey="progress" />
        <Column title="🔍 In Review" columnKey="review" />
        <Column title="✅ Done" columnKey="done" />
      </div>
    </div>
  );
};

export default MyIdeas;