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
      {adventures.map((adventure) => (
        <div
          key={adventure.id}
          className=""
          style={{borderBottom: '1px solid white'}}
        >
          {adventure.coverImageUrl && (
            <div style={{ 
              marginBottom: '1rem',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              width: '100%',
              maxHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={adventure.coverImageUrl}
                alt={`Portada de ${adventure.title}`}
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  maxHeight: '200px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
          )}
          <div className="flex justify-between items-start" style={{marginBottom: 0}}>
            <h3 className="font-medium text-white" style={{marginBottom: 8}}>{adventure.title}</h3>
              <span className="text-xs text-gray-500">
              {adventure.updatedAt ? formatDate(adventure.updatedAt) : formatDate(adventure.createdAt)}
            </span>
        
          </div>
          
          <p className="text-gray-400 capitalize" style={{marginBottom: 24, fontSize: 20}}>{adventure.genre}</p> 
          
          <div className="flex justify-between items-center" style={{marginBottom: 16}}>
         
             <p className="text-sm text-gray-300" style={{marginBottom: 0}}>
            {adventure.steps.length} paso{adventure.steps.length !== 1 ? 's' : ''}
          </p>
            <Button
              onClick={() => handleLoadAdventure(adventure)}
              variant="secondary"
              size="sm"
              fullWidth={false}
            >
              Continuar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
