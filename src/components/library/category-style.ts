import type { VaultComponent } from "@/types/vault";

export type VisualCategory = "Data Display" | "Inputs" | "Navigation" | "Layout" | "Feedback" | "Forms" | "Utilities" | "Surfaces" | "Charts" | "Cards";

export function visualCategory(componentOrCategory: VaultComponent | string): VisualCategory {
  const category = typeof componentOrCategory === "string" ? componentOrCategory : componentOrCategory.category;
  if (category === "Buttons") return "Inputs";
  if (category === "Cards") return "Cards";
  return category as VisualCategory;
}

export function categoryStyle(categoryInput: VaultComponent | string) {
  const category = visualCategory(categoryInput);
  const styles: Record<string, { accent: string; soft: string; border: string; text: string; gradient: string }> = {
    "Data Display": { accent: "#4C8DFF", soft: "#EEF5FF", border: "#B8D4FF", text: "#2157B3", gradient: "from-[#EEF5FF] to-[#F8FBFF]" },
    Inputs: { accent: "#FF7664", soft: "#FFF1EF", border: "#FFC8C0", text: "#B8493B", gradient: "from-[#FFF1EF] to-[#FFF9F7]" },
    Navigation: { accent: "#F1BE48", soft: "#FFF8E6", border: "#F8DA85", text: "#8A640A", gradient: "from-[#FFF8E6] to-[#FFFCF4]" },
    Layout: { accent: "#51C89B", soft: "#ECFBF5", border: "#AEE8D2", text: "#187351", gradient: "from-[#ECFBF5] to-[#F7FFFB]" },
    Feedback: { accent: "#9A78FF", soft: "#F4F0FF", border: "#D2C5FF", text: "#6546C7", gradient: "from-[#F4F0FF] to-[#FBFAFF]" },
    Forms: { accent: "#E978D4", soft: "#FDF0FA", border: "#F4BFE9", text: "#A83D96", gradient: "from-[#FDF0FA] to-[#FFF8FD]" },
    Utilities: { accent: "#7A86A1", soft: "#F0F3F8", border: "#D5DAE7", text: "#4B556F", gradient: "from-[#F0F3F8] to-[#FAFBFD]" },
    Surfaces: { accent: "#56C7D9", soft: "#ECFAFC", border: "#ADE6EE", text: "#167889", gradient: "from-[#ECFAFC] to-[#F8FEFF]" },
    Charts: { accent: "#6366F1", soft: "#EEF0FF", border: "#C7CCFF", text: "#4548B8", gradient: "from-[#EEF0FF] to-[#FAFAFF]" },
    Cards: { accent: "#6366F1", soft: "#EEF0FF", border: "#C7CCFF", text: "#4548B8", gradient: "from-[#EEF0FF] to-[#FAFAFF]" },
  };

  return styles[category] ?? styles.Utilities;
}

export function cardSpan(component: VaultComponent) {
  if (component.slug === "table-data-grid" || component.slug === "navbar-floating") return "md:col-span-2";
  if (component.slug === "pricing-card" || component.slug === "profile-compact") return "md:row-span-2";
  if (component.slug === "card-stats") return "lg:col-span-2";
  return "";
}
