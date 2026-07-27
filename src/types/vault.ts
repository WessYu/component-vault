export type ComponentCategory =
  | "Buttons"
  | "Cards"
  | "Forms"
  | "Navigation"
  | "Data Display"
  | "Feedback"
  | "Surfaces"
  | "Charts"
  | "Utilities";

export type ComponentState =
  | "Default"
  | "Hover"
  | "Focus"
  | "Active"
  | "Disabled"
  | "Loading"
  | "Error";

export type ComponentSize = "Small" | "Medium" | "Large";
export type ComponentVariant = "Primary" | "Secondary" | "Ghost" | "Danger" | "Success";

export type VaultComponent = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string;
  category: ComponentCategory;
  framework: "React" | "HTML";
  language: "tsx" | "jsx" | "html";
  code: string;
  styles: string;
  usageCode: string;
  notes: string;
  version: string;
  isFavorite: boolean;
  isPublic: boolean;
  tags: string[];
  collectionIds: string[];
  updatedAt: string;
  previewHtml: string;
  tokens: DesignToken[];
  usage: ComponentUsage[];
  props: {
    variant: ComponentVariant;
    size: ComponentSize;
    state: ComponentState;
    iconLeft: boolean;
    iconRight: boolean;
    fullWidth: boolean;
    disabled: boolean;
    loading: boolean;
  };
};

export type Collection = {
  id: string;
  name: string;
  description: string;
  componentIds: string[];
  updatedAt: string;
};

export type DesignToken = {
  id: string;
  type: "color" | "spacing" | "radius" | "shadow" | "typography" | "border";
  name: string;
  value: string;
};

export type ComponentUsage = {
  id: string;
  projectName: string;
  location: string;
  url: string;
  count: number;
};

export type WindowKey = "browser" | "preview" | "editor" | "inspector" | "terminal";
