import { SearchX } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";

export default function NotFound() {
  return (
    <main className="lp-centered">
      <EmptyState
        headingLevel={1}
        icon={<SearchX size={32} strokeWidth={1.5} />}
        title="Page introuvable"
        description="Ce lien ne mène nulle part, ou la galerie n'est plus en ligne."
        actions={<Button label="Retour à l'accueil" variant="secondary" href="/" />}
      />
    </main>
  );
}
