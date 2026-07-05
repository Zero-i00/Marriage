import cn from "clsx";
import { LoaderCircle } from "lucide-react";
import styles from "./loader.module.css";
import type { LoaderProps } from "./loader.props";

/**
 * Индикатор загрузки (спиннер)
 *
 * @example
 * <Loader size='sm' />
 */
export function Loader({ className, size = "md", ...rest }: LoaderProps) {
  return (
    <output
      className={cn(styles.loader, styles[`loader--${size}`], className)}
      aria-live="polite"
      aria-label="Загрузка"
      {...rest}
    >
      <LoaderCircle className={styles.loader__icon} />
    </output>
  );
}
