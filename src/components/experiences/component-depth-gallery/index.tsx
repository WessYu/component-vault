import { ExperienceDemo, ExperienceDocumentation, ExperienceMobile, ExperiencePreview, ExperienceProperties, ExperienceReducedMotionFallback } from "@/components/experiences/shared/experience-shell";
import { getExperience } from "@/components/experiences/experience-data";

const slug = "component-depth-gallery" as const;
const experience = getExperience(slug)!;

export function ComponentDepthGalleryPreview() { return <ExperiencePreview slug={slug} />; }
export function ComponentDepthGalleryDemo() { return <ExperienceDemo experience={experience} />; }
export function ComponentDepthGalleryProperties() { return <ExperienceProperties experience={experience} />; }
export function ComponentDepthGalleryDocumentation() { return <ExperienceDocumentation experience={experience} />; }
export function ComponentDepthGalleryCode() { return <pre>{experience.code}</pre>; }
export function ComponentDepthGalleryMobile() { return <ExperienceMobile slug={slug} />; }
export function ComponentDepthGalleryReducedMotion() { return <ExperienceReducedMotionFallback slug={slug} />; }
