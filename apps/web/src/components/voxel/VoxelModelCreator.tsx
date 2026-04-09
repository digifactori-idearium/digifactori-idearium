import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { createVoxelModel } from '@/services/voxel.service';

const VoxelModelCreator: React.FC<{
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}> = ({ isOpen, setIsOpen }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error('Entre un nom pour ton modèle');
            return;
        }

        try {
            setLoading(true);
            const response = await createVoxelModel(name.trim());
            navigate(`/app/voxel/${response.data.id}`);
            setIsOpen(false);
            toast.success('Création du modèle réussie');
            setName('');
        } catch (error: any) {
            toast.error(error?.message || 'Échec de la création du modèle');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={open => {
                setIsOpen(open);
                if (!open) setName('');
            }}
        >
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden bg-sidebar! border-mauve! dialog-btn">
                <DialogHeader className="shrink-0">
                    <DialogTitle>Choisis le nom de ton nouveau modèle</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Nom du modèle</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Mon super modèle"
                            className="w-full rounded-xl border border-mauve/30 bg-white px-4 py-3 text-black outline-none"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="main-btn"
                    >
                        {loading ? 'Création...' : 'Envoyer'}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export { VoxelModelCreator };