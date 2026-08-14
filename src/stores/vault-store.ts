"use client";

import { create } from "zustand";
import type { Collection, ComponentState, ComponentVariant, VaultComponent, WindowKey } from "@/types/vault";
import { demoCollections, demoComponents } from "@/services/demo-data";
import {
  createCollection as createCollectionRequest,
  createComponent as createComponentRequest,
  deleteCollection as deleteCollectionRequest,
  deleteComponent as deleteComponentRequest,
  getVaultData,
  toggleComponentFavorite,
  updateCollection as updateCollectionRequest,
  updateComponent as updateComponentRequest,
} from "@/services/vault-service";

type EditorTab = "Component.tsx" | "styles.css" | "usage.tsx" | "notes.md";
type InspectorTab = "PROPS" | "STATES" | "TOKENS" | "NOTES" | "USAGE";
type DeviceMode = "Desktop" | "Tablet" | "Mobile";

type WindowState = {
  minimized: boolean;
  closed: boolean;
  maximized: boolean;
};

type VaultState = {
  components: VaultComponent[];
  collections: Collection[];
  isHydrated: boolean;
  isSyncing: boolean;
  backendError: string | null;
  activeComponentSlug: string;
  activeWindow: WindowKey;
  windows: Record<WindowKey, WindowState>;
  editorTab: EditorTab;
  inspectorTab: InspectorTab;
  terminalLogs: string[];
  search: string;
  category: string;
  viewMode: "grid" | "list";
  gridEnabled: boolean;
  guidesEnabled: boolean;
  deviceMode: DeviceMode;
  zoom: number;
  previewState: ComponentState;
  previewVariant: ComponentVariant;
  tableSettings: { density: "Compact" | "Comfortable"; stripedRows: boolean; stickyHeader: boolean; borders: boolean; rows: number; columns: number; sortable: boolean; pagination: boolean; radius: number; rowHeight: number; headerBackground: string };
  setSelectedComponent: (slug: string) => void;
  setActiveComponentSlug: (slug: string) => void;
  setActiveWindow: (window: WindowKey) => void;
  toggleWindow: (window: WindowKey, action: "minimize" | "maximize" | "close" | "restore") => void;
  setEditorTab: (tab: EditorTab) => void;
  setInspectorTab: (tab: InspectorTab) => void;
  addLog: (message: string) => void;
  setSearch: (value: string) => void;
  setCategory: (value: string) => void;
  setViewMode: (mode: "grid" | "list") => void;
  loadVault: (force?: boolean) => Promise<void>;
  createComponent: (input?: Partial<VaultComponent>) => Promise<VaultComponent | null>;
  updateComponentDetails: (id: string, patch: Partial<VaultComponent>) => Promise<VaultComponent | null>;
  deleteComponent: (id: string) => Promise<boolean>;
  createCollection: (input?: Partial<Collection>) => Promise<Collection | null>;
  updateCollection: (id: string, patch: Partial<Collection>) => Promise<Collection | null>;
  deleteCollection: (id: string) => Promise<boolean>;
  toggleCollectionComponent: (collectionId: string, componentId: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  updateCode: (id: string, field: "code" | "styles" | "usageCode" | "notes", value: string) => Promise<void>;
  setGridEnabled: (value: boolean) => void;
  setGuidesEnabled: (value: boolean) => void;
  setDeviceMode: (value: DeviceMode) => void;
  setZoom: (value: number) => void;
  setPreviewState: (value: ComponentState) => void;
  setPreviewVariant: (value: ComponentVariant) => void;
  updateTableSettings: (values: Partial<VaultState["tableSettings"]>) => void;
};

const defaultWindowState: Record<WindowKey, WindowState> = {
  browser: { minimized: false, closed: false, maximized: false },
  preview: { minimized: false, closed: false, maximized: false },
  editor: { minimized: false, closed: false, maximized: false },
  inspector: { minimized: false, closed: false, maximized: false },
  terminal: { minimized: false, closed: false, maximized: false },
};

function mergeSeedComponents(components: VaultComponent[]) {
  const byId = new Map(demoComponents.map((component) => [component.id, component]));
  for (const component of components) byId.set(component.id, component);
  return Array.from(byId.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

function mergeSeedCollections(collections: Collection[]) {
  const byId = new Map(demoCollections.map((collection) => [collection.id, collection]));
  for (const collection of collections) {
    const seed = byId.get(collection.id);
    byId.set(collection.id, { ...collection, componentIds: Array.from(new Set([...(seed?.componentIds ?? []), ...collection.componentIds])) });
  }
  return Array.from(byId.values());
}

export const useVaultStore = create<VaultState>((set, get) => ({
  components: demoComponents,
  collections: demoCollections,
  isHydrated: false,
  isSyncing: false,
  backendError: null,
  activeComponentSlug: demoComponents[0].slug,
  activeWindow: "browser",
  windows: defaultWindowState,
  editorTab: "Component.tsx",
  inspectorTab: "PROPS",
  terminalLogs: ["All systems operational.", "Preview compiled.", "Vault drive mounted."],
  search: "",
  category: "All Components",
  viewMode: "grid",
  gridEnabled: true,
  guidesEnabled: true,
  deviceMode: "Desktop",
  zoom: 100,
  previewState: "Default",
  previewVariant: "Primary",
  tableSettings: { density: "Comfortable", stripedRows: true, stickyHeader: true, borders: true, rows: 5, columns: 4, sortable: true, pagination: true, radius: 4, rowHeight: 42, headerBackground: "#DED9CB" },
  setSelectedComponent: (slug) => get().setActiveComponentSlug(slug),
  setActiveComponentSlug: (slug) => {
    const selected = get().components.find((component) => component.slug === slug || component.id === slug);
    if (!selected) return;
    set({ activeComponentSlug: selected.slug, previewState: selected.props.state ?? "Default", previewVariant: selected.props.variant ?? "Primary" });
    get().addLog(`${selected.name} selected.`);
  },
  setActiveWindow: (window) => set({ activeWindow: window }),
  toggleWindow: (window, action) => set((state) => {
    const next = { ...state.windows[window] };
    if (action === "minimize") next.minimized = true;
    if (action === "maximize") next.maximized = !next.maximized;
    if (action === "close") next.closed = true;
    if (action === "restore") { next.closed = false; next.minimized = false; next.maximized = false; }
    return { activeWindow: window, windows: { ...state.windows, [window]: next } };
  }),
  setEditorTab: (tab) => set({ editorTab: tab, activeWindow: "editor" }),
  setInspectorTab: (tab) => set({ inspectorTab: tab, activeWindow: "inspector" }),
  addLog: (message) => set((state) => ({ terminalLogs: [message, ...state.terminalLogs].slice(0, 8) })),
  setSearch: (value) => set({ search: value }),
  setCategory: (value) => set({ category: value }),
  setViewMode: (mode) => set({ viewMode: mode }),
  loadVault: async (force = false) => {
    if (get().isHydrated && !force) return;
    set({ isSyncing: true, backendError: null });
    try {
      const payload = await getVaultData();
      set({ components: mergeSeedComponents(payload.components), collections: mergeSeedCollections(payload.collections), isHydrated: true, isSyncing: false });
    } catch (error) {
      set({
        // The seed dataset is a valid offline/read-only fallback. Do not leave routes suspended when the optional backend is unavailable.
        isHydrated: true,
        isSyncing: false,
        backendError: error instanceof Error ? error.message : "Unable to load vault backend.",
      });
    }
  },
  createComponent: async (input = {}) => {
    set({ isSyncing: true, backendError: null });
    try {
      const component = await createComponentRequest(input);
      set((state) => ({ components: [component, ...state.components.filter((item) => item.id !== component.id)], activeComponentSlug: component.slug, isSyncing: false }));
      get().addLog(`${component.name} created in Convex.`);
      return component;
    } catch (error) {
      set({ backendError: error instanceof Error ? error.message : "Unable to create component.", isSyncing: false });
      return null;
    }
  },
  updateComponentDetails: async (id, patch) => {
    const previous = get().components;
    const current = previous.find((component) => component.id === id || component.slug === id);
    if (!current) return null;
    const optimistic = { ...current, ...patch, updatedAt: new Date().toISOString() };
    set((state) => ({ components: state.components.map((component) => (component.id === current.id ? optimistic : component)), activeComponentSlug: patch.slug ?? state.activeComponentSlug, backendError: null }));
    try {
      const component = await updateComponentRequest(current.id, { ...patch, updatedAt: optimistic.updatedAt });
      set((state) => ({ components: state.components.map((item) => (item.id === component.id ? component : item)), activeComponentSlug: component.slug }));
      return component;
    } catch (error) {
      set({ components: previous, backendError: error instanceof Error ? error.message : "Unable to update component." });
      return null;
    }
  },
  deleteComponent: async (id) => {
    try {
      await deleteComponentRequest(id);
      set((state) => ({ components: state.components.filter((component) => component.id !== id), activeComponentSlug: state.components.find((component) => component.id !== id)?.slug ?? demoComponents[0].slug }));
      return true;
    } catch (error) {
      set({ backendError: error instanceof Error ? error.message : "Unable to delete component." });
      return false;
    }
  },
  createCollection: async (input = {}) => {
    try {
      const collection = await createCollectionRequest(input);
      set((state) => ({ collections: [collection, ...state.collections.filter((item) => item.id !== collection.id)] }));
      return collection;
    } catch (error) {
      set({ backendError: error instanceof Error ? error.message : "Unable to create collection." });
      return null;
    }
  },
  updateCollection: async (id, patch) => {
    try {
      const collection = await updateCollectionRequest(id, patch);
      set((state) => ({ collections: state.collections.map((item) => (item.id === collection.id ? collection : item)) }));
      return collection;
    } catch (error) {
      set({ backendError: error instanceof Error ? error.message : "Unable to update collection." });
      return null;
    }
  },
  deleteCollection: async (id) => {
    try {
      await deleteCollectionRequest(id);
      set((state) => ({ collections: state.collections.filter((item) => item.id !== id) }));
      return true;
    } catch (error) {
      set({ backendError: error instanceof Error ? error.message : "Unable to delete collection." });
      return false;
    }
  },
  toggleCollectionComponent: async (collectionId, componentId) => {
    const collection = get().collections.find((item) => item.id === collectionId);
    if (!collection) return;
    const has = collection.componentIds.includes(componentId);
    const next = has ? collection.componentIds.filter((id) => id !== componentId) : [...collection.componentIds, componentId];
    set((state) => ({ collections: state.collections.map((item) => (item.id === collectionId ? { ...item, componentIds: next } : item)) }));
    try { await updateCollectionRequest(collectionId, { componentIds: next }); } catch (error) { set({ backendError: error instanceof Error ? error.message : "Unable to update collection." }); }
  },
  toggleFavorite: async (id) => {
    const current = get().components.find((component) => component.id === id);
    if (!current) return;
    const nextFavorite = !current.isFavorite;
    set((state) => ({ components: state.components.map((component) => component.id === id ? { ...component, isFavorite: nextFavorite } : component) }));
    try { await toggleComponentFavorite(id, nextFavorite); } catch (error) { set({ backendError: error instanceof Error ? error.message : "Unable to update favorite." }); }
  },
  updateCode: async (id, field, value) => {
    const component = get().components.find((item) => item.id === id);
    if (!component) return;
    set((state) => ({ components: state.components.map((item) => item.id === id ? { ...item, [field]: value, updatedAt: new Date().toISOString() } : item) }));
    try { await updateComponentRequest(id, { [field]: value, updatedAt: new Date().toISOString() }); } catch (error) { set({ backendError: error instanceof Error ? error.message : "Unable to update component code." }); }
  },
  setGridEnabled: (value) => set({ gridEnabled: value }),
  setGuidesEnabled: (value) => set({ guidesEnabled: value }),
  setDeviceMode: (value) => set({ deviceMode: value }),
  setZoom: (value) => set({ zoom: value }),
  setPreviewState: (value) => set({ previewState: value }),
  setPreviewVariant: (value) => set({ previewVariant: value }),
  updateTableSettings: (values) => set((state) => ({ tableSettings: { ...state.tableSettings, ...values } })),
}));
