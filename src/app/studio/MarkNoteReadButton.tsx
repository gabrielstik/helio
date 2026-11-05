"use client";

import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { markNoteRead } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button label="Marquer comme lue" variant="ghost" size="sm" type="submit" isIconOnly tooltip="Marquer comme lue" isLoading={pending} icon={<Check size={16} strokeWidth={2} aria-hidden />} />
  );
}

export function MarkNoteReadButton({ noteId }: { noteId: string }) {
  return (
    <form action={markNoteRead}>
      <input type="hidden" name="note_id" value={noteId} />
      <Submit />
    </form>
  );
}
