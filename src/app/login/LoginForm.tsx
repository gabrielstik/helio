"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@astryxdesign/core/Button";
import { FormLayout } from "@astryxdesign/core/FormLayout";
import { TextInput } from "@astryxdesign/core/TextInput";
import { signIn } from "./actions";

function SubmitButton({ isDisabled }: { isDisabled: boolean }) {
  const { pending } = useFormStatus();
  return <Button label="Se connecter" variant="primary" type="submit" width="100%" isLoading={pending} isDisabled={isDisabled} />;
}

/** Champs contrôlés (règle Astryx) ; `htmlName` les fait partir dans le FormData de l'action serveur. */
export function LoginForm({ next, isDisabled }: { next: string; isDisabled: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form action={signIn}>
      <input type="hidden" name="next" value={next} />
      <FormLayout defaultOptionality="required">
        <TextInput label="E-mail" type="email" htmlName="email" value={email} onChange={setEmail} hasAutoFocus />
        <TextInput label="Mot de passe" type="password" htmlName="password" value={password} onChange={setPassword} />
        <SubmitButton isDisabled={isDisabled} />
      </FormLayout>
    </form>
  );
}
