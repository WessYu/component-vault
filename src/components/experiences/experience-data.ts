import type { ComponentCategory } from "@/types/vault";

export type ExperienceSlug =
  | "project-chapter-scroll"
  | "card-stack-navigator"
  | "grid-to-detail-morph"
  | "scroll-anatomy"
  | "magnetic-component-rail"
  | "split-story-scroll"
  | "component-depth-gallery"
  | "before-after-scrubber";

export type MotionExperience = {
  slug: ExperienceSlug;
  name: string;
  shortName: string;
  description: string;
  category: ComponentCategory;
  version: string;
  accent: string;
  secondary: string;
  chapters: Array<{
    label: string;
    title: string;
    description: string;
    color: string;
  }>;
  props: string[];
  code: string;
  docs: string[];
};

export const interactiveExperiences: MotionExperience[] = [
  {
    slug: "project-chapter-scroll",
    name: "Project Chapter Scroll",
    shortName: "Chapter Scroll",
    description: "Sticky project narrative where vertical scroll drives chapter, media, color and progress transitions.",
    category: "Motion Experiences",
    version: "v1.0.0",
    accent: "#6366F1",
    secondary: "#E978D4",
    chapters: [
      { label: "01", title: "Editorial entry", description: "A sticky stage pins the active project while the page continues to own scroll.", color: "#EEF0FF" },
      { label: "02", title: "Chapter focus", description: "The previous project recedes while the next one arrives with depth and masked text.", color: "#ECFBF5" },
      { label: "03", title: "Natural release", description: "At the final chapter the section releases back to normal document flow.", color: "#FFF7ED" },
    ],
    props: ["chapters", "activeIndex", "snap", "progress", "keyboard"],
    code: `const { activeIndex, progress } = useActiveChapter(sectionRef, projects.length);
return <section ref={sectionRef} className="relative h-[320vh]">
  <div className="sticky top-0 grid min-h-dvh place-items-center">
    <ProjectChapter project={projects[activeIndex]} progress={progress} />
  </div>
</section>;`,
    docs: ["Use a tall parent and a sticky stage instead of locking the whole page.", "Expose keyboard controls for chapter changes.", "Respect reduced motion by rendering all chapters as a readable stack."],
  },
  {
    slug: "card-stack-navigator",
    name: "Card Stack Navigator",
    shortName: "Card Stack",
    description: "Depth-based content navigation with drag, wheel and keyboard controls.",
    category: "Motion Experiences",
    version: "v1.0.0",
    accent: "#FF7664",
    secondary: "#F1BE48",
    chapters: [
      { label: "A", title: "Active card", description: "The front card owns actions and content.", color: "#FFF1EF" },
      { label: "B", title: "Depth queue", description: "Two to four cards remain visible behind with scale and shadow.", color: "#FFF8E6" },
      { label: "C", title: "Bounded navigation", description: "Back and next actions stop clearly at the beginning and end.", color: "#EEF0FF" },
    ],
    props: ["items", "activeIndex", "dragThreshold", "wheel", "keyboard"],
    code: `const drag = useDragNavigation({ index, count: cards.length, onChange: setIndex });
const onWheel = useWheelNavigation({ index, count: cards.length, onChange: setIndex });
return <Stack onWheel={onWheel} {...drag}>{cards.map(renderDepthCard)}</Stack>;`,
    docs: ["Do not frame this as a dating pattern.", "Keep actions inside the active card accessible.", "Use small rotation only on dismissal."],
  },
  {
    slug: "grid-to-detail-morph",
    name: "Grid to Detail Morph",
    shortName: "Grid Morph",
    description: "Shared layout transition that expands a library card into a complete detail surface without reloading.",
    category: "Motion Experiences",
    version: "v1.0.0",
    accent: "#51C89B",
    secondary: "#6366F1",
    chapters: [
      { label: "01", title: "Preserve origin", description: "The card keeps its source geometry and scroll position.", color: "#ECFBF5" },
      { label: "02", title: "Morph preview", description: "Preview, title and metadata move into the full detail layout.", color: "#EEF5FF" },
      { label: "03", title: "Return cleanly", description: "Closing restores the exact library position.", color: "#F7F8FC" },
    ],
    props: ["layoutId", "selectedId", "history", "scrollRestore", "overlay"],
    code: `<motion.article layoutId={\`component-\${id}\`} onClick={() => open(id)} />
<AnimatePresence>{selected ? <motion.section layoutId={\`component-\${selected}\`} /> : null}</AnimatePresence>`,
    docs: ["Use Framer Motion layoutId for the card, preview and title.", "Update URL with history.pushState without a full navigation.", "Store scrollY before opening and restore on close."],
  },
  {
    slug: "scroll-anatomy",
    name: "Scroll Anatomy",
    shortName: "Anatomy",
    description: "Scroll-led anatomy view that separates a component into layers, labels, tokens and prop links.",
    category: "Motion Experiences",
    version: "v1.0.0",
    accent: "#4C8DFF",
    secondary: "#9A78FF",
    chapters: [
      { label: "1", title: "Complete component", description: "Start from a recognizable Adaptive Navigation pattern.", color: "#EEF5FF" },
      { label: "4", title: "Separated layers", description: "Container, navigation and account menu pull apart with labels.", color: "#F4F0FF" },
      { label: "8", title: "Reassembled", description: "Tokens and props resolve back into the final component.", color: "#F7F8FC" },
    ],
    props: ["steps", "labels", "tokenMap", "codeHints", "progress"],
    code: `const { activeIndex } = useActiveChapter(ref, anatomySteps.length);
return <AdaptiveNavigationAnatomy step={anatomySteps[activeIndex]} />;`,
    docs: ["Connect each label to a meaningful code or token hint.", "Keep motion small enough for technical review.", "Reduced motion should show all layers without scroll choreography."],
  },
  {
    slug: "magnetic-component-rail",
    name: "Magnetic Component Rail",
    shortName: "Magnetic Rail",
    description: "Horizontal rail driven by vertical scroll, drag, arrows and keyboard with magnetic snap.",
    category: "Motion Experiences",
    version: "v1.0.0",
    accent: "#9A78FF",
    secondary: "#56C7D9",
    chapters: [
      { label: "01", title: "Wide cards", description: "The center card receives emphasis while neighbors remain visible.", color: "#F4F0FF" },
      { label: "02", title: "Inertia and snap", description: "Drag and vertical scroll resolve to the nearest item.", color: "#ECFAFC" },
      { label: "03", title: "Release point", description: "After the final item the page returns to normal vertical flow.", color: "#F7F8FC" },
    ],
    props: ["items", "activeIndex", "snap", "drag", "progress"],
    code: `const drag = useDragNavigation({ index, count: items.length, onChange: setIndex });
return <motion.div drag="x" animate={{ x: centerOffset(index) }} {...drag} />;`,
    docs: ["Use vertical scroll only within the local section.", "Expose arrows and keyboard controls as alternatives.", "Scale and opacity should describe distance from center."],
  },
  {
    slug: "split-story-scroll",
    name: "Split Story Scroll",
    shortName: "Split Story",
    description: "Two-column story where sticky copy tracks visual examples and async states.",
    category: "Motion Experiences",
    version: "v1.0.0",
    accent: "#F1BE48",
    secondary: "#51C89B",
    chapters: [
      { label: "Idle", title: "Idle", description: "The action is available and stable.", color: "#FFF8E6" },
      { label: "Progress", title: "Progress", description: "Loading and progress states remain legible.", color: "#EEF0FF" },
      { label: "Retry", title: "Retry", description: "Error and retry states are part of the same narrative.", color: "#FFF1EF" },
    ],
    props: ["states", "activeState", "stickyCopy", "progress", "keyboard"],
    code: `const state = states[activeIndex];
return <SplitStory left={<StateCopy state={state} />} right={<AsyncExample state={state} />} />;`,
    docs: ["Use for lifecycle education and onboarding.", "The sticky side should describe the state currently visible.", "Touch users should be able to progress by natural scroll."],
  },
  {
    slug: "component-depth-gallery",
    name: "Component Depth Gallery",
    shortName: "Depth Gallery",
    description: "Short depth-axis gallery where scroll brings one component forward at a time.",
    category: "Motion Experiences",
    version: "v1.0.0",
    accent: "#56C7D9",
    secondary: "#6366F1",
    chapters: [
      { label: "01", title: "Layered start", description: "A maximum of five items sit on distinct depth planes.", color: "#ECFAFC" },
      { label: "03", title: "Active approach", description: "The current item moves forward without aggressive perspective.", color: "#EEF0FF" },
      { label: "05", title: "Clear end", description: "Items leave the viewport and the story resolves.", color: "#F7F8FC" },
    ],
    props: ["depth", "activeIndex", "maxItems", "backgroundTone", "reducedMotion"],
    code: `items.map((item, i) => <motion.article animate={{ scale: scaleFor(i), y: yFor(i), opacity: opacityFor(i) }} />)`,
    docs: ["Limit the set to five items.", "Avoid motion that feels like a tunnel.", "Keep title and description outside the moving depth stack."],
  },
  {
    slug: "before-after-scrubber",
    name: "Before After Scrubber",
    shortName: "Scrubber",
    description: "Direct component comparison with draggable split, device/theme modes, token changes and code diff.",
    category: "Motion Experiences",
    version: "v1.0.0",
    accent: "#E978D4",
    secondary: "#6366F1",
    chapters: [
      { label: "Before", title: "Previous version", description: "The old component remains inspectable.", color: "#FDF0FA" },
      { label: "Compare", title: "Scrub comparison", description: "A draggable handle reveals exact visual differences.", color: "#EEF0FF" },
      { label: "After", title: "Updated system", description: "Tokens, code and changes explain the redesign.", color: "#ECFBF5" },
    ],
    props: ["position", "device", "theme", "tokenDiff", "keyboard"],
    code: `<div className="relative">
  <Before />
  <After style={{ clipPath: \`inset(0 \${100 - position}% 0 0)\` }} />
  <ScrubberHandle value={position} onChange={setPosition} />
</div>`,
    docs: ["Support mouse, touch and keyboard adjustment.", "Pair the visual comparison with token and code changes.", "Keep desktop/mobile and light/dark modes explicit."],
  },
];

export function getExperience(slug: string) {
  return interactiveExperiences.find((experience) => experience.slug === slug);
}
