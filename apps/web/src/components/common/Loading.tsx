export function Loading() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="w-10 h-10 rounded-full border-4 border-violet-300 border-t-violet-600 animate-spin" />
        <p className="text-sm font-medium">Chargement…</p>
      </div>
    </div>
  );
}
