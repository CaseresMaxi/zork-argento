import React, { useEffect, useState, useCallback } from 'react';
import type { AdventureDocument } from '../../types';
import { useAdventureStore } from '../../store';
import { useAuth } from '../../hooks';
import Button from './Button';

interface AdventureListProps {
  onSelectAdventure?: (adventure: AdventureDocument) => void;
}

export const AdventureList: React.FC<AdventureListProps> = ({ onSelectAdventure }) => {
  const { user } = useAuth();
  const { getUserAdventures, loadAdventure, isLoading } = useAdventureStore();
  const [adventures, setAdventures] = useState<AdventureDocument[]>([]);

  const loadUserAdventures = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const userAdventures = await getUserAdventures(user.id);
      setAdventures(userAdventures);
    } catch (error) {
      console.error('Error loading adventures:', error);
    }
  }, [user?.id, getUserAdventures]);

  useEffect(() => {
    if (user?.id) {
      loadUserAdventures();
    }
  }, [user?.id, loadUserAdventures]);

  const handleLoadAdventure = async (adventure: AdventureDocument) => {
    if (adventure.id && user?.id) {
      await loadAdventure(adventure.id, user.id);
      onSelectAdventure?.(adventure);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (adventures.length === 0) {
    return (
      <div className="text-center p-8 text-gray-400">
        <p>No tienes aventuras guardadas aún.</p>
        <p className="text-sm mt-2">¡Comienza una nueva aventura para verla aquí!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-amber-400 mb-4">Tus Aventuras</h3>
      {adventures.map((adventure) => (
        <div
          key={adventure.id}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-amber-600 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-white">{adventure.title}</h4>
            <span className="text-xs text-gray-400 capitalize">{adventure.genre}</span>
          </div>
          
          <p className="text-sm text-gray-300 mb-2">
            {adventure.steps.length} paso{adventure.steps.length !== 1 ? 's' : ''}
          </p>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {adventure.updatedAt ? formatDate(adventure.updatedAt) : formatDate(adventure.createdAt)}
            </span>
            
            <Button
              onClick={() => handleLoadAdventure(adventure)}
              variant="secondary"
              size="sm"
            >
              Continuar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
