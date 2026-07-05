import cn from "clsx";
import { forwardRef, type Ref, useId } from "react";
import { Loader } from "@/shared/components/ui/loader";
import styles from "./textarea.module.css";
import type { TextareaProps } from "./textarea.props";

/**
 * Многострочное текстовое поле с label, hint, состояниями ошибки/успеха и загрузки
 *
 * @example
 * <Textarea label='Комментарий' hint='Ваши пожелания' error={errors.comment} />
 */
function TextareaInner(
  {
    id,
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
  }: TextareaProps,
  ref: Ref<HTMLTextAreaElement>,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = hint ? `${textareaId}-hint` : undefined;

  return (
    <div {...container} className={cn(styles.container, container?.className)}>
      {label && (
        <label htmlFor={textareaId} className={styles.textarea__label}>
          {label}
        </label>
      )}
      <div
        className={cn(
          styles.textarea__wrapper,
          styles[`textarea__wrapper--${size}`],
          error && styles["textarea__wrapper--error"],
          success && styles["textarea__wrapper--success"],
        )}
      >
        {LeftComponent}
        <textarea
          id={textareaId}
          ref={ref}
          required={required}
          aria-invalid={!!error}
          aria-describedby={hintId}
          aria-disabled={disabled}
          disabled={disabled || isLoading}
          data-success={!!success}
          className={cn(styles.textarea, className)}
          placeholder={required ? `${placeholder} *` : placeholder}
          {...rest}
        />
        {isLoading && <Loader size={"sm"} />}
        {!isLoading && RightComponent}
      </div>
      {hint && (
        <p id={hintId} className={styles.textarea__hint}>
          {hint}
        </p>
      )}
      {error && <p className={styles.textarea__error}>{error}</p>}
      {success && <p className={styles.textarea__success}>{success}</p>}
    </div>
  );
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  TextareaInner,
);
Textarea.displayName = "Textarea";
