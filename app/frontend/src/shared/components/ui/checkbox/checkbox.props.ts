import type { ComponentProps } from "react";
import type { TypeIconSize } from "@/app/styles/types/size.type";

type CheckboxElement = Omit<ComponentProps<"input">, "size" | "checked">;

/** Свойства компонента Checkbox */
export interface CheckboxProps extends CheckboxElement {
  /** Текстовая метка справа от чекбокса */
  label?: string;
  /** Состояние чекбокса (контролируемый режим) @default false */
  isChecked?: boolean;
  /** Красная обводка при ошибке @default false */
  error?: boolean;
  /** Вспомогательный текст под чекбоксом */
  hint?: string;
  /** Размер чекбокса @default 'sm' */
  size?: TypeIconSize;
}
