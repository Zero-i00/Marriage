import cn from "clsx";
import styles from "./typography.module.css";
import type { TypographyProps, TypographyVariant } from "./typography.props";

/**
 * Определяет HTML элемент по умолчанию на основе variant
 *
 * @param variant - Вариант типографики
 * @returns HTML элемент, соответствующий semantic HTML best practices
 */
const TYPOGRAPHY_MAPPED_ELEMENT: Record<
  TypographyVariant,
  keyof HTMLElementTagNameMap
> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  "subtitle-1": "p",
  "subtitle-2": "p",
  "body-1": "p",
  "body-2": "p",
  caption: "span",
  overline: "span",
};

/**
 * Компонент Typography для отображения текста с заданным стилем типографики
 *
 * @description
 * Предоставляет семантическое отображение текста с применением стилей из design system.
 * Поддерживает все варианты типографики (заголовки, подзаголовки, текст).
 * Автоматически использует семантически правильные HTML элементы.
 *
 * @param {TypographyProps} props - Свойства компонента
 * @param {'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle-1' | 'subtitle-2' | 'body-1' | 'body-2' | 'caption' | 'overline'} props.variant - Вариант типографики (обязательный)
 * @param {string} [props.as] - HTML-тег для рендера вместо тега по умолчанию для variant
 * @param {React.ReactNode} props.children - Содержимое
 * @param {string} [props.className] - Дополнительные CSS классы
 *
 * @example
 * <Typography variant="h1">Заголовок первого уровня</Typography>
 * <Typography variant="h1" as="span">Стиль h1 без тега заголовка</Typography>
 */
export function Typography({
  variant,
  as,
  children,
  className,
  ...rest
}: TypographyProps) {
  const Component = as ?? TYPOGRAPHY_MAPPED_ELEMENT[variant] ?? "p";
  return (
    <Component
      className={cn(
        styles.typography,
        styles[`typography--${variant}`],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
