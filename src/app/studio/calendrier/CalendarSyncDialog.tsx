"use client";

import { useActionState, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { rotateCalendarToken, type EventFormState } from "./actions";

/** L'adresse et son bouton « Copier » ; remonté quand l'adresse change, pour ne pas garder « Copié » sur l'ancienne. */
function CopyField({ feedUrl }: { feedUrl: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <HStack gap={2} align="end">
      <TextInput label="Adresse du calendrier" value={feedUrl} isReadOnly isLabelHidden width="100%" />
      <Button
        label={copied ? "Copié" : "Copier"}
        variant="secondary"
        clickAction={async () => {
          await navigator.clipboard.writeText(feedUrl);
          setCopied(true);
        }}
      />
    </HStack>
  );
}

/** Changer l'adresse coupe tous les abonnements : on le dit en clair et on demande confirmation. */
function RotateAddress() {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState<EventFormState, FormData>(async () => {
    const next = await rotateCalendarToken();
    if (next.ok) setConfirming(false);
    return next;
  }, {});

  return (
    <VStack gap={2}>
      <Text weight="semibold">Adresse partagée par erreur ?</Text>
      {state.ok && !confirming && (
        <Banner status="success" title="Nouvelle adresse créée" description="Réabonnez Google Agenda et vos autres agendas avec l'adresse ci-dessus." />
      )}
      {state.error && <Banner status="error" title={state.error} />}
      {confirming ? (
        <VStack gap={2}>
          <Text color="secondary">
            L&apos;adresse actuelle cessera de fonctionner tout de suite : Google Agenda, Apple Calendar et Outlook ne recevront plus vos
            dates tant que vous ne les aurez pas réabonnés.
          </Text>
          <form action={action}>
            <HStack gap={2}>
              <Button label="Changer l'adresse" variant="destructive" size="sm" type="submit" isLoading={pending} />
              <Button label="Annuler" variant="ghost" size="sm" onClick={() => setConfirming(false)} isDisabled={pending} />
            </HStack>
          </form>
        </VStack>
      ) : (
        <HStack>
          <Button label="Changer l'adresse…" variant="ghost" size="sm" onClick={() => setConfirming(true)} />
        </HStack>
      )}
    </VStack>
  );
}

/**
 * Abonnement d'un agenda externe au flux iCal du photographe (/api/calendar/<jeton>.ics) : en un clic pour
 * Google Agenda, par l'adresse pour Apple Calendar et Outlook. Sens unique : Helio vers l'agenda.
 */
export function CalendarSyncDialog({ feedUrl }: { feedUrl: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const webcal = feedUrl.replace(/^https?:\/\//, "webcal://");
  const google = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`;
  // Google va chercher le flux lui-même : il ne voit pas un serveur qui tourne sur ce Mac.
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(feedUrl);

  return (
    <>
      <Button label="Synchroniser" variant="secondary" size="sm" icon={<RefreshCw size={16} strokeWidth={1.75} aria-hidden />} onClick={() => setIsOpen(true)} />
      <Dialog isOpen={isOpen} onOpenChange={setIsOpen} width={500}>
        <DialogHeader title="Synchroniser votre agenda" subtitle="Vos rendez-vous et jours de shooting, dans votre agenda habituel." onOpenChange={setIsOpen} />
        <VStack gap={5} padding={4}>
          {isLocal && (
            <Banner
              status="info"
              title="Disponible depuis la version en ligne"
              description="Google Agenda lit le calendrier sur internet : il ne peut pas joindre l'app quand elle tourne sur votre ordinateur."
            />
          )}
          <VStack gap={2}>
            <Text weight="semibold">Google Agenda</Text>
            <Text color="secondary">
              Google ajoute le calendrier « Helio » à votre compte et le met à jour tout seul, en général en quelques heures.
            </Text>
            <HStack>
              <Button label="Ajouter à Google Agenda" variant="primary" href={google} target="_blank" rel="noopener noreferrer" isDisabled={isLocal} />
            </HStack>
          </VStack>
          <VStack gap={2}>
            <Text weight="semibold">Apple Calendar, Outlook et autres</Text>
            <Text color="secondary">Abonnez-vous à cette adresse. Gardez-la pour vous : elle donne accès à vos dates.</Text>
            <CopyField key={feedUrl} feedUrl={feedUrl} />
          </VStack>
          <RotateAddress />
        </VStack>
      </Dialog>
    </>
  );
}
