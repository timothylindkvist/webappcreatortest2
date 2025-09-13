'use client';
import React, { createContext, useContext, useState } from 'react';

export type Theme = {
  vibe?: string;
  palette: { brand: string; accent: string; background: string; foreground: string };
  typography?: { body?: string; headings?: string };
  density?: 'compact' | 'cozy' | 'comfortablertable';
};

export type SiteData = {
  theme: Theme;
  brand: { name: string; tagline: string; industry?: string };
  hero: { title: string; subtitle: string; cta?: { label: string; href?: string } };
  about?: { heading?: string; body?: string };
  features?: { title?: string; items?: { title: string; body: string }[] };
  gallery?: { title?: string; images?: { src: string; caption?: string; alt?: string }[] };
  testimonials?: { title?: string; items?: { quote: string; author?: string }[] };
  pricing?: { title?: string; plans?: { name: string; price?: string; features?: string[] }[] };
  faq?: { title?: string; items?: { q: string; a: string }[] };
  cta?: { title?: string; subtitle?: string; button?: { label: string; href?: string } };
};

type CtxShape = {
  brief: string;
  setBrief: (b: string) => void;
  data: SiteData;
  setData: (d: SiteData) => void;
  applyTheme: (t: Partial<Theme> | { brand?: string; accent?: string; background?: string; foreground?: string }) => void;
  addSection: (section: keyof SiteData, payload?: any) => void;
  removeSection: (section: keyof SiteData) => void;
  patchSection: (section: keyof SiteData, patch: any) => void;
  setTypography: (fonts: { body?: string; headings?: string }) => void;
  setDensity: (density: 'compact' | 'cozy' | 'comfortablertable') => void;
  applyStylePreset: (preset: string) => void;
  fixImages: (section?: keyof SiteData | 'all') => void;
  redesign: (concept?: string) => void;
  rebuild: () => Promise<void>;
};

const BuilderCtx = createContext<CtxShape | null>(null);

export const BuilderProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [brief, setBrief] = useState('');
  const [data, setData] = useState<SiteData>({
    theme: { palette: { brand: '#7C3AED', accent: '#06B6D4', background: '#ffffff', foreground: '#0b0f19' }, density: 'cozy' },
    brand: { name: 'Your Brand', tagline: 'Let’s build something great.' },
    hero: { title: 'Describe your site in the chat →', subtitle: 'The assistant will design & edit live.' },
  });

  const applyTheme: CtxShape['applyTheme'] = (themeLike) => {
    const flat: any = themeLike || {};
    const incomingPalette =
      'palette' in flat
        ? flat.palette
        : (flat.brand || flat.accent || flat.background || flat.foreground)
          ? { brand: flat.brand, accent: flat.accent, background: flat.background, foreground: flat.foreground }
          : undefined;

    setData((cur) => ({
    cur,
    [section]: { (cur as any)[section], (patch || {}) } as any,
  }));
  };

  const addSection: CtxShape['addSection'] = (section, payload) =>
    setData((cur) => ({
    cur,
    [section]: { (cur as any)[section], (patch || {}) } as any,
  }));

  const removeSection: CtxShape['removeSection'] = (section) =>
    setData((cur) => ({
    cur,
    [section]: { (cur as any)[section], (patch || {}) } as any,
  }));

  const setTypography: CtxShape['setTypography'] = (fonts) => applyTheme({ typography: fonts });
  const setDensity: CtxShape['setDensity'] = (density) => applyTheme({ density });
  const applyStylePreset: CtxShape['applyStylePreset'] = (preset) => applyTheme({ vibe: preset });

  const fixImages: CtxShape['fixImages'] = (which = 'all') => {
    setData((cur) => ({
    cur,
    [section]: { (cur as any)[section], (patch || {}) } as any,
  }));
        }
      });

      return copy;
    });
  };


  // Expose handlers for chat tool calls
  if (typeof window !== 'undefined') {
    (window as any).__sidesmithTools = {
      setSiteData: (args: any) => setData(args),
      updateBrief: (args: any) => setBrief(args?.brief ?? ''),
      applyTheme: (args: any) => applyTheme(args),
      addSection: (args: any) => addSection(args?.section as any, args?.payload),
      removeSection: (args: any) => removeSection(args?.section as any),
      patchSection: (args: any) => patchSection(args?.section as any, args?.patch),
    };
  }

  const redesign: CtxShape['redesign'] = () => {
    // placeholder for future AI actions
  };

  const rebuild: CtxShape['rebuild'] = async () => {
    const res = await fetch('/api/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Build failed: ${res.status} ${errText}`);
    }
    const json = await res.json();
    if (json?.data) setData(json.data as SiteData);
  };

  return (
    <BuilderCtx.Provider
      value={{
        brief,
        setBrief,
        data,
        setData,
        applyTheme,
        addSection,
        removeSection,
        patchSection,
        setTypography,
        setDensity,
        applyStylePreset,
        fixImages,
        redesign,
        rebuild,
      }}
    >
      {children}
    </BuilderCtx.Provider>
  );
};

export const useBuilder = () => {
  const ctx = useContext(BuilderCtx);
  if (!ctx) throw new Error('useBuilder must be used within BuilderProvider');
  return ctx;
};
