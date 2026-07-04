import type { CSSProperties } from "react";

/** Стиль с CSS-переменной `--delay`, которую читает `.animate-*` из styles/animations.css. */
export type DelayStyle = CSSProperties & { "--delay"?: string };

export function delay(seconds: number): DelayStyle {
  return { "--delay": `${seconds}s` };
}
