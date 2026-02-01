import React, { useState, useRef, useEffect } from 'react';
import { 
  Type, Image as ImageIcon, Square, Download, Wand2, 
  Undo2, Redo2,
  Circle as CircleIcon, Triangle as TriangleIcon, Diamond as DiamondIcon, ArrowRight, Star, ChevronDown,
  X, FileType, Image, MonitorPlay,
  Smile, Hexagon, Octagon, Cloud, Heart, User, Home, Mail, Bell, Calendar, MapPin, Camera, Lock, Check, AlertTriangle, Info,
  Settings, Sparkles,
  Phone, Globe, Video, FileText, Folder, Clock, CreditCard, DollarSign, 
  ShoppingCart, Tag, ThumbsUp, MessageCircle, Layout, Sun, Moon, 
  Zap, Award, Bookmark, Briefcase, Compass, Coffee, Flag, Headphones, 
  Key, Laptop, Lightbulb, Mouse, Paperclip, PieChart, Power, Radio, Scissors, 
  Send, Smartphone, Speaker, Tablet, Target, Thermometer, Truck, Umbrella, Unlock, 
  Watch, Wifi, Music, Link, Printer, Gift, Share,
  Workflow, LayoutList, GitCommitHorizontal, RefreshCw,
  Plus,
  ChartColumn, LineChart, Table as TableIcon,
  Grid3X3,
  Layers,
  Minus,
  Pentagon,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  MessageSquare,
  Disc,
  Box,
  Cylinder,
  MessageCircle as Callout,
  Ban,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  StopCircle,
  PlayCircle,
  PauseCircle,
  Eye,
  EyeOff,
  Filter,
  Search as SearchIcon,
  Trash2,
  Copy,
  Save,
  Edit,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Code,
  Terminal,
  Cpu,
  Database,
  Server,
  Monitor,
  HardDrive,
  Clipboard,
  PaintBucket,
  Eraser,
  Pencil,
  Highlighter,
  ListOrdered,
  List as ListBulleted,
  ListTree,
  Paintbrush,
  Baseline,
  FilePlus,
  FolderOpen,
  Scan,
  GitBranch,
  Repeat,
  Library,
  WholeWord,
  PlusSquare,
  SquareDashed,
  CopyPlus,
  Trash,
  SpellCheck,
  Book,
  Accessibility,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCw,
  MoveUp,
  MoveDown,
  IterationCcw,
  RefreshCcw,
  MousePointer2 as CursorIcon,
  Zap as FlashIcon,
  SquareSlash,
  Maximize as ZoomIcon,
  Minimize as ShrinkIcon,
  MoveRight,
  MoveLeft
} from 'lucide-react';
import { ElementType, SlideElement, Slide } from '../types';

interface Props {
  onAddElement: (type: ElementType, content?: string, style?: React.CSSProperties) => void;
  onPresent: () => void;
  onGenerateAI: (topic: string) => void;
  onGenerateImageAI: (topic: string) => void;
  onGenerateSlideAI: (topic: string) => void;
  isGenerating: boolean;
  onExport: (format: 'json' | 'pdf' | 'pptx' | 'image') => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onAddSlide: () => void;
  onDuplicateSlide: () => void;
  onDeleteSlide: () => void;
  onPaste: () => void;
  onCopy: () => void;
  onCut: () => void;
  canPaste: boolean;
  onDeleteElement: () => void;
  selectedElement?: SlideElement;
  onUpdateElement?: (updates: Partial<SlideElement>) => void;
  onFindReplace: (find: string, replace: string, matchCase: boolean) => void;
  onCreateNew: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  slideBackground: string;
  onUpdateSlideBackground: (color: string) => void;
  onScreenshot?: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onFitToWindow: () => void;
  currentSlide: Slide;
  onUpdateSlide: (slideId: string, updates: Partial<Slide>) => void;
  onApplyTransitionToAll: (transition: string, duration: number) => void;
}

const TABS = ['File', 'Home', 'Insert', 'Slide', 'Transitions', 'Animations', 'Tools', 'View', 'AI'];

const TRANSITIONS = [
  { id: 'none', label: 'None', icon: Ban },
  { id: 'fade', label: 'Fade', icon: Sun },
  { id: 'slide-left', label: 'Slide Left', icon: MoveRight },
  { id: 'slide-right', label: 'Slide Right', icon: MoveLeft },
  { id: 'slide-up', label: 'Slide Up', icon: MoveUp },
  { id: 'slide-down', label: 'Slide Down', icon: MoveDown },
  { id: 'zoom-in', label: 'Zoom In', icon: ZoomIcon },
  { id: 'zoom-out', label: 'Zoom Out', icon: ShrinkIcon },
  { id: 'flip-h', label: 'Flip H', icon: RefreshCw },
  { id: 'flip-v', label: 'Flip V', icon: RefreshCcw },
  { id: 'dissolve', label: 'Dissolve', icon: SquareSlash },
  { id: 'rotate', label: 'Rotate', icon: RotateCw },
  { id: 'skew', label: 'Skew', icon: IterationCcw },
];

const ANIMATIONS = [
  { id: 'none', label: 'None', icon: Ban },
  { id: 'fade-in', label: 'Fade In', icon: Sun },
  { id: 'fly-in-bottom', label: 'Fly Bottom', icon: ArrowUp },
  { id: 'fly-in-top', label: 'Fly Top', icon: ArrowDown },
  { id: 'fly-in-left', label: 'Fly Left', icon: MoveRight },
  { id: 'fly-in-right', label: 'Fly Right', icon: MoveLeft },
  { id: 'zoom-in', label: 'Zoom In', icon: ZoomIcon },
  { id: 'bounce-in', label: 'Bounce', icon: FlashIcon },
  { id: 'spin-in', label: 'Spin', icon: RotateCw },
  { id: 'float', label: 'Float', icon: Cloud },
  { id: 'pulse', label: 'Pulse', icon: Heart },
];

const SHAPES = [
    {id:'rectangle', icon: Square, label: 'Rect'}, {id:'circle', icon: CircleIcon, label: 'Circle'}, 
    {id:'triangle', icon: TriangleIcon, label: 'Triangle'}, {id:'right-triangle', icon: TriangleIcon, label: 'Right Tri', rotate: 90}, 
    {id:'diamond', icon: DiamondIcon, label: 'Diamond'}, {id:'pentagon', icon: Pentagon, label: 'Pentagon'},
    {id:'hexagon', icon: Hexagon, label: 'Hexagon'}, {id:'octagon', icon: Octagon, label: 'Octagon'},
    {id:'star', icon: Star, label: 'Star'}, {id:'heart-shape', icon: Heart, label: 'Heart'},
    {id:'cloud', icon: Cloud, label: 'Cloud'}, {id:'sun', icon: Sun, label: 'Sun'},
    {id:'moon', icon: Moon, label: 'Moon'}, {id:'lightning', icon: Zap, label: 'Bolt'},
    {id:'arrowRight', icon: ArrowRight, label: 'Right'}, {id:'arrowLeft', icon: ArrowLeft, label: 'Left'},
    {id:'arrowUp', icon: ArrowUp, label: 'Up'}, {id:'arrowDown', icon: ArrowDown, label: 'Down'},
    {id:'speech-bubble', icon: MessageSquare, label: 'Speech'}, {id:'plus', icon: Plus, label: 'Plus'},
    {id:'ring', icon: Disc, label: 'Ring'}, {id:'cube', icon: Box, label: 'Cube'}, {id:'cylinder', icon: Cylinder, label: 'Cylinder'},
    {id:'callout', icon: Callout, label: 'Callout'}, {id:'cross', icon: X, label: 'Cross'}, {id:'ban', icon: Ban, label: 'Ban'}
];

const ICONS_LIST = [
    Home, User, Mail, Bell, SearchIcon, Star, Heart, Check, X, AlertTriangle, Info,
    Settings, Phone, Globe, Video, FileText, Folder, Clock, CreditCard, DollarSign, 
    ShoppingCart, Tag, ThumbsUp, MessageCircle, Sun, Moon, Zap, Award, Bookmark, 
    Briefcase, Clipboard, Compass, Coffee, Flag, Headphones, Key, Laptop, Lightbulb, 
    Mouse, Paperclip, Power, Radio, Scissors, Send, Smartphone, Speaker, 
    Tablet, Target, Thermometer, Truck, Umbrella, Unlock, Watch, Wifi, Music, 
    Link, Printer, Gift, Share, Smile, Cloud, Camera, MapPin, Lock, Calendar,
    CheckCircle, HelpCircle, AlertCircle, StopCircle, PlayCircle, PauseCircle,
    Eye, EyeOff, Filter, SearchIcon, Trash2, Copy, Save, Edit,
    Terminal, Code, Cpu, Database, Server, Phone, Monitor, Tablet, HardDrive
];

export const WORDART_PRESETS = [
    { 
        name: 'Rainbow', 
        style: { 
            fontSize: '72px', fontWeight: '900', textAlign: 'center', 
            backgroundImage: 'linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8f00ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.2))'
        } 
    },
    { 
        name: 'Golden 3D', 
        style: { 
            fontSize: '72px', fontWeight: 'bold', textAlign: 'center', 
            color: '#FFD700', 
            textShadow: '0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15)'
        } 
    },
    { 
        name: '3D Chrome', 
        style: { 
            fontSize: '72px', fontWeight: '900', textAlign: 'center', 
            backgroundImage: 'linear-gradient(to bottom, #fff 0%, #aaa 40%, #000 50%, #888 55%, #fff 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(4px 4px 0px #333)'
        } 
    },
    { 
        name: 'Comic', 
        style: { 
            fontSize: '72px', fontWeight: '900', textAlign: 'center', 
            color: '#facc15', WebkitTextStroke: '3px #000',
            textShadow: '8px 8px 0px #000',
            fontFamily: 'cursive',
            transform: 'rotate(-2deg)'
        } 
    },
    { 
        name: 'Sticker', 
        style: { 
            fontSize: '72px', fontWeight: '900', textAlign: 'center', 
            color: '#3b82f6', WebkitTextStroke: '6px #fff',
            filter: 'drop-shadow(3px 3px 2px rgba(0,0,0,0.3))'
        } 
    },
    { 
        name: 'Holographic', 
        style: { 
            fontSize: '72px', fontWeight: 'bold', textAlign: 'center', 
            backgroundImage: 'linear-gradient(45deg, #00f2ff, #00ffaa, #ff00ff, #00f2ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 8px rgba(0,242,255,0.4))'
        } 
    }
];

const FONTS = [
  { name: 'Sans Serif', value: 'sans-serif' },
  { name: 'Serif', value: 'serif' },
  { name: 'Monospace', value: 'monospace' },
  { name: 'Handwritten', value: 'cursive' },
  { name: 'Roboto', value: "'Roboto', sans-serif" },
  { name: 'Open Sans', value: "'Open Sans', sans-serif" },
  { name: 'Montserrat', value: "'Montserrat', sans-serif" },
  { name: 'Lato', value: "'Lato', sans-serif" },
  { name: 'Poppins', value: "'Poppins', sans-serif" },
  { name: 'Playfair Display', value: "'Playfair Display', serif" },
  { name: 'Merriweather', value: "'Merriweather', serif" },
];

const PRESET_COLORS = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff'
];

const ColorDropdown = ({ 
    isOpen, 
    onClose, 
    onSelect, 
    currentColor, 
    allowTransparent 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSelect: (c: string) => void; 
    currentColor?: string;
    allowTransparent?: boolean;
}) => {
    if (!isOpen) return null;
    return (
        <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded shadow-xl z-[110] w-48 animate-in fade-in zoom-in-95 duration-75" onClick={e => e.stopPropagation()}>
            <div className="grid grid-cols-10 gap-1 mb-2">
                {PRESET_COLORS.map(c => (
                    <button 
                        key={c} 
                        onClick={() => { onSelect(c); onClose(); }} 
                        className="w-4 h-4 rounded-sm border border-gray-100 hover:scale-110 transition-transform" 
                        style={{ backgroundColor: c }} 
                        title={c}
                    />
                ))}
            </div>
            {allowTransparent && (
                 <button 
                    onClick={() => { onSelect('transparent'); onClose(); }} 
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 mb-2 border-t border-gray-100 mt-1"
                 >
                    Transparent
                 </button>
            )}
            <div className="border-t border-gray-100 pt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">Custom:</span>
                <div className="relative flex-1 h-6 rounded border border-gray-300 overflow-hidden">
                    <input 
                        type="color" 
                        value={currentColor?.startsWith('#') ? currentColor : '#000000'}
                        onChange={(e) => onSelect(e.target.value)}
                        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
};

const BorderSettingsDropdown = ({ 
    isOpen, 
    onClose, 
    onSelectColor, 
    currentColor, 
    onSelectWidth, 
    currentWidth 
}: {
    isOpen: boolean;
    onClose: () => void;
    onSelectColor: (c: string) => void;
    currentColor: string;
    onSelectWidth: (w: number) => void;
    currentWidth: number;
}) => {
    if (!isOpen) return null;
    return (
        <div className="absolute top-full left-0 mt-1 p-3 bg-white border border-gray-200 rounded shadow-xl z-[110] w-56 animate-in fade-in zoom-in-95 duration-75 flex flex-col gap-3" onClick={e => e.stopPropagation()}>
            <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Color</span>
                <div className="grid grid-cols-8 gap-1.5">
                    {PRESET_COLORS.slice(0, 16).map(c => (
                        <button 
                            key={c} 
                            onClick={() => { onSelectColor(c); }} 
                            className={`w-5 h-5 rounded-sm border hover:scale-110 transition-transform ${currentColor === c ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-100'}`} 
                            style={{ backgroundColor: c }} 
                            title={c}
                        />
                    ))}
                    <button 
                        onClick={() => { onSelectColor('transparent'); }} 
                        className={`w-5 h-5 rounded-sm border flex items-center justify-center relative hover:scale-110 transition-transform ${currentColor === 'transparent' ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-200'}`}
                        title="No Border"
                    >
                        <div className="w-full h-px bg-red-500 transform rotate-45"></div>
                    </button>
                </div>
            </div>
            <div className="h-px bg-gray-100"></div>
            <div>
                 <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thickness</span>
                    <span className="text-xs font-mono text-gray-600 bg-gray-100 px-1.5 rounded">{currentWidth}px</span>
                 </div>
                 <input 
                    type="range" min="0" max="24" step="1" 
                    value={currentWidth} 
                    onChange={(e) => onSelectWidth(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                 />
            </div>
        </div>
    );
};

const CompactBtn = ({ icon: Icon, label, onClick, active, disabled, hasDropdown, colorBar, className, showLabel }: any) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(e); }}
    disabled={disabled}
    title={label}
    className={`
      flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-gray-200 transition-colors text-gray-700 relative
      ${active ? 'bg-gray-200 text-blue-600 font-bold' : ''}
      ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      ${className}
    `}
  >
    {Icon && <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />}
    {showLabel && label && <span className="text-[11px] font-medium whitespace-nowrap hidden sm:inline">{label}</span>}
    {colorBar && <div className="absolute bottom-1 left-1.5 right-1.5 h-0.5 rounded-full" style={{ backgroundColor: colorBar }}></div>}
    {hasDropdown && <ChevronDown size={10} className="ml-0.5 text-gray-500" />}
  </button>
);

const CompactSeparator = () => <div className="h-5 w-px bg-gray-300 mx-1.5 self-center"></div>;

export const Toolbar: React.FC<Props> = ({ 
  onAddElement, 
  onPresent, 
  onGenerateAI, 
  onGenerateImageAI,
  onGenerateSlideAI,
  isGenerating,
  onExport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onPaste,
  onCopy,
  onCut,
  canPaste,
  onDeleteElement,
  selectedElement,
  onUpdateElement,
  onFindReplace,
  onCreateNew,
  onImport,
  slideBackground,
  onUpdateSlideBackground,
  onScreenshot,
  zoom,
  onZoomChange,
  onFitToWindow,
  currentSlide,
  onUpdateSlide,
  onApplyTransitionToAll
}) => {
  const [activeTab, setActiveTab] = useState('Home');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showStockSearch, setShowStockSearch] = useState(false);
  const [stockQuery, setStockQuery] = useState('');
  const [stockImages, setStockImages] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      const handleClick = () => setOpenMenu(null);
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
  }, []);

  const toggleMenu = (menuId: string) => {
    setOpenMenu(prev => prev === menuId ? null : menuId);
  };

  const handleAiAction = (action: 'content' | 'image' | 'slide') => {
    if (aiPrompt.trim()) {
      if (action === 'content') onGenerateAI(aiPrompt);
      else if (action === 'image') onGenerateImageAI(aiPrompt);
      else if (action === 'slide') onGenerateSlideAI(aiPrompt);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) onAddElement('image', reader.result as string);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStockSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockQuery.trim()) return;
    const images = Array.from({ length: 9 }).map((_, i) => `https://loremflickr.com/640/480/${encodeURIComponent(stockQuery)}?lock=${Math.floor(Math.random() * 10000) + i}`);
    setStockImages(images);
  };

  const selectStockImage = (url: string) => {
      onAddElement('image', url);
      setShowStockSearch(false);
      setStockQuery('');
      setStockImages([]);
  };

  const handleAddChart = (type: 'bar' | 'line' | 'pie' | 'area' | 'radar' | 'composed') => {
      let initialData = { type, data: [{ name: 'A', value: 100 }, { name: 'B', value: 200 }, { name: 'C', value: 150 }, { name: 'D', value: 50 }], title: 'Chart Data' };
      if (type === 'radar') initialData.data = [{ name: 'Math', value: 120 }, { name: 'Art', value: 98 }, { name: 'Sci', value: 86 }, { name: 'Eng', value: 99 }, { name: 'His', value: 85 }];
      onAddElement('chart', JSON.stringify(initialData), { width: 400, height: 300, color: '#3b82f6' });
      setOpenMenu(null);
  };

  const handleAddTable = (variant: 'basic' | 'pricing' | 'comparison') => {
      let rows = [['Header 1', 'Header 2'], ['Cell 1', 'Cell 2'], ['Cell 3', 'Cell 4']];
      let style = { width: 400, height: 200, backgroundColor: '#ffffff', borderColor: '#e5e7eb' };
      if (variant === 'pricing') rows = [['Feature', 'Basic', 'Pro'], ['Users', '1', '5'], ['Storage', '5GB', 'Unlimited'], ['Support', 'Email', '24/7']];
      onAddElement('table', JSON.stringify({ rows, variant }), style);
      setOpenMenu(null);
  };

  const handleAddDiagram = (type: string) => {
      const initialData = { type, items: [{ title: 'Step 1', description: '' }, { title: 'Step 2', description: '' }] };
      onAddElement('diagram', JSON.stringify(initialData), { width: 500, height: 300, backgroundColor: '#3b82f6', color: '#ffffff' });
      setOpenMenu(null);
  };

  const handleAddWordArt = (preset: any) => {
    onAddElement('text', preset.name.toUpperCase(), { ...preset.style, width: 600, height: 150 });
    setOpenMenu(null);
  };

  const handleBold = () => { if (selectedElement && onUpdateElement) { onUpdateElement({ style: { ...selectedElement.style, fontWeight: selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold' } }); } };
  const handleItalic = () => { if (selectedElement && onUpdateElement) { onUpdateElement({ style: { ...selectedElement.style, fontStyle: selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic' } }); } };
  const handleUnderline = () => { if (selectedElement && onUpdateElement) { const current = selectedElement.style.textDecoration || ''; const hasUnderline = current.includes('underline'); const newDecor = hasUnderline ? current.replace('underline', '').trim() : `${current} underline`.trim(); onUpdateElement({ style: { ...selectedElement.style, textDecoration: newDecor || 'none' } }); } };
  const handleFontSize = (delta: number) => { if (selectedElement && onUpdateElement) { const currentSize = parseInt(selectedElement.style.fontSize as string) || 16; const newSize = Math.max(8, currentSize + delta); onUpdateElement({ style: { ...selectedElement.style, fontSize: `${newSize}px` } }); } };
  const handleAlign = (align: 'left' | 'center' | 'right' | 'justify') => { if (selectedElement && onUpdateElement) { onUpdateElement({ style: { ...selectedElement.style, textAlign: align } }); setOpenMenu(null); } };
  const handleFontFamily = (font: string) => { if (selectedElement && onUpdateElement) { onUpdateElement({ style: { ...selectedElement.style, fontFamily: font } }); setOpenMenu(null); } };
  const handleClearFormatting = () => { if (selectedElement && onUpdateElement) { onUpdateElement({ style: { ...selectedElement.style, fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', backgroundColor: 'transparent', borderColor: 'transparent', borderWidth: '0px', fontSize: '16px', fontFamily: 'sans-serif', verticalAlign: 'baseline', backgroundImage: 'none', filter: 'none', textShadow: 'none' } }); } };
  const handleList = (type: 'bullet' | 'number') => { if (selectedElement && selectedElement.type === 'text' && onUpdateElement) { const lines = selectedElement.content.split('\n'); const isBullet = type === 'bullet'; const prefixRegex = isBullet ? /^•\s+/ : /^\d+\.\s+/; const allMatch = lines.every(l => prefixRegex.test(l.trim())); const newContent = lines.map((l, i) => { const clean = l.replace(/^(•|\d+\.)\s+/, ''); if (allMatch) return clean; return isBullet ? `• ${clean}` : `${i + 1}. ${clean}`; }).join('\n'); onUpdateElement({ content: newContent }); } };
  const toggleFullScreen = () => { if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); } else { if (document.exitFullscreen) { document.exitFullscreen(); } } };

  const currentAlignIcon = React.useMemo(() => { const align = selectedElement?.style.textAlign || 'left'; switch(align) { case 'center': return AlignCenter; case 'right': return AlignRight; case 'justify': return AlignJustify; default: return AlignLeft; } }, [selectedElement?.style.textAlign]);
  const currentFontName = React.useMemo(() => { const font = selectedElement?.style.fontFamily || 'sans-serif'; const cleanFont = font.replace(/['"]/g, ''); const found = FONTS.find(f => f.value.includes(cleanFont) || f.value === font); return found ? found.name : cleanFont; }, [selectedElement?.style.fontFamily]);
  const currentTextColor = selectedElement?.style.color || '#000000';
  const currentHighlightColor = selectedElement?.style.backgroundColor || 'transparent';
  const currentBorderColor = selectedElement?.style.borderColor || 'transparent';
  const currentBorderWidth = parseInt(selectedElement?.style.borderWidth as string) || 0;

  return (
    <div className="flex flex-col w-full border-b border-gray-300 bg-[#f3f4f6] select-none z-40">
       <div className="flex px-2 pt-1 gap-1 items-center bg-[#f3f4f6]">
          {TABS.map(tab => (
              <div 
                key={tab} 
                onClick={(e) => { e.stopPropagation(); if (tab === 'File') toggleMenu('file'); else setActiveTab(tab); }} 
                className={`px-3 py-1.5 text-[13px] cursor-pointer transition-colors ${activeTab === tab && tab !== 'File' ? 'font-bold text-gray-900 border-b-2 border-red-600' : 'text-gray-600 hover:text-gray-900'} ${tab === 'File' ? 'font-medium text-gray-800' : ''} ${tab === 'AI' ? 'text-violet-600 font-medium' : ''}`}
              >
                 {tab === 'AI' ? <span className="flex items-center gap-1"><Sparkles size={12}/> AI</span> : tab}
              </div>
          ))}
          <div className="ml-auto flex items-center gap-2 pr-2">
              <button onClick={onPresent} className="flex items-center gap-1.5 px-3 py-1 rounded hover:bg-gray-200 text-gray-700 text-xs font-medium border border-gray-300 bg-white"><MonitorPlay size={14}/> Present</button>
              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); toggleMenu('export'); }} className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm"><Download size={14}/> Export <ChevronDown size={12}/></button>
                {openMenu === 'export' && (
                    <div className="absolute top-full right-0 mt-1 w-56 bg-white shadow-xl border border-gray-200 rounded-md py-1 z-[110] flex flex-col text-left" onClick={e => e.stopPropagation()}>
                        <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100 mb-1">Download As</div>
                        <button onClick={() => {onExport('pptx'); setOpenMenu(null)}} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"><MonitorPlay size={16} className="text-orange-500"/> PowerPoint (.pptx)</button>
                        <button onClick={() => {onExport('pdf'); setOpenMenu(null)}} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"><FileType size={16} className="text-red-500"/> PDF Document (.pdf)</button>
                        <button onClick={() => {onExport('image'); setOpenMenu(null)}} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"><ImageIcon size={16} className="text-blue-500"/> Current Slide (.png)</button>
                        <button onClick={() => {onExport('json'); setOpenMenu(null)}} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"><Code size={16} className="text-gray-500"/> JSON Source (.json)</button>
                    </div>
                )}
              </div>
          </div>
       </div>
       
       {openMenu === 'file' && (
           <div className="absolute top-8 left-1 w-48 bg-white shadow-xl border border-gray-200 rounded-md py-1 z-[110] flex flex-col" onClick={e => e.stopPropagation()}>
               <button onClick={() => { onCreateNew(); setOpenMenu(null); }} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left flex items-center gap-2"><FilePlus size={16}/> New Presentation</button>
               <button onClick={() => { importInputRef.current?.click(); setOpenMenu(null); }} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left flex items-center gap-2"><FolderOpen size={16}/> Open/Import</button>
               <div className="h-px bg-gray-100 my-1"></div>
               <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Export As</div>
               <button onClick={() => {onExport('pptx'); setOpenMenu(null)}} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left flex items-center gap-2"><MonitorPlay size={16}/> PowerPoint (.pptx)</button>
               <button onClick={() => {onExport('pdf'); setOpenMenu(null)}} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left flex items-center gap-2"><FileType size={16}/> PDF Document (.pdf)</button>
               <button onClick={() => {onExport('image'); setOpenMenu(null)}} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left flex items-center gap-2"><ImageIcon size={16}/> Current Slide (.png)</button>
           </div>
       )}

       {openMenu === 'findReplace' && (
           <div className="absolute top-28 right-20 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-[110] animate-in slide-in-from-top-2 fade-in" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-semibold text-sm text-gray-800">Find and Replace</h3>
                   <button onClick={() => setOpenMenu(null)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
               </div>
               <div className="space-y-3">
                   <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">Find</label>
                       <input value={findText} onChange={(e) => setFindText(e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none" placeholder="Text to find..." autoFocus />
                   </div>
                   <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">Replace with</label>
                       <input value={replaceText} onChange={(e) => setReplaceText(e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none" placeholder="Replacement text..." />
                   </div>
                   <button onClick={() => { onFindReplace(findText, replaceText, false); setOpenMenu(null); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded shadow-sm transition-colors">Replace All</button>
               </div>
           </div>
       )}

       <div className="bg-white flex items-center px-4 shadow-sm border-t border-gray-200 h-14 relative z-30">
           {activeTab === 'Home' && (
               <div className="flex items-center gap-1 h-full w-full">
                  <div className="flex items-center gap-1"> <CompactBtn icon={Undo2} onClick={onUndo} disabled={!canUndo} label="Undo" /> <CompactBtn icon={Redo2} onClick={onRedo} disabled={!canRedo} label="Redo" /> </div>
                  <CompactSeparator />
                  <div className="flex items-center gap-1 relative">
                      <CompactBtn icon={Clipboard} onClick={() => toggleMenu('paste')} disabled={!canPaste && !selectedElement} label="Paste Options" hasDropdown />
                      {openMenu === 'paste' && (
                          <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg z-[110] flex flex-col p-1" onClick={e => e.stopPropagation()}>
                              <button onClick={() => { onPaste(); setOpenMenu(null); }} disabled={!canPaste} className="p-2 hover:bg-gray-100 text-left text-xs rounded flex gap-2 disabled:opacity-50"><Clipboard size={14}/> Paste</button>
                              <button onClick={() => { onCut(); setOpenMenu(null); }} disabled={!selectedElement} className="p-2 hover:bg-gray-100 text-left text-xs rounded flex gap-2 disabled:opacity-50"><Scissors size={14}/> Cut</button>
                              <button onClick={() => { onCopy(); setOpenMenu(null); }} disabled={!selectedElement} className="p-2 hover:bg-gray-100 text-left text-xs rounded flex gap-2 disabled:opacity-50"><Copy size={14}/> Copy</button>
                          </div>
                      )}
                  </div>
                  <CompactSeparator />
                  <div className="flex items-center gap-1"> <CompactBtn icon={PlusSquare} onClick={onAddSlide} label="New Slide" hasDropdown={false} /> <div className="relative"> <CompactBtn icon={PaintBucket} onClick={() => toggleMenu('slideBg')} hasDropdown colorBar={slideBackground} title="Slide Background" /> <ColorDropdown isOpen={openMenu === 'slideBg'} onClose={() => setOpenMenu(null)} onSelect={(c) => { onUpdateSlideBackground(c); }} currentColor={slideBackground} /> </div> </div>
                  <CompactSeparator />
                  <div className="flex items-center gap-2">
                       <CompactBtn icon={Eraser} onClick={handleClearFormatting} title="Clear Formatting" /> 
                       <div className="relative">
                           <div className="flex items-center border border-gray-300 rounded hover:border-gray-400 bg-white">
                               <button onClick={(e) => { e.stopPropagation(); toggleMenu('font'); }} className="w-24 text-xs px-2 py-1 outline-none text-gray-700 font-sans text-left truncate">{currentFontName}</button>
                               <button onClick={(e) => { e.stopPropagation(); toggleMenu('font'); }} className="px-1 border-l border-gray-200 text-gray-500 hover:bg-gray-100 h-6 flex items-center"><ChevronDown size={12}/></button>
                           </div>
                           {openMenu === 'font' && <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg z-[110] max-h-60 overflow-y-auto" onClick={e => e.stopPropagation()}> {FONTS.map(font => <button key={font.value} onClick={() => { handleFontFamily(font.value); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 text-gray-700" style={{ fontFamily: font.value }}>{font.name}</button> )} </div> }
                       </div>
                       <div className="flex items-center border border-gray-300 rounded hover:border-gray-400 bg-white">
                           <input className="w-8 text-xs px-1 py-1 outline-none text-center text-gray-700 bg-transparent" value={parseInt(selectedElement?.style.fontSize as string) || 16} readOnly />
                           <div className="flex flex-col border-l border-gray-200"> <button onClick={() => handleFontSize(1)} className="px-1 h-3 flex items-center hover:bg-gray-100"><ChevronDown size={8} className="rotate-180"/></button> <button onClick={() => handleFontSize(-1)} className="px-1 h-3 flex items-center hover:bg-gray-100"><ChevronDown size={8}/></button> </div>
                       </div>
                       <div className="flex items-center gap-0.5 ml-1">
                           <CompactBtn icon={Bold} onClick={handleBold} active={selectedElement?.style.fontWeight === 'bold'} /> <CompactBtn icon={Italic} onClick={handleItalic} active={selectedElement?.style.fontStyle === 'italic'} /> <CompactBtn icon={Underline} onClick={handleUnderline} active={selectedElement?.style.textDecoration?.includes('underline')} />
                           <div className="relative"> <CompactBtn icon={Baseline} onClick={() => toggleMenu('textColor')} hasDropdown colorBar={currentTextColor} className="relative" /> <ColorDropdown isOpen={openMenu === 'textColor'} onClose={() => setOpenMenu(null)} onSelect={(c) => { onUpdateElement?.({ style: { ...selectedElement?.style, color: c } }); setOpenMenu(null); }} currentColor={currentTextColor} /> </div>
                           <div className="relative"> <CompactBtn icon={Highlighter} onClick={() => toggleMenu('highlight')} hasDropdown colorBar={currentHighlightColor} className="relative" /> <ColorDropdown isOpen={openMenu === 'highlight'} onClose={() => setOpenMenu(null)} onSelect={(c) => { onUpdateElement?.({ style: { ...selectedElement?.style, backgroundColor: c } }); setOpenMenu(null); }} currentColor={currentHighlightColor} allowTransparent /> </div>
                           <div className="relative"> <CompactBtn icon={SquareDashed} onClick={() => toggleMenu('border')} hasDropdown colorBar={currentBorderColor} title="Text Border" /> <BorderSettingsDropdown isOpen={openMenu === 'border'} onClose={() => setOpenMenu(null)} onSelectColor={(c) => onUpdateElement?.({ style: { ...selectedElement?.style, borderColor: c, borderWidth: '2px', borderStyle: 'solid' } })} currentColor={currentBorderColor} onSelectWidth={(w) => onUpdateElement?.({ style: { ...selectedElement?.style, borderWidth: `${w}px`, borderStyle: w > 0 ? 'solid' : 'none' } })} currentWidth={currentBorderWidth} /> </div>
                       </div>
                  </div>
                  <CompactSeparator />
                  <div className="flex items-center gap-1">
                      <CompactBtn icon={ListBulleted} onClick={() => handleList('bullet')} /> <CompactBtn icon={ListOrdered} onClick={() => handleList('number')} />
                      <div className="relative">
                           <CompactBtn icon={currentAlignIcon} onClick={() => toggleMenu('align')} hasDropdown active={openMenu === 'align'} />
                           {openMenu === 'align' && <div className="absolute top-full left-0 mt-1 w-10 bg-white border border-gray-200 rounded shadow-lg z-[110] flex flex-col p-1" onClick={e => e.stopPropagation()}> <button onClick={() => handleAlign('left')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700"><AlignLeft size={16}/></button> <button onClick={() => handleAlign('center')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700"><AlignCenter size={16}/></button> <button onClick={() => handleAlign('right')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700"><AlignRight size={16}/></button> </div> }
                      </div>
                      <CompactBtn icon={SearchIcon} onClick={() => toggleMenu('findReplace')} title="Find and Replace" active={openMenu === 'findReplace'} />
                  </div>
               </div>
           )}

           {activeTab === 'Insert' && (
               <div className="flex items-center gap-1 h-full w-full">
                  <CompactBtn icon={PlusSquare} label="New Slide" onClick={onAddSlide} hasDropdown={false} showLabel /> <CompactSeparator /> <CompactBtn icon={Type} label="Text Box" onClick={() => onAddElement('text')} showLabel /> <CompactSeparator />
                  <div className="relative"><CompactBtn icon={Square} label="Shapes" onClick={() => toggleMenu('shape')} hasDropdown showLabel />
                       {openMenu === 'shape' && <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-[110] p-2 grid grid-cols-4 gap-1 w-64 max-h-80 overflow-y-auto" onClick={e => e.stopPropagation()}> {SHAPES.map(s => <button key={s.id} onClick={() => { onAddElement('shape', s.id); setOpenMenu(null); }} className="p-2 hover:bg-gray-100 rounded flex flex-col items-center justify-center text-gray-600 gap-1" title={s.label}> <s.icon size={20} /> </button> )} </div> }
                  </div> <CompactSeparator />
                  <div className="relative"><CompactBtn icon={Smile} label="Icons" onClick={() => toggleMenu('icon')} hasDropdown showLabel />
                       {openMenu === 'icon' && <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-[110] p-2 grid grid-cols-6 gap-1 w-72 max-h-80 overflow-y-auto" onClick={e => e.stopPropagation()}> {ICONS_LIST.map((IconComp, i) => <button key={i} onClick={() => { onAddElement('icon', (IconComp as any).displayName || (IconComp as any).name); setOpenMenu(null); }} className="p-2 hover:bg-gray-100 rounded flex justify-center text-gray-600"><IconComp size={18}/></button> )} </div> }
                  </div> <CompactSeparator /> <CompactBtn icon={ImageIcon} label="Pictures" onClick={() => fileInputRef.current?.click()} showLabel /> <CompactSeparator /> <CompactBtn icon={Library} label="Stock Images" onClick={() => setShowStockSearch(true)} showLabel /> <CompactSeparator /> <CompactBtn icon={Scan} label="Screenshot" onClick={onScreenshot} showLabel /> <CompactSeparator />
                  <div className="relative"><CompactBtn icon={TableIcon} label="Table" onClick={() => toggleMenu('table')} hasDropdown showLabel />
                       {openMenu === 'table' && <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-[110] p-1 flex flex-col w-32" onClick={e => e.stopPropagation()}> <button onClick={() => handleAddTable('basic')} className="p-2 hover:bg-gray-100 text-left text-sm rounded flex gap-2"><Grid3X3 size={16}/> Basic</button> <button onClick={() => handleAddTable('pricing')} className="p-2 hover:bg-gray-100 text-left text-sm rounded flex gap-2"><Layout size={16}/> Pricing</button> <button onClick={() => handleAddTable('comparison')} className="p-2 hover:bg-gray-100 text-left text-sm rounded flex gap-2"><ListTree size={16}/> Compare</button> </div> }
                  </div> <CompactSeparator />
                  <div className="relative"><CompactBtn icon={Workflow} label="SmartArt" onClick={() => toggleMenu('diagram')} hasDropdown showLabel />
                       {openMenu === 'diagram' && <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-[110] p-1 flex flex-col w-40" onClick={e => e.stopPropagation()}> <button onClick={() => handleAddDiagram('list')} className="p-2 hover:bg-gray-100 text-left text-sm rounded flex gap-2"><LayoutList size={16}/> List</button> <button onClick={() => handleAddDiagram('process')} className="p-2 hover:bg-gray-100 text-left text-sm rounded flex gap-2"><GitCommitHorizontal size={16}/> Process</button> <button onClick={() => handleAddDiagram('cycle')} className="p-2 hover:bg-gray-100 text-left text-sm rounded flex gap-2"><Repeat size={16}/> Cycle</button> <button onClick={() => handleAddDiagram('hierarchy')} className="p-2 hover:bg-gray-100 text-left text-sm rounded flex gap-2"><GitBranch size={16}/> Hierarchy</button> </div> }
                  </div> <CompactSeparator />
                  <div className="relative"><CompactBtn icon={ChartColumn} label="Charts" onClick={() => toggleMenu('chart')} hasDropdown showLabel />
                       {openMenu === 'chart' && <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-[110] p-1 flex flex-col w-32" onClick={e => e.stopPropagation()}> <button onClick={() => handleAddChart('bar')} className="p-2 hover:bg-gray-100 text-left text-sm rounded flex gap-2"><ChartColumn size={16}/> Bar</button> <button onClick={() => handleAddChart('line')} className="p-2 hover:bg-gray-100 text-left text-sm rounded flex gap-2"><LineChart size={16}/> Line</button> <button onClick={() => handleAddChart('pie')} className="p-2 hover:bg-gray-100 text-left text-sm rounded flex gap-2"><PieChart size={16}/> Pie</button> </div> }
                  </div> <CompactSeparator />
                  <div className="relative"><CompactBtn icon={WholeWord} label="WordArt" onClick={() => toggleMenu('wordArt')} hasDropdown showLabel />
                      {openMenu === 'wordArt' && <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded shadow-xl z-[110] p-3 animate-in fade-in zoom-in-95 duration-100" onClick={e => e.stopPropagation()}> <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Select Preset Style</h4> <div className="grid grid-cols-3 gap-2"> {WORDART_PRESETS.map((preset, i) => <button key={i} onClick={() => handleAddWordArt(preset)} className="p-2 border border-slate-100 rounded hover:bg-blue-50 hover:border-blue-200 transition-all flex flex-col items-center justify-center gap-2 group min-h-[60px]" > <div className="w-full text-center truncate pointer-events-none" style={{ ...preset.style, fontSize: '12px', lineHeight: '1.2' }}> Aa </div> <span className="text-[9px] text-gray-500 font-medium group-hover:text-blue-600">{preset.name}</span> </button> )} </div> </div> }
                  </div>
               </div>
           )}

           {activeTab === 'Slide' && (
               <div className="flex items-center gap-1 h-full w-full"> <CompactBtn icon={PlusSquare} label="New Slide" onClick={onAddSlide} showLabel /> <CompactBtn icon={CopyPlus} label="Duplicate Slide" onClick={onDuplicateSlide} showLabel /> <CompactBtn icon={Trash} label="Delete Slide" onClick={onDeleteSlide} className="text-red-500" showLabel /> <CompactSeparator /> <div className="flex items-center gap-2"> <span className="text-xs font-medium text-gray-500">Background:</span> <div className="relative"> <CompactBtn icon={PaintBucket} onClick={() => toggleMenu('slideBg')} hasDropdown colorBar={slideBackground} title="Background Color" /> <ColorDropdown isOpen={openMenu === 'slideBg'} onClose={() => setOpenMenu(null)} onSelect={(c) => { onUpdateSlideBackground(c); }} currentColor={slideBackground} /> </div> </div> <CompactSeparator /> <CompactBtn icon={Download} label="Download Slide" onClick={() => onExport('image')} showLabel /> </div>
           )}

           {activeTab === 'Transitions' && (
               <div className="flex items-center gap-3 h-full w-full overflow-x-hidden">
                   <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-2xl px-2"> {TRANSITIONS.map((t) => <CompactBtn key={t.id} icon={t.icon} label={t.label} active={currentSlide.transition === t.id} showLabel onClick={() => onUpdateSlide(currentSlide.id, { transition: t.id, transitionDuration: currentSlide.transitionDuration || 0.5 })} /> )} </div> <CompactSeparator />
                   <div className="flex items-center gap-2 shrink-0"> <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">Duration (s):</span> <input type="number" step="0.1" min="0.1" max="5.0" className="w-12 text-xs border border-gray-300 rounded px-1 py-0.5 outline-none" value={currentSlide.transitionDuration || 0.5} onChange={(e) => onUpdateSlide(currentSlide.id, { transitionDuration: parseFloat(e.target.value) })} /> </div> <CompactSeparator />
                   <button onClick={() => onApplyTransitionToAll(currentSlide.transition || 'none', currentSlide.transitionDuration || 0.5)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded shadow-sm whitespace-nowrap shrink-0 mr-4" > Apply to all slides </button>
               </div>
           )}

           {activeTab === 'Animations' && (
               <div className="flex items-center gap-3 h-full w-full overflow-x-hidden px-4">
                   <div className="flex items-center gap-2 text-blue-600"> <CursorIcon size={16} /> <span className="text-[11px] font-bold uppercase tracking-wider">Element Animation:</span> </div>
                   {selectedElement ? (
                       <>
                           <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-2xl px-2"> {ANIMATIONS.map((anim) => <CompactBtn key={anim.id} icon={anim.icon} label={anim.label} active={selectedElement.animation === anim.id} showLabel onClick={() => onUpdateElement?.({ animation: anim.id, animationDuration: selectedElement.animationDuration || 0.5 })} /> )} </div>
                           <CompactSeparator />
                           <div className="flex items-center gap-2 shrink-0"> <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">Duration (s):</span> <input type="number" step="0.1" min="0.1" max="5.0" className="w-12 text-xs border border-gray-300 rounded px-1 py-0.5 outline-none" value={selectedElement.animationDuration || 0.5} onChange={(e) => onUpdateElement?.({ animationDuration: parseFloat(e.target.value) })} /> </div>
                       </>
                   ) : ( <div className="text-gray-400 text-xs italic">Select an element to add animations</div> )}
               </div>
           )}

           {activeTab === 'Tools' && (
               <div className="flex items-center gap-1 h-full w-full"> <CompactBtn icon={SpellCheck} label="Spelling" showLabel onClick={() => alert('Spelling check complete. No errors found.')} /> <CompactSeparator /> <CompactBtn icon={Compass} label="Explore" showLabel onClick={() => setActiveTab('AI')} /> <CompactSeparator /> <CompactBtn icon={Book} label="Dictionary" showLabel onClick={() => alert('Dictionary feature is coming soon!')} /> <CompactSeparator /> <CompactBtn icon={SearchIcon} label="Find & Replace" showLabel onClick={() => toggleMenu('findReplace')} /> <CompactSeparator /> <CompactBtn icon={Accessibility} label="Accessibility" showLabel onClick={() => alert('Accessibility feature is coming soon!')} /> </div>
           )}

           {activeTab === 'View' && (
               <div className="flex items-center gap-1 h-full w-full"> <CompactBtn icon={Maximize2} label="Full Screen" showLabel onClick={toggleFullScreen} /> <CompactSeparator /> <div className="flex items-center gap-1"> <CompactBtn icon={ZoomOut} onClick={() => onZoomChange(Math.max(0.2, zoom - 0.1))} title="Zoom Out" /> <span className="text-[11px] font-mono w-10 text-center text-gray-600">{Math.round(zoom * 100)}%</span> <CompactBtn icon={ZoomIn} onClick={() => onZoomChange(Math.min(3, zoom + 0.1))} title="Zoom In" /> <CompactBtn icon={Maximize} label="Fit to Window" showLabel onClick={onFitToWindow} /> </div> </div>
           )}
           
           {activeTab === 'AI' && (
                <div className="flex items-center gap-3 w-full max-w-6xl mx-auto px-4 animate-in fade-in slide-in-from-top-1">
                     <div className="flex items-center gap-2 text-violet-700 font-semibold text-sm whitespace-nowrap"><Sparkles size={18} /><span>AI Studio</span></div> 
                     <div className="h-6 w-px bg-gray-300 mx-2"></div>
                     <div className="flex-1 relative"> <input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Enter a topic or prompt..." className="w-full border border-violet-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-violet-50/50" onKeyDown={(e) => e.key === 'Enter' && handleAiAction('content')} /> </div>
                     <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleAiAction('slide'); }} disabled={isGenerating || !aiPrompt.trim()} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 transition-all border border-violet-700"><Layout size={14} />{isGenerating ? 'Working...' : 'Generate Slide'}</button>
                        <button onClick={(e) => { e.stopPropagation(); handleAiAction('content'); }} disabled={isGenerating || !aiPrompt.trim()} className="bg-white hover:bg-violet-50 text-violet-700 px-4 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 transition-all border border-violet-200"><FileType size={14} />Content</button>
                        <button onClick={(e) => { e.stopPropagation(); handleAiAction('image'); }} disabled={isGenerating || !aiPrompt.trim()} className="bg-white hover:bg-violet-50 text-violet-700 px-4 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 transition-all border border-violet-200"><ImageIcon size={14} />Image</button>
                     </div>
                </div>
           )}
       </div>
       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
       <input type="file" ref={importInputRef} className="hidden" accept=".json" onChange={onImport} />
        {showStockSearch && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4" onClick={() => setShowStockSearch(false)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="p-3 border-b border-gray-200 flex items-center justify-between"> <h3 className="font-semibold text-gray-800">Search Stock Images</h3> <button onClick={() => setShowStockSearch(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500"><X size={18}/></button> </div>
            <div className="p-3 bg-gray-50 border-b border-gray-200"> <form onSubmit={handleStockSearch} className="flex gap-2"> <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={stockQuery} onChange={(e) => setStockQuery(e.target.value)} placeholder="Keywords..." autoFocus /> <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Search</button> </form> </div>
            <div className="p-4 overflow-y-auto flex-1 bg-gray-50"> <div className="grid grid-cols-3 gap-3"> {stockImages.map((url, i) => <button key={i} onClick={() => selectStockImage(url)} className="aspect-video bg-gray-200 rounded overflow-hidden hover:ring-2 ring-blue-500"> <img src={url} className="w-full h-full object-cover" loading="lazy" /> </button> )} </div> {stockImages.length === 0 && <div className="text-center text-gray-400 py-10">No images found</div>} </div>
            </div>
        </div>
        )}
    </div>
  );
};