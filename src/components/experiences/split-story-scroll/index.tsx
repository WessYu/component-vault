import { ExperienceDemo, ExperienceDocumentation, ExperienceMobile, ExperiencePreview, ExperienceProperties, ExperienceReducedMotionFallback } from "@/components/experiences/shared/experience-shell";
import { getExperience } from "@/components/experiences/experience-data";

const slug = "split-story-scroll" as const;
const experience = getExperience(slug)!;

export function SplitStoryScrollPreview() { return <ExperiencePreview slug={slug} />; }
export function SplitStoryScrollDemo() { return <ExperienceDemo experience={experience} />; }
export function SplitStoryScrollProperties() { return <ExperienceProperties experience={experience} />; }
export function SplitStoryScrollDocumentation() { return <ExperienceDocumentation experience={experience} />; }
export function SplitStoryScrollCode() { return <pre>{experience.code}</pre>; }
export function SplitStoryScrollMobile() { return <ExperienceMobile slug={slug} />; }
export function SplitStoryScrollReducedMotion() { return <ExperienceReducedMotionFallback slug={slug} />; }
