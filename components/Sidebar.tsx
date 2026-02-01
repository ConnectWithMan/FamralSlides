import React, { useState, useEffect } from 'react';
import { Slide } from '../types';
import { SlideStage } from './SlideStage';
import { Plus, Copy, Trash2 } from 'lucide-react';

interface Props {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
  onAddSlide: () => void;
  onDeleteSlide: (slideId: string) => void;
  onDuplicateSlide: (slideId: string) => void;
  onReorderSlides: (fromIndex: number, toIndex: number) => void;
}

export const Sidebar: React.FC<Props> = ({ 
    slides, 
    currentSlideIndex, 
    onSlideSelect, 
    onAddSlide,
    onDeleteSlide,
    onDuplicateSlide,
    onReorderSlides
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, slideId: string } | null>(null);
  
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, slideId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, slideId });
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Optional: We could set a custom drag image here
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Essential to allow dropping
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorderSlides(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-y-auto" onContextMenu={(e) => e.preventDefault()}>
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <button 
          onClick={onAddSlide}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>New Slide</span>
        </button>
      </div>
      
      <div className="flex flex-col gap-4 p-4 pb-20">
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            draggable
            onClick={() => onSlideSelect(index)}
            onContextMenu={(e) => handleContextMenu(e, slide.id)}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`cursor-pointer group flex gap-2 transition-all relative rounded p-1
              ${index === currentSlideIndex ? 'bg-blue-50' : 'hover:bg-gray-100'}
              ${draggedIndex === index ? 'opacity-40' : ''}
              ${dragOverIndex === index ? 'ring-2 ring-blue-400 ring-dashed' : ''}
              ${index === currentSlideIndex && dragOverIndex !== index ? 'ring-2 ring-blue-500' : ''}
            `}
          >
            <div className="w-6 flex flex-col items-center pt-2 font-medium text-gray-400 text-sm select-none">
              {index + 1}
            </div>
            <div className="relative border border-gray-200 bg-white shadow-sm pointer-events-none" style={{ width: 160, height: 90 }}>
               <div style={{ transform: 'scale(0.166)', transformOrigin: 'top left', width: 960, height: 540 }}>
                 <SlideStage slide={slide} readOnly />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          style={{ top: contextMenu.y, left: contextMenu.x }} 
          className="fixed bg-white border border-gray-200 shadow-xl rounded-lg z-50 py-1 min-w-[140px] animate-in fade-in zoom-in duration-100"
        >
           <button 
             onClick={() => onDuplicateSlide(contextMenu.slideId)}
             className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
           >
             <Copy size={14} />
             Duplicate
           </button>
           <button 
             onClick={() => onDeleteSlide(contextMenu.slideId)}
             className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
           >
             <Trash2 size={14} />
             Delete
           </button>
        </div>
      )}
    </div>
  );
};