import { ExperienceDemo, ExperienceDocumentation, ExperienceMobile, ExperiencePreview, ExperienceProperties, ExperienceReducedMotionFallback } from "@/components/experiences/shared/experience-shell";
import { getExperience } from "@/components/experiences/experience-data";

const slug = "magnetic-component-rail" as const;
const experience = getExperience(slug)!;

export function MagneticComponentRailPreview() { return <ExperiencePreview slug={slug} />; }
export function MagneticComponentRailDemo() { return <ExperienceDemo experience={experience} />; }
export function MagneticComponentRailProperties() { return <ExperienceProperties experience={experience} />; }
export function MagneticComponentRailDocumentation() { return <ExperienceDocumentation experience={experience} />; }
export function MagneticComponentRailCode() { return <pre>{experience.code}</pre>; }
export function MagneticComponentRailMobile() { return <ExperienceMobile slug={slug} />; }
export function MagneticComponentRailReducedMotion() { return <ExperienceReducedMotionFallback slug={slug} />; }
