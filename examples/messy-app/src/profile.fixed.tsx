import { Text } from "./components/ui/text";

export function ProfileFixed() {
  return (
    <main>
      <Text.H1 className="text-4xl font-bold tracking-tight">Developer profile</Text.H1>
      <Text.Paragraph className="mt-3 text-sm leading-6 text-slate-600">This version uses the governed typography API.</Text.Paragraph>
    </main>
  );
}
