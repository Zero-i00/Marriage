import cn from "clsx";
import { Check } from "lucide-react";
import { forwardRef, type Ref } from "react";
import styles from "./checkbox.module.css";
import type { CheckboxProps } from "./checkbox.props";

/**
 * Чекбокс на нативном `<input type="checkbox">`
 *
 * @example
 * <Checkbox label='Согласен с условиями' isChecked={agreed} onChange={onToggle} />
 */
function CheckboxInner(
  {
    id,
    label,
    hint,
    className,
    onChange,
    size = "sm",
    error = false,
    disabled = false,
    isChecked = false,
    ...rest
  }: CheckboxProps,
  ref: Ref<HTMLInputElement>,
) {
  return (
    <div className={cn(styles.wrapper, className)}>
      <label
        htmlFor={id}
        className={cn(
          styles.label,
          styles[`label--${size}`],
          disabled && styles["label--disabled"],
          error && styles["label--error"],
        )}
      >
        <span className={styles.container}>
          <input
            ref={ref}
            id={id}
            type="checkbox"
            checked={isChecked}
            disabled={disabled}
            onChange={onChange}
            readOnly={!onChange}
            className={styles.input}
            aria-checked={isChecked}
            aria-invalid={error}
            aria-disabled={disabled}
            {...rest}
          />
          <span
            className={cn(
              styles.checkbox,
              styles[`checkbox--${size}`],
              isChecked && styles["checkbox--checked"],
              disabled && styles["checkbox--disabled"],
              error && styles["checkbox--error"],
            )}
          >
            {isChecked && <Check className={styles.icon} strokeWidth={3} />}
          </span>
        </span>
        {label && <span className={styles["label-text"]}>{label}</span>}
      </label>
      {hint && (
        <span className={cn(styles.hint, error && styles["hint--error"])}>
          {hint}
        </span>
      )}
    </div>
  );
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  CheckboxInner,
);
Checkbox.displayName = "Checkbox";
