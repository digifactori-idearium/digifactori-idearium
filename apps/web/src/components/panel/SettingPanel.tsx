import { useSnapshot } from 'valtio';

import ConfigPanel from './ConfigPanel';
import { ObjectConfigPanel } from './ObjectPanel';

import { sceneState } from '@/stores';

export const SettingPanel = () => {
  const snap = useSnapshot(sceneState);
  const selectedObject = snap.selectedObjectId;

  if (!snap.settingPanelOpen) return null;

  return (
    <aside className="fixed right-3 top-20 bottom-3 w-80 z-50 animate-in slide-in-from-right duration-500">
      <div className="h-full w-full flex flex-col backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden text-white">
        {selectedObject ? <ObjectConfigPanel /> : <ConfigPanel />}
      </div>
    </aside>
  );
};
