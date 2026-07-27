import { ExperienceDemo, ExperienceDocumentation, ExperienceMobile, ExperiencePreview, ExperienceProperties, ExperienceReducedMotionFallback } from "@/components/experiences/shared/experience-shell";
import { getExperience } from "@/components/experiences/experience-data";

const slug = "grid-to-detail-morph" as const;
const experience = getExperience(slug)!;

export function GridToDetailMorphPreview() { return <ExperiencePreview slug={slug} />; }
export function GridToDetailMorphDemo() { return <ExperienceDemo experience={experience} />; }
export function GridToDetailMorphProperties() { return <ExperienceProperties experience={experience} />; }
export function GridToDetailMorphDocumentation() { return <ExperienceDocumentation experience={experience} />; }
export function GridToDetailMorphCode() { return <pre>{experience.code}</pre>; }
export function GridToDetailMorphMobile() { return <ExperienceMobile slug={slug} />; }
export function GridToDetailMorphReducedMotion() { return <ExperienceReducedMotionFallback slug={slug} />; }
