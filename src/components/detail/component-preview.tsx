"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { EmergingTrendPreview } from "@/components/trends/emerging-trend-preview";
import { categoryStyle } from "@/components/library/category-style";
import { ExperiencePreview } from "@/components/experiences/shared/experience-shell";
import { getExperience, type ExperienceSlug } from "@/components/experiences/experience-data";
import { cn } from "@/lib/utils";
import type { VaultComponent } from "@/types/vault";

type PreviewProps = {
  component: VaultComponent;
  compact?: boolean;
  viewport?: "Desktop" | "Tablet" | "Mobile";
  variant?: string;
  theme?: "Light" | "Dark";
  tableOptions?: {
    density: "Compact" | "Comfortable";
    stripedRows: boolean;
    bordered: boolean;
    stickyHeader: boolean;
    pagination: boolean;
    selectable: boolean;
    sortable: boolean;
    loading: boolean;
    empty: boolean;
    error: boolean;
  };
  pricingOptions?: {
    tier: string;
    price: string;
    billing: string;
    features: string[];
    buttonLabel: string;
    accent: string;
    highlighted: boolean;
    loading: boolean;
    disabled: boolean;
  };
};

export function ComponentPreview({ component, compact = false, viewport = "Desktop", theme = "Light", tableOptions, pricingOptions }: PreviewProps) {
  const style = categoryStyle(component);
  const width = viewport === "Mobile" ? "max-w-[310px]" : viewport === "Tablet" ? "max-w-[560px]" : "max-w-[900px]";
  const isEmergingTrend = component.tags.includes("2026-trend") || component.slug.startsWith("trend-");
  const hasFullMotionExperience = component.category === "Motion Experiences" && getExperience(component.slug);
  const shouldUseMinimalPreview = compact && !isEmergingTrend && !hasFullMotionExperience;

  return (
    <motion.div
      layout={!compact}
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-[28px] border",
        compact ? "h-[176px] min-h-0 p-3" : "min-h-[430px] p-5",
        theme === "Dark" ? "border-[#25283A] bg-[#171A2B]" : "border-[#E4E7EF] bg-white",
      )}
      style={{
        background: theme === "Dark"
          ? `radial-gradient(circle at 20% 20%, ${style.accent}33, transparent 30%), #171A2B`
          : `radial-gradient(circle at 22px 22px, ${style.accent}22 1.5px, transparent 1.5px), linear-gradient(135deg, ${style.soft}, #fff)`,
        backgroundSize: theme === "Dark" ? "auto" : "22px 22px, auto",
      }}
    >
      <div className={cn("w-full transition-all duration-200", width, compact && "h-full max-w-none overflow-hidden")}>
        {shouldUseMinimalPreview ? (
          <MinimalLivePreview component={component} />
        ) : isEmergingTrend ? (
          <EmergingTrendPreview slug={component.slug} compact={compact} />
        ) : component.slug === "table-data-grid" ? (
          <DataTablePreview compact={compact} options={tableOptions} />
        ) : hasFullMotionExperience ? (
          <ExperiencePreview slug={component.slug as ExperienceSlug} />
        ) : component.slug === "pricing-card" ? (
          <PricingPreview compact={compact} options={pricingOptions} />
        ) : component.slug === "card-stats" ? (
          <AnalyticsPreview />
        ) : component.slug === "profile-compact" ? (
          <ProfilePreview />
        ) : component.slug === "navbar-floating" ? (
          <NavigationPreview />
        ) : component.slug === "input-text-field" ? (
          <FormPreview />
        ) : component.slug === "button-primary" ? (
          <ButtonPreview />
        ) : (
          <div className="mx-auto max-w-sm rounded-2xl border border-[#E4E7EF] bg-white p-5 shadow-xl shadow-[#171A2B]/8" dangerouslySetInnerHTML={{ __html: component.previewHtml }} />
        )}
      </div>
    </motion.div>
  );
}

function MinimalLivePreview({ component }: { component: VaultComponent }) {
  const style = categoryStyle(component);
  const tags = new Set(component.tags);

  if (component.category === "Motion Experiences") return <MiniMotionSurface style={style} tags={tags} />;
  if (component.category === "Charts" || tags.has("chart")) return <MiniChart style={style} variant={tags.has("donut") ? "donut" : tags.has("bar") ? "bar" : "line"} />;
  if (component.category === "Data Display" || tags.has("table") || tags.has("kanban") || tags.has("audit")) return <MiniDataSurface style={style} mode={tags.has("kanban") ? "kanban" : tags.has("audit") ? "timeline" : "table"} />;
  if (component.category === "Forms" || component.category === "Buttons" || tags.has("input") || tags.has("button") || tags.has("toggle")) return <MiniInputSurface style={style} mode={tags.has("button") ? "button" : tags.has("toggle") ? "toggle" : "field"} />;
  if (component.category === "Navigation" || tags.has("nav") || tags.has("toolbar") || tags.has("breadcrumb") || tags.has("command")) return <MiniNavigationSurface style={style} mode={tags.has("command") ? "command" : tags.has("breadcrumb") ? "breadcrumb" : "nav"} />;
  if (component.category === "Feedback" || tags.has("toast") || tags.has("alert") || tags.has("loading") || tags.has("badge")) return <MiniFeedbackSurface style={style} mode={tags.has("loading") ? "skeleton" : tags.has("alert") ? "alert" : "toast"} />;
  if (component.category === "Utilities" || tags.has("swatch") || tags.has("avatar") || tags.has("code") || tags.has("shortcut")) return <MiniUtilitySurface style={style} mode={tags.has("code") ? "code" : tags.has("avatar") ? "avatar" : tags.has("swatch") ? "swatch" : "chip"} />;
  return <MiniCardSurface style={style} mode={component.category === "Surfaces" ? "surface" : "card"} />;
}

function MiniFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid h-full min-h-[132px] place-items-center overflow-hidden rounded-[24px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_52px_rgba(23,26,43,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.85),transparent)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <motion.span
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.86),transparent)]"
        animate={{ x: ["0%", "420%"] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.35 }}
      />
      {children}
    </div>
  );
}

function MiniMotionSurface({ style, tags }: { style: ReturnType<typeof categoryStyle>; tags: Set<string> }) {
  if (tags.has("loading") || tags.has("skeleton")) return <MiniFeedbackSurface style={style} mode="skeleton" />;
  if (tags.has("tabs")) return <MiniNavigationSurface style={style} mode="nav" />;
  if (tags.has("route") || tags.has("progress")) {
    return (
      <MiniFrame>
        <div className="w-full max-w-[390px] rounded-2xl border border-[#E4E7EF] bg-white p-4 shadow-sm">
          <span className="block h-2 w-20 rounded-full bg-[#E8EBF2]" />
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#EEF0F6]">
            <motion.span className="block h-full rounded-full" style={{ background: style.accent }} animate={{ width: ["12%", "84%", "28%"] }} transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }} />
          </div>
        </div>
      </MiniFrame>
    );
  }

  if (tags.has("count") || tags.has("metric")) return <MiniChart style={style} variant="line" />;
  if (tags.has("drawer")) {
    return (
      <MiniFrame>
        <div className="relative h-28 w-full max-w-[390px] overflow-hidden rounded-[24px] border border-[#E4E7EF] bg-[#F7F8FC]">
          <motion.div className="absolute bottom-0 right-0 top-0 w-44 rounded-l-[28px] border-l border-[#E4E7EF] bg-white p-4 shadow-2xl" animate={{ x: [28, 0, 28] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
            <span className="block h-3 w-20 rounded-full" style={{ background: `${style.accent}55` }} />
            <span className="mt-4 block h-2.5 w-28 rounded-full bg-[#E8EBF2]" />
          </motion.div>
        </div>
      </MiniFrame>
    );
  }

  if (tags.has("reorder") || tags.has("drag")) {
    return (
      <MiniFrame>
        <div className="w-full max-w-[380px] space-y-2">
          {[0, 1, 2].map((row) => (
            <motion.div key={row} className="flex h-10 items-center gap-3 rounded-2xl border border-[#E4E7EF] bg-white px-3 shadow-sm" animate={{ y: row === 1 ? [0, -8, 0] : 0, boxShadow: row === 1 ? "0 18px 32px rgba(23,26,43,0.14)" : "0 1px 2px rgba(23,26,43,0.05)" }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
              <span className="grid gap-1">{[0, 1].map((dot) => <span key={dot} className="h-1 w-4 rounded-full bg-[#CBD1DE]" />)}</span>
              <span className="h-3 flex-1 rounded-full bg-[#E8EBF2]" />
            </motion.div>
          ))}
        </div>
      </MiniFrame>
    );
  }

  if (tags.has("focus")) {
    return (
      <MiniFrame>
        <motion.button className="relative h-16 w-[min(320px,84%)] rounded-[22px] border bg-white shadow-lg" style={{ borderColor: style.accent }} animate={{ boxShadow: [`0 0 0 0 ${style.accent}33`, `0 0 0 10px ${style.accent}00`, `0 0 0 0 ${style.accent}33`] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <span className="mx-auto block h-3 w-24 rounded-full" style={{ background: `${style.accent}55` }} />
        </motion.button>
      </MiniFrame>
    );
  }

  if (tags.has("magnetic") || tags.has("hover")) {
    return (
      <MiniFrame>
        <div className="flex w-full max-w-[360px] items-center justify-center gap-3">
          {[0, 1, 2].map((item) => (
            <motion.div key={item} className="h-20 w-24 rounded-[24px] border border-[#E4E7EF] bg-white shadow-lg" animate={{ y: item === 1 ? [-2, -12, -2] : 0, scale: item === 1 ? [1, 1.06, 1] : 1 }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
              <span className="m-4 block h-2.5 rounded-full" style={{ background: item === 1 ? `${style.accent}55` : "#E8EBF2" }} />
            </motion.div>
          ))}
        </div>
      </MiniFrame>
    );
  }

  if (tags.has("scroll") || tags.has("reveal") || tags.has("list") || tags.has("stagger")) {
    return (
      <MiniFrame>
        <div className="w-full max-w-[380px] space-y-3">
          {[0, 1, 2].map((row) => (
            <motion.div key={row} className="h-8 rounded-2xl bg-white shadow-sm" animate={{ x: [-18, 0, 0], opacity: [0.35, 1, 1] }} transition={{ duration: 1.8, delay: row * 0.18, repeat: Infinity, ease: "easeInOut" }}>
              <span className="ml-4 block h-full w-1/2 rounded-full" style={{ background: row === 0 ? `${style.accent}35` : "#E8EBF2" }} />
            </motion.div>
          ))}
        </div>
      </MiniFrame>
    );
  }

  if (tags.has("spotlight")) {
    return (
      <MiniFrame>
        <div className="relative h-28 w-full max-w-[390px] overflow-hidden rounded-[24px] border border-[#E4E7EF] bg-white">
          <motion.span className="absolute size-32 rounded-full blur-2xl" style={{ background: `${style.accent}44` }} animate={{ x: [10, 230, 80], y: [8, 42, 18] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} />
          <span className="absolute inset-x-8 bottom-8 h-12 rounded-[20px] shadow-lg" style={{ background: `linear-gradient(135deg, ${style.accent}, #E978D4)` }} />
        </div>
      </MiniFrame>
    );
  }

  return <MiniCardSurface style={style} mode="card" />;
}

function MiniDataSurface({ style, mode }: { style: ReturnType<typeof categoryStyle>; mode: "table" | "kanban" | "timeline" }) {
  if (mode === "kanban") {
    return (
      <MiniFrame>
        <div className="grid w-full max-w-[360px] grid-cols-3 gap-2">
          {[0, 1, 2].map((column) => (
            <div key={column} className="rounded-2xl border border-[#E4E7EF] bg-[#F7F8FC] p-2">
              <span className="block h-2 w-12 rounded-full" style={{ background: column === 1 ? style.accent : "#D8DDE8" }} />
              {[0, 1].map((card) => (
                <motion.span key={card} className="mt-2 block h-8 rounded-xl bg-white shadow-sm" animate={{ y: card === 0 && column === 1 ? [0, -3, 0] : 0 }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
              ))}
            </div>
          ))}
        </div>
      </MiniFrame>
    );
  }

  if (mode === "timeline") {
    return (
      <MiniFrame>
        <div className="w-full max-w-[360px] space-y-3">
          {["Saved", "Reviewed", "Shipped"].map((item, index) => (
            <motion.div key={item} className="grid grid-cols-[18px_1fr_auto] items-center gap-3" animate={{ opacity: [0.72, 1, 0.72] }} transition={{ duration: 1.8, delay: index * 0.22, repeat: Infinity }}>
              <span className="size-3 rounded-full" style={{ background: index === 0 ? style.accent : "#D8DDE8" }} />
              <span className="h-3 rounded-full bg-[#E8EBF2]" />
              <span className="h-3 w-9 rounded-full bg-[#F0F2F7]" />
            </motion.div>
          ))}
        </div>
      </MiniFrame>
    );
  }

  return (
    <MiniFrame>
      <div className="w-full max-w-[390px] overflow-hidden rounded-2xl border border-[#E4E7EF] bg-white">
        <div className="grid grid-cols-[1.2fr_0.8fr_0.7fr] gap-3 border-b border-[#EEF0F6] bg-[#F7F8FC] px-4 py-3">
          {[0, 1, 2].map((item) => <span key={item} className="h-2 rounded-full bg-[#D8DDE8]" />)}
        </div>
        {[0, 1, 2].map((row) => (
          <motion.div key={row} className="grid grid-cols-[1.2fr_0.8fr_0.7fr] gap-3 border-b border-[#F0F2F7] px-4 py-3 last:border-0" animate={{ opacity: row === 1 ? [0.75, 1, 0.75] : 1 }} transition={{ duration: 1.7, repeat: Infinity }}>
            <span className="h-3 rounded-full bg-[#E8EBF2]" />
            <span className="h-3 rounded-full" style={{ background: `${style.accent}24` }} />
            <span className="h-3 rounded-full bg-[#E8EBF2]" />
          </motion.div>
        ))}
      </div>
    </MiniFrame>
  );
}

function MiniInputSurface({ style, mode }: { style: ReturnType<typeof categoryStyle>; mode: "field" | "button" | "toggle" }) {
  if (mode === "button") {
    return (
      <MiniFrame>
        <motion.button className="h-16 w-[min(330px,88%)] rounded-[22px] shadow-[0_18px_34px_rgba(23,26,43,0.12)]" style={{ background: `linear-gradient(135deg, ${style.accent}, ${style.text})` }} animate={{ scale: [1, 0.985, 1] }} transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}>
          <span className="mx-auto block h-3 w-24 rounded-full bg-white/78" />
        </motion.button>
      </MiniFrame>
    );
  }

  if (mode === "toggle") {
    return (
      <MiniFrame>
        <div className="flex w-full max-w-[340px] items-center justify-between rounded-2xl border border-[#E4E7EF] bg-white px-4 py-4 shadow-sm">
          <div className="space-y-2"><span className="block h-3 w-28 rounded-full bg-[#D8DDE8]" /><span className="block h-2 w-20 rounded-full bg-[#EEF0F6]" /></div>
          <span className="relative h-8 w-14 rounded-full" style={{ background: `${style.accent}25` }}><motion.span className="absolute top-1 size-6 rounded-full shadow-md" style={{ background: style.accent }} animate={{ x: [4, 22, 4] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} /></span>
        </div>
      </MiniFrame>
    );
  }

  return (
    <MiniFrame>
      <div className="w-full max-w-[360px] rounded-2xl border border-[#E4E7EF] bg-white p-4 shadow-sm">
        <span className="block h-2.5 w-20 rounded-full bg-[#D8DDE8]" />
        <div className="mt-3 flex h-12 items-center rounded-2xl border border-[#D4D8E3] px-4">
          <motion.span className="h-3 rounded-full" style={{ background: `${style.accent}55` }} animate={{ width: ["34%", "64%", "42%"] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
        </div>
      </div>
    </MiniFrame>
  );
}

function MiniNavigationSurface({ style, mode }: { style: ReturnType<typeof categoryStyle>; mode: "nav" | "breadcrumb" | "command" }) {
  if (mode === "command") {
    return (
      <MiniFrame>
        <motion.div className="flex h-14 w-[min(360px,90%)] items-center gap-3 rounded-full border border-[#E4E7EF] bg-white px-5 shadow-lg" animate={{ width: ["72%", "90%", "72%"] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
          <span className="size-3 rounded-full" style={{ background: style.accent }} />
          <span className="h-3 flex-1 rounded-full bg-[#E8EBF2]" />
          <span className="h-6 w-12 rounded-full bg-[#F3EEFF]" />
        </motion.div>
      </MiniFrame>
    );
  }

  if (mode === "breadcrumb") {
    return (
      <MiniFrame>
        <div className="flex w-full max-w-[390px] items-center gap-2 rounded-2xl border border-[#E4E7EF] bg-white px-4 py-4 shadow-sm">
          {[70, 92, 130].map((width, index) => <span key={width} className="h-3 rounded-full" style={{ width, background: index === 2 ? `${style.accent}42` : "#E8EBF2" }} />)}
        </div>
      </MiniFrame>
    );
  }

  return (
    <MiniFrame>
      <nav className="flex w-full max-w-[420px] items-center gap-4 rounded-full border border-[#E4E7EF] bg-white px-4 py-3 shadow-lg">
        <span className="size-8 rounded-2xl" style={{ background: style.accent }} />
        {[0, 1, 2].map((item) => <span key={item} className="h-3 flex-1 rounded-full bg-[#E8EBF2]" />)}
        <motion.span className="size-8 rounded-full bg-[#F1BE48]" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
      </nav>
    </MiniFrame>
  );
}

function MiniFeedbackSurface({ style, mode }: { style: ReturnType<typeof categoryStyle>; mode: "toast" | "alert" | "skeleton" }) {
  if (mode === "skeleton") {
    return (
      <MiniFrame>
        <div className="w-full max-w-[390px] rounded-2xl border border-[#E4E7EF] bg-white p-4 shadow-sm">
          {[0, 1, 2].map((row) => (
            <span key={row} className="mt-3 block h-4 overflow-hidden rounded-full bg-[#EEF0F6] first:mt-0">
              <motion.span className="block h-full w-1/2 rounded-full bg-white/80" animate={{ x: ["-100%", "240%"] }} transition={{ duration: 1.4, repeat: Infinity, delay: row * 0.08, ease: "easeInOut" }} />
            </span>
          ))}
        </div>
      </MiniFrame>
    );
  }

  if (mode === "alert") {
    return (
      <MiniFrame>
        <motion.div className="grid w-full max-w-[360px] grid-cols-[36px_1fr] gap-3 rounded-2xl border bg-white p-4 shadow-lg" style={{ borderColor: `${style.accent}55` }} animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <span className="size-9 rounded-2xl" style={{ background: `${style.accent}24` }} />
          <div className="space-y-2"><span className="block h-3 w-32 rounded-full" style={{ background: `${style.accent}45` }} /><span className="block h-2.5 w-44 rounded-full bg-[#E8EBF2]" /></div>
        </motion.div>
      </MiniFrame>
    );
  }

  return (
    <MiniFrame>
      <div className="relative h-28 w-full max-w-[360px]">
        {[0, 1, 2].map((item) => (
          <motion.div key={item} className="absolute inset-x-0 rounded-2xl border border-[#E4E7EF] bg-white p-3 shadow-lg" style={{ top: item * 18 }} animate={{ x: item === 0 ? [0, 8, 0] : 0 }} transition={{ duration: 2.1, repeat: Infinity }}>
            <span className="block h-3 w-28 rounded-full" style={{ background: item === 0 ? `${style.accent}55` : "#E8EBF2" }} />
          </motion.div>
        ))}
      </div>
    </MiniFrame>
  );
}

function MiniUtilitySurface({ style, mode }: { style: ReturnType<typeof categoryStyle>; mode: "swatch" | "avatar" | "code" | "chip" }) {
  if (mode === "code") {
    return (
      <MiniFrame>
        <div className="w-full max-w-[370px] rounded-2xl bg-[#171A2B] p-4 shadow-xl">
          {[0, 1, 2, 3].map((line) => <span key={line} className="mt-2 block h-2.5 rounded-full first:mt-0" style={{ width: `${92 - line * 13}%`, background: line === 1 ? `${style.accent}` : "rgba(255,255,255,0.18)" }} />)}
        </div>
      </MiniFrame>
    );
  }

  if (mode === "avatar") {
    return (
      <MiniFrame>
        <div className="flex items-center justify-center -space-x-4">
          {[style.accent, "#F1BE48", "#51C89B", "#FF7664"].map((color, index) => <motion.span key={color} className="grid size-16 place-items-center rounded-full border-4 border-white shadow-lg" style={{ background: color }} animate={{ y: index === 1 ? [0, -5, 0] : 0 }} transition={{ duration: 1.8, repeat: Infinity }} />)}
        </div>
      </MiniFrame>
    );
  }

  if (mode === "swatch") {
    return (
      <MiniFrame>
        <div className="grid grid-cols-5 gap-3">
          {[style.accent, style.text, "#51C89B", "#F1BE48", "#E978D4", "#4C8DFF", "#171A2B", "#D8DDE8", "#FFFFFF", style.soft].map((color, index) => <motion.span key={`${color}-${index}`} className="size-10 rounded-2xl border border-[#E4E7EF] shadow-sm" style={{ background: color }} animate={{ scale: index === 0 ? [1, 1.08, 1] : 1 }} transition={{ duration: 1.8, repeat: Infinity }} />)}
        </div>
      </MiniFrame>
    );
  }

  return (
    <MiniFrame>
      <div className="flex flex-wrap justify-center gap-2">
        {["Ctrl", "K", "Save", "Run"].map((item, index) => <motion.span key={item} className="rounded-2xl border border-[#E4E7EF] bg-white px-4 py-2 text-xs font-bold text-[#171A2B] shadow-sm" animate={{ y: index === 1 ? [0, -4, 0] : 0 }} transition={{ duration: 1.8, repeat: Infinity }}>{item}</motion.span>)}
      </div>
    </MiniFrame>
  );
}

function MiniChart({ style, variant }: { style: ReturnType<typeof categoryStyle>; variant: "line" | "bar" | "donut" }) {
  if (variant === "donut") {
    return (
      <MiniFrame>
        <div className="relative size-28 rounded-full" style={{ background: `conic-gradient(${style.accent} 0 76%, #E8EBF2 76% 100%)` }}>
          <div className="absolute inset-5 rounded-full bg-white shadow-inner" />
          <motion.span className="absolute inset-0 rounded-full border-2 border-white/80" animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
        </div>
      </MiniFrame>
    );
  }

  if (variant === "bar") {
    return (
      <MiniFrame>
        <div className="flex h-28 w-full max-w-[340px] items-end justify-center gap-3">
          {[42, 76, 56, 96, 68].map((height, index) => <motion.span key={height} className="w-10 rounded-t-2xl" style={{ background: index === 3 ? style.accent : `${style.accent}35` }} animate={{ height: [`${height * 0.75}%`, `${height}%`, `${height * 0.75}%`] }} transition={{ duration: 1.7, delay: index * 0.08, repeat: Infinity, ease: "easeInOut" }} />)}
        </div>
      </MiniFrame>
    );
  }

  return (
    <MiniFrame>
      <svg viewBox="0 0 320 120" className="h-32 w-full max-w-[380px] overflow-visible">
        <path d="M8 92 C42 24 78 106 112 56 S176 78 210 34 S268 62 312 18" fill="none" stroke={style.accent} strokeWidth="8" strokeLinecap="round" />
        <motion.circle r="8" fill={style.accent} animate={{ cx: [8, 112, 210, 312], cy: [92, 56, 34, 18] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} />
      </svg>
    </MiniFrame>
  );
}

function MiniCardSurface({ style, mode }: { style: ReturnType<typeof categoryStyle>; mode: "card" | "surface" }) {
  return (
    <MiniFrame>
      <div className="relative h-28 w-full max-w-[360px]">
        {[0, 1, 2].map((item) => (
          <motion.div
            key={item}
            className="absolute inset-x-0 mx-auto rounded-[24px] border border-[#E4E7EF] bg-white shadow-lg"
            style={{ top: mode === "surface" ? item * 14 : item * 10, height: 84, width: `${92 - item * 7}%`, zIndex: 3 - item }}
            animate={{ y: item === 0 ? [0, -5, 0] : 0, borderColor: item === 0 ? [style.border, style.accent, style.border] : "#E4E7EF" }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {item === 0 ? <span className="m-5 block h-3 w-28 rounded-full" style={{ background: `${style.accent}55` }} /> : null}
          </motion.div>
        ))}
      </div>
    </MiniFrame>
  );
}

function PricingPreview({ compact, options }: { compact?: boolean; options?: PreviewProps["pricingOptions"] }) {
  const tier = options?.tier ?? "Pro";
  const price = options?.price ?? "29";
  const billing = options?.billing ?? "/month";
  const buttonLabel = options?.buttonLabel ?? "Start free trial";
  const accent = options?.accent ?? "#6366F1";
  const features = options?.features?.length ? options.features : ["Unlimited projects", "Team collaboration", "Advanced analytics", "Priority support"];

  return (
    <motion.article
      className={cn("mx-auto rounded-3xl border bg-white p-6 shadow-2xl shadow-[#171A2B]/10", compact ? "max-w-[220px] p-4" : "max-w-[300px]", options?.highlighted ? "border-[#6366F1]" : "border-[#E4E7EF]")}
      whileHover={{ y: -3 }}
    >
      <div className="text-sm font-semibold text-[#171A2B]">{tier}</div>
      <div className="mt-4 flex items-end gap-1"><span className={cn("font-bold tracking-[-0.03em]", compact ? "text-3xl" : "text-4xl")}>${price}</span><span className="pb-1 text-sm text-[#6D7285]">{billing}</span></div>
      <ul className="mt-5 space-y-3">
        {features.map((feature) => <li key={feature} className="flex items-center gap-2 text-xs font-medium text-[#4B5165]"><span className="grid size-4 place-items-center rounded-full text-white" style={{ background: accent }}><Check size={10} aria-hidden /></span>{feature}</li>)}
      </ul>
      <button className="mt-6 min-h-10 w-full rounded-xl text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60" style={{ background: options?.disabled ? "#9A9FB1" : "#171A2B" }} disabled={options?.disabled}>
        {options?.loading ? <Loader2 className="mx-auto animate-spin" size={16} aria-hidden /> : buttonLabel}
      </button>
    </motion.article>
  );
}

function DataTablePreview({ compact, options }: { compact?: boolean; options?: PreviewProps["tableOptions"] }) {
  const rows = [["Acme Corp", "Active", "Enterprise", "$24,800"], ["Northstar", "Trial", "Team", "$4,200"], ["Luma Systems", "Active", "Scale", "$18,450"], ["Orbit", "Paused", "Pro", "$7,920"]];
  const rowPadding = options?.density === "Compact" || compact ? "py-2" : "py-3";
  if (options?.error) return <div className="rounded-2xl border border-red-200 bg-white p-8 text-center text-sm font-medium text-red-600">Unable to load table data.</div>;
  if (options?.empty) return <div className="rounded-2xl border border-[#E4E7EF] bg-white p-8 text-center text-sm text-[#6D7285]">No customers match this view.</div>;
  return (
    <div className={cn("overflow-hidden rounded-2xl bg-white shadow-xl shadow-[#171A2B]/8", options?.bordered !== false && "border border-[#E4E7EF]")}>
      <div className="flex items-center justify-between border-b border-[#E4E7EF] px-4 py-3"><div><p className="text-sm font-semibold">Customers</p>{!compact ? <p className="text-xs text-[#9A9FB1]">Revenue and renewal overview</p> : null}</div><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">Live</span></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-xs"><thead className={cn("text-[#6D7285]", options?.stickyHeader && "sticky top-0 bg-white")}><tr>{["Customer", "Status", "Plan", "Spend"].map((heading) => <th key={heading} className="border-b border-[#EEF0F6] px-4 py-3 font-medium">{heading}{options?.sortable && heading === "Spend" ? " ↓" : ""}</th>)}</tr></thead><tbody>{options?.loading ? Array.from({ length: 3 }).map((_, row) => <tr key={row}>{Array.from({ length: 4 }).map((__, cell) => <td key={cell} className="px-4 py-3"><span className="block h-3 animate-pulse rounded-full bg-[#EEF0F6]" /></td>)}</tr>) : rows.slice(0, compact ? 3 : 4).map((row, index) => <tr key={row[0]} className={cn(options?.stripedRows && index % 2 === 1 && "bg-[#F7F8FC]")}><td className={cn("border-b border-[#EEF0F6] px-4 font-medium text-[#171A2B]", rowPadding)}><span className="inline-flex items-center gap-2">{options?.selectable ? <input type="checkbox" aria-label={`Select ${row[0]}`} /> : null}{row[0]}</span></td><td className={cn("border-b border-[#EEF0F6] px-4", rowPadding)}><StatusPill status={row[1]} /></td><td className={cn("border-b border-[#EEF0F6] px-4 text-[#6D7285]", rowPadding)}>{row[2]}</td><td className={cn("border-b border-[#EEF0F6] px-4 font-semibold", rowPadding)}>{row[3]}</td></tr>)}</tbody></table></div>
      {options?.pagination !== false && !compact ? <div className="flex items-center justify-between px-4 py-3 text-xs text-[#6D7285]"><span>1-4 of 42</span><span>Next →</span></div> : null}
    </div>
  );
}

function AnalyticsPreview() {
  return <div className="rounded-3xl border border-[#E4E7EF] bg-white p-5 shadow-xl shadow-[#171A2B]/8"><div className="flex items-start justify-between"><div><p className="text-xs text-[#6D7285]">Total Revenue</p><strong className="mt-1 block text-2xl">$45,231.89</strong><span className="text-xs font-medium text-emerald-600">+12.5% vs last month</span></div><span className="rounded-full bg-[#EEF0FF] px-2 py-1 text-xs text-[#6366F1]">Live</span></div><svg viewBox="0 0 240 80" className="mt-4 h-24 w-full overflow-visible"><path d="M4 70 C30 18 58 72 86 38 S136 60 164 24 S210 46 236 12" fill="none" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" /><path d="M4 70 C30 18 58 72 86 38 S136 60 164 24 S210 46 236 12 L236 80 L4 80 Z" fill="url(#chartFill)" opacity=".28" /><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#6366F1" /><stop offset="1" stopColor="#6366F1" stopOpacity="0" /></linearGradient></defs></svg></div>;
}
function ProfilePreview() { return <div className="mx-auto max-w-[240px] overflow-hidden rounded-3xl border border-[#E4E7EF] bg-white shadow-xl shadow-[#171A2B]/8"><div className="h-20 bg-gradient-to-br from-[#6366F1] to-[#E978D4]" /><div className="-mt-9 p-5 text-center"><span className="mx-auto grid size-18 place-items-center rounded-full border-4 border-white bg-gradient-to-br from-[#F1BE48] to-[#FF7664] text-lg font-bold text-white">OR</span><h3 className="mt-3 font-semibold">Olivia Rhye</h3><p className="text-xs text-[#6D7285]">Product Designer</p><div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><strong>128</strong><strong>2.4k</strong><strong>342</strong></div></div></div>; }
function NavigationPreview() { return <div className="rounded-2xl bg-[#111827] p-4 shadow-xl shadow-[#171A2B]/10"><nav className="flex items-center gap-5 text-xs text-white/72"><span className="flex items-center gap-2 font-semibold text-white"><span className="size-5 rounded bg-[#9A78FF]" /> Dashboard</span><span>Projects</span><span>Team</span><span>Reports</span><span className="ml-auto size-7 rounded-full bg-gradient-to-br from-[#F1BE48] to-[#FF7664]" /></nav></div>; }
function FormPreview() { return <div className="rounded-2xl border border-[#E4E7EF] bg-white p-5 shadow-xl shadow-[#171A2B]/8"><label className="block text-xs font-medium text-[#6D7285]">Email address</label><input className="mt-2 h-11 w-full rounded-xl border border-[#D4D8E3] px-3 text-sm outline-none focus:border-[#6366F1]" defaultValue="olivia@untitled.co" /><label className="mt-4 block text-xs font-medium text-[#6D7285]">Password</label><input className="mt-2 h-11 w-full rounded-xl border border-[#D4D8E3] px-3 text-sm outline-none focus:border-[#6366F1]" defaultValue="••••••••••" /></div>; }
function ButtonPreview() { return <div className="flex flex-wrap justify-center gap-3"><button className="min-h-10 rounded-xl bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200">Primary</button><button className="min-h-10 rounded-xl border border-[#D4D8E3] bg-white px-4 text-sm font-semibold text-[#6366F1]">Secondary</button><button className="min-h-10 rounded-xl px-4 text-sm font-semibold text-[#6D7285]">Tertiary</button></div>; }
function StatusPill({ status }: { status: string }) {
  const tone = { Active: "bg-emerald-50 text-emerald-700", Trial: "bg-blue-50 text-blue-700", Paused: "bg-amber-50 text-amber-700" }[status] ?? "bg-slate-50 text-slate-700";
  return <span className={cn("rounded-full px-2 py-1 text-[11px] font-medium", tone)}>{status}</span>;
}
