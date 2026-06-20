import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FilamentSpool {
  id: string; // Unique ID (uuid)
  name: string; // Tên do người dùng đặt
  brand: string; // Tên hãng
  type: string; // PLA, PETG, ABS...
  color: string; // Hex color (e.g. #FF0000)
  totalWeight: number; // Trọng lượng ban đầu (g)
  remainingWeight: number; // Trọng lượng còn lại (g)
  amsAssigned: number | null; // Null nếu chưa gán, 0-3 tương ứng với khay AMS
  updatedAt: number; // Timestamp
}

interface InventoryContextProps {
  spools: FilamentSpool[];
  addSpool: (spool: Omit<FilamentSpool, 'id' | 'updatedAt'>) => void;
  updateSpool: (id: string, updates: Partial<FilamentSpool>) => void;
  deleteSpool: (id: string) => void;
  assignToAms: (spoolId: string, amsSlot: number | null) => void;
  deductFilament: (amsSlot: number, gramsUsed: number) => void;
  getSpoolByAmsSlot: (amsSlot: number) => FilamentSpool | undefined;
}

const InventoryContext = createContext<InventoryContextProps | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'bambu_inventory_spools';

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [spools, setSpools] = useState<FilamentSpool[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse inventory from localStorage', e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(spools));
  }, [spools]);

  const addSpool = (spoolData: Omit<FilamentSpool, 'id' | 'updatedAt'>) => {
    const newSpool: FilamentSpool = {
      ...spoolData,
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      updatedAt: Date.now()
    };
    setSpools(prev => [...prev, newSpool]);
  };

  const updateSpool = (id: string, updates: Partial<FilamentSpool>) => {
    setSpools(prev => prev.map(spool => 
      spool.id === id ? { ...spool, ...updates, updatedAt: Date.now() } : spool
    ));
  };

  const deleteSpool = (id: string) => {
    setSpools(prev => prev.filter(spool => spool.id !== id));
  };

  const assignToAms = (spoolId: string, amsSlot: number | null) => {
    setSpools(prev => prev.map(spool => {
      // If unassigning, just clear it for this spool
      if (spool.id === spoolId) {
        return { ...spool, amsAssigned: amsSlot, updatedAt: Date.now() };
      }
      // If assigning a new slot, ensure no other spool has this slot
      if (amsSlot !== null && spool.amsAssigned === amsSlot) {
        return { ...spool, amsAssigned: null, updatedAt: Date.now() };
      }
      return spool;
    }));
  };

  const deductFilament = (amsSlot: number, gramsUsed: number) => {
    setSpools(prev => prev.map(spool => {
      if (spool.amsAssigned === amsSlot) {
        const newRemaining = Math.max(0, spool.remainingWeight - gramsUsed);
        return { ...spool, remainingWeight: newRemaining, updatedAt: Date.now() };
      }
      return spool;
    }));
  };

  const getSpoolByAmsSlot = (amsSlot: number) => {
    return spools.find(s => s.amsAssigned === amsSlot);
  };

  return (
    <InventoryContext.Provider value={{
      spools, addSpool, updateSpool, deleteSpool, assignToAms, deductFilament, getSpoolByAmsSlot
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
