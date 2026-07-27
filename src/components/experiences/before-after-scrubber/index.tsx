import { ExperienceDemo, ExperienceDocumentation, ExperienceMobile, ExperiencePreview, ExperienceProperties, ExperienceReducedMotionFallback } from "@/components/experiences/shared/experience-shell";
import { getExperience } from "@/components/experiences/experience-data";

const slug = "before-after-scrubber" as const;
const experience = getExperience(slug)!;

export function BeforeAfterScrubberPreview() { return <ExperiencePreview slug={slug} />; }
export function BeforeAfterScrubberDemo() { return <ExperienceDemo experience={experience} />; }
export function BeforeAfterScrubberProperties() { return <ExperienceProperties experience={experience} />; }
export function BeforeAfterScrubberDocumentation() { return <ExperienceDocumentation experience={experience} />; }
export function BeforeAfterScrubberCode() { return <pre>{experience.code}</pre>; }
export function BeforeAfterScrubberMobile() { return <ExperienceMobile slug={slug} />; }
export function BeforeAfterScrubberReducedMotion() { return <ExperienceReducedMotionFallback slug={slug} />; }
