'use client';
import React, { createContext, useContext, useState } from 'react';

export type Theme = {
  vibe?: string;
  palette: { brand: string; accent: string; background: string; foreground: string };
  typography?: { body?: string; headings?: string };
  density?: 'compact' | 'cozy' | 'comfortable';
};

export type SiteData = {
  theme: Theme;
  brand: { name: string; tagline: string; industry?: string };
  hero: { title: string; subtitle: string; cta?: { label: string; href?: string } };
  about?: { heading?: string; body?: string };
  features?: { title?: string; items?: { title: string; body: string }[] };
  gallery?: { title?: string; images?: { src: string; alt?: string }[] };
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
  setDensity: (density: 'compact' | 'cozy' | 'comfortable') => void;
  rebuild: () => Promise<void>;
};

const defaultTheme: Theme = {
  palette: { brand: '#4f46e5', accent: '#06b6d4', background: '#ffffff', foreground: '#111827' },
};

const defaultSite: SiteData = {
  theme: defaultTheme,
  brand: { name: 'Your Brand', tagline: 'Tagline goes here' },
  hero: { title: 'Welcome', subtitle: 'Let’s build something great.' },
};

const Ctx = createContext<CtxShape | null>(null);

export const BuilderProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [brief, setBrief] = useState('');
  const [data, setData] = useState<SiteData>(defaultSite);

  const applyTheme: CtxShape['applyTheme'] = (t) => {
    setData((cur) => ({
      ...cur,
      theme: { ...cur.theme, ...(t as any) },
    }));
  };

  const addSection: CtxShape['addSection'] = (section, payload) => {
    setData((cur) => ({
      ...cur,
      [section]: (payload ?? (cur as any)[section]) as any,
    }));
  };

  const removeSection: CtxShape['removeSection'] = (section) => {
    setData((cur) => {
      const copy: any = { ...cur };
      delete copy[section];
      return copy;
    });
  };

  const patchSection: CtxShape['patchSection'] = (section, patch) =>
    setData((cur) => ({
      ...cur,
      [section]: { ...(cur as any)[section], ...(patch || {}) } as any,
    }));

  const setTypography: CtxShape['setTypography'] = (fonts) => applyTheme({ typography: fonts });
  const setDensity: CtxShape['setDensity'] = (density) => applyTheme({ density });

  const rebuild: CtxShape['rebuild'] = async () => {
    // This is a stub. Your UI will trigger /api/chat with intent: 'rebuild' and then you can reset state here.
    setData(defaultSite);
  };

  return (
    <Ctx.Provider
      value={{ brief, setBrief, data, setData, applyTheme, addSection, removeSection, patchSection, setTypography, setDensity, rebuild }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useBuilder = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBuilder must be used within BuilderProvider');
  return ctx;
};
