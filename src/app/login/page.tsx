import type { Metadata } from "next";
import { Banner } from "@astryxdesign/core/Banner";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Link } from "@astryxdesign/core/Link";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Logo } from "@/components/Logo";
import { PRODUCT_NAME } from "@/lib/site";
import { supabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion" };

/** Codes d'erreur passés dans ?error= ; on n'affiche jamais le texte brut de l'URL. */
const ERRORS: Record<string, string> = {
  invalid_credentials: "E-mail ou mot de passe incorrect.",
  email_not_confirmed: "Cette adresse n'est pas encore confirmée.",
  invalid_form: "Renseignez votre e-mail et votre mot de passe.",
  profile_missing: "Ce compte n'a pas de profil.",
  auth_callback_failed: "Ce lien de connexion n'est plus valide.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "";
  const error = typeof sp.error === "string" ? (ERRORS[sp.error] ?? "La connexion a échoué. Réessayez.") : null;

  return (
    <main className="lp-centered">
      <VStack gap={6} align="center" width="100%" maxWidth={400}>
        <Link href="/" color="primary" isStandalone>
          <HStack gap={2} align="center">
            <Logo size={28} />
            <Text weight="semibold" size="lg">
              {PRODUCT_NAME}
            </Text>
          </HStack>
        </Link>
        <Card width="100%" padding={6} elevation="low">
          <VStack gap={5}>
            <VStack gap={1}>
              <Heading level={1}>Connexion</Heading>
              <Text color="secondary">Retrouvez votre studio, vos clients et vos galeries.</Text>
            </VStack>
            {!supabaseConfigured && (
              <Banner status="warning" title="Supabase n'est pas configuré" description="Renseignez .env.local (voir .env.example et le README)." />
            )}
            {error && <Banner status="error" title={error} />}
            <LoginForm next={next} isDisabled={!supabaseConfigured} />
          </VStack>
        </Card>
      </VStack>
    </main>
  );
}
