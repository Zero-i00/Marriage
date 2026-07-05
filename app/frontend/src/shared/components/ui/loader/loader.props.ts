import type { ComponentProps } from "react";
import type { TypeIconSize } from "@/app/styles/types/size.type";

/**
 * Свойства компонента Loader
 */
export interface LoaderProps extends ComponentProps<"output"> {
  /**
   * Размер загрузчика
   *
   * @remarks
   * Определяет размер индикатора загрузки из предопределенного набора значений
   *
   * @default 'md'
   */
  size?: TypeIconSize;
}
