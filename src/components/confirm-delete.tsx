"use client";

import { useRef, type ReactNode } from "react";

type ConfirmDeleteProps = {
  action: (formData: FormData) => void;
  children: ReactNode;
  message?: string;
};

export function ConfirmDelete({ action, children, message }: ConfirmDeleteProps) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    if (!confirm(message ?? "Estas seguro de que quieres eliminar este registro?")) {
      return;
    }
    action(formData);
  }

  return (
    <form ref={formRef} action={handleSubmit}>
      {children}
    </form>
  );
}
