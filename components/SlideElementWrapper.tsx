import React, { useState, useRef, useEffect, CSSProperties } from 'react';
import { SlideElement } from '../types';
import * as LucideIcons from 'lucide-react';
import { ArrowRight, MoveDown, Plus, X, Trash2, Check } from 'lucide-react';
import { 
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
    AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface Props {
  element: SlideElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<SlideElement>) => void;
  readOnly?: boolean;
  onContextMenu?: (e: React.MouseEvent, id: string) => void;
}

export const SlideElementWrapper: React.FC<Props> = ({ element, isSelected, onSelect, onUpdate, readOnly, onContextMenu }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [localUpdate, setLocalUpdate] = useState<Partial<SlideElement> | null>(null);

  const dragStart = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });
  const initialSize = useRef({ w: 0, h: 0 });
  const editableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSelected) setIsEditing(false);
  }, [isSelected]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('.chart-editor-modal') || target.isContentEditable) return;
    if (readOnly) return;
    e.stopPropagation();
    onSelect(element.id);
    if (!isEditing) {
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        initialPos.current = { x: element.x, y: element.y };
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(element.id);
    if (onContextMenu) onContextMenu(e, element.id);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (readOnly) return;
    e.stopPropagation();
    setIsResizing(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialSize.current = { w: element.width, h: element.height };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setLocalUpdate({ x: initialPos.current.x + dx, y: initialPos.current.y + dy });
      } else if (isResizing) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setLocalUpdate({ width: Math.max(100, initialSize.current.w + dx), height: Math.max(100, initialSize.current.h + dy) });
      }
    };
    const handleMouseUp = () => {
      if ((isDragging || isResizing) && localUpdate) onUpdate(element.id, localUpdate);
      setIsDragging(false);
      setIsResizing(false);
      setLocalUpdate(null);
    };
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, element.id, onUpdate, localUpdate]);

  const handleDoubleClick = () => {
    if (readOnly) return;
    setIsEditing(true);
    if (element.type === 'text') setTimeout(() => editableRef.current?.focus(), 0);
  };

  const handleBlur = () => {
    if (element.type === 'text') {
        setIsEditing(false);
        if (editableRef.current) onUpdate(element.id, { content: editableRef.current.innerText });
    }
  };
  
  const elementStyle = { ...element.style };
  if (element.type === 'shape' && !elementStyle.backgroundColor) elementStyle.backgroundColor = '#9ca3af'; 

  const displayX = localUpdate?.x ?? element.x;
  const displayY = localUpdate?.y ?? element.y;
  const displayWidth = localUpdate?.width ?? element.width;
  const displayHeight = localUpdate?.height ?? element.height;

  const animationClass = element.animation && element.animation !== 'none' ? `animate-${element.animation}` : '';
  const animationDuration = element.animationDuration || 0.5;

  const containerStyle: CSSProperties = {
    position: 'absolute',
    left: displayX,
    top: displayY,
    width: displayWidth,
    height: displayHeight,
    cursor: isDragging ? 'grabbing' : readOnly ? 'default' : 'grab',
    ...elementStyle,
    wordWrap: 'break-word',
    overflow: 'visible',
    animationDuration: `${animationDuration}s`,
  };

  if (['shape', 'icon', 'diagram', 'chart', 'table'].includes(element.type)) {
    containerStyle.backgroundColor = 'transparent';
    if (element.type !== 'table') {
        containerStyle.borderColor = 'transparent';
        containerStyle.borderWidth = 0;
    }
    containerStyle.boxShadow = 'none';
  }

  if (element.type === 'text' && elementStyle.backgroundImage) delete containerStyle.backgroundImage;

  const outlineStyle = !readOnly 
    ? (isSelected ? '2px solid #3b82f6' : (isHovered ? '1px dashed #3b82f6' : 'none'))
    : 'none';

  const renderIcon = () => {
    const IconComponent = (LucideIcons as any)[element.content];
    if (!IconComponent) return <div className="text-red-500 text-xs">Icon not found</div>;
    return <div style={{ width: '100%', height: '100%', color: elementStyle.color || '#000000' }}><IconComponent size="100%" strokeWidth={2} /></div>;
  };

  const renderDiagram = () => {
    const data = (() => { try { return JSON.parse(element.content); } catch { return { type: 'list', items: [] }; } })();
    const themeColor = element.style.backgroundColor || '#3b82f6';
    const textColor = element.style.color || '#ffffff';
    const handleItemChange = (index: number, field: string, value: string) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        onUpdate(element.id, { content: JSON.stringify({ ...data, items: newItems }) });
    };
    if (data.type === 'list') {
        return (
            <div className="w-full h-full flex flex-col gap-3 p-4 bg-gray-50/50 border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                {data.items.map((item: any, i: number) => (
                    <div key={i} className="flex gap-3 items-start bg-white p-3 rounded shadow-sm border-l-4" style={{ borderColor: themeColor }}>
                        <div className="flex flex-col flex-1 gap-1">
                             <input className="font-bold text-lg bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-300 rounded px-1 text-gray-800" value={item.title} onChange={(e) => handleItemChange(i, 'title', e.target.value)} placeholder="Title" disabled={!isEditing} />
                             <textarea className="text-sm text-gray-600 bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-300 rounded px-1 resize-none" value={item.description} onChange={(e) => handleItemChange(i, 'description', e.target.value)} placeholder="Description" rows={2} disabled={!isEditing} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    if (data.type === 'process') {
         return (
            <div className="w-full h-full flex items-center justify-between p-4 overflow-hidden">
                {data.items.map((item: any, i: number) => (
                    <React.Fragment key={i}>
                        <div className="flex flex-col items-center justify-center p-3 rounded-lg shadow-md flex-1 h-full min-w-0 mx-2" style={{ backgroundColor: themeColor, color: textColor }} >
                            <input className="font-bold text-center bg-transparent border-none outline-none rounded w-full" value={item.title} onChange={(e) => handleItemChange(i, 'title', e.target.value)} style={{ color: textColor }} disabled={!isEditing} />
                            <textarea className="text-xs text-center bg-transparent border-none outline-none rounded w-full resize-none mt-1 opacity-90" value={item.description} onChange={(e) => handleItemChange(i, 'description', e.target.value)} rows={3} style={{ color: textColor }} disabled={!isEditing} />
                        </div>
                        {i < data.items.length - 1 && <ArrowRight className="text-gray-400 shrink-0" size={24} />}
                    </React.Fragment>
                ))}
            </div>
        );
    }
    return <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50 border border-dashed rounded">Diagram</div>;
  };

  const renderTable = () => {
    const data = (() => { try { return JSON.parse(element.content); } catch { return { rows: [['Header 1', 'Header 2'], ['Cell 1', 'Cell 2']] }; } })();
    const borderColor = element.style.borderColor || '#e5e7eb';
    const textColor = element.style.color || '#1f2937';
    const bgColor = element.style.backgroundColor || '#ffffff';
    const updateCell = (rowIndex: number, colIndex: number, value: string) => {
        const newRows = [...data.rows];
        newRows[rowIndex] = [...newRows[rowIndex]];
        newRows[rowIndex][colIndex] = value;
        onUpdate(element.id, { content: JSON.stringify({ ...data, rows: newRows }) });
    };
    return (
        <div className="w-full h-full overflow-auto relative">
           <table className="w-full h-full border-collapse table-fixed" style={{ backgroundColor: bgColor }}>
              <tbody>
                {data.rows.map((row: string[], i: number) => (
                    <tr key={i}>
                        {row.map((cell: string, j: number) => (
                            <td key={j} className="relative transition-colors focus-within:bg-blue-50" style={{ border: `${element.style.borderWidth || '1px'} solid ${borderColor}`, color: textColor, backgroundColor: i === 0 ? (element.style.accentColor || '#f9fafb') : 'transparent', fontWeight: i === 0 ? 'bold' : (element.style.fontWeight || 'normal'), fontStyle: element.style.fontStyle || 'normal', textDecoration: element.style.textDecoration || 'none', padding: element.style.padding || '8px', textAlign: (element.style.textAlign as any) || 'left', fontFamily: element.style.fontFamily || 'sans-serif', fontSize: element.style.fontSize || '16px' }} >
                                <div contentEditable={!readOnly && isEditing} suppressContentEditableWarning onBlur={(e) => updateCell(i, j, e.currentTarget.innerText)} className={`w-full h-full outline-none bg-transparent ${isEditing ? 'cursor-text' : 'cursor-inherit'}`} > {cell} </div>
                            </td>
                        ))}
                    </tr>
                ))}
              </tbody>
           </table>
        </div>
    );
  };

  const renderChart = () => {
      const data = (() => { try { return JSON.parse(element.content); } catch { return { type: 'bar', data: [], title: '' }; } })();
      const themeColor = element.style.color || '#3b82f6';
      const ChartComponent = () => {
          if (data.type === 'pie') {
             const COLORS = [themeColor, '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
             return (<ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.data} cx="50%" cy="50%" innerRadius={40} outerRadius={80} fill={themeColor} dataKey="value" label={({name}) => name}>{data.data.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>);
          } else if (data.type === 'line') {
              return (<ResponsiveContainer width="100%" height="100%"><LineChart data={data.data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="value" stroke={themeColor} strokeWidth={3} /></LineChart></ResponsiveContainer>);
          } else if (data.type === 'area') {
              return (<ResponsiveContainer width="100%" height="100%"><AreaChart data={data.data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="value" stroke={themeColor} fill={themeColor} fillOpacity={0.3} /></AreaChart></ResponsiveContainer>);
          }
          return (<ResponsiveContainer width="100%" height="100%"><BarChart data={data.data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip cursor={{ fill: '#f3f4f6' }} /><Bar dataKey="value" fill={themeColor} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>);
      };
      return (<div className="w-full h-full relative group">{data.title && <div className="absolute top-2 left-0 right-0 text-center text-sm font-semibold text-gray-600 pointer-events-none z-0"> {data.title} </div>}<div className="w-full h-full p-2 pt-6"> <ChartComponent /> </div></div>);
  };

  const renderShape = () => {
    const shapeType = element.content || 'rectangle'; 
    const fill = elementStyle.backgroundColor || '#9ca3af';
    const stroke = elementStyle.borderColor || 'none';
    const strokeWidth = elementStyle.borderWidth ? parseInt(elementStyle.borderWidth as string) : 0;
    const commonProps = { width: "100%", height: "100%", fill: fill, stroke: stroke, strokeWidth: strokeWidth, vectorEffect: "non-scaling-stroke" };
    const commonDivStyle: CSSProperties = { width: '100%', height: '100%', backgroundColor: fill, border: `${strokeWidth}px solid ${stroke === 'none' ? 'transparent' : stroke}`, borderRadius: elementStyle.borderRadius, };
    if (shapeType === 'circle') return <div style={{ ...commonDivStyle, borderRadius: '50%' }} />;
    if (shapeType === 'star') return <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full block"><polygon points="50,1 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" {...commonProps} /></svg>;
    return <div style={commonDivStyle} />;
  };

  return (
    <div
      style={{ ...containerStyle, outline: outlineStyle, zIndex: isSelected ? 10 : (isHovered ? 5 : 1) }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
      className={`group ${animationClass}`}
    >
      {['chart', 'table', 'diagram'].includes(element.type) && !isEditing && !readOnly && <div className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing bg-transparent" />}
      {element.type === 'text' ? (
        <div ref={editableRef} contentEditable={isEditing} suppressContentEditableWarning onBlur={handleBlur} style={{ width: '100%', height: '100%', outline: 'none', cursor: isEditing ? 'text' : 'inherit', textTransform: elementStyle.textTransform as any }} > {element.content} </div>
      ) : element.type === 'image' ? (
        <img src={element.content} alt="slide element" className="w-full h-full object-cover pointer-events-none" style={{ borderRadius: elementStyle.borderRadius, opacity: elementStyle.opacity, filter: elementStyle.filter, borderColor: elementStyle.borderColor, borderWidth: elementStyle.borderWidth, borderStyle: elementStyle.borderStyle, boxShadow: elementStyle.boxShadow }} />
      ) : element.type === 'icon' ? (
        <div className="w-full h-full pointer-events-none select-none flex items-center justify-center"> {renderIcon()} </div>
      ) : element.type === 'diagram' ? (
        <div className="w-full h-full"> {renderDiagram()} </div>
      ) : element.type === 'chart' ? (
        <div className="w-full h-full"> {renderChart()} </div>
      ) : element.type === 'table' ? (
        <div className="w-full h-full"> {renderTable()} </div>
      ) : (
        <div className="w-full h-full pointer-events-none select-none"> {renderShape()} </div>
      )}
      {isSelected && !readOnly && !isEditing && <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize z-20" onMouseDown={handleResizeStart} />}
    </div>
  );
};