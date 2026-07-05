import cn from "clsx";
import styles from "./typography.module.css";
import type { TypographyProps, TypographyVariant } from "./typography.props";

/** HTML-элемент по умолчанию для каждого варианта типографики */
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
 * Текст с заданным вариантом типографики, рендерит семантически правильный HTML-тег.
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
