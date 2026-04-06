import { create } from 'zustand';
import { SiteSettings } from '../types';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface SettingsState {
  settings: SiteSettings | null;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
}

const DEFAULT_SETTINGS: Omit<SiteSettings, 'id'> = {
  general: {
    siteName: 'LUXE.',
    logo: '',
    favicon: '',
    homepageSlug: 'home'
  },
  header: {
    menuId: 'main-menu',
    showSearch: true,
    sticky: true
  },
  footer: {
    copyright: `© ${new Date().getFullYear()} LuxeCommerce. All rights reserved.`,
    showAdminLogin: true,
    columns: [
      {
        title: 'Shop',
        items: [
          { label: 'All Products', url: '/shop' },
          { label: 'New Arrivals', url: '/categories/new-arrivals' },
          { label: 'Featured', url: '/categories/featured' },
          { label: 'Sale', url: '/categories/sale' }
        ]
      },
      {
        title: 'Support',
        items: [
          { label: 'Contact Us', url: '/contact' },
          { label: 'Shipping Info', url: '/shipping' },
          { label: 'Returns & Exchanges', url: '/returns' },
          { label: 'FAQ', url: '/faq' }
        ]
      },
      {
        title: 'Legal',
        items: [
          { label: 'Privacy Policy', url: '/privacy' },
          { label: 'Terms of Service', url: '/terms' }
        ]
      }
    ],
    socialLinks: []
  },
  theme: {
    primaryColor: '#000000',
    fontFamily: 'Inter',
    borderRadius: '1rem'
  }
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: true,
  fetchSettings: async () => {
    set({ isLoading: true });
    const docRef = doc(db, 'settings', 'site-config');
    
    // Initial fetch
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      set({ settings: { id: snap.id, ...snap.data() } as SiteSettings, isLoading: false });
    } else {
      // Create default if not exists
      await setDoc(docRef, DEFAULT_SETTINGS);
      set({ settings: { id: 'site-config', ...DEFAULT_SETTINGS } as SiteSettings, isLoading: false });
    }

    // Subscribe to changes
    onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        set({ settings: { id: doc.id, ...doc.data() } as SiteSettings });
      }
    });
  },
  updateSettings: async (newSettings) => {
    const docRef = doc(db, 'settings', 'site-config');
    const current = get().settings;
    if (!current) return;

    const updated = { ...current, ...newSettings };
    // Remove id before saving
    const { id, ...data } = updated;
    await setDoc(docRef, data);
  }
}));
