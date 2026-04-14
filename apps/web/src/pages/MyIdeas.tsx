import React, { useState } from 'react';

// ================= TYPES =================
type Priority = 'high' | 'low';

type Task = {
  id: string;
  content: string;
  priority: Priority;
  color: string;
};

type ColumnType = 'todo' | 'progress' | 'done';

const initialData: Record<ColumnType, Task[]> = {
  todo: [],
  progress: [],
  done: [],
};

const COLORS = ['#fde68a', '#bfdbfe', '#bbf7d0', '#fecaca', '#ddd6fe'];

// ================= COLUMN =================
type ColumnProps = {
  title: string;
  columnKey: ColumnType;
  columns: Record<ColumnType, Task[]>;
  inputs: Record<ColumnType, string>;
  setInputs: React.Dispatch<React.SetStateAction<Record<ColumnType, string>>>;
  addTask: (column: ColumnType) => void;
  onDrop: (e: React.DragEvent, column: ColumnType) => void;
  onDragStart: (e: React.DragEvent, task: Task, column: ColumnType) => void;
  setModalPriority: React.Dispatch<React.SetStateAction<{ column: ColumnType; id: string } | null>>;
  setModalEdit: React.Dispatch<React.SetStateAction<{ column: ColumnType; id: string; value: string } | null>>;
  setModalDelete: React.Dispatch<React.SetStateAction<{ column: ColumnType; id: string } | null>>;
};

const Column = ({
  title,
  columnKey,
  columns,
  inputs,
  setInputs,
  addTask,
  onDrop,
  onDragStart,
  setModalPriority,
  setModalEdit,
  setModalDelete,
}: ColumnProps) => (
  <div
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => onDrop(e, columnKey)}
    className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl min-h-[500px]"
  >
    <h2 className="text-lg font-bold mb-3 dark:text-white">
      {title} ({columns[columnKey].length})
    </h2>

    <div className="flex flex-col gap-3 flex-1">
      {columns[columnKey].map((task: Task) => (
        <div
          key={task.id}
          draggable
          onDragStart={(e) => onDragStart(e, task, columnKey)}
          className="p-3 rounded-lg shadow cursor-grab"
          style={{ backgroundColor: task.color }}
        >
          <div className="flex justify-between">
            <span className="dark:text-black">{task.content}</span>
            <span
              onClick={() =>
                setModalPriority({ column: columnKey, id: task.id })
              }
              className={`text-xs px-2 py-1 rounded cursor-pointer ${
                task.priority === 'high'
                  ? 'bg-red-500 text-white'
                  : 'bg-green-500 text-white'
              }`}
            >
              {task.priority === 'high'
                ? 'Important'
                : 'Pas important'}
            </span>
          </div>

          <div className="flex gap-2 mt-2 text-xs">
            <button
              onClick={() =>
                setModalEdit({
                  column: columnKey,
                  id: task.id,
                  value: task.content,
                })
              }
            >
              ✏️ Modifier
            </button>
            <button
              onClick={() =>
                setModalDelete({ column: columnKey, id: task.id })
              }
            >
              ❌ Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-3">
      <textarea
        value={inputs[columnKey]}
        onChange={(e) =>
          setInputs((prev) => ({
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

// ================= MAIN =================
const MyIdeas: React.FC = () => {
  const [columns, setColumns] = useState(initialData);

  const [inputs, setInputs] = useState<Record<ColumnType, string>>({
    todo: '',
    progress: '',
    done: '',
  });

  const [modalPriority, setModalPriority] = useState<{
    column: ColumnType;
    id: string;
  } | null>(null);

  const [modalDelete, setModalDelete] = useState<{
    column: ColumnType;
    id: string;
  } | null>(null);

  const [modalEdit, setModalEdit] = useState<{
    column: ColumnType;
    id: string;
    value: string;
  } | null>(null);

  // ➕ Ajouter
  const addTask = (column: ColumnType) => {
    if (!inputs[column].trim()) return;

    const randomColor =
      COLORS[Math.floor(Math.random() * COLORS.length)];

    const task: Task = {
      id: Date.now().toString(),
      content: inputs[column],
      priority: 'low',
      color: randomColor,
    };

    setColumns((prev) => ({
      ...prev,
      [column]: [...prev[column], task],
    }));

    setInputs((prev) => ({ ...prev, [column]: '' }));
  };

  // ⭐ priorité
  const setPriority = (priority: Priority) => {
    if (!modalPriority) return;

    setColumns((prev) => ({
      ...prev,
      [modalPriority.column]: prev[modalPriority.column].map((t: Task) =>
        t.id === modalPriority.id ? { ...t, priority } : t
      ),
    }));

    setModalPriority(null);
  };

  // ❌ supprimer
  const confirmDelete = () => {
    if (!modalDelete) return;

    setColumns((prev) => ({
      ...prev,
      [modalDelete.column]: prev[modalDelete.column].filter(
        (t: Task) => t.id !== modalDelete.id
      ),
    }));

    setModalDelete(null);
  };

  // ✏️ edit
  const confirmEdit = () => {
    if (!modalEdit) return;

    setColumns((prev) => ({
      ...prev,
      [modalEdit.column]: prev[modalEdit.column].map((t: Task) =>
        t.id === modalEdit.id
          ? { ...t, content: modalEdit.value }
          : t
      ),
    }));

    setModalEdit(null);
  };

  // 🧲 drag
  const onDragStart = (
    e: React.DragEvent,
    task: Task,
    from: ColumnType
  ) => {
    e.dataTransfer.setData(
      'task',
      JSON.stringify({ task, from })
    );
  };

  const onDrop = (e: React.DragEvent, to: ColumnType) => {
    const data = JSON.parse(e.dataTransfer.getData('task'));
    const { task, from } = data;

    if (from === to) return;

    setColumns((prev) => ({
      ...prev,
      [from]: prev[from].filter((t: Task) => t.id !== task.id),
      [to]: [...prev[to], task],
    }));
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Mes idées</h1>

      <div className="flex gap-4">
        <Column title="📌 À faire" columnKey="todo" {...{ columns, inputs, setInputs, addTask, onDrop, onDragStart, setModalPriority, setModalEdit, setModalDelete }} />
        <Column title="🚧 En cours" columnKey="progress" {...{ columns, inputs, setInputs, addTask, onDrop, onDragStart, setModalPriority, setModalEdit, setModalDelete }} />
        <Column title="✅ Terminé" columnKey="done" {...{ columns, inputs, setInputs, addTask, onDrop, onDragStart, setModalPriority, setModalEdit, setModalDelete }} />
      </div>

      {/* PRIORITY MODAL */}
      {modalPriority && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="mb-4 font-bold">Choisir la priorité</h3>
            <div className="flex gap-4">
              <button onClick={() => setPriority('high')} className="bg-red-500 text-white px-4 py-2 rounded">
                Important
              </button>
              <button onClick={() => setPriority('low')} className="bg-green-500 text-white px-4 py-2 rounded">
                Pas important
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modalDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="mb-4 font-bold">Supprimer cette idée ?</h3>
            <div className="flex gap-4">
              <button onClick={confirmDelete} className="bg-red-500 text-white px-4 py-2 rounded">
                Supprimer
              </button>
              <button onClick={() => setModalDelete(null)} className="bg-gray-300 px-4 py-2 rounded">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {modalEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[300px]">
            <h3 className="mb-4 font-bold">Modifier l'idée</h3>
            <textarea
              value={modalEdit.value}
              onChange={(e) =>
                setModalEdit({
                  ...modalEdit,
                  value: e.target.value,
                })
              }
              className="w-full p-2 border rounded mb-3"
            />
            <div className="flex gap-4">
              <button onClick={confirmEdit} className="bg-blue-500 text-white px-4 py-2 rounded">
                Valider
              </button>
              <button onClick={() => setModalEdit(null)} className="bg-gray-300 px-4 py-2 rounded">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyIdeas;