import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Database, Plus, Camera, Trash2 } from 'lucide-react';

interface Filament {
  id: string;
  name: string;
  color: string;
  brand: string;
  totalWeight: number;
  remainingWeight: number;
  barcode: string;
}

export function InventoryScreen() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFilament, setNewFilament] = useState<Partial<Filament>>({
    color: '#ffffff',
    totalWeight: 1000,
    remainingWeight: 1000
  });

  useEffect(() => {
    // Load từ localStorage
    const saved = localStorage.getItem('bambu_filaments');
    if (saved) {
      try {
        setFilaments(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveFilaments = (data: Filament[]) => {
    setFilaments(data);
    localStorage.setItem('bambu_filaments', JSON.stringify(data));
  };

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render((decodedText) => {
        scanner.clear();
        setShowScanner(false);
        // Quét thành công
        setNewFilament(prev => ({ ...prev, barcode: decodedText }));
        setShowAddModal(true);
      }, (error) => {
        // Ignore errors during scan
      });

      return () => {
        scanner.clear().catch(e => {});
      };
    }
  }, [showScanner]);

  const handleAdd = () => {
    if (!newFilament.name) return;
    const item: Filament = {
      id: Date.now().toString(),
      name: newFilament.name,
      color: newFilament.color || '#ffffff',
      brand: newFilament.brand || 'Unknown',
      totalWeight: Number(newFilament.totalWeight) || 1000,
      remainingWeight: Number(newFilament.remainingWeight) || 1000,
      barcode: newFilament.barcode || ''
    };
    saveFilaments([...filaments, item]);
    setShowAddModal(false);
    setNewFilament({ color: '#ffffff', totalWeight: 1000, remainingWeight: 1000 });
  };

  const handleDelete = (id: string) => {
    saveFilaments(filaments.filter(f => f.id !== id));
  };

  return (
    <div className="w-full h-full bg-[#1e1e1f] text-white overflow-y-auto p-4 sm:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-normal flex items-center gap-3">
            <Database className="text-[#00e676]" size={28} />
            Kho Nhựa (Inventory)
          </h2>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowScanner(true)}
              className="bg-[#2a2a2b] hover:bg-[#353535] text-white px-3 py-2 rounded-lg border border-[#3a3a3c] transition-colors flex items-center gap-2"
            >
              <Camera size={20} className="text-[#00e676]"/>
              <span className="hidden sm:inline">Quét Mã Vạch</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#00e676] hover:bg-[#00c853] text-black px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Thêm Nhựa</span>
            </button>
          </div>
        </div>

        {/* Scanner Overlay */}
        {showScanner && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
             <div className="bg-white text-black p-4 rounded-xl w-full max-w-md relative">
               <button 
                 onClick={() => setShowScanner(false)}
                 className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold"
               >
                 Đóng X
               </button>
               <div id="reader" className="w-full bg-white rounded overflow-hidden"></div>
             </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
             <div className="bg-[#2a2a2b] border border-[#3a3a3c] rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-medium mb-4 text-[#00e676]">Thêm Cuộn Nhựa Mới</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#a0a0a0] mb-1">Tên Nhựa (VD: PLA Basic Xanh)</label>
                    <input type="text" value={newFilament.name || ''} onChange={e => setNewFilament({...newFilament, name: e.target.value})} className="w-full bg-[#1e1e1f] border border-[#3a3a3c] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00e676]" placeholder="Tên nhựa..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#a0a0a0] mb-1">Thương hiệu</label>
                      <input type="text" value={newFilament.brand || ''} onChange={e => setNewFilament({...newFilament, brand: e.target.value})} className="w-full bg-[#1e1e1f] border border-[#3a3a3c] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00e676]" placeholder="Bambu, Esun..." />
                    </div>
                    <div>
                      <label className="block text-sm text-[#a0a0a0] mb-1">Màu sắc</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={newFilament.color || '#ffffff'} onChange={e => setNewFilament({...newFilament, color: e.target.value})} className="h-10 w-10 rounded cursor-pointer bg-transparent border-0" />
                        <span className="text-sm uppercase">{newFilament.color}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#a0a0a0] mb-1">Trọng lượng (g)</label>
                      <input type="number" value={newFilament.totalWeight || ''} onChange={e => setNewFilament({...newFilament, totalWeight: Number(e.target.value)})} className="w-full bg-[#1e1e1f] border border-[#3a3a3c] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00e676]" />
                    </div>
                    <div>
                      <label className="block text-sm text-[#a0a0a0] mb-1">Còn lại (g)</label>
                      <input type="number" value={newFilament.remainingWeight || ''} onChange={e => setNewFilament({...newFilament, remainingWeight: Number(e.target.value)})} className="w-full bg-[#1e1e1f] border border-[#3a3a3c] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00e676]" />
                    </div>
                  </div>
                  {newFilament.barcode && (
                    <div>
                      <label className="block text-sm text-[#a0a0a0] mb-1">Mã Vạch</label>
                      <input type="text" disabled value={newFilament.barcode} className="w-full bg-[#1e1e1f] border border-[#3a3a3c] rounded-lg px-4 py-2 text-[#888]" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 rounded-lg border border-[#3a3a3c] text-white hover:bg-[#353535] transition-colors">Hủy</button>
                  <button onClick={handleAdd} className="flex-1 py-2 rounded-lg bg-[#00e676] text-black font-medium hover:bg-[#00c853] transition-colors">Lưu Nhựa</button>
                </div>
             </div>
          </div>
        )}

        {/* List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filaments.length === 0 ? (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-[#3a3a3c] rounded-xl text-[#a0a0a0]">
              <Database className="mx-auto text-[#555] mb-3" size={40} />
              <p>Kho nhựa đang trống.</p>
              <p className="text-sm">Bấm "Quét Mã Vạch" hoặc "Thêm Nhựa" để tạo mới dữ liệu.</p>
            </div>
          ) : (
            filaments.map(f => {
              const percent = Math.max(0, Math.min(100, Math.round((f.remainingWeight / f.totalWeight) * 100)));
              const isLow = percent < 15;
              
              return (
                <div key={f.id} className="bg-[#2a2a2b] border border-[#3a3a3c] rounded-xl p-5 relative overflow-hidden group hover:border-[#555] transition-colors">
                   <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: f.color }}></div>
                   <button onClick={() => handleDelete(f.id)} className="absolute top-4 right-4 text-[#555] hover:text-[#ff5252] opacity-0 group-hover:opacity-100 transition-opacity">
                     <Trash2 size={18} />
                   </button>
                   
                   <div className="pl-4">
                     <h3 className="font-medium text-lg mb-1">{f.name}</h3>
                     <p className="text-sm text-[#a0a0a0] mb-4">{f.brand}</p>
                     
                     <div className="flex justify-between text-sm mb-2">
                        <span className="text-[#a0a0a0]">Còn lại: <span className={isLow ? 'text-[#ff5252] font-medium' : 'text-white'}>{f.remainingWeight}g</span></span>
                        <span className="text-[#666]">{percent}%</span>
                     </div>
                     
                     <div className="w-full h-2 bg-[#1e1e1f] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-[#ff5252]' : 'bg-[#00e676]'}`} 
                          style={{ width: `${percent}%` }}
                        ></div>
                     </div>
                     
                     {f.barcode && (
                       <div className="mt-4 text-xs font-mono text-[#555] bg-[#1e1e1f] px-2 py-1 rounded inline-block">
                         {f.barcode}
                       </div>
                     )}
                   </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
