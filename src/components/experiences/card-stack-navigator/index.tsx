import { ExperienceDemo, ExperienceDocumentation, ExperienceMobile, ExperiencePreview, ExperienceProperties, ExperienceReducedMotionFallback } from "@/components/experiences/shared/experience-shell";
import { getExperience } from "@/components/experiences/experience-data";

const slug = "card-stack-navigator" as const;
const experience = getExperience(slug)!;

export function CardStackNavigatorPreview() { return <ExperiencePreview slug={slug} />; }
export function CardStackNavigatorDemo() { return <ExperienceDemo experience={experience} />; }
export function CardStackNavigatorProperties() { return <ExperienceProperties experience={experience} />; }
export function CardStackNavigatorDocumentation() { return <ExperienceDocumentation experience={experience} />; }
export function CardStackNavigatorCode() { return <pre>{experience.code}</pre>; }
export function CardStackNavigatorMobile() { return <ExperienceMobile slug={slug} />; }
export function CardStackNavigatorReducedMotion() { return <ExperienceReducedMotionFallback slug={slug} />; }
