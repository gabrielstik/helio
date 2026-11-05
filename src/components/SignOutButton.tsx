"use client";

import { LogOut } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";

/** POST /auth/signout ; en icône seule dans la barre latérale, avec son libellé ailleurs. */
export function SignOutButton({ isIconOnly = false }: { isIconOnly?: boolean }) {
  return (
    <form action="/auth/signout" method="post">
      <Button
        label="Se déconnecter"
        variant="ghost"
        size="sm"
        type="submit"
        icon={<LogOut size={16} strokeWidth={1.75} aria-hidden />}
        isIconOnly={isIconOnly}
        tooltip={isIconOnly ? "Se déconnecter" : undefined}
      />
    </form>
  );
}
