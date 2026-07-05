import cn from "clsx";
import { forwardRef, type Ref } from "react";
import styles from "./radio.module.css";
import type { RadioProps } from "./radio.props";

/**
 * Радио-кнопка на нативном `<input type="radio">`
 *
 * @example
 * <Radio name="gender" label="Мужской" onChange={(e) => console.log(e.target.checked)} />
 */
function RadioInner(
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
  }: RadioProps,
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
            type="radio"
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
              styles.radio,
              styles[`radio--${size}`],
              isChecked && styles["radio--checked"],
              disabled && styles["radio--disabled"],
              error && styles["radio--error"],
            )}
          ></span>
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

export const Radio = forwardRef<HTMLInputElement, RadioProps>(RadioInner);
Radio.displayName = "Radio";
