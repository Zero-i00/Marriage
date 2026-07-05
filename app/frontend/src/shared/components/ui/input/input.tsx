import cn from "clsx";
import { forwardRef, type Ref, useId } from "react";
import { Loader } from "@/shared/components/ui/loader";
import styles from "./input.module.css";
import type { InputProps } from "./input.props";

/**
 * Текстовое поле ввода с label, hint, состояниями ошибки/успеха и загрузки
 *
 * @example
 * <Input label='Имя' hint='Как к вам обращаться' error={errors.name} />
 */
function InputInner(
  {
    id,
    type,
    hint,
    error,
    label,
    success,
    container,
    className,
    placeholder,
    LeftComponent,
    RightComponent,
    size = "sm",
    disabled = false,
    required = false,
    isLoading = false,
    ...rest
  }: InputProps,
  ref: Ref<HTMLInputElement>,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div {...container} className={cn(styles.container, container?.className)}>
      {label && (
        <label htmlFor={inputId} className={styles.input__label}>
          {label}
        </label>
      )}
      <div
        className={cn(
          styles.input__wrapper,
          styles[`input__wrapper--${size}`],
          error && styles["input__wrapper--error"],
          success && styles["input__wrapper--success"],
        )}
      >
        {LeftComponent}
        <input
          id={inputId}
          ref={ref}
          type={type}
          required={required}
          aria-invalid={!!error}
          aria-describedby={hintId}
          aria-disabled={disabled}
          disabled={disabled || isLoading}
          data-success={!!success}
          className={cn(styles.input, className)}
          placeholder={required ? `${placeholder} *` : placeholder}
          {...rest}
        />
        {isLoading && <Loader size={"sm"} />}
        {!isLoading && RightComponent}
      </div>
      {hint && (
        <p id={hintId} className={styles.input__hint}>
          {hint}
        </p>
      )}
      {error && <p className={styles.input__error}>{error}</p>}
      {success && <p className={styles.input__success}>{success}</p>}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(InputInner);
Input.displayName = "Input";
