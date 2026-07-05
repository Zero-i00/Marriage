import type { ComponentProps, ReactNode } from "react";
import type { TypeIconSize } from "@/app/styles/types/size.type";

export type InputElement = Omit<ComponentProps<"input">, "size">;
/** Свойства компонента Input */
export interface InputProps extends InputElement {
  /** Размер поля ввода @default 'sm' */
  size?: TypeIconSize;
  /** Подпись над полем, связана через htmlFor */
  label?: string;
  /** Подсказка под полем ввода */
  hint?: string;
  /** Текст ошибки валидации — окрашивает рамку в красный */
  error?: string;
  /** Текст успешной валидации — окрашивает рамку в зелёный */
  success?: string;
  /** Состояние загрузки — показывает loader, блокирует поле @default false */
  isLoading?: boolean;
  /** Иконка слева от поля ввода */
  LeftComponent?: ReactNode;
  /** Иконка справа от поля ввода */
  RightComponent?: ReactNode;
  /** HTML атрибуты для контейнера компонента */
  container?: ComponentProps<"div">;
}
