import cn from "clsx";
import type { ButtonProps } from "@/shared/components/ui/button/button.props";
import { Loader } from "@/shared/components/ui/loader/loader";
import styles from "./button.module.css";

/**
 * Базовая кнопка с состоянием загрузки
 *
 * @example
 * <Button variant='icon' size='md' isLoading={isSubmitting}>Отправить</Button>
 */
export function Button({
  children,
  className,
  size = "md",
  type = "button",
  disabled = false,
  isLoading = false,
  variant = "default",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        styles.btn,
        styles[`btn--${size}`],
        styles[`btn--${variant}`],
        className,
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? <Loader size={size} /> : children}
    </button>
  );
}
