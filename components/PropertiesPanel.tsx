import React, { useState, useRef, useEffect } from 'react';
import { 
  PaintBucket, Pencil, Type, Bold, Italic, Underline as UnderlineIcon, 
  AlignLeft, AlignCenter, AlignRight, Trash2, Palette, Grid3X3, 
  Highlighter, ChevronDown, Monitor, Layout, Columns,
  ScanLine, MoveVertical, MoveHorizontal, Sparkles, Layers, Frame,
  Maximize2, Minimize2, Ban,
  Image as ImageIcon,
  Sun,
  Contrast,
  Droplet,
  Aperture,
  Wand2,
  CaseUpper,
  CaseLower,
  CaseSensitive,
  WholeWord,
  Settings2,
  Palette as PaletteIcon
} from 'lucide-react';
import { SlideElement } from '../types';
import { PATTERNS, getPatternStyle } from '../utils/patterns';
import { WORDART_PRESETS } from './Toolbar';

interface Props {
  selectedElement: SlideElement | undefined;
  onUpdateElementStyle: (style: React.CSSProperties) => void;
  onDeleteElement: () => void;
  slideBackground: string;
  onUpdateSlideBackground: (color: string) => void;
  slidePattern?: string;
  slidePatternColor?: string;
  onUpdateSlidePattern: (patternId: string, color?: string) => void;
  slideBorderWidth?: number;
  slideBorderColor?: string;
  onUpdateSlideBorder: (width: number, color?: string) => void;
}

// Text Effect Presets
const TEXT_EFFECTS = [
    { name: 'None', style: { textShadow: 'none', webkitTextStrokeWidth: '0px' } },
    { name: 'Neon', style: { textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00de, 0 0 30px #ff00de', color: '#ffffff' } },
    { name: '3D', style: { textShadow: '1px 1px 0px #c9c9c9, 2px 2px 0px #b9b9b9, 3px 3px 0px #a9a9a9, 4px 4px 0px #999', transform: 'translateZ(0)' } },
    { name: 'Retro', style: { textShadow: '3px 3px 0px #FF0080, -3px -3px 0px #00FFFF' } },
    { name: 'Glow', style: { textShadow: '0 0 10px rgba(59, 130, 246, 0.8)' } },
    { name: 'Outline', style: { webkitTextStrokeWidth: '1px', webkitTextStrokeColor: '#000', color: 'transparent' } },
    { name: 'Glitch', style: { textShadow: '2px 0 #ff00ff, -2px 0 #00ffff' } },
    { name: 'Fire', style: { textShadow: '0 -5px 4px #FFD700, 2px -10px 6px #FF8C00, -2px -15px 11px #FF4500, 2px -25px 18px #FF0000', color: '#ffff00' } },
    { name: 'Soft', style: { textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.5)' } },
    { name: 'Vintage', style: { textShadow: '2px 2px 0px #d4d4d4', letterSpacing: '2px', color: '#555' } },
];

// WordArt Presets
const ADDITIONAL_WORDART = [
    { name: 'Cyber Glow', style: { fontSize: '72px', fontWeight: '900', textAlign: 'center', color: '#0ff', textShadow: '0 0 10px #0ff, 0 0 20px #0ff, 0 0 40px #f0f' } },
    { name: 'Blueprint', style: { fontSize: '72px', fontWeight: 'bold', textAlign: 'center', color: '#fff', WebkitTextStroke: '1px #a5f3fc', textShadow: '2px 2px 0px rgba(0,0,0,0.1)' } },
    { name: 'Vintage Stamp', style: { fontSize: '72px', fontWeight: 'bold', textAlign: 'center', color: '#991b1b', opacity: '0.8', filter: 'contrast(1.5) grayscale(0.5) blur(0.2px)', fontFamily: 'serif' } },
    { name: 'Toxic', style: { fontSize: '72px', fontWeight: '900', textAlign: 'center', color: '#39ff14', textShadow: '0 0 5px #39ff14, 0 0 10px #39ff14, 0 0 20px #000' } },
    { name: 'Pearl', style: { fontSize: '72px', fontWeight: 'bold', textAlign: 'center', color: '#fefefe', backgroundImage: 'radial-gradient(circle at top left, #fff, #ddd)', WebkitBackgroundClip: 'text', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' } }
];

const ALL_WORDART = [...WORDART_PRESETS, ...ADDITIONAL_WORDART];

const toHex = (color: string | number | undefined): string => {
  if (typeof color !== 'string') return '#000000';
  if (color === 'transparent') return '#ffffff';
  if (color.startsWith('#') && color.length === 7) return color;
  if (color.startsWith('#') && color.length === 4) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  return '#000000';
};

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
  { name: 'Oswald', value: "'Oswald', sans-serif" },
  { name: 'Raleway', value: "'Raleway', sans-serif" },
  { name: 'Nunito', value: "'Nunito', sans-serif" },
];

const Section = ({ title, children, className = "" }: { title: string, children?: React.ReactNode, className?: string }) => (
    <div className={`py-5 px-5 border-b border-slate-100 last:border-0 ${className}`}>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            {title}
        </h3>
        <div className="flex flex-col gap-3.5">
            {children}
        </div>
    </div>
);

const PropertyRow = ({ label, children, className = "" }: { label?: string, children?: React.ReactNode, className?: string }) => (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
        {label && <span className="text-xs font-medium text-slate-600 min-w-[60px]">{label}</span>}
        <div className="flex-1 flex justify-end items-center gap-2 min-w-0">
            {children}
        </div>
    </div>
);

const ColorPicker = ({ value, onChange, icon: Icon, label, allowTransparent }: { value: string | undefined, onChange: (val: string) => void, icon?: any, label?: string, allowTransparent?: boolean }) => {
    const isTransparent = value === 'transparent';
    return (
        <div className="flex items-center gap-1 w-full">
            <div className="relative flex-1 group">
                <div className="flex items-center justify-between p-1.5 border border-slate-200 rounded-md bg-white hover:border-slate-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-5 h-5 rounded border border-slate-200 shadow-sm flex-shrink-0 relative overflow-hidden" style={{ backgroundColor: isTransparent ? '#ffffff' : toHex(value) }}>
                            {isTransparent && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-px bg-red-500 transform rotate-45"></div></div>}
                            {isTransparent && <div className="absolute inset-0 bg-slate-100/50"></div>}
                        </div>
                        <span className={`text-xs font-mono truncate ${isTransparent ? 'text-slate-400 italic' : 'text-slate-600'}`}>
                            {isTransparent ? 'None' : (value || '#000000')}
                        </span>
                    </div>
                    {Icon && <Icon size={14} className="text-slate-400 mr-1" />}
                </div>
                <input type="color" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" value={toHex(value)} onChange={(e) => onChange(e.target.value)} />
            </div>
            {allowTransparent && (
                <button onClick={() => onChange('transparent')} className={`p-2 rounded-md border transition-colors flex items-center justify-center ${isTransparent ? 'bg-slate-100 border-slate-300 text-red-500' : 'border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`} title="No Color (Transparent)">
                    <Ban size={14} />
                </button>
            )}
        </div>
    );
};

const SliderControl = ({ value, min, max, step = 1, onChange, unit = "" }: { value: number, min: number, max: number, step?: number, onChange: (val: number) => void, unit?: string }) => (
    <div className="flex items-center gap-3 w-full">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        <div className="w-10 text-right"><span className="text-xs font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{value}{unit}</span></div>
    </div>
);

const SelectControl = ({ value, options, onChange }: { value: string | undefined, options: { name: string, value: string }[], onChange: (val: string) => void }) => (
    <div className="relative w-full">
        <select className="w-full text-xs text-slate-700 border border-slate-200 rounded-md pl-2 pr-8 py-2 bg-white appearance-none hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-shadow" value={value} onChange={(e) => onChange(e.target.value)}>
            {options.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
);

const SegmentedControl = ({ options, value, onChange }: { options: { icon?: any, value: string, label?: string }[], value: string | undefined, onChange: (val: string) => void }) => (
    <div className="flex bg-slate-100 p-1 rounded-md w-full gap-0.5">
        {options.map((opt) => {
            const isActive = value === opt.value || (!value && opt.value === 'left');
            const Icon = opt.icon;
            return (
                <button key={opt.value} onClick={() => onChange(isActive ? '' : opt.value)} className={`flex-1 flex items-center justify-center py-1.5 rounded-sm text-slate-600 transition-all ${isActive ? 'bg-white text-blue-600 shadow-sm font-medium' : 'hover:bg-slate-200/50 hover:text-slate-900'}`} title={opt.label}>
                    {Icon && <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />}
                    {opt.label && !Icon && <span className="text-xs font-semibold">{opt.label}</span>}
                </button>
            );
        })}
    </div>
);

const ToggleButton = ({ isActive, onChange, icon: Icon, label }: { isActive: boolean, onChange: () => void, icon: any, label?: string }) => (
    <button onClick={onChange} className={`flex-1 flex items-center justify-center py-1.5 rounded-sm transition-all ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'}`} title={label}>
        <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
    </button>
);

export const PropertiesPanel: React.FC<Props> = ({
    selectedElement,
    onUpdateElementStyle,
    onDeleteElement,
    slideBackground,
    onUpdateSlideBackground,
    slidePattern,
    slidePatternColor,
    onUpdateSlidePattern,
    slideBorderWidth,
    slideBorderColor,
    onUpdateSlideBorder
}) => {
    const [showPatternMenu, setShowPatternMenu] = useState(false);
    const [activeTab, setActiveTab] = useState<'settings' | 'wordart'>('settings');
    const patternMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (patternMenuRef.current && !patternMenuRef.current.contains(event.target as Node)) {
                setShowPatternMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentPatternColor = slidePatternColor || '#9ca3af';

    const parseShadow = (shadowStr: string | undefined) => {
        if (!shadowStr || shadowStr === 'none') return { x: 2, y: 2, blur: 4, color: 'rgba(0,0,0,0.5)' };
        const parts = shadowStr.match(/^(-?[\d.]+)px (-?[\d.]+)px ([\d.]+)px (.+)$/);
        if (parts) return { x: parseFloat(parts[1]), y: parseFloat(parts[2]), blur: parseFloat(parts[3]), color: parts[4] };
        return { x: 2, y: 2, blur: 4, color: 'rgba(0,0,0,0.5)' };
    };

    const getFilterValue = (filterStr: string | undefined, type: string, defaultVal: number) => {
        if (!filterStr) return defaultVal;
        const match = filterStr.match(new RegExp(`${type}\\(([\\d.]+)`));
        return match ? parseFloat(match[1]) : defaultVal;
    };

    const updateFilter = (type: string, value: number, unit = '') => {
        const currentFilter = selectedElement?.style.filter || '';
        let newFilter = currentFilter;
        if (currentFilter.includes(type)) {
            newFilter = currentFilter.replace(new RegExp(`${type}\\([\\d.]+\\w*\\)`), `${type}(${value}${unit})`);
        } else {
            newFilter = `${currentFilter} ${type}(${value}${unit})`.trim();
        }
        onUpdateElementStyle({ filter: newFilter });
    };

    if (selectedElement) {
        const isText = selectedElement.type === 'text' || selectedElement.type === 'table' || selectedElement.type === 'diagram';
        const isShape = selectedElement.type === 'shape' || selectedElement.type === 'table' || selectedElement.type === 'text';
        const isIcon = selectedElement.type === 'icon';
        const isTable = selectedElement.type === 'table';
        const isImage = selectedElement.type === 'image';

        const currentShadow = parseShadow((isText ? selectedElement.style.textShadow : selectedElement.style.boxShadow) as string);
        const hasShadow = isText 
            ? (!!selectedElement.style.textShadow && selectedElement.style.textShadow !== 'none')
            : (!!selectedElement.style.boxShadow && selectedElement.style.boxShadow !== 'none');

        const outlineWidth = parseInt(selectedElement.style.webkitTextStrokeWidth as string) || 0;
        const outlineColor = (selectedElement.style.webkitTextStrokeColor as string) || '#000000';

        return (
            <div className="w-[280px] bg-white border-l border-slate-200 h-full overflow-y-auto flex flex-col z-10 custom-scrollbar">
                <div className="px-5 pt-4 pb-0 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-20">
                    <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm capitalize mb-4">
                        {selectedElement.type === 'text' && <Type size={16} className="text-blue-500" />}
                        {selectedElement.type === 'shape' && <Layout size={16} className="text-blue-500" />}
                        {selectedElement.type === 'image' && <ImageIcon size={16} className="text-blue-500" />}
                        {selectedElement.type === 'table' && <Columns size={16} className="text-blue-500" />}
                        {selectedElement.type === 'icon' && <Sparkles size={16} className="text-blue-500" />}
                        {selectedElement.type}
                    </h2>
                    {selectedElement.type === 'text' && (
                        <div className="flex border-b border-slate-100 -mx-5 px-5">
                            <button onClick={() => setActiveTab('settings')} className={`flex-1 py-2 text-xs font-bold transition-all flex items-center justify-center gap-2 border-b-2 ${activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Settings2 size={14}/> Settings</button>
                            <button onClick={() => setActiveTab('wordart')} className={`flex-1 py-2 text-xs font-bold transition-all flex items-center justify-center gap-2 border-b-2 ${activeTab === 'wordart' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><PaletteIcon size={14}/> WordArt</button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {selectedElement.type === 'text' && activeTab === 'wordart' && (
                        <div className="animate-in fade-in duration-200">
                            <Section title="Style Presets">
                                <p className="text-[10px] text-slate-400 mb-2 px-1">Apply pre-designed high-fidelity styles to your text element.</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {ALL_WORDART.map((preset, i) => (
                                        <button key={i} onClick={() => onUpdateElementStyle(preset.style as React.CSSProperties)} className="min-h-[60px] flex flex-col items-center justify-center border border-slate-100 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all p-2 group" title={preset.name}>
                                            <div className="w-full text-center truncate mb-1" style={{ ...preset.style, fontSize: '10px', lineHeight: '1.2' }}>Aa</div>
                                            <span className="text-[8px] text-slate-400 font-medium group-hover:text-blue-500">{preset.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </Section>
                        </div>
                    )}

                    {(selectedElement.type !== 'text' || activeTab === 'settings') && (
                        <div className="animate-in fade-in duration-200">
                            {isTable && (
                                <Section title="Table Style">
                                    <PropertyRow label="Accent"><ColorPicker value={selectedElement.style.accentColor || '#f9fafb'} onChange={(c) => onUpdateElementStyle({accentColor: c})} allowTransparent /></PropertyRow>
                                    <PropertyRow label="Padding"><SliderControl min={4} max={32} value={parseInt(selectedElement.style.padding as string) || 8} onChange={(val) => onUpdateElementStyle({ padding: `${val}px` })} unit="px" /></PropertyRow>
                                </Section>
                            )}

                            {isText && (
                                <Section title="Typography">
                                    <PropertyRow label="Effects">
                                        <div className="flex gap-1 flex-wrap justify-end">
                                            {TEXT_EFFECTS.map(effect => (
                                                <button key={effect.name} onClick={() => onUpdateElementStyle(effect.style as React.CSSProperties)} className="px-2 py-1 text-[10px] border border-slate-200 rounded hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors">{effect.name}</button>
                                            ))}
                                        </div>
                                    </PropertyRow>
                                    <div className="h-px bg-slate-100 my-2"></div>
                                    <PropertyRow><SelectControl value={selectedElement.style.fontFamily || 'sans-serif'} options={FONTS} onChange={(val) => onUpdateElementStyle({ fontFamily: val })} /></PropertyRow>
                                    <PropertyRow><SelectControl value={selectedElement.style.fontSize || '16px'} options={[12,14,16,18,24,30,36,48,60,72,96,128,160].map(s => ({ name: `${s}px`, value: `${s}px` }))} onChange={(val) => onUpdateElementStyle({ fontSize: val })} /></PropertyRow>
                                    <PropertyRow><div className="flex bg-slate-100 p-1 rounded-md w-full gap-0.5"><ToggleButton icon={Bold} isActive={selectedElement.style.fontWeight === 'bold'} onChange={() => onUpdateElementStyle({ fontWeight: selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold' })} /><ToggleButton icon={Italic} isActive={selectedElement.style.fontStyle === 'italic'} onChange={() => onUpdateElementStyle({ fontStyle: selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic' })} /><ToggleButton icon={UnderlineIcon} isActive={selectedElement.style.textDecoration === 'underline'} onChange={() => onUpdateElementStyle({ textDecoration: selectedElement.style.textDecoration === 'underline' ? 'none' : 'underline' })} /></div></PropertyRow>
                                    <PropertyRow label="Case"><SegmentedControl value={selectedElement.style.textTransform || 'none'} onChange={(val) => onUpdateElementStyle({ textTransform: val as any })} options={[{ value: 'none', icon: Type, label: 'Aa' }, { value: 'uppercase', icon: CaseUpper }, { value: 'lowercase', icon: CaseLower }, { value: 'capitalize', icon: CaseSensitive }]} /></PropertyRow>
                                    {(selectedElement.type === 'text' || selectedElement.type === 'table') && (
                                        <PropertyRow><SegmentedControl value={selectedElement.style.textAlign || 'left'} onChange={(val) => onUpdateElementStyle({ textAlign: val as any })} options={[{ value: 'left', icon: AlignLeft }, { value: 'center', icon: AlignCenter }, { value: 'right', icon: AlignRight }]} /></PropertyRow>
                                    )}
                                    <PropertyRow label="Color"><ColorPicker value={selectedElement.style.color} onChange={(c) => onUpdateElementStyle({color: c})} /></PropertyRow>
                                    {selectedElement.type === 'text' && (<PropertyRow label="Bg"><ColorPicker value={selectedElement.style.backgroundColor} onChange={(c) => onUpdateElementStyle({backgroundColor: c})} icon={Highlighter} allowTransparent /></PropertyRow>)}
                                </Section>
                            )}
                            
                            {(isText || isImage) && (
                                <Section title="Effects">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                                                <input type="checkbox" checked={hasShadow} onChange={(e) => {
                                                        const prop = isText ? 'textShadow' : 'boxShadow';
                                                        if (e.target.checked) onUpdateElementStyle({ [prop]: '2px 2px 4px rgba(0,0,0,0.5)' });
                                                        else onUpdateElementStyle({ [prop]: 'none' });
                                                    }} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                                                <Layers size={14} className="text-slate-500"/>
                                                <span>Drop Shadow</span>
                                            </label>
                                        </div>
                                        {hasShadow && (
                                            <div className="pl-6 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <ColorPicker value={currentShadow.color} onChange={(c) => {
                                                    const prop = isText ? 'textShadow' : 'boxShadow';
                                                    onUpdateElementStyle({ [prop]: `${currentShadow.x}px ${currentShadow.y}px ${currentShadow.blur}px ${c}` });
                                                }} />
                                                <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                                                    <div className="space-y-1"><span className="text-[10px] text-slate-400 uppercase tracking-wide">X Offset</span><input type="number" value={currentShadow.x} onChange={(e) => { const prop = isText ? 'textShadow' : 'boxShadow'; onUpdateElementStyle({ [prop]: `${e.target.value}px ${currentShadow.y}px ${currentShadow.blur}px ${currentShadow.color}` }); }} className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:border-blue-500 focus:outline-none" /></div>
                                                    <div className="space-y-1"><span className="text-[10px] text-slate-400 uppercase tracking-wide">Y Offset</span><input type="number" value={currentShadow.y} onChange={(e) => { const prop = isText ? 'textShadow' : 'boxShadow'; onUpdateElementStyle({ [prop]: `${currentShadow.x}px ${e.target.value}px ${currentShadow.blur}px ${currentShadow.color}` }); }} className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:border-blue-500 focus:outline-none" /></div>
                                                    <div className="col-span-2 space-y-1"><span className="text-[10px] text-slate-400 uppercase tracking-wide">Blur</span><SliderControl min={0} max={20} value={currentShadow.blur} onChange={(val) => { const prop = isText ? 'textShadow' : 'boxShadow'; onUpdateElementStyle({ [prop]: `${currentShadow.x}px ${currentShadow.y}px ${val}px ${currentShadow.color}` }); }} unit="px" /></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {isText && (
                                        <>
                                            <div className="h-px bg-slate-100 my-2"/>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-medium text-slate-700"><ScanLine size={14} className="text-slate-500"/><span>Text Outline</span></div></div>
                                                <div className="pl-6 space-y-3"><ColorPicker value={outlineColor} onChange={(c) => onUpdateElementStyle({ webkitTextStrokeColor: c, webkitTextStrokeWidth: outlineWidth ? `${outlineWidth}px` : '1px' })} /><SliderControl min={0} max={10} step={0.5} value={outlineWidth} onChange={(val) => onUpdateElementStyle({ webkitTextStrokeWidth: `${val}px`, webkitTextStrokeColor: outlineColor })} unit="px" /></div>
                                            </div>
                                        </>
                                    )}
                                </Section>
                            )}

                            {isImage && (
                                <>
                                    <Section title="Image Appearance">
                                        <PropertyRow label="Border Radius">
                                            <SliderControl min={0} max={200} value={parseInt(selectedElement.style.borderRadius as string) || 0} onChange={(val) => onUpdateElementStyle({ borderRadius: `${val}px` })} unit="px" />
                                        </PropertyRow>
                                        <PropertyRow label="Opacity">
                                            <SliderControl min={0} max={100} value={(parseFloat(selectedElement.style.opacity as string) || 1) * 100} onChange={(val) => onUpdateElementStyle({ opacity: String(val / 100) })} unit="%" />
                                        </PropertyRow>
                                        <div className="h-px bg-slate-100 my-1"></div>
                                        <PropertyRow label="Border Color">
                                            <ColorPicker value={selectedElement.style.borderColor} onChange={(c) => onUpdateElementStyle({borderColor: c, borderWidth: selectedElement.style.borderWidth || '1px', borderStyle: 'solid'})} icon={Pencil} allowTransparent />
                                        </PropertyRow>
                                        <PropertyRow label="Border Width">
                                            <SliderControl min={0} max={20} value={parseInt(selectedElement.style.borderWidth as string) || 0} onChange={(val) => onUpdateElementStyle({ borderWidth: `${val}px`, borderStyle: 'solid' })} unit="px" />
                                        </PropertyRow>
                                    </Section>
                                    <Section title="Image Adjustments">
                                        <div className="space-y-3">
                                            <PropertyRow label="Blur"><SliderControl min={0} max={20} value={getFilterValue(selectedElement.style.filter, 'blur', 0)} onChange={(val) => updateFilter('blur', val, 'px')} unit="px" /></PropertyRow>
                                            <PropertyRow label="Bright"><SliderControl min={0} max={200} value={getFilterValue(selectedElement.style.filter, 'brightness', 100)} onChange={(val) => updateFilter('brightness', val, '%')} unit="%" /></PropertyRow>
                                            <PropertyRow label="Contrast"><SliderControl min={0} max={200} value={getFilterValue(selectedElement.style.filter, 'contrast', 100)} onChange={(val) => updateFilter('contrast', val, '%')} unit="%" /></PropertyRow>
                                            <PropertyRow label="Gray"><SliderControl min={0} max={100} value={getFilterValue(selectedElement.style.filter, 'grayscale', 0)} onChange={(val) => updateFilter('grayscale', val, '%')} unit="%" /></PropertyRow>
                                            <PropertyRow label="Sepia"><SliderControl min={0} max={100} value={getFilterValue(selectedElement.style.filter, 'sepia', 0)} onChange={(val) => updateFilter('sepia', val, '%')} unit="%" /></PropertyRow>
                                        </div>
                                    </Section>
                                </>
                            )}

                            {(isShape || isIcon) && (
                                <Section title="Appearance">
                                    <PropertyRow label={isIcon ? "Color" : (isTable ? "Bg Color" : "Fill")}><ColorPicker value={isIcon ? selectedElement.style.color : selectedElement.style.backgroundColor} onChange={(c) => isIcon ? onUpdateElementStyle({color: c}) : onUpdateElementStyle({backgroundColor: c})} icon={PaintBucket} allowTransparent /></PropertyRow>
                                    {!isIcon && (
                                        <>
                                            <PropertyRow label="Border"><ColorPicker value={selectedElement.style.borderColor} onChange={(c) => onUpdateElementStyle({borderColor: c, borderWidth: selectedElement.style.borderWidth || '1px'})} icon={Pencil} allowTransparent /></PropertyRow>
                                            <PropertyRow label="Width"><SliderControl min={0} max={20} value={parseInt(selectedElement.style.borderWidth as string) || 0} onChange={(val) => onUpdateElementStyle({ borderWidth: `${val}px` })} unit="px" /></PropertyRow>
                                        </>
                                    )}
                                    <PropertyRow label="Opacity"><SliderControl min={0} max={100} value={(parseFloat(selectedElement.style.opacity as string) || 1) * 100} onChange={(val) => onUpdateElementStyle({ opacity: String(val / 100) })} unit="%" /></PropertyRow>
                                    {selectedElement.content === 'rectangle' && (<PropertyRow label="Rounding"><SliderControl min={0} max={50} value={parseInt(selectedElement.style.borderRadius as string) || 0} onChange={(val) => onUpdateElementStyle({ borderRadius: `${val}px` })} unit="px" /></PropertyRow>)}
                                </Section>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-auto p-5 border-t border-slate-200 bg-slate-50">
                    <button onClick={onDeleteElement} className="w-full flex items-center justify-center gap-2 text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 py-2.5 rounded-lg text-xs font-medium transition-all shadow-sm"><Trash2 size={14} /> Delete Element</button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-[280px] bg-white border-l border-slate-200 h-full overflow-y-auto flex flex-col z-10 custom-scrollbar">
             <div className="px-5 py-4 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-20"><h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm"><Monitor size={16} className="text-blue-500" /> Slide Settings</h2></div>
            <Section title="Background"><PropertyRow label="Fill"><ColorPicker value={slideBackground} onChange={onUpdateSlideBackground} icon={Palette} /></PropertyRow></Section>
            <Section title="Pattern Overlay">
                 <div className="relative w-full mb-3" ref={patternMenuRef}>
                     <button onClick={() => setShowPatternMenu(!showPatternMenu)} className="w-full flex items-center justify-between border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 bg-white hover:border-blue-400 transition-colors focus:ring-2 focus:ring-blue-100"><div className="flex items-center gap-2"><Grid3X3 size={14} className="text-slate-500" /><span className="font-medium">{PATTERNS.find(p => p.id === slidePattern)?.name || 'None'}</span></div><ChevronDown size={14} className="text-slate-400" /></button>
                     {showPatternMenu && (
                         <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-[100] p-3 flex flex-col gap-3 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"><div className="grid grid-cols-3 gap-2">{PATTERNS.map((p) => (<button key={p.id} onClick={() => { onUpdateSlidePattern(p.id === 'none' ? '' : p.id); setShowPatternMenu(false); }} className={`aspect-square rounded border transition-all relative overflow-hidden group ${slidePattern === p.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-100 hover:border-slate-300'}`} title={p.name}><div className="absolute inset-0 opacity-80 group-hover:opacity-100" style={{ backgroundColor: slideBackground, ...getPatternStyle(p.id, currentPatternColor) }}></div>{p.id === 'none' && <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 font-medium">None</span>}</button>))}</div></div>
                     )}
                 </div>
                 {slidePattern && (<PropertyRow label="Color"><ColorPicker value={currentPatternColor} onChange={(c) => onUpdateSlidePattern(slidePattern || 'grid', c)} /></PropertyRow>)}
            </Section>
            <Section title="Frame & Border"><PropertyRow label="Color"><ColorPicker value={slideBorderColor || '#000000'} onChange={(c) => onUpdateSlideBorder(slideBorderWidth || 20, c)} icon={Frame} allowTransparent /></PropertyRow><PropertyRow label="Thickness"><SliderControl min={0} max={100} value={slideBorderWidth || 0} onChange={(val) => onUpdateSlideBorder(val, slideBorderColor || '#000000')} unit="px" /></PropertyRow></Section>
        </div>
    );
};