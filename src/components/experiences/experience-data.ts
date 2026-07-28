import type { ComponentCategory } from "@/types/vault";

export type ExperienceSlug =
  | "project-chapter-scroll"
  | "card-stack-navigator"
  | "grid-to-detail-morph"
  | "scroll-anatomy"
  | "magnetic-component-rail"
  | "split-story-scroll"
  | "component-depth-gallery"
  | "before-after-scrubber"
  | "trend-cursor-lens"
  | "trend-variable-type-reactor"
  | "trend-liquid-morph-cta"
  | "trend-deconstructed-hero"
  | "trend-proximity-dock"
  | "trend-spatial-depth-selector"
  | "trend-physics-card-toss"
  | "trend-scroll-layer-peel"
  | "trend-morphing-command-capsule"
  | "trend-ambient-light-window";

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
  {
    slug: "trend-cursor-lens",
    name: "Trend / Cursor Lens Reveal",
    shortName: "Cursor Lens",
    description: "Pointer-following reveal lens that exposes a secondary visual or information layer only where the user explores.",
    category: "Motion Experiences",
    version: "v0.9.0",
    accent: "#776AF4",
    secondary: "#42D3FF",
    chapters: [
      { label: "01", title: "Idle surface", description: "The base layer stays calm until the pointer enters.", color: "#F4F0FF" },
      { label: "02", title: "Local reveal", description: "A bounded lens reveals grid, code or context around the pointer.", color: "#EDF8FF" },
      { label: "03", title: "Useful exit", description: "The extra layer disappears without stealing focus from content.", color: "#F7F8FC" },
    ],
    props: ["radius", "followSpring", "revealLayer", "touchFallback", "reducedMotion"],
    code: `const [point, setPoint] = useState({ x: 50, y: 50 });
return <Surface onPointerMove={updatePoint} style={{ "--x": point.x, "--y": point.y }} />;`,
    docs: ["Use the lens to reveal useful context, not decorative noise.", "Provide an explicit non-hover fallback on touch devices.", "Keep the reveal radius large enough to avoid precision hunting."],
  },
  {
    slug: "trend-variable-type-reactor",
    name: "Trend / Variable Type Reactor",
    shortName: "Type Reactor",
    description: "Kinetic typography whose weight, width and spacing react continuously to pointer position or scroll progress.",
    category: "Motion Experiences",
    version: "v0.9.0",
    accent: "#171A2B",
    secondary: "#B89C6A",
    chapters: [
      { label: "01", title: "Readable baseline", description: "Typography starts from a stable, readable setting.", color: "#F7F4EC" },
      { label: "02", title: "Variable response", description: "Pointer or scroll changes axis values rather than swapping whole fonts.", color: "#EFE8DA" },
      { label: "03", title: "Meaningful emphasis", description: "Motion communicates tone, hierarchy or progress.", color: "#F7F8FC" },
    ],
    props: ["weightAxis", "widthAxis", "tracking", "input", "clamp"],
    code: `const weight = map(pointerX, 0, width, 420, 850);
return <h1 style={{ fontVariationSettings: \`"wght" \${weight}\` }}>Shape the voice.</h1>;`,
    docs: ["Use a real variable font when available.", "Do not animate type so aggressively that line breaks constantly change.", "Treat typography as interaction feedback, not a loading animation."],
  },
  {
    slug: "trend-liquid-morph-cta",
    name: "Trend / Liquid Morph CTA",
    shortName: "Liquid CTA",
    description: "Compact call-to-action whose internal shapes merge, stretch and reform to communicate state changes without glassmorphism.",
    category: "Motion Experiences",
    version: "v0.9.0",
    accent: "#51C89B",
    secondary: "#6366F1",
    chapters: [
      { label: "01", title: "Stable action", description: "The CTA starts with conventional hit area and label.", color: "#EAFBF6" },
      { label: "02", title: "Morph feedback", description: "Internal blobs merge as the action changes state.", color: "#EEF0FF" },
      { label: "03", title: "Resolved state", description: "The final shape settles quickly and remains readable.", color: "#F7F8FC" },
    ],
    props: ["state", "blobCount", "spring", "label", "reducedMotion"],
    code: `<motion.button animate={{ borderRadius: active ? 38 : 18 }}>
  <motion.span animate={blobMotion(active)} />
  <span>{label}</span>
</motion.button>`,
    docs: ["Keep the actual button semantics intact.", "Morph internal decoration instead of moving the click target.", "Use short spring durations so feedback feels immediate."],
  },
  {
    slug: "trend-deconstructed-hero",
    name: "Trend / Deconstructed Hero",
    shortName: "Deconstructed Hero",
    description: "Asymmetric hero composition built from readable fragments, overlapping cards and intentional misalignment instead of one centered block.",
    category: "Motion Experiences",
    version: "v0.9.0",
    accent: "#9A78FF",
    secondary: "#171A2B",
    chapters: [
      { label: "01", title: "Fragmented entry", description: "Headline, signal and proof points arrive as separate objects.", color: "#F4F0FF" },
      { label: "02", title: "Controlled overlap", description: "Elements overlap without hiding core information.", color: "#F7F8FC" },
      { label: "03", title: "Responsive recompose", description: "On small screens the fragments resolve back into a clear reading order.", color: "#EEF0FF" },
    ],
    props: ["fragments", "overlap", "rotation", "stackOnMobile", "hoverLift"],
    code: `return <HeroGrid>{fragments.map((fragment) => <motion.article key={fragment.id} whileHover={{ rotate: 0, y: -4 }} />)}</HeroGrid>;`,
    docs: ["Preserve a logical DOM reading order despite visual asymmetry.", "Keep rotations small around interactive controls.", "Use overlap to create hierarchy, not to hide information."],
  },
  {
    slug: "trend-proximity-dock",
    name: "Trend / Proximity Dock",
    shortName: "Proximity Dock",
    description: "Navigation dock where neighboring actions respond proportionally to pointer distance instead of a binary hover state.",
    category: "Motion Experiences",
    version: "v0.9.0",
    accent: "#6366F1",
    secondary: "#171A2B",
    chapters: [
      { label: "01", title: "Resting rail", description: "All actions remain recognizable at their default size.", color: "#F7F8FC" },
      { label: "02", title: "Proximity response", description: "Nearby items scale and lift based on pointer distance.", color: "#EEF0FF" },
      { label: "03", title: "Keyboard parity", description: "Focus receives equivalent emphasis without requiring a pointer.", color: "#F4F0FF" },
    ],
    props: ["items", "radius", "maxScale", "spring", "focusParity"],
    code: `const distance = Math.abs(pointerIndex - index);
const scale = Math.max(1, maxScale - distance * falloff);
return <motion.button animate={{ scale, y: -(scale - 1) * 12 }} />;`,
    docs: ["Do not let scaled items overlap unrelated controls.", "Use icons with accessible labels.", "Disable pointer-driven scaling on coarse pointers."],
  },
  {
    slug: "trend-spatial-depth-selector",
    name: "Trend / Spatial Depth Selector",
    shortName: "Spatial Selector",
    description: "A restrained 3D selector that uses depth planes and perspective to express sequence without requiring WebGL or a headset.",
    category: "Motion Experiences",
    version: "v0.9.0",
    accent: "#42D3FF",
    secondary: "#776AF4",
    chapters: [
      { label: "01", title: "Depth queue", description: "Adjacent options sit on shallow perspective planes.", color: "#EDF8FF" },
      { label: "02", title: "Active plane", description: "Selection moves one surface forward while neighbors remain visible.", color: "#F4F0FF" },
      { label: "03", title: "Flat fallback", description: "Reduced-motion mode becomes a conventional card selector.", color: "#F7F8FC" },
    ],
    props: ["items", "activeIndex", "perspective", "depth", "flatFallback"],
    code: `return items.map((item, i) => <motion.button animate={{ x: offset(i), rotateY: angle(i), scale: scale(i) }} />);`,
    docs: ["Use shallow perspective so labels remain readable.", "Do not make users chase moving targets.", "Keep the selection model understandable when motion is disabled."],
  },
  {
    slug: "trend-physics-card-toss",
    name: "Trend / Physics Card Toss",
    shortName: "Physics Card",
    description: "Direct-manipulation card with bounded drag, weight, elasticity and tactile spring return for playful product surfaces.",
    category: "Motion Experiences",
    version: "v0.9.0",
    accent: "#A77839",
    secondary: "#F1BE48",
    chapters: [
      { label: "01", title: "Grab", description: "The card signals that it can be directly manipulated.", color: "#FFF6EA" },
      { label: "02", title: "Weighted drag", description: "Elasticity and scale communicate resistance while dragging.", color: "#FFF8E6" },
      { label: "03", title: "Bounded settle", description: "Release returns or snaps to a valid position.", color: "#F7F8FC" },
    ],
    props: ["drag", "constraints", "elasticity", "snap", "throwVelocity"],
    code: `<motion.article drag dragConstraints={bounds} dragElastic={0.16} whileDrag={{ scale: 1.06, rotate: 4 }} />`,
    docs: ["Use physics where direct manipulation improves understanding.", "Always provide click or keyboard alternatives for real actions.", "Keep throw distances bounded inside the local surface."],
  },
  {
    slug: "trend-scroll-layer-peel",
    name: "Trend / Scroll Layer Peel",
    shortName: "Layer Peel",
    description: "Scroll-driven stacked surfaces that peel away one layer at a time to reveal narrative, architecture or progressive detail.",
    category: "Motion Experiences",
    version: "v0.9.0",
    accent: "#4C8DFF",
    secondary: "#51C89B",
    chapters: [
      { label: "01", title: "Story layer", description: "The first surface presents the high-level idea.", color: "#EDF3FF" },
      { label: "02", title: "System layer", description: "Scroll peels the top layer and reveals structure below.", color: "#EAFBF6" },
      { label: "03", title: "Detail layer", description: "The final surface resolves into implementation detail.", color: "#F4F0FF" },
    ],
    props: ["layers", "activeIndex", "wheel", "snap", "release"],
    code: `const active = useWheelStep(layerCount);
return layers.map((layer, i) => <motion.section animate={peelState(i, active)} />);`,
    docs: ["Use local scroll choreography and release the page at both ends.", "Avoid hijacking high-velocity trackpad gestures.", "Provide a progress label so users understand position."],
  },
  {
    slug: "trend-morphing-command-capsule",
    name: "Trend / Morphing Command Capsule",
    shortName: "Command Capsule",
    description: "A compact command trigger that expands in-place into search and actions, preserving spatial context instead of opening a detached modal.",
    category: "Motion Experiences",
    version: "v0.9.0",
    accent: "#6366F1",
    secondary: "#9A78FF",
    chapters: [
      { label: "01", title: "Compact trigger", description: "The command surface starts as a small capsule.", color: "#F7F8FC" },
      { label: "02", title: "In-place morph", description: "Width, radius and content expand from the same object.", color: "#EEF0FF" },
      { label: "03", title: "Context preserved", description: "Closing returns exactly to the original trigger.", color: "#F4F0FF" },
    ],
    props: ["open", "query", "commands", "shortcut", "focusReturn"],
    code: `<motion.div layout animate={{ width: open ? 360 : 180, borderRadius: open ? 26 : 999 }}>
  <CommandTrigger onClick={() => setOpen(!open)} />
  <AnimatePresence>{open && <CommandResults />}</AnimatePresence>
</motion.div>`,
    docs: ["Move focus into search when opened and restore it on close.", "Keep keyboard navigation first-class.", "Use layout morphing to explain where the command surface came from."],
  },
  {
    slug: "trend-ambient-light-window",
    name: "Trend / Ambient Light Window",
    shortName: "Ambient Window",
    description: "Pointer-aware illumination that gives a flat interface subtle material depth without relying on full frosted-glass styling.",
    category: "Motion Experiences",
    version: "v0.9.0",
    accent: "#AFC7F3",
    secondary: "#FFFFFF",
    chapters: [
      { label: "01", title: "Neutral material", description: "The surface remains calm and mostly opaque.", color: "#E4EBF6" },
      { label: "02", title: "Moving light", description: "Pointer position changes a bounded radial highlight.", color: "#EEF3FB" },
      { label: "03", title: "Attention cue", description: "Light reinforces hierarchy instead of becoming the hierarchy.", color: "#F7F8FC" },
    ],
    props: ["lightRadius", "intensity", "pointer", "surface", "reducedMotion"],
    code: `const glow = \`radial-gradient(circle 150px at \${x}% \${y}%, rgba(255,255,255,.9), transparent 70%)\`;
return <section style={{ backgroundImage: glow }} />;`,
    docs: ["Use light to guide attention around meaningful controls.", "Prefer opaque surfaces with subtle illumination over blanket glass effects.", "Disable continuous pointer tracking on touch devices."],
  },
];

export function getExperience(slug: string) {
  return interactiveExperiences.find((experience) => experience.slug === slug);
}
