"use client";

import { QUICK_NOTES } from "@/lib/prospecting-data";

interface ProspectNotesProps {
  notes: string;
  onChange: (notes: string) => void;
}

export function ProspectNotes({ notes, onChange }: ProspectNotesProps) {
  function append(note: string) {
    onChange(notes ? `${notes}\n${note}` : note);
  }

  return (
    <div className="space-y-3">
      <textarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="Заметки по контакту…"
        className="w-full rounded-xl bg-[#f6f6f6] p-4 text-sm outline-none focus:ring-2 focus:ring-[#050505]/10"
      />
      <div className="flex flex-wrap gap-2">
        {QUICK_NOTES.map((note) => (
          <button
            key={note}
            type="button"
            onClick={() => append(note)}
            className="rounded-full bg-[#f6f6f6] px-3 py-1.5 text-xs font-medium text-[#050505] hover:bg-[#ebebeb]"
          >
            {note}
          </button>
        ))}
      </div>
    </div>
  );
}
