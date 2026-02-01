import React from 'react';
import { Slide, SlideElement } from '../types';
import { SlideElementWrapper } from './SlideElementWrapper';
import { getPatternStyle } from '../utils/patterns';

interface Props {
  slide: Slide;
  scale?: number;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onUpdateElement?: (id: string, updates: Partial<SlideElement>) => void;
  readOnly?: boolean;
  onElementContextMenu?: (e: React.MouseEvent, id: string) => void;
  onBackgroundContextMenu?: (e: React.MouseEvent) => void;
}

export const SlideStage: React.FC<Props> = ({ 
  slide, 
  scale = 1, 
  selectedElementId = null, 
  onSelectElement = (_id: string | null) => {}, 
  onUpdateElement = (_id: string, _updates: Partial<SlideElement>) => {},
  readOnly = false,
  onElementContextMenu,
  onBackgroundContextMenu
}) => {
  const CANVAS_WIDTH = 960;
  const CANVAS_HEIGHT = 540;

  const handleStageClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !readOnly) {
      onSelectElement(null);
    }
  };
  
  // Use patternColor if available, otherwise default to a subtle gray-300
  const patternStyle = getPatternStyle(slide.pattern, slide.patternColor || '#cbd5e1');

  // Slide Frame / Border Style
  const frameStyle: React.CSSProperties = {
    borderWidth: slide.borderWidth ? `${slide.borderWidth}px` : '0px',
    borderColor: slide.borderColor || 'transparent',
    borderStyle: 'solid',
    boxSizing: 'border-box'
  };

  return (
    <div 
      className="relative bg-white shadow-lg overflow-hidden transition-transform duration-200"
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        // Change from background to backgroundColor to ensure solid color
        backgroundColor: slide.background || '#ffffff',
        ...patternStyle,
        ...frameStyle
      }}
      onMouseDown={handleStageClick}
      onContextMenu={(e) => {
          if (!readOnly && onBackgroundContextMenu) {
              e.preventDefault();
              onBackgroundContextMenu(e);
          }
      }}
    >
      {slide.elements.map(el => (
        <SlideElementWrapper
          key={el.id}
          element={el}
          isSelected={selectedElementId === el.id}
          onSelect={(id) => onSelectElement(id)}
          onUpdate={onUpdateElement}
          readOnly={readOnly}
          onContextMenu={onElementContextMenu}
        />
      ))}
    </div>
  );
};