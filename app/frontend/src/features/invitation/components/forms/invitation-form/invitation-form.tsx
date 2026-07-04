"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMutation, useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { Plus, Trash } from "lucide-react";
import type { ComponentProps } from "react";
import { useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import { ICON_SIZE } from "@/app/styles/types/size.type";
import { SchemaInvitationRequest } from "@/features/invitation/schemas/invitation.schema";
import { drinkService } from "@/features/invitation/services/drink.service";
import { invitationService } from "@/features/invitation/services/invitation.service";
import type { TypeInvitationRequest } from "@/features/invitation/types/invitation.type";
import { extractError } from "@/shared/api/api.error";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Radio } from "@/shared/components/ui/radio";
import { Typography } from "@/shared/components/ui/typography";
import { COOKIE_INVITATION_PASSED } from "@/shared/constants/cookie.constant";
import { INVALID_REQUIRED } from "@/shared/constants/error.constant";

const FormSchema = SchemaInvitationRequest;
type FormData = TypeInvitationRequest;

const DEFAULT_VALUES: FormData = {
  is_plan_visit: true,
  music: "",
  drink_ids: [],
  guests: [{ full_name: "" }],
};

type Props = ComponentProps<"form"> & {
  /** Вызывается после успешной отправки анкеты (см. cookie-гейт в InvitationSection) */
  onSubmitted?: () => void;
};

export function InvitationForm({
  method = "POST",
  className,
  onSubmitted,
  ...rest
}: Props) {
  const [isMounting, startTransition] = useTransition();

  const { data: drinks = [] } = useQuery({
    queryKey: ["drinks"],
    queryFn: () => drinkService.list(),
  });

  const { control, register, handleSubmit, reset } = useForm<FormData>({
    mode: "onSubmit",
    resolver: valibotResolver(FormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "guests",
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => invitationService.create(data),
    onSuccess: () => {
      startTransition(() => {
        reset(DEFAULT_VALUES);
        Cookies.set(COOKIE_INVITATION_PASSED, "true", {
          expires: 365,
          sameSite: "lax",
        });
        toast.success("Анкета отправлена!");
        onSubmitted?.();
      });
    },
    onError: async (error) => {
      const messages = await extractError(error);
      for (const message of messages) toast.error(message);
    },
  });

  const submit = (data: FormData) => mutation.mutate(data);
  const isLoading = isMounting || mutation.isPending;

  return (
    <form
      method={method}
      onSubmit={handleSubmit(submit)}
      className={twMerge("flex w-full max-w-md flex-col gap-8", className)}
      {...rest}
    >
      <Controller
        control={control}
        name="guests.0.full_name"
        rules={{ required: INVALID_REQUIRED }}
        render={({ field: guestField, fieldState: { error } }) => (
          <Input
            required
            label="ФИО"
            placeholder="Иванов Иван Иванович"
            error={error?.message}
            {...guestField}
          />
        )}
      />

      <Controller
        control={control}
        name="is_plan_visit"
        render={({ field }) => (
          <div className="flex flex-col gap-3">
            <Typography
              variant="subtitle-1"
              className="text-[var(--color-primary-900)]"
            >
              Планируете ли Вы присутствовать на свадьбе?
            </Typography>
            <Radio
              label="Да, с удовольствием"
              isChecked={field.value}
              onChange={() => field.onChange(true)}
            />
            <Radio
              label="К сожалению, не смогу"
              isChecked={!field.value}
              onChange={() => field.onChange(false)}
            />
          </div>
        )}
      />

      <div className="flex flex-col gap-3">
        <Typography
          variant="subtitle-1"
          className="text-[var(--color-primary-900)]"
        >
          Будет ли с Вами ещё кто-то?
        </Typography>

        <button
          type="button"
          className="flex w-fit items-center gap-3 text-left"
          onClick={() => append({ full_name: "" })}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--rounded-sm)] border-2 border-[var(--color-primary-400)]">
            <Plus
              size={ICON_SIZE.xs}
              className="text-[var(--color-primary-700)]"
            />
          </span>
          <Typography variant="body-2">
            Да (вторая половинка / ребёнок)
          </Typography>
        </button>

        {fields.slice(1).map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <Controller
              control={control}
              name={`guests.${index + 1}.full_name`}
              rules={{ required: INVALID_REQUIRED }}
              render={({ field: guestField, fieldState: { error } }) => (
                <Input
                  className="flex-1"
                  required
                  placeholder="Иванов Иван Иванович"
                  error={error?.message}
                  {...guestField}
                />
              )}
            />
            <Button
              type="button"
              variant="icon"
              aria-label="Удалить гостя"
              className="mt-auto"
              onClick={() => remove(index + 1)}
            >
              <Trash size={ICON_SIZE.sm} />
            </Button>
          </div>
        ))}

        <Checkbox label="Нет" isChecked={fields.length === 1} />
      </div>

      <Controller
        control={control}
        name="drink_ids"
        render={({ field }) => (
          <div className="flex flex-col gap-3">
            <Typography
              variant="subtitle-1"
              className="text-[var(--color-primary-900)]"
            >
              Уточните Ваши предпочтения в алкоголе:
            </Typography>
            {drinks.length === 0 ? (
              <Typography
                variant="body-2"
                className="text-[var(--color-gray-600)]"
              >
                Пока нет вариантов на выбор
              </Typography>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {drinks.map((drink) => {
                  const isChecked = field.value.includes(drink.id);
                  return (
                    <Checkbox
                      key={drink.id}
                      label={drink.title}
                      isChecked={isChecked}
                      onChange={() =>
                        field.onChange(
                          isChecked
                            ? field.value.filter((id) => id !== drink.id)
                            : [...field.value, drink.id],
                        )
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      />

      <Input
        label="Оставьте свой любимый музыкальный трек для дискотеки"
        placeholder="Bruno Mars - Just The Way You Are"
        {...register("music")}
      />

      <Button
        type="submit"
        size="lg"
        isLoading={isLoading}
        className="w-2/3 self-center"
      >
        Отправить!
      </Button>
    </form>
  );
}
