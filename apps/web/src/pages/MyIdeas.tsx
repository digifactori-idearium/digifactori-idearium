import React, { useState, useEffect } from 'react';
import { getIdeas, saveIdeas } from '@/services/idea.services';

// ================= TYPES =================
type Priority = 'high' | 'low';

type Task = {
  id: string;
  content: string;
  priority: Priority;
  color: string;
};

type ColumnType = 'todo' | 'progress' | 'done';

type Columns = Record<ColumnType, Task[]>;

type Inputs = Record<ColumnType, string>;

type ModalTaskData = {
  column: ColumnType;
  id: string;
};

type ModalEditData = {
  column: ColumnType;
  id: string;
  value: string;
};

type ColumnProps = {
  title: string;
  columnKey: ColumnType;
  columns: Columns;
  inputs: Inputs;
  setInputs: React.Dispatch<React.SetStateAction<Inputs>>;
  addTask: (column: ColumnType) => void;
  onDrop: (
    e: React.DragEvent<HTMLDivElement>,
    to: ColumnType
  ) => Promise<void>;
  onDragStart: (
    e: React.DragEvent<HTMLDivElement>,
    task: Task,
    from: ColumnType
  ) => void;
  setModalPriority: React.Dispatch<
    React.SetStateAction<ModalTaskData | null>
  >;
  setModalEdit: React.Dispatch<
    React.SetStateAction<ModalEditData | null>
  >;
  setModalDelete: React.Dispatch<
    React.SetStateAction<ModalTaskData | null>
  >;
  setModalColor: React.Dispatch<
    React.SetStateAction<ModalTaskData | null>
  >;
};

type ModalProps = {
  children: React.ReactNode;
  title: string;
};

const initialData: Columns = {
  todo: [],
  progress: [],
  done: [],
};

const COLORS = ['#fde68a', '#bfdbfe', '#bbf7d0', '#fecaca', '#ddd6fe'];

// ================= COLUMN =================
const Column: React.FC<ColumnProps> = ({
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
  setModalColor,
}) => (
  <div
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => onDrop(e, columnKey)}
    className="flex flex-col flex-1 bg-gray-50 p-5 rounded-2xl min-h-[520px] shadow-sm"
  >
    {/* ✅ TITRE COLONNE HARMONISÉ */}
    <h2 className="text-lg font-semibold mb-4 text-violet-700">
      {title} ({columns[columnKey]?.length || 0})
    </h2>

    {/* LIST */}
    <div className="flex flex-col gap-3 flex-1">
      {(columns[columnKey] || []).map((task: Task) => (
        <div
          key={task.id}
          draggable
          onDragStart={(e) => onDragStart(e, task, columnKey)}
          className="p-3 rounded-xl shadow-sm cursor-grab transition hover:shadow-md"
          style={{ backgroundColor: task.color }}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm">{task.content}</span>

            <button
              onClick={() =>
                setModalPriority({ column: columnKey, id: task.id })
              }
              className={`text-xs px-2 py-1 rounded font-medium ${
                task.priority === 'high'
                  ? 'bg-red-500 text-white'
                  : 'bg-green-500 text-white'
              }`}
            >
              {task.priority === 'high' ? 'Important' : 'Pas important'}
            </button>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <button
              onClick={() =>
                setModalEdit({
                  column: columnKey,
                  id: task.id,
                  value: task.content,
                })
              }
              className="px-2 py-1 bg-blue-100 text-blue-700 rounded"
            >
              Modifier
            </button>

            <button
              onClick={() =>
                setModalDelete({ column: columnKey, id: task.id })
              }
              className="px-2 py-1 bg-red-100 text-red-700 rounded"
            >
              Supprimer
            </button>

            <button
              onClick={() =>
                setModalColor({ column: columnKey, id: task.id })
              }
              className="px-2 py-1 bg-purple-100 text-purple-700 rounded"
            >
              Grouper 🎨
            </button>
          </div>
        </div>
      ))}
    </div>

    {/* INPUT FIXÉ EN BAS */}
    <div className="mt-auto pt-4">
      <textarea
        value={inputs[columnKey]}
        onChange={(e) =>
          setInputs((prev) => ({
            ...prev,
            [columnKey]: e.target.value,
          }))
        }
        placeholder="Nouvelle idée..."
        className="w-full p-2 rounded border text-sm"
      />

      {/* ✅ BOUTON AJOUTER → VIOLET PASTEL */}
      <button
        onClick={() => addTask(columnKey)}
        className="w-full mt-2 bg-violet-400 hover:bg-violet-500 text-white py-2 rounded-lg transition"
      >
        Ajouter
      </button>
    </div>
  </div>
);

// ================= MAIN =================
const MyIdeas: React.FC = () => {
  const [columns, setColumns] = useState<Columns>(initialData);

  const [inputs, setInputs] = useState<Inputs>({
    todo: '',
    progress: '',
    done: '',
  });

  const [modalPriority, setModalPriority] =
    useState<ModalTaskData | null>(null);

  const [modalDelete, setModalDelete] =
    useState<ModalTaskData | null>(null);

  const [modalEdit, setModalEdit] =
    useState<ModalEditData | null>(null);

  const [modalColor, setModalColor] =
    useState<ModalTaskData | null>(null);

  // LOAD
  useEffect(() => {
    const load = async () => {
      const res = await getIdeas();

      setColumns({
        todo: res?.data?.data?.todo || [],
        progress: res?.data?.data?.progress || [],
        done: res?.data?.data?.done || [],
      });
    };

    load();
  }, []);

  // SAVE
  const updateColumns = async (newCols: Columns) => {
    setColumns(newCols);
    await saveIdeas(newCols);
  };

  // ADD
  const addTask = async (column: ColumnType) => {
    if (!inputs[column].trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      content: inputs[column],
      priority: 'low',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };

    const newCols: Columns = {
      ...columns,
      [column]: [...(columns[column] || []), task],
    };

    setInputs((p) => ({ ...p, [column]: '' }));
    await updateColumns(newCols);
  };

  // PRIORITY
  const setPriority = async (priority: Priority) => {
    if (!modalPriority) return;

    const newCols: Columns = {
      ...columns,
      [modalPriority.column]: columns[modalPriority.column].map(
        (t: Task) =>
          t.id === modalPriority.id ? { ...t, priority } : t
      ),
    };

    setModalPriority(null);
    await updateColumns(newCols);
  };

  // DELETE
  const confirmDelete = async () => {
    if (!modalDelete) return;

    const newCols: Columns = {
      ...columns,
      [modalDelete.column]: columns[modalDelete.column].filter(
        (t: Task) => t.id !== modalDelete.id
      ),
    };

    setModalDelete(null);
    await updateColumns(newCols);
  };

  // EDIT
  const confirmEdit = async () => {
    if (!modalEdit) return;

    const newCols: Columns = {
      ...columns,
      [modalEdit.column]: columns[modalEdit.column].map((t: Task) =>
        t.id === modalEdit.id
          ? { ...t, content: modalEdit.value }
          : t
      ),
    };

    setModalEdit(null);
    await updateColumns(newCols);
  };

  // COLOR
  const setColor = async (color: string) => {
    if (!modalColor) return;

    const newCols: Columns = {
      ...columns,
      [modalColor.column]: columns[modalColor.column].map((t: Task) =>
        t.id === modalColor.id ? { ...t, color } : t
      ),
    };

    setModalColor(null);
    await updateColumns(newCols);
  };

  // DRAG
  const onDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    task: Task,
    from: ColumnType
  ) => {
    e.dataTransfer.setData('task', JSON.stringify({ task, from }));
  };

  const onDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    to: ColumnType
  ) => {
    const {
      task,
      from,
    }: { task: Task; from: ColumnType } = JSON.parse(
      e.dataTransfer.getData('task')
    );

    if (from === to) return;

    const newCols: Columns = {
      ...columns,
      [from]: columns[from].filter((t: Task) => t.id !== task.id),
      [to]: [...columns[to], task],
    };

    await updateColumns(newCols);
  };

  return (
    <div className="min-h-screen p-6 bg-white">
      {/* ✅ TITRE ROSE DOUX */}
      <h1 className="text-3xl font-semibold mb-8 text-pink-400 drop-shadow-sm">
        Mon planificateur d'idées
      </h1>

      <div className="flex gap-6">
        <Column
          title="À faire"
          columnKey="todo"
          columns={columns}
          inputs={inputs}
          setInputs={setInputs}
          addTask={addTask}
          onDrop={onDrop}
          onDragStart={onDragStart}
          setModalPriority={setModalPriority}
          setModalEdit={setModalEdit}
          setModalDelete={setModalDelete}
          setModalColor={setModalColor}
        />

        <Column
          title="En cours"
          columnKey="progress"
          columns={columns}
          inputs={inputs}
          setInputs={setInputs}
          addTask={addTask}
          onDrop={onDrop}
          onDragStart={onDragStart}
          setModalPriority={setModalPriority}
          setModalEdit={setModalEdit}
          setModalDelete={setModalDelete}
          setModalColor={setModalColor}
        />

        <Column
          title="Terminé"
          columnKey="done"
          columns={columns}
          inputs={inputs}
          setInputs={setInputs}
          addTask={addTask}
          onDrop={onDrop}
          onDragStart={onDragStart}
          setModalPriority={setModalPriority}
          setModalEdit={setModalEdit}
          setModalDelete={setModalDelete}
          setModalColor={setModalColor}
        />
      </div>

      {/* MODALS */}
      {modalPriority && (
        <Modal title="Changer la priorité">
          <button
            onClick={() => setPriority('high')}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Important
          </button>

          <button
            onClick={() => setPriority('low')}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Pas important
          </button>
        </Modal>
      )}

      {modalDelete && (
        <Modal title="Supprimer cette idée ?">
          <button
            onClick={confirmDelete}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Supprimer
          </button>

          <button
            onClick={() => setModalDelete(null)}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Annuler
          </button>
        </Modal>
      )}

      {modalEdit && (
        <Modal title="Modifier l'idée">
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

          <button
            onClick={confirmEdit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Valider
          </button>
        </Modal>
      )}

      {modalColor && (
        <Modal title="Choisir une couleur">
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <div
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded cursor-pointer"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

// ================= MODAL =================
const Modal: React.FC<ModalProps> = ({ children, title }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col gap-4">
      <h3 className="font-semibold text-gray-700">{title}</h3>

      <div className="flex gap-3 flex-wrap">{children}</div>
    </div>
  </div>
);

export default MyIdeas;