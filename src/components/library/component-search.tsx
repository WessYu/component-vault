"use client";

import { Search } from "lucide-react";

export function ComponentSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#E4E7EF] bg-white px-4 text-sm text-[#9A9FB1] shadow-sm">
      <Search size={17} aria-hidden />
      <span className="sr-only">Search library</span>
      <input className="min-w-0 flex-1 bg-transparent outline-none" value={value} placeholder="Search by name, category, tag or technology..." onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
