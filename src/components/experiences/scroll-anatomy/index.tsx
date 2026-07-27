import { ExperienceDemo, ExperienceDocumentation, ExperienceMobile, ExperiencePreview, ExperienceProperties, ExperienceReducedMotionFallback } from "@/components/experiences/shared/experience-shell";
import { getExperience } from "@/components/experiences/experience-data";

const slug = "scroll-anatomy" as const;
const experience = getExperience(slug)!;

export function ScrollAnatomyPreview() { return <ExperiencePreview slug={slug} />; }
export function ScrollAnatomyDemo() { return <ExperienceDemo experience={experience} />; }
export function ScrollAnatomyProperties() { return <ExperienceProperties experience={experience} />; }
export function ScrollAnatomyDocumentation() { return <ExperienceDocumentation experience={experience} />; }
export function ScrollAnatomyCode() { return <pre>{experience.code}</pre>; }
export function ScrollAnatomyMobile() { return <ExperienceMobile slug={slug} />; }
export function ScrollAnatomyReducedMotion() { return <ExperienceReducedMotionFallback slug={slug} />; }
