import { CliShowcase } from "@/components/landing/cli-showcase";
import { CliTutorial } from "@/components/landing/cli-tutorial";
import { GuardOverview } from "@/components/landing/guard-overview";
import { LandingExperience } from "@/components/landing/landing-experience";

export default function Home() {
  return (
    <>
      <LandingExperience />
      <CliShowcase />
      <CliTutorial />
      <GuardOverview />
    </>
  );
}
