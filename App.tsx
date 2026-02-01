import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { SlideStage } from './components/SlideStage';
import { Presentation, Slide, SlideElement, ElementType } from './types';
import { generateTextContent, generateFullSlideElements, generateImage } from './services/geminiService';
import { X, Plus, Minus, Maximize, Copy, Trash2, Clipboard, ArrowUpFromLine, ArrowDownFromLine, CopyPlus, PanelRight, Scissors } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';

const INITIAL_SLIDE: Slide = {
  id: 'slide-1',
  background: '#ffffff',
  elements: [
    {
      id: 'title-1',
      type: 'text',
      content: 'Famral Slides',
      x: 100,
      y: 100,
      width: 760,
      height: 100,
      style: { fontSize: '48px', fontWeight: 'bold', color: '#1f2937', textAlign: 'center' }
    },
    {
      id: 'subtitle-1',
      type: 'text',
      content: 'Click to edit subtitle',
      x: 200,
      y: 220,
      width: 560,
      height: 60,
      style: { fontSize: '24px', color: '#6b7280', textAlign: 'center' }
    }
  ],
  transition: 'none',
  transitionDuration: 0.5
};

const INITIAL_PRESENTATION: Presentation = {
  id: 'pres-1',
  title: 'Untitled Presentation',
  slides: [INITIAL_SLIDE]
};

function App() {
  const [presentation, setPresentation] = useState<Presentation>(INITIAL_PRESENTATION);
  const [past, setPast] = useState<Presentation[]>([]);
  const [future, setFuture] = useState<Presentation[]>([]);
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Zoom state
  const [zoom, setZoom] = useState(0.8);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'element' | 'slide', targetId?: string } | null>(null);
  const [clipboard, setClipboard] = useState<SlideElement | null>(null);

  const stageContainerRef = useRef<HTMLDivElement>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('famral-slides-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPresentation(parsed);
      } catch (e) {
        console.error("Failed to load saved presentation");
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('famral-slides-data', JSON.stringify(presentation));
  }, [presentation]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // --- History Management ---

  const pushToHistory = useCallback((newPresentation: Presentation) => {
    setPast(prev => [...prev, presentation]);
    setPresentation(newPresentation);
    setFuture([]);
  }, [presentation]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    
    setFuture(prev => [presentation, ...prev]);
    setPresentation(previous);
    setPast(newPast);
    
    if (currentSlideIndex >= previous.slides.length) {
      setCurrentSlideIndex(previous.slides.length - 1);
    }
  }, [past, presentation, currentSlideIndex]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setPast(prev => [...prev, presentation]);
    setPresentation(next);
    setFuture(newFuture);

    if (currentSlideIndex >= next.slides.length) {
      setCurrentSlideIndex(next.slides.length - 1);
    }
  }, [future, presentation, currentSlideIndex]);

  // --- State Updates ---

  const currentSlide = presentation.slides[currentSlideIndex];

  const updateSlide = useCallback((slideId: string, updates: Partial<Slide>) => {
    setPresentation(prev => {
        const newSlides = prev.slides.map(s => s.id === slideId ? { ...s, ...updates } : s);
        return { ...prev, slides: newSlides };
    });
  }, []);

  const updateSlideWithHistory = (slideId: string, updates: Partial<Slide>) => {
    const newSlides = presentation.slides.map(s => s.id === slideId ? { ...s, ...updates } : s);
    pushToHistory({ ...presentation, slides: newSlides });
  };

  const updateElement = (elementId: string, updates: Partial<SlideElement>) => {
    const slide = presentation.slides[currentSlideIndex];
    const updatedElements = slide.elements.map(el => 
      el.id === elementId ? { ...el, ...updates, style: { ...el.style, ...updates.style } } : el
    );
    updateSlideWithHistory(slide.id, { elements: updatedElements });
  };

  const addElement = (type: ElementType, initialContent?: string, initialStyle?: React.CSSProperties) => {
    const defaultContent = type === 'text' ? 'New Text' : type === 'image' ? 'https://picsum.photos/400/300' : 'rectangle';
    const content = initialContent || defaultContent;

    let width = 200;
    let height = 200;
    let style: React.CSSProperties = {};

    if (type === 'text') {
        width = 400;
        height = 100;
        style = { fontSize: '24px', color: '#000000', lineHeight: '1.4' };
    } else if (type === 'shape') {
        width = 200;
        height = 200;
        style = { backgroundColor: '#3b82f6' };
    } else if (type === 'icon') {
        width = 80;
        height = 80;
        style = { color: '#4b5563' };
    } else if (type === 'table') {
        width = 400;
        height = 200;
        style = { borderColor: '#e5e7eb', backgroundColor: '#ffffff', color: '#1f2937', borderWidth: '1px' };
    }

    if (initialStyle) {
        style = { ...style, ...initialStyle };
        if (initialStyle.fontSize && parseInt(initialStyle.fontSize as string) > 40) {
            height = 120;
        }
    }

    const newElement: SlideElement = {
      id: crypto.randomUUID(),
      type,
      content,
      x: 300,
      y: 200,
      width,
      height,
      style
    };

    updateSlideWithHistory(currentSlide.id, {
      elements: [...currentSlide.elements, newElement]
    });
    setSelectedElementId(newElement.id);
  };
  
  const deleteElement = useCallback(() => {
    if (!selectedElementId) return;
    const slide = presentation.slides[currentSlideIndex];
    const newElements = slide.elements.filter(el => el.id !== selectedElementId);
    updateSlideWithHistory(slide.id, { elements: newElements });
    setSelectedElementId(null);
  }, [selectedElementId, presentation.slides, currentSlideIndex, pushToHistory, presentation]);

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      background: '#ffffff',
      elements: [],
      transition: 'none',
      transitionDuration: 0.5
    };
    pushToHistory({
      ...presentation,
      slides: [...presentation.slides, newSlide]
    });
    setCurrentSlideIndex(presentation.slides.length);
  };

  const handleDeleteSlide = (slideId: string) => {
    if (presentation.slides.length <= 1) {
        alert("Cannot delete the only slide in the presentation.");
        return;
    }
    const indexToDelete = presentation.slides.findIndex(s => s.id === slideId);
    if (indexToDelete === -1) return;
    const newSlides = presentation.slides.filter(s => s.id !== slideId);
    let newIndex = currentSlideIndex;
    if (indexToDelete === currentSlideIndex) {
        newIndex = Math.max(0, indexToDelete - 1);
    } else if (indexToDelete < currentSlideIndex) {
        newIndex = currentSlideIndex - 1;
    }
    newIndex = Math.min(newIndex, newSlides.length - 1);
    pushToHistory({ ...presentation, slides: newSlides });
    setCurrentSlideIndex(newIndex);
  };

  const handleDuplicateSlide = (slideId: string) => {
    const index = presentation.slides.findIndex(s => s.id === slideId);
    if (index === -1) return;
    const originalSlide = presentation.slides[index];
    const newSlide: Slide = {
        ...originalSlide,
        id: crypto.randomUUID(),
        elements: originalSlide.elements.map(el => ({
            ...el,
            id: crypto.randomUUID()
        }))
    };
    const newSlides = [...presentation.slides];
    newSlides.splice(index + 1, 0, newSlide);
    pushToHistory({ ...presentation, slides: newSlides });
    setCurrentSlideIndex(index + 1);
  };

  const handleReorderSlides = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newSlides = [...presentation.slides];
    const [movedSlide] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, movedSlide);
    let newCurrentIndex = currentSlideIndex;
    if (currentSlideIndex === fromIndex) {
        newCurrentIndex = toIndex;
    } else if (fromIndex < currentSlideIndex && toIndex >= currentSlideIndex) {
        newCurrentIndex -= 1;
    } else if (fromIndex > currentSlideIndex && toIndex <= currentSlideIndex) {
        newCurrentIndex += 1;
    }
    pushToHistory({ ...presentation, slides: newSlides });
    setCurrentSlideIndex(newCurrentIndex);
  };

  const handleAIGenerate = async (type: 'content' | 'image' | 'slide', topic: string) => {
    setIsGenerating(true);
    try {
      if (type === 'content') {
        const text = await generateTextContent(topic);
        addElement('text', text, { width: 600, height: 200 });
      } else if (type === 'image') {
        const imageUrl = await generateImage(topic);
        addElement('image', imageUrl, { width: 400, height: 300 });
      } else if (type === 'slide') {
        const elementsData = await generateFullSlideElements(topic);
        const newSlide: Slide = {
          id: crypto.randomUUID(),
          background: '#ffffff',
          elements: elementsData.map(el => ({
            ...el,
            id: crypto.randomUUID()
          })),
          transition: 'fade',
          transitionDuration: 0.5
        };
        pushToHistory({
          ...presentation,
          slides: [...presentation.slides, newSlide]
        });
        setCurrentSlideIndex(presentation.slides.length);
      }
    } catch (error) {
      alert("Failed to generate AI content. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFindReplace = (findText: string, replaceText: string, matchCase: boolean) => {
    if (!findText) return;
    const newSlides = presentation.slides.map(slide => ({
        ...slide,
        elements: slide.elements.map(el => {
            if (el.type === 'text') {
                const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), matchCase ? 'g' : 'gi');
                return {
                    ...el,
                    content: el.content.replace(regex, replaceText)
                };
            }
            return el;
        })
    }));
    pushToHistory({ ...presentation, slides: newSlides });
  };

  const handleApplyTransitionToAll = (transition: string, duration: number) => {
      const newSlides = presentation.slides.map(s => ({
          ...s,
          transition,
          transitionDuration: duration
      }));
      pushToHistory({ ...presentation, slides: newSlides });
  };

  const handleExport = async (format: 'json' | 'pdf' | 'pptx' | 'image') => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    try {
        if (format === 'json') {
             const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(presentation));
             const link = document.createElement('a');
             link.href = dataStr;
             link.download = `${presentation.title || 'presentation'}.json`;
             link.click();
        } else if (format === 'image') {
            const slideElement = document.getElementById(`export-slide-${currentSlideIndex}`);
            if (slideElement) {
                const canvas = await html2canvas(slideElement, { useCORS: true, scale: 2, backgroundColor: null, logging: false });
                const link = document.createElement('a');
                link.download = `slide-${currentSlideIndex + 1}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        } else if (format === 'pdf') {
            const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [960, 540] });
            const slides = presentation.slides;
            for (let i = 0; i < slides.length; i++) {
                const slideElement = document.getElementById(`export-slide-${i}`);
                if (slideElement) {
                    if (i > 0) doc.addPage();
                    const canvas = await html2canvas(slideElement, { useCORS: true, scale: 2, logging: false });
                    const imgData = canvas.toDataURL('image/jpeg', 0.95);
                    doc.addImage(imgData, 'JPEG', 0, 0, 960, 540);
                }
            }
            doc.save(`${presentation.title || 'presentation'}.pdf`);
        } else if (format === 'pptx') {
            const pres = new PptxGenJS();
            pres.layout = 'LAYOUT_16x9'; 
            pres.title = presentation.title;
            presentation.slides.forEach((slideData) => {
                const slide = pres.addSlide();
                if (slideData.background && slideData.background !== '#ffffff') {
                    slide.background = { color: slideData.background.replace('#', '') };
                }
                slideData.elements.forEach(el => {
                    const x = (el.x / 960) * 100 + '%';
                    const y = (el.y / 540) * 100 + '%';
                    const w = (el.width / 960) * 100 + '%';
                    const h = (el.height / 540) * 100 + '%';
                    if (el.type === 'text') {
                        slide.addText(el.content, {
                            x, y, w, h,
                            fontSize: parseInt(el.style.fontSize as string) || 16,
                            color: (el.style.color as string)?.replace('#', '') || '000000',
                            bold: el.style.fontWeight === 'bold',
                            italic: el.style.fontStyle === 'italic',
                            align: el.style.textAlign as any || 'left',
                            fontFace: el.style.fontFamily || 'Arial',
                            fill: el.style.backgroundColor ? { color: (el.style.backgroundColor as string).replace('#', '') } : undefined
                        });
                    } else if (el.type === 'image') {
                        slide.addImage({ path: el.content, x, y, w, h });
                    } else if (el.type === 'shape') {
                        let shapeType = pres.ShapeType.rect;
                        switch (el.content) {
                            case 'circle': shapeType = pres.ShapeType.ellipse; break;
                            case 'triangle': shapeType = pres.ShapeType.triangle; break;
                            case 'diamond': shapeType = pres.ShapeType.diamond; break;
                            case 'star': shapeType = pres.ShapeType.star5; break;
                            default: shapeType = pres.ShapeType.rect;
                        }
                        slide.addShape(shapeType, {
                            x, y, w, h,
                            fill: { color: (el.style.backgroundColor as string)?.replace('#', '') || 'CCCCCC' },
                            line: el.style.borderWidth ? { color: (el.style.borderColor as string)?.replace('#', '') || '000000', width: parseInt(el.style.borderWidth as string) } : undefined
                        });
                    }
                });
            });
            pres.writeFile({ fileName: `${presentation.title || 'presentation'}.pptx` });
        }
    } catch (error) {
        console.error("Export failed:", error);
        alert("An error occurred during export.");
    } finally {
        setIsExporting(false);
    }
  };

  const handleCreateNew = () => {
    if (confirm("Create new presentation? Unsaved changes will be lost.")) {
        setPresentation(INITIAL_PRESENTATION);
        setPast([]);
        setFuture([]);
        setCurrentSlideIndex(0);
        setSelectedElementId(null);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              try {
                  if (event.target?.result) {
                      const imported = JSON.parse(event.target.result as string);
                      if (imported.slides && Array.isArray(imported.slides)) {
                           setPresentation(imported);
                           setPast([]);
                           setFuture([]);
                           setCurrentSlideIndex(0);
                           setSelectedElementId(null);
                      } else { alert("Invalid presentation file format."); }
                  }
              } catch (err) { alert("Failed to import presentation."); }
          };
          reader.readAsText(file);
      }
      e.target.value = '';
  };
  
  const handleElementContextMenu = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'element', targetId: elementId });
  };

  const handleSlideContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'slide' });
  };

  const handleCopy = () => {
    const targetId = contextMenu?.targetId || selectedElementId;
    if (targetId) {
        const el = currentSlide.elements.find(e => e.id === targetId);
        if (el) setClipboard(el);
    }
    setContextMenu(null);
  };

  const handleCut = () => {
      const targetId = contextMenu?.targetId || selectedElementId;
      if (targetId) {
          const el = currentSlide.elements.find(e => e.id === targetId);
          if (el) {
              setClipboard(el);
              const newElements = currentSlide.elements.filter(e => e.id !== targetId);
              updateSlideWithHistory(currentSlide.id, { elements: newElements });
              setSelectedElementId(null);
          }
      }
      setContextMenu(null);
  };

  const handleDuplicate = () => {
   const targetId = contextMenu?.targetId || selectedElementId;
   if (targetId) {
        const el = currentSlide.elements.find(e => e.id === targetId);
        if (el) {
            const newEl = { ...el, id: crypto.randomUUID(), x: el.x + 20, y: el.y + 20 };
            updateSlideWithHistory(currentSlide.id, { elements: [...currentSlide.elements, newEl] });
            setSelectedElementId(newEl.id);
        }
   }
   setContextMenu(null);
  };

  const handleDeleteFromMenu = () => {
    const targetId = contextMenu?.targetId || selectedElementId;
    if (targetId) {
        const newElements = currentSlide.elements.filter(el => el.id !== targetId);
        updateSlideWithHistory(currentSlide.id, { elements: newElements });
        setSelectedElementId(null);
    }
    setContextMenu(null);
  };

  const handlePaste = useCallback(() => {
    if (clipboard) {
         const newEl = { ...clipboard, id: crypto.randomUUID(), x: clipboard.x + 20, y: clipboard.y + 20 };
         setPresentation(prev => {
             const slides = [...prev.slides];
             const slideIndex = prev.slides.findIndex(s => s.id === currentSlide.id);
             if (slideIndex === -1) return prev;
             const slide = slides[slideIndex];
             slides[slideIndex] = { ...slide, elements: [...slide.elements, newEl] };
             return { ...prev, slides };
         });
         setSelectedElementId(newEl.id);
    }
    setContextMenu(null);
  }, [clipboard, currentSlide.id]);

  const handleBringToFront = () => {
    if (contextMenu?.targetId) {
         const elIndex = currentSlide.elements.findIndex(e => e.id === contextMenu.targetId);
         if (elIndex === -1) return;
         const newElements = [...currentSlide.elements];
         const [el] = newElements.splice(elIndex, 1);
         newElements.push(el);
         updateSlideWithHistory(currentSlide.id, { elements: newElements });
    }
    setContextMenu(null);
  };

  const handleSendToBack = () => {
    if (contextMenu?.targetId) {
         const elIndex = currentSlide.elements.findIndex(e => e.id === contextMenu.targetId);
         if (elIndex === -1) return;
         const newElements = [...currentSlide.elements];
         const [el] = newElements.splice(elIndex, 1);
         newElements.unshift(el);
         updateSlideWithHistory(currentSlide.id, { elements: newElements });
    }
    setContextMenu(null);
  };

  const handleScreenshot = async () => {
    const stage = document.getElementById('main-slide-stage');
    if (stage) {
      const canvas = await html2canvas(stage, { useCORS: true, backgroundColor: null });
      const dataUrl = canvas.toDataURL('image/png');
      addElement('image', dataUrl, { width: 320, height: 180 });
    }
  };

  const handleFitToWindow = useCallback(() => {
    if (stageContainerRef.current) {
        const { clientWidth, clientHeight } = stageContainerRef.current;
        const scale = Math.min((clientWidth - 64) / 960, (clientHeight - 64) / 540);
        setZoom(parseFloat(scale.toFixed(2)));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPresenting) {
        if (e.key === 'ArrowRight' || e.key === 'Space') { setCurrentSlideIndex(prev => Math.min(prev + 1, presentation.slides.length - 1)); }
        else if (e.key === 'ArrowLeft') { setCurrentSlideIndex(prev => Math.max(prev - 1, 0)); }
        else if (e.key === 'Escape') { setIsPresenting(false); }
        return;
      }
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      } else if (isCmdOrCtrl && e.key === 'y') { e.preventDefault(); redo(); }
      else if (isCmdOrCtrl && e.key === 'x') {
          const activeEl = document.activeElement as HTMLElement;
          if (!(activeEl?.isContentEditable || activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA') && selectedElementId) { e.preventDefault(); handleCut(); }
      } else if (isCmdOrCtrl && e.key === 'c') {
          const activeEl = document.activeElement as HTMLElement;
          if (!(activeEl?.isContentEditable || activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA') && selectedElementId) { e.preventDefault(); handleCopy(); }
      } else if (isCmdOrCtrl && e.key === 'v') {
          const activeEl = document.activeElement as HTMLElement;
          if (!(activeEl?.isContentEditable || activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA')) { e.preventDefault(); handlePaste(); }
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !isCmdOrCtrl) {
        const activeEl = document.activeElement as HTMLElement;
        if (activeEl?.tagName?.toLowerCase() !== 'input' && activeEl?.tagName?.toLowerCase() !== 'textarea' && !activeEl?.isContentEditable && selectedElementId) { e.preventDefault(); deleteElement(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, presentation.slides.length, undo, redo, deleteElement, selectedElementId, handleCut, handleCopy, handlePaste]);

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 font-sans overflow-hidden">
      <div className="h-10 bg-[#f3f4f6] border-b border-gray-300 flex items-center px-4 justify-between select-none">
        <div className="flex items-center gap-3">
          <img src="https://www.famral.com/image/slides.png" alt="Famral Slides Logo" className="h-6 w-6 object-contain" />
          <span className="font-semibold text-sm text-gray-700">Famral Slides</span>
          <div className="h-4 w-px bg-gray-300 mx-1"></div>
          <input 
            value={presentation.title}
            onChange={(e) => setPresentation(p => ({...p, title: e.target.value}))}
            className="text-sm bg-transparent border-transparent hover:border-gray-300 border px-1.5 py-0.5 rounded focus:border-blue-500 focus:outline-none focus:bg-white transition-colors text-gray-700"
          />
        </div>
      </div>

      <Toolbar 
        onAddElement={addElement}
        onPresent={() => setIsPresenting(true)}
        onGenerateAI={(topic) => handleAIGenerate('content', topic)}
        onGenerateImageAI={(topic) => handleAIGenerate('image', topic)}
        onGenerateSlideAI={(topic) => handleAIGenerate('slide', topic)}
        isGenerating={isGenerating}
        onExport={handleExport}
        onUndo={undo}
        onRedo={redo}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        onAddSlide={handleAddSlide}
        onDuplicateSlide={() => handleDuplicateSlide(currentSlide.id)}
        onDeleteSlide={() => handleDeleteSlide(currentSlide.id)}
        onPaste={handlePaste}
        onCopy={handleCopy}
        onCut={handleCut}
        canPaste={!!clipboard}
        onDeleteElement={deleteElement}
        selectedElement={currentSlide.elements.find(el => el.id === selectedElementId)}
        onUpdateElement={selectedElementId ? (updates) => updateElement(selectedElementId, updates) : undefined}
        onFindReplace={handleFindReplace}
        onCreateNew={handleCreateNew}
        onImport={handleImport}
        slideBackground={currentSlide.background}
        onUpdateSlideBackground={(color) => updateSlideWithHistory(currentSlide.id, { background: color })}
        onScreenshot={handleScreenshot}
        zoom={zoom}
        onZoomChange={setZoom}
        onFitToWindow={handleFitToWindow}
        currentSlide={currentSlide}
        onUpdateSlide={updateSlideWithHistory}
        onApplyTransitionToAll={handleApplyTransitionToAll}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          slides={presentation.slides} 
          currentSlideIndex={currentSlideIndex}
          onSlideSelect={setCurrentSlideIndex}
          onAddSlide={handleAddSlide}
          onDeleteSlide={handleDeleteSlide}
          onDuplicateSlide={handleDuplicateSlide}
          onReorderSlides={handleReorderSlides}
        />
        
        <div ref={stageContainerRef} className="flex-1 overflow-auto flex items-center justify-center p-8 relative bg-[#e5e5e5]">
          <div id="main-slide-stage" style={{ width: 960 * zoom, height: 540 * zoom, flexShrink: 0, boxShadow: '0 0 10px rgba(0,0,0,0.1)', position: 'relative' }}> 
            <SlideStage slide={currentSlide} selectedElementId={selectedElementId} onSelectElement={setSelectedElementId} onUpdateElement={updateElement} scale={zoom} onElementContextMenu={handleElementContextMenu} onBackgroundContextMenu={handleSlideContextMenu} />
          </div>
          <div className="fixed bottom-6 left-72 flex items-center gap-1 bg-white p-1 rounded-lg shadow-md border border-gray-200 z-50">
             <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><Minus size={16} /></button>
             <div className="w-12 text-center text-xs font-medium text-gray-600 select-none">{Math.round(zoom * 100)}%</div>
             <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><Plus size={16} /></button>
             <div className="w-px h-4 bg-gray-200 mx-1"></div>
             <button onClick={handleFitToWindow} title="Fit to Window" className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><Maximize size={16} /></button>
          </div>
        </div>

        {selectedElementId && (
            <PropertiesPanel 
              selectedElement={currentSlide.elements.find(el => el.id === selectedElementId)}
              onUpdateElementStyle={(style) => selectedElementId && updateElement(selectedElementId, { style })}
              onDeleteElement={deleteElement}
              slideBackground={currentSlide.background}
              onUpdateSlideBackground={(color) => updateSlideWithHistory(currentSlide.id, { background: color })}
              slidePattern={currentSlide.pattern}
              slidePatternColor={currentSlide.patternColor}
              onUpdateSlidePattern={(patternId, color) => updateSlideWithHistory(currentSlide.id, { pattern: patternId, ...(color ? { patternColor: color } : {}) })}
              slideBorderWidth={currentSlide.borderWidth}
              slideBorderColor={currentSlide.borderColor}
              onUpdateSlideBorder={(width, color) => updateSlideWithHistory(currentSlide.id, { borderWidth: width, ...(color ? { borderColor: color } : {}) })}
            />
        )}
      </div>

      <div style={{ position: 'absolute', top: 0, left: -99999, pointerEvents: 'none' }}>
         {presentation.slides.map((slide, index) => (
             <div key={slide.id} id={`export-slide-${index}`}><SlideStage slide={slide} scale={1} readOnly={true} /></div>
         ))}
      </div>

      {contextMenu && (
        <div className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] min-w-[160px] animate-in fade-in zoom-in-95 duration-75" style={{ top: contextMenu.y, left: contextMenu.x }}>
            {contextMenu.type === 'element' && (
                <>
                    <button onClick={handleCut} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Scissors size={14} /> Cut</button>
                    <button onClick={handleCopy} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Copy size={14} /> Copy</button>
                    <button onClick={handleDuplicate} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><CopyPlus size={14} /> Duplicate</button>
                    <button onClick={handleDeleteFromMenu} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} /> Delete</button>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button onClick={handleBringToFront} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><ArrowUpFromLine size={14} /> Bring to Front</button>
                     <button onClick={handleSendToBack} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><ArrowDownFromLine size={14} /> Send to Back</button>
                </>
            )}
            {(contextMenu.type === 'slide' || contextMenu.type === 'element') && (
                 <>
                    {contextMenu.type === 'element' && <div className="h-px bg-gray-100 my-1"></div>}
                    <button onClick={handlePaste} disabled={!clipboard} className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${!clipboard ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}><Clipboard size={14} /> Paste</button>
                 </>
            )}
        </div>
      )}

      {(isGenerating || isExporting) && (
        <div className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center backdrop-blur-sm">
           <div className="bg-white p-4 rounded-lg shadow-xl flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium text-gray-700">{isGenerating ? 'Gemini AI is working...' : 'Exporting...'}</span>
           </div>
        </div>
      )}

      {isPresenting && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
          <div className="absolute top-4 right-4 z-50">
            <button onClick={() => setIsPresenting(false)} className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors"><X size={24} /></button>
          </div>
          <div className="w-full h-full flex items-center justify-center bg-black">
            <div key={currentSlideIndex} className={`relative ${currentSlide.transition !== 'none' ? `transition-${currentSlide.transition}` : ''}`} style={{ animationDuration: `${currentSlide.transitionDuration || 0.5}s`, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}> 
               <SlideStage slide={currentSlide} readOnly />
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-full flex gap-4 shadow-xl border border-white/20">
             <button onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} disabled={currentSlideIndex === 0} className="disabled:opacity-30 hover:text-blue-400 font-medium transition-colors">Prev</button>
             <span className="text-sm font-mono opacity-70 flex items-center">{currentSlideIndex + 1} / {presentation.slides.length}</span>
             <button onClick={() => setCurrentSlideIndex(Math.min(presentation.slides.length - 1, currentSlideIndex + 1))} disabled={currentSlideIndex === presentation.slides.length - 1} className="disabled:opacity-30 hover:text-blue-400 font-medium transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
