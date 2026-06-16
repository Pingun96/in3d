import React, { useState } from 'react';
import { Search, Download, Heart, Eye, Filter, Box } from 'lucide-react';

const mockTrending = [
  {
    id: 1,
    name: '3D Benchy',
    creator: 'CreativeTools',
    image: 'https://cdn.thingiverse.com/renders/bc/65/5b/18/76/3DBenchy_preview_featured.jpg',
    likes: 12450,
    views: 45000,
    tags: ['Calibration', 'Test']
  },
  {
    id: 2,
    name: 'Articulated Dragon',
    creator: 'McGybeer',
    image: 'https://cdn.thingiverse.com/renders/71/6c/cf/70/4c/7c229713c7bc384bc1335b71db48d5d3_preview_featured.jpg',
    likes: 8520,
    views: 32100,
    tags: ['Articulated', 'Toy']
  },
  {
    id: 3,
    name: 'Low Poly Pikachu',
    creator: 'Flowalistik',
    image: 'https://cdn.thingiverse.com/renders/49/ee/18/f3/f9/pikachu_preview_featured.jpg',
    likes: 6730,
    views: 28000,
    tags: ['Pokemon', 'Low Poly']
  },
  {
    id: 4,
    name: 'XYZ 20mm Calibration Cube',
    creator: 'iDig3Dprinting',
    image: 'https://cdn.thingiverse.com/renders/12/32/7a/d5/9c/xyzCalibration_cube_preview_featured.jpg',
    likes: 9200,
    views: 41000,
    tags: ['Calibration', 'Cube']
  },
  {
    id: 5,
    name: 'Phone Stand (Print in Place)',
    creator: 'SoniaVerdu',
    image: 'https://cdn.thingiverse.com/renders/98/e6/a1/3f/7e/IMG_20160205_120614_preview_featured.jpg',
    likes: 4150,
    views: 15200,
    tags: ['Utility', 'Stand']
  },
  {
    id: 6,
    name: 'Flexi Rex',
    creator: 'DrLex',
    image: 'https://cdn.thingiverse.com/renders/83/8f/c7/2a/3e/Flexi-Rex_preview_featured.JPG',
    likes: 15600,
    views: 55000,
    tags: ['Flexi', 'Dinosaur']
  }
];

export function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mockTrending.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-[#1e1e1f] text-white overflow-y-auto p-4 sm:p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-normal flex items-center gap-3">
            <Box className="text-[#00e676]" size={28} />
            Thư Viện Mô Hình
          </h2>
          
          <div className="flex gap-2">
            <div className="relative w-full md:w-64">
              <input 
                type="text" 
                placeholder="Tìm kiếm MakerWorld / Thingiverse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#2a2a2b] border border-[#3a3a3c] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#00e676]"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
            </div>
            <button className="bg-[#2a2a2b] p-2 rounded-lg border border-[#3a3a3c] hover:bg-[#353535] transition-colors">
              <Filter size={20} className="text-[#a0a0a0]" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {['Trending', 'Newest', 'Art', 'Gadgets', 'Toys', 'Tools', 'Home'].map((cat, i) => (
            <button 
              key={cat}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${i === 0 ? 'bg-[#00e676] text-black' : 'bg-[#2a2a2b] text-[#a0a0a0] hover:bg-[#353535] border border-[#3a3a3c]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(item => (
            <div key={item.id} className="bg-[#2a2a2b] rounded-xl overflow-hidden border border-[#3a3a3c] group hover:border-[#555] transition-colors flex flex-col">
              <div className="relative aspect-square overflow-hidden bg-[#111]">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/2a2a2b/00e676?text=3D+Model' }}
                />
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-8 h-8 bg-black/60 backdrop-blur rounded-full flex items-center justify-center hover:bg-[#00e676] hover:text-black transition-colors" title="Download">
                    <Download size={14} />
                  </button>
                  <button className="w-8 h-8 bg-black/60 backdrop-blur rounded-full flex items-center justify-center hover:bg-[#ff5252] hover:text-white transition-colors" title="Like">
                    <Heart size={14} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-medium text-[15px] mb-1 line-clamp-1" title={item.name}>{item.name}</h3>
                <p className="text-xs text-[#a0a0a0] mb-3">by {item.creator}</p>
                
                <div className="flex flex-wrap gap-1 mb-4 mt-auto">
                  {item.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-[#1e1e1f] text-[#888] px-2 py-0.5 rounded border border-[#333]">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-[#888] text-xs pt-3 border-t border-[#3a3a3c]">
                  <div className="flex items-center gap-1">
                    <Heart size={12} />
                    <span>{(item.likes / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={12} />
                    <span>{(item.views / 1000).toFixed(1)}k</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filtered.length === 0 && (
          <div className="text-center py-20 text-[#888]">
            Không tìm thấy mô hình nào phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}
