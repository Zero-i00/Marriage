import type { HTMLAttributes } from "react";

/**
 * Тип для всех доступных вариантов типографики
 */
export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle-1"
  | "subtitle-2"
  | "body-1"
  | "body-2"
  | "caption"
  | "overline";

const TYPOGRAPHY_ELEMENTS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
  "li",
  "em",
  "address",
  "dt",
  "dd",
] as const satisfies readonly (keyof HTMLElementTagNameMap)[];

/**
 * Допустимые HTML-теги для рендера через проп `as`
 */
export type TypographyElement = (typeof TYPOGRAPHY_ELEMENTS)[number];

/**
 * Свойства компонента Typography
 */
export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  /**
   * Вариант типографики (размер, вес шрифта, межстрочный интервал)
   *
   * @remarks
   * Определяет стиль текста на основе design tokens из sizes.css
   */
  variant: TypographyVariant;

  /**
   * HTML-тег для рендера вместо элемента по умолчанию для variant
   *
   * @remarks
   * Стили variant применяются независимо от тега. Например,
   * `variant="h1" as="span"` даёт стиль h1 без семантики заголовка.
   */
  as?: TypographyElement;
}
