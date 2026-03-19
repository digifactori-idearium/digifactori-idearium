const cleanupMap = new Map<string, () => void>();

export function setCleanup(actionId: string, fn: () => void) {
  cleanupMap.get(actionId)?.();
  cleanupMap.set(actionId, fn);
}

export function runCleanup(actionId: string) {
  cleanupMap.get(actionId)?.();
  cleanupMap.delete(actionId);
}

export function runAllCleanups(objectId: string, actions: ActionConfig[]) {
  actions.forEach(a => runCleanup(a.id));
}

type TickFn = (delta: number) => void;
const _tickers = new Set<TickFn>();
let _rafId = 0;
let _lastTime = 0;

function _loop(now: number) {
  const delta = Math.min((now - _lastTime) / 1000, 0.1);
  _lastTime = now;
  _tickers.forEach(fn => fn(delta));
  if (_tickers.size > 0) _rafId = requestAnimationFrame(_loop);
}

export function addTicker(fn: TickFn): () => void {
  if (_tickers.size === 0) {
    _lastTime = performance.now();
    _rafId = requestAnimationFrame(_loop);
  }
  _tickers.add(fn);
  return () => {
    _tickers.delete(fn);
    if (_tickers.size === 0) cancelAnimationFrame(_rafId);
  };
}
