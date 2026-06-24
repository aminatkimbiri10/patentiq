"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ActionState = { success?: boolean; error?: string; message?: string };

/** Affiche un toast sonner quand un server action retourne success/error. */
export function useActionToast(state: ActionState | undefined) {
  const lastKey = useRef<string>("");

  useEffect(() => {
    if (!state) return;
    const key = `${state.success ?? ""}|${state.error ?? ""}|${state.message ?? ""}`;
    if (key === lastKey.current || key === "||") return;
    lastKey.current = key;

    notifyActionResult(state);
  }, [state]);
}

export function notifyActionResult(state: ActionState) {
  if (state.error) {
    toast.error(state.error);
    return;
  }
  if (state.success && state.message) {
    toast.success(state.message);
  }
}
