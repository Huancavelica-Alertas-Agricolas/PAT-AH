import { useState, useEffect } from 'react';
import { CropType } from '../types';

export interface Crop {
  id: string;
  name: string;
  type: CropType;
  area: number;
  location: string;
  plantingDate?: Date;
  harvestDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AddCropData {
  name: string;
  type: CropType;
  area: number;
  location: string;
  plantingDate?: Date;
  harvestDate?: Date;
  notes?: string;
}

interface UpdateCropData {
  name?: string;
  type?: CropType;
  area?: number;
  location?: string;
  plantingDate?: Date;
  harvestDate?: Date;
  notes?: string;
}

export const useCrops = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar cultivos desde localStorage al inicializar
  useEffect(() => {
    setIsLoading(true);
    try {
      const savedCrops = localStorage.getItem('crops');
      let parsedCrops: Crop[] = [];
      if (savedCrops) {
        parsedCrops = JSON.parse(savedCrops).map((crop: any) => ({
          ...crop,
          plantingDate: crop.plantingDate ? new Date(crop.plantingDate) : undefined,
          harvestDate: crop.harvestDate ? new Date(crop.harvestDate) : undefined,
          createdAt: new Date(crop.createdAt),
          updatedAt: new Date(crop.updatedAt)
        }));
      }
      // Si no hay cultivos, solo rellenar demo cuando VITE_OFFLINE_DEMO está explícitamente habilitado
      if (!parsedCrops || parsedCrops.length === 0) {
        const OFFLINE_DEMO = (import.meta.env.VITE_OFFLINE_DEMO as string) === 'true';
        if (OFFLINE_DEMO) {
          parsedCrops = [
            {
              id: '1',
              name: 'Papa Blanca Lote Norte',
              type: 'papa',
              area: 2.5,
              location: 'Sector Alto Verde',
              plantingDate: new Date('2025-03-15'),
              harvestDate: new Date('2025-08-15'),
              createdAt: new Date('2025-03-01'),
              updatedAt: new Date('2025-03-01')
            },
            {
              id: '2',
              name: 'Maíz Amarillo Lote Sur',
              type: 'maiz',
              area: 1.8,
              location: 'Sector Bajo Verde',
              plantingDate: new Date('2025-04-01'),
              harvestDate: new Date('2025-09-01'),
              createdAt: new Date('2025-03-20'),
              updatedAt: new Date('2025-03-20')
            }
          ];
          localStorage.setItem('crops', JSON.stringify(parsedCrops));
        } else {
          parsedCrops = [];
        }
      }
      setCrops(parsedCrops);
    } catch (error) {
      console.error('Error loading crops:', error);
      setCrops([]);
    }
    setIsLoading(false);
  }, []);

  // Guardar cultivos en localStorage cuando cambie el estado
  const saveCrops = (newCrops: Crop[]) => {
    try {
      localStorage.setItem('crops', JSON.stringify(newCrops));
      setCrops(newCrops);
    } catch (error) {
      console.error('Error saving crops:', error);
    }
  };

  const addCrop = (cropData: AddCropData) => {
    const newCrop: Crop = {
      id: Date.now().toString(),
      ...cropData,
      area: Number(cropData.area),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedCrops = [...crops, newCrop];
    saveCrops(updatedCrops);
    return newCrop;
  };

  const updateCrop = (cropId: string, updateData: UpdateCropData) => {
    const updatedCrops = crops.map(crop => {
      if (crop.id === cropId) {
        return {
          ...crop,
          ...updateData,
          area: updateData.area ? Number(updateData.area) : crop.area,
          updatedAt: new Date()
        };
      }
      return crop;
    });

    saveCrops(updatedCrops);
    return updatedCrops.find(crop => crop.id === cropId);
  };

  const deleteCrop = (cropId: string) => {
    const updatedCrops = crops.filter(crop => crop.id !== cropId);
    saveCrops(updatedCrops);
  };

  const getCropById = (cropId: string) => {
    return crops.find(crop => crop.id === cropId);
  };

  const getCropsByType = (type: CropType) => {
    return crops.filter(crop => crop.type === type);
  };

  const getActiveCrops = () => {
    const now = new Date();
    return crops.filter(crop => {
      // Un cultivo está activo si está en proceso de crecimiento
      const hasPlantingDate = crop.plantingDate && crop.plantingDate <= now;
      const notHarvested = !crop.harvestDate || crop.harvestDate > now;
      return hasPlantingDate && notHarvested;
    });
  };

  const getTotalArea = () => {
    return crops.reduce((total, crop) => total + crop.area, 0);
  };

  const getCropStats = () => {
    const total = crops.length;
    const byType = crops.reduce((acc, crop) => {
      acc[crop.type] = (acc[crop.type] || 0) + 1;
      return acc;
    }, {} as Record<CropType, number>);

    const active = getActiveCrops().length;
    const totalArea = getTotalArea();

    return {
      total,
      active,
      totalArea,
      byType
    };
  };

  return {
    crops,
    isLoading,
    addCrop,
    updateCrop,
    deleteCrop,
    getCropById,
    getCropsByType,
    getActiveCrops,
    getTotalArea,
    getCropStats
  };
};