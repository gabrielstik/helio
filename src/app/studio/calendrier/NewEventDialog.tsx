"use client";

import { useActionState, useEffect, useState, type ComponentProps } from "react";
import { Plus } from "lucide-react";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { DateInput } from "@astryxdesign/core/DateInput";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { FormLayout } from "@astryxdesign/core/FormLayout";
import { Selector } from "@astryxdesign/core/Selector";
import { VStack } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TimeInput } from "@astryxdesign/core/TimeInput";
import { createEvent, type EventFormState } from "./actions";

type Day = ComponentProps<typeof DateInput>["value"];
type Time = ComponentProps<typeof TimeInput>["value"];

const DURATIONS = [
  { value: "30", label: "30 min" },
  { value: "60", label: "1 h" },
  { value: "90", label: "1 h 30" },
  { value: "120", label: "2 h" },
  { value: "180", label: "3 h" },
  { value: "480", label: "La journée (8 h)" },
];

/** Le formulaire, remonté à chaque ouverture pour repartir de champs vides. */
function EventForm({ clients, defaultDay, onDone }: { clients: { id: string; name: string }[]; defaultDay: string; onDone: () => void }) {
  const [state, action, pending] = useActionState<EventFormState, FormData>(createEvent, {});
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [day, setDay] = useState<Day>(defaultDay as Day);
  const [time, setTime] = useState<Time>("10:00" as Time);
  const [duration, setDuration] = useState("60");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={action}>
      {/* DateInput et TimeInput n'ont pas d'attribut name : leurs valeurs partent par ces champs cachés. */}
      <input type="hidden" name="day" value={day ?? ""} />
      <input type="hidden" name="time" value={time ?? ""} />
      <VStack gap={4} padding={4}>
        {state.error && <Banner status="error" title={state.error} />}
        <FormLayout defaultOptionality="required">
          <Selector
            label="Client"
            htmlName="client_id"
            value={clientId}
            onChange={setClientId}
            options={clients.map((c) => ({ value: c.id, label: c.name }))}
            hasSearch={clients.length > 8}
            searchPlaceholder="Rechercher…"
            placeholder="Choisir un client"
          />
          <TextInput label="Titre" htmlName="title" value={title} onChange={setTitle} placeholder="Repérage, essai coiffure, rendez-vous de présentation…" />
          <DateInput label="Jour" value={day} onChange={setDay} weekStartsOn="mon" />
          <TimeInput label="Heure" value={time} onChange={setTime} hourFormat="24h" increment={15} />
          <Selector label="Durée" htmlName="duration" value={duration} onChange={setDuration} options={DURATIONS} />
          <TextInput label="Lieu" htmlName="location" value={location} onChange={setLocation} isOptional />
        </FormLayout>
        <Button label="Enregistrer le rendez-vous" variant="primary" type="submit" width="100%" isLoading={pending} />
      </VStack>
    </form>
  );
}

/** « Nouveau rendez-vous » : un client, un titre, un jour et une heure de Paris, une durée, un lieu. */
export function NewEventDialog({ clients, defaultDay }: { clients: { id: string; name: string }[]; defaultDay: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const noClient = clients.length === 0;

  return (
    <>
      <Button
        label="Nouveau rendez-vous"
        variant="primary"
        size="sm"
        icon={<Plus size={16} strokeWidth={2} aria-hidden />}
        onClick={() => setIsOpen(true)}
        isDisabled={noClient}
        tooltip={noClient ? "Ajoutez d'abord un client au CRM." : undefined}
      />
      <Dialog isOpen={isOpen} onOpenChange={setIsOpen} purpose="form" width={460}>
        <DialogHeader title="Nouveau rendez-vous" subtitle="Il apparaît aussi dans l'espace du client." onOpenChange={setIsOpen} />
        {isOpen && <EventForm clients={clients} defaultDay={defaultDay} onDone={() => setIsOpen(false)} />}
      </Dialog>
    </>
  );
}
