import type { ComponentProps } from "react";
import type { TypeIconSize } from "@/app/styles/types/size.type";

type RadioElement = Omit<ComponentProps<"input">, "size">;

/**
 * Свойства компонента Radio
 */
export interface RadioProps extends RadioElement {
  /**
   * Текстовая метка радио-кнопки
   *
   * @remarks
   * Отображается справа от радио-кнопки. При клике на метку радио-кнопка выбирается.
   */
  label?: string;

  /**
   * Состояние радио-кнопки (выбрана/не выбрана)
   *
   * @remarks
   * Используйте этот проп для контролируемого компонента.
   * Для неконтролируемого используйте стандартный HTML атрибут defaultChecked.
   *
   * @default false
   */
  isChecked?: boolean;

  /**
   * Состояние ошибки
   *
   * @remarks
   * При true радио-кнопка отображается с красной обводкой
   *
   * @default false
   */
  error?: boolean;

  /**
   * Вспомогательный текст под радио-кнопкой
   *
   * @remarks
   * Обычно используется для отображения ошибок валидации или подсказок
   */
  hint?: string;

  /**
   * Размер radio
   *
   * @remarks
   * Определяет размер radio из предопределенного набора значений
   *
   * @default 'sm'
   */
  size?: TypeIconSize;
}
