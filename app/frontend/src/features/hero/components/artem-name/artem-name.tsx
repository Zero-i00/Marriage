import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { delay } from "@/shared/lib/section-animation";

/**
 * Имя "Артём" — цельный SVG (декоративная линия-росчерк + буквы), рисуется от руки:
 * сперва линия штрихом, затем буквы обводятся и заливаются слева направо.
 */
export function ArtemName({ className, ...rest }: ComponentProps<"svg">) {
  return (
    <svg
      className={twMerge("aspect-1720/137 h-auto", className)}
      viewBox="0 0 1720 137"
      fill="none"
      role="img"
      aria-label="Артём"
      {...rest}
    >
      <path
        className="animate-draw"
        style={delay(1.3)}
        d="M1277.81 134.22C1086.09 134.342 988.39 27.7951 888.375 15.3933C820.345 6.95754 786.942 145.861 629.783 95.1532C466.631 30.6965 362.685 85.2979 408.03 109.647C453.375 133.997 663.484 32.2993 529.324 5.49132C395.162 -21.3167 169.722 85.6276 -39.7383 79.8509"
        stroke="var(--color-primary-900)"
        strokeWidth="2.34188"
        vectorEffect="non-scaling-stroke"
        pathLength="1"
      />
      <path
        className="animate-write"
        style={delay(1.7)}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1275.87 135.49L1308.55 37.5608H1322.58L1359.48 135.49H1345.59L1330.48 95.4474H1291.67L1278.32 135.49H1275.87ZM1292.49 93.0589L1309.91 40.6518L1329.66 93.0589H1292.49Z"
        fill="var(--color-primary-900)"
        stroke="var(--color-primary-900)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        pathLength="1"
      />
      <path
        className="animate-write"
        style={delay(1.78)}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1366.39 38.2413H1379.33V70.8376C1382.05 53.9775 1387.09 36.1338 1407.11 36.1338C1426.71 36.1338 1443.87 44.8449 1443.87 68.3086C1443.87 97.2519 1424.53 102.31 1402.2 102.31H1379.33V136.171H1366.39V38.2413ZM1379.33 100.202C1379.33 100.202 1378.1 80.5323 1384.23 58.7545C1389.54 39.6463 1398.8 38.3818 1407.11 38.3818C1421.95 38.3818 1430.53 44.9854 1430.53 68.3086C1430.53 97.9544 1415.41 100.202 1402.2 100.202H1379.33Z"
        fill="var(--color-primary-900)"
        stroke="var(--color-primary-900)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        pathLength="1"
      />
      <path
        className="animate-write"
        style={delay(1.86)}
        d="M1450.79 39.8203H1490.21V135.992H1503.21V39.8203H1542.49V37.5608H1450.79V39.8203Z"
        fill="var(--color-primary-900)"
        stroke="var(--color-primary-900)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        pathLength="1"
      />
      <path
        className="animate-write"
        style={delay(1.94)}
        d="M1549.4 37.5608V135.992H1618.1V133.591H1562.4V85.8585H1605.79V83.599H1562.4V39.8203H1618.1V37.5608H1549.4Z"
        fill="var(--color-primary-900)"
        stroke="var(--color-primary-900)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        pathLength="1"
      />
      <path
        className="animate-write"
        style={delay(2.02)}
        d="M1625.02 37.5608V135.992H1638.02V41.2326L1672.51 88.1181L1707.14 41.2326V135.992H1720V37.5608H1706.86L1672.51 84.1639L1638.16 37.5608H1625.02Z"
        fill="var(--color-primary-900)"
        stroke="var(--color-primary-900)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        pathLength="1"
      />
    </svg>
  );
}
