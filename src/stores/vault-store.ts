"use client";

import { create } from "zustand";
import type { Collection, ComponentState, ComponentVariant, VaultComponent, WindowKey } from "@/types/vault";
import { demoCollections, demoComponents } from "@/services/demo-data";
import {
  createCollection as createCollectionRequest,
  createComponent as createComponentRequest,
  getVaultData,
  toggleComponentFavorite,
  updateComponent,
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
  tableSettings: {
    density: "Compact" | "Comfortable";
    stripedRows: boolean;
    stickyHeader: boolean;
    borders: boolean;
    rows: number;
    columns: number;
    sortable: boolean;
    pagination: boolean;
    radius: number;
    rowHeight: number;
    headerBackground: string;
  };
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
  createCollection: (input?: Partial<Collection>) => Promise<Collection | null>;
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
  tableSettings: {
    density: "Comfortable",
    stripedRows: true,
    stickyHeader: true,
    borders: true,
    rows: 5,
    columns: 4,
    sortable: true,
    pagination: true,
    radius: 4,
    rowHeight: 42,
    headerBackground: "#DED9CB",
  },
  setSelectedComponent: (slug) => get().setActiveComponentSlug(slug),
  setActiveComponentSlug: (slug) => {
    const selected = get().components.find((component) => component.slug === slug || component.id === slug);
    if (!selected) return;
    set({
      activeComponentSlug: selected.slug,
      previewState: selected?.props.state ?? "Default",
      previewVariant: selected?.props.variant ?? "Primary",
    });
    get().addLog(`${selected?.name ?? "Component"} selected.`);
  },
  setActiveWindow: (window) => set({ activeWindow: window }),
  toggleWindow: (window, action) =>
    set((state) => {
      const next = { ...state.windows[window] };
      if (action === "minimize") next.minimized = true;
      if (action === "maximize") next.maximized = !next.maximized;
      if (action === "close") next.closed = true;
      if (action === "restore") {
        next.closed = false;
        next.minimized = false;
        next.maximized = false;
      }

      return {
        activeWindow: window,
        windows: {
          ...state.windows,
          [window]: next,
        },
      };
    }),
  setEditorTab: (tab) => set({ editorTab: tab, activeWindow: "editor" }),
  setInspectorTab: (tab) => set({ inspectorTab: tab, activeWindow: "inspector" }),
  addLog: (message) =>
    set((state) => ({
      terminalLogs: [message, ...state.terminalLogs].slice(0, 8),
    })),
  setSearch: (value) => set({ search: value }),
  setCategory: (value) => set({ category: value }),
  setViewMode: (mode) => set({ viewMode: mode }),
  loadVault: async (force = false) => {
    if (get().isHydrated && !force) return;
    set({ isSyncing: true, backendError: null });
    try {
      const payload = await getVaultData();
      set({
        components: payload.components,
        collections: payload.collections,
        isHydrated: true,
        isSyncing: false,
      });
    } catch (error) {
      set({
        backendError: error instanceof Error ? error.message : "Unable to load vault backend.",
        isSyncing: false,
      });
    }
  },
  createComponent: async (input = {}) => {
    set({ isSyncing: true, backendError: null });
    try {
      const component = await createComponentRequest(input);
      set((state) => ({
        components: [component, ...state.components.filter((item) => item.id !== component.id)],
        activeComponentSlug: component.slug,
        isSyncing: false,
      }));
      return component;
    } catch (error) {
      set({ backendError: error instanceof Error ? error.message : "Unable to create component.", isSyncing: false });
      return null;
    }
  },
  createCollection: async (input = {}) => {
    set({ isSyncing: true, backendError: null });
    try {
      const collection = await createCollectionRequest(input);
      set((state) => ({
        collections: [collection, ...state.collections.filter((item) => item.id !== collection.id)],
        isSyncing: false,
      }));
      return collection;
    } catch (error) {
      set({ backendError: error instanceof Error ? error.message : "Unable to create collection.", isSyncing: false });
      return null;
    }
  },
  toggleFavorite: async (id) => {
    const previous = get().components;
    set((state) => ({
      components: state.components.map((component) =>
        component.id === id ? { ...component, isFavorite: !component.isFavorite } : component,
      ),
      backendError: null,
    }));
    try {
      const component = await toggleComponentFavorite(id);
      set((state) => ({
        components: state.components.map((item) => (item.id === component.id ? component : item)),
      }));
    } catch (error) {
      set({ components: previous, backendError: error instanceof Error ? error.message : "Unable to update favorite." });
    }
  },
  updateCode: async (id, field, value) => {
    const previous = get().components;
    const updatedAt = new Date().toISOString();
    set((state) => ({
      components: state.components.map((component) =>
        component.id === id ? { ...component, [field]: value, updatedAt } : component,
      ),
      backendError: null,
    }));
    try {
      const component = await updateComponent(id, { [field]: value, updatedAt });
      set((state) => ({
        components: state.components.map((item) => (item.id === component.id ? component : item)),
      }));
    } catch (error) {
      set({ components: previous, backendError: error instanceof Error ? error.message : "Unable to save component." });
    }
  },
  setGridEnabled: (value) => set({ gridEnabled: value }),
  setGuidesEnabled: (value) => set({ guidesEnabled: value }),
  setDeviceMode: (value) => set({ deviceMode: value }),
  setZoom: (value) => set({ zoom: value }),
  setPreviewState: (value) => {
    set({ previewState: value });
    get().addLog(`Preview state set to ${value}.`);
  },
  setPreviewVariant: (value) => {
    set({ previewVariant: value });
    get().addLog(`Variant switched to ${value}.`);
  },
  updateTableSettings: (values) =>
    set((state) => ({
      tableSettings: {
        ...state.tableSettings,
        ...values,
      },
    })),
}));

export function useSelectedComponent() {
  return useVaultStore((state) => state.components.find((component) => component.slug === state.activeComponentSlug) ?? state.components[0]);
}
