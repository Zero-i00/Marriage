"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { type ComponentProps, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { SchemaInvitationRequest } from "@/features/invitation/schemas/invitation.schema";
import type { TypeInvitationRequest } from "@/features/invitation/types/invitation.type";

const FormSchema = SchemaInvitationRequest;
type FormData = TypeInvitationRequest;

export function InvitationForm({
  method = "POST",
  className,
  ...rest
}: ComponentProps<"form">) {
  const [isPending, setIsPending] = useState(false);
  const [isMounting, startTransition] = useTransition();
  const isLoading = isMounting || isPending;

  const { control, handleSubmit } = useForm<FormData>({
    mode: "onSubmit",
    resolver: valibotResolver(FormSchema),
  });

  const submit = (data: FormData) => {
    if (isLoading) return;

    console.log(data);
  };

  return (
    <form
      method={method}
      onSubmit={handleSubmit(submit)}
      className={twMerge(``, className)}
      {...rest}
    ></form>
  );
}
