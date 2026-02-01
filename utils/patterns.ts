import { CSSProperties } from 'react';

export interface PatternDef {
  id: string;
  name: string;
}

export const PATTERNS: PatternDef[] = [
  { id: 'none', name: 'None' },
  { id: 'grid', name: 'Grid' },
  { id: 'dots', name: 'Dots' },
  { id: 'dots-lg', name: 'Big Dots' },
  { id: 'diagonal', name: 'Diagonal' },
  { id: 'diagonal-wide', name: 'Wide Diagonal' },
  { id: 'vertical', name: 'Vertical' },
  { id: 'horizontal', name: 'Horizontal' },
  { id: 'crosshatch', name: 'Crosshatch' },
  { id: 'paper', name: 'Notebook' },
  { id: 'blueprint', name: 'Blueprint' },
  { id: 'zigzag', name: 'Zigzag' },
  { id: 'triangles', name: 'Triangles' },
  { id: 'polka-lg', name: 'Large Polka' },
  { id: 'stripes-sm', name: 'Fine Stripes' },
  { id: 'honeycomb', name: 'Honeycomb' },
  { id: 'plus', name: 'Pluses' },
  { id: 'dashed', name: 'Dashed Grid' },
  { id: 'waves', name: 'Waves' },
  { id: 'checker-sm', name: 'Small Check' },
  { id: 'lined-paper', name: 'Lined' }
];

export const getPatternStyle = (patternId: string | undefined, color: string = '#94a3b8'): CSSProperties => {
  if (!patternId || patternId === 'none') return {};

  const c = color;
  const common = { backgroundRepeat: 'repeat' };

  switch (patternId) {
    case 'grid':
      return { 
        backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`, 
        backgroundSize: '20px 20px',
        ...common
      };
    case 'dots':
      return { 
        backgroundImage: `radial-gradient(${c} 1px, transparent 1px)`, 
        backgroundSize: '20px 20px',
        ...common
      };
    case 'dots-lg':
      return { 
        backgroundImage: `radial-gradient(${c} 2px, transparent 2px)`, 
        backgroundSize: '30px 30px',
        ...common
      };
    case 'diagonal':
      return { 
        backgroundImage: `repeating-linear-gradient(45deg, ${c}, ${c} 1px, transparent 1px, transparent 10px)`,
        ...common
      };
    case 'diagonal-wide':
      return { 
        backgroundImage: `repeating-linear-gradient(45deg, ${c}, ${c} 2px, transparent 2px, transparent 20px)`,
        ...common
      };
    case 'vertical':
      return { 
        backgroundImage: `repeating-linear-gradient(90deg, ${c}, ${c} 1px, transparent 1px, transparent 20px)`,
        ...common
      };
    case 'horizontal':
      return { 
        backgroundImage: `repeating-linear-gradient(0deg, ${c}, ${c} 1px, transparent 1px, transparent 20px)`,
        ...common
      };
    case 'crosshatch':
      return { 
        backgroundImage: `repeating-linear-gradient(45deg, ${c}, ${c} 1px, transparent 1px, transparent 10px), repeating-linear-gradient(-45deg, ${c}, ${c} 1px, transparent 1px, transparent 10px)`,
        ...common
      };
    case 'paper':
      return { 
        backgroundImage: `linear-gradient(${c} 1px, transparent 1px)`, 
        backgroundSize: '100% 25px',
        ...common
      };
    case 'blueprint':
      return { 
        backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`, 
        backgroundSize: '50px 50px',
        ...common
      };
    case 'zigzag':
      return { 
        backgroundImage: `linear-gradient(135deg, ${c} 25%, transparent 25%), linear-gradient(225deg, ${c} 25%, transparent 25%), linear-gradient(45deg, ${c} 25%, transparent 25%), linear-gradient(315deg, ${c} 25%, transparent 25%)`, 
        backgroundPosition: '10px 0, 10px 0, 0 0, 0 0', 
        backgroundSize: '20px 20px', 
        opacity: 0.5,
        ...common
      };
    case 'triangles':
      return { 
        backgroundImage: `linear-gradient(45deg, ${c} 25%, transparent 25%, transparent 75%, ${c} 75%, ${c}), linear-gradient(-45deg, ${c} 25%, transparent 25%, transparent 75%, ${c} 75%, ${c})`, 
        backgroundSize: '20px 20px', 
        backgroundPosition: '0 0, 10px 10px',
        opacity: 0.5,
        ...common
      };
    case 'polka-lg':
      return { 
        backgroundImage: `radial-gradient(${c} 15%, transparent 16%)`, 
        backgroundSize: '20px 20px',
        ...common
      };
    case 'stripes-sm':
      return { 
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 4px, ${c} 4px, ${c} 5px)`, 
        backgroundSize: '100% 5px',
        ...common
      };
    case 'honeycomb':
      return { 
        backgroundImage: `radial-gradient(circle, ${c} 2px, transparent 2.5px)`, 
        backgroundSize: '16px 16px', 
        backgroundPosition: '0 0, 8px 8px',
        ...common
      };
    case 'plus':
      return { 
        backgroundImage: `linear-gradient(transparent 9px, ${c} 9px, ${c} 11px, transparent 11px), linear-gradient(90deg, transparent 9px, ${c} 9px, ${c} 11px, transparent 11px)`, 
        backgroundSize: '20px 20px',
        ...common
      };
    case 'dashed':
      return { 
        backgroundImage: `linear-gradient(90deg, ${c} 50%, transparent 50%), linear-gradient(${c} 50%, transparent 50%)`, 
        backgroundSize: '10px 2px, 2px 10px',
        ...common
      };
    case 'waves':
      return { 
        backgroundImage: `radial-gradient(circle at 100% 50%, transparent 20%, ${c} 21%, ${c} 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, ${c} 21%, ${c} 34%, transparent 35%, transparent) `, 
        backgroundSize: '20px 20px', 
        backgroundPosition: '0 0, 10px 10px',
        opacity: 0.5,
        ...common
      };
    case 'checker-sm':
      return { 
        backgroundImage: `linear-gradient(45deg, ${c} 25%, transparent 25%), linear-gradient(-45deg, ${c} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${c} 75%), linear-gradient(-45deg, transparent 75%, ${c} 75%)`, 
        backgroundSize: '20px 20px', 
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        opacity: 0.3,
        ...common
      };
    case 'lined-paper':
      return { 
        backgroundImage: `linear-gradient(${c} 1px, transparent 1px)`, 
        backgroundSize: '100% 24px',
        ...common
      };
    default:
      return {};
  }
};