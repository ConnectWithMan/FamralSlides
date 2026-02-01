import { CSSProperties } from 'react';

export type ElementType = 'text' | 'image' | 'shape' | 'icon' | 'diagram' | 'chart' | 'table';

export interface SlideElement {
  id: string;
  type: ElementType;
  content: string; // text content, image url, shape type, diagram JSON, chart JSON, or table JSON
  x: number;
  y: number;
  width: number;
  height: number;
  style: CSSProperties;
  animation?: string; // e.g., 'none', 'fade-in', 'fly-in-left', 'zoom-in', 'bounce', 'spin'
  animationDuration?: number; // duration in seconds
}

export interface Slide {
  id: string;
  elements: SlideElement[];
  background: string;
  pattern?: string; // ID of the pattern from utils/patterns.ts
  patternColor?: string; // Color of the pattern elements
  borderWidth?: number;
  borderColor?: string;
  transition?: string; // e.g., 'none', 'fade', 'slide-left', 'zoom'
  transitionDuration?: number; // duration in seconds
}

export interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
}

export interface EditorState {
  presentation: Presentation;
  currentSlideIndex: number;
  selectedElementId: string | null;
  isPresenting: boolean;
  isGenerating: boolean;
}