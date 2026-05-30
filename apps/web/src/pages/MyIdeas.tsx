import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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
  onDrop: (e: React.DragEvent<HTMLDivElement>, to: ColumnType) => Promise<void>;
  onDragStart: (
    e: React.DragEvent<HTMLDivElement>,
    task: Task,
    from: ColumnType
  ) => void;
  setModalPriority: React.Dispatch<React.SetStateAction<ModalTaskData | null>>;
  setModalEdit: React.Dispatch<React.SetStateAction<ModalEditData | null>>;
  setModalDelete: React.Dispatch<React.SetStateAction<ModalTaskData | null>>;
  setModalColor: React.Dispatch<React.SetStateAction<ModalTaskData | null>>;
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
    onDragOver={e => e.preventDefault()}
    onDrop={e => onDrop(e, columnKey)}
    className="flex flex-col flex-1 bg-card border border-border p-5 rounded-2xl h-[calc(100vh-13rem)] shadow-sm"
  >
    <h2 className="text-base font-semibold mb-4 text-violet-500 dark:text-violet-400 flex items-center gap-2">
      {title}
      <Badge variant="secondary" className="text-xs font-normal">
        {columns[columnKey]?.length || 0}
      </Badge>
    </h2>

    <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 scrollbar-thin">
      {(columns[columnKey] || []).map((task: Task) => (
        <div
          key={task.id}
          draggable
          onDragStart={e => onDragStart(e, task, columnKey)}
          className="p-3 rounded-xl shadow-sm cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md"
          style={{ backgroundColor: task.color }}
        >
          <div className="flex justify-between items-start gap-2">
            <span className="text-sm text-gray-800 font-medium leading-snug flex-1">
              {task.content}
            </span>

            <Button
              size="sm"
              variant={task.priority === 'high' ? 'destructive' : 'default'}
              className={`shrink-0 h-6 text-xs px-2 ${
                task.priority === 'low'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : ''
              }`}
              onClick={() =>
                setModalPriority({ column: columnKey, id: task.id })
              }
            >
              {task.priority === 'high' ? 'Important' : 'Pas important'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              size="sm"
              variant="secondary"
              className="h-6 text-xs px-2 bg-blue-100 hover:bg-blue-200 text-blue-700"
              onClick={() =>
                setModalEdit({
                  column: columnKey,
                  id: task.id,
                  value: task.content,
                })
              }
            >
              Modifier
            </Button>

            <Button
              size="sm"
              variant="secondary"
              className="h-6 text-xs px-2 bg-red-100 hover:bg-red-200 text-red-700"
              onClick={() => setModalDelete({ column: columnKey, id: task.id })}
            >
              Supprimer
            </Button>

            <Button
              size="sm"
              variant="secondary"
              className="h-6 text-xs px-2 bg-purple-100 hover:bg-purple-200 text-purple-700"
              onClick={() => setModalColor({ column: columnKey, id: task.id })}
            >
              Grouper 🎨
            </Button>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-auto pt-4 space-y-2">
      <Textarea
        value={inputs[columnKey]}
        onChange={e =>
          setInputs(prev => ({ ...prev, [columnKey]: e.target.value }))
        }
        placeholder="Nouvelle idée..."
        className="resize-none text-sm"
        rows={2}
      />

      <Button
        onClick={() => addTask(columnKey)}
        className="w-full bg-violet-500 hover:bg-violet-600 text-white"
      >
        Ajouter
      </Button>
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

  const [modalPriority, setModalPriority] = useState<ModalTaskData | null>(
    null
  );
  const [modalDelete, setModalDelete] = useState<ModalTaskData | null>(null);
  const [modalEdit, setModalEdit] = useState<ModalEditData | null>(null);
  const [modalColor, setModalColor] = useState<ModalTaskData | null>(null);

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

  const updateColumns = async (newCols: Columns) => {
    setColumns(newCols);
    await saveIdeas(newCols);
  };

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

    setInputs(p => ({ ...p, [column]: '' }));
    await updateColumns(newCols);
  };

  const setPriority = async (priority: Priority) => {
    if (!modalPriority) return;

    const newCols: Columns = {
      ...columns,
      [modalPriority.column]: columns[modalPriority.column].map((t: Task) =>
        t.id === modalPriority.id ? { ...t, priority } : t
      ),
    };

    setModalPriority(null);
    await updateColumns(newCols);
  };

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

  const confirmEdit = async () => {
    if (!modalEdit) return;

    const newCols: Columns = {
      ...columns,
      [modalEdit.column]: columns[modalEdit.column].map((t: Task) =>
        t.id === modalEdit.id ? { ...t, content: modalEdit.value } : t
      ),
    };

    setModalEdit(null);
    await updateColumns(newCols);
  };

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

  const onDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    task: Task,
    from: ColumnType
  ) => {
    e.dataTransfer.setData('task', JSON.stringify({ task, from }));
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>, to: ColumnType) => {
    const { task, from }: { task: Task; from: ColumnType } = JSON.parse(
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
    <div className="h-full bg-sidebar w-full">
      <h1 className="text-3xl font-semibold mb-8 magic-text">
        Mon planificateur d'idées
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {(['todo', 'progress', 'done'] as ColumnType[]).map((col, i) => (
          <Column
            key={col}
            title={['À faire', 'En cours', 'Terminé'][i]}
            columnKey={col}
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
        ))}
      </div>

      {/* ── PRIORITY MODAL ── */}
      <Dialog
        open={!!modalPriority}
        onOpenChange={open => !open && setModalPriority(null)}
      >
        <DialogContent className="sm:max-w-sm bg-sidebar">
          <DialogHeader>
            <DialogTitle>Changer la priorité</DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:flex-row">
            <Button
              variant="destructive"
              onClick={() => setPriority('high')}
              className="flex-1"
            >
              🔴 Important
            </Button>
            <Button
              onClick={() => setPriority('low')}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              🟢 Pas important
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE MODAL ── */}
      <Dialog
        open={!!modalDelete}
        onOpenChange={open => !open && setModalDelete(null)}
      >
        <DialogContent className="sm:max-w-sm bg-sidebar">
          <DialogHeader>
            <DialogTitle>Supprimer cette idée ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Cette action est irréversible.
          </p>
          <DialogFooter className="flex gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setModalDelete(null)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="flex-1"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT MODAL ── */}
      <Dialog
        open={!!modalEdit}
        onOpenChange={open => !open && setModalEdit(null)}
      >
        <DialogContent className="sm:max-w-sm bg-sidebar">
          <DialogHeader>
            <DialogTitle>Modifier l'idée</DialogTitle>
          </DialogHeader>
          <Textarea
            value={modalEdit?.value ?? ''}
            onChange={e =>
              modalEdit && setModalEdit({ ...modalEdit, value: e.target.value })
            }
            rows={3}
            className="resize-none"
          />
          <DialogFooter>
            <Button
              onClick={confirmEdit}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              Valider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── COLOR MODAL ── */}
      <Dialog
        open={!!modalColor}
        onOpenChange={open => !open && setModalColor(null)}
      >
        <DialogContent className="sm:max-w-xs bg-sidebar">
          <DialogHeader>
            <DialogTitle>Choisir une couleur</DialogTitle>
          </DialogHeader>
          <div className="flex gap-3 justify-center py-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-md hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-400"
                style={{ backgroundColor: c }}
                aria-label={`Couleur ${c}`}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyIdeas;
