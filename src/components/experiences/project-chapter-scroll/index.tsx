import { ExperienceDemo, ExperienceDocumentation, ExperienceMobile, ExperiencePreview, ExperienceProperties, ExperienceReducedMotionFallback } from "@/components/experiences/shared/experience-shell";
import { getExperience } from "@/components/experiences/experience-data";

const slug = "project-chapter-scroll" as const;
const experience = getExperience(slug)!;

export function ProjectChapterScrollPreview() { return <ExperiencePreview slug={slug} />; }
export function ProjectChapterScrollDemo() { return <ExperienceDemo experience={experience} />; }
export function ProjectChapterScrollProperties() { return <ExperienceProperties experience={experience} />; }
export function ProjectChapterScrollDocumentation() { return <ExperienceDocumentation experience={experience} />; }
export function ProjectChapterScrollCode() { return <pre>{experience.code}</pre>; }
export function ProjectChapterScrollMobile() { return <ExperienceMobile slug={slug} />; }
export function ProjectChapterScrollReducedMotion() { return <ExperienceReducedMotionFallback slug={slug} />; }
