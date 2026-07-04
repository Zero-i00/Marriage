"use client";

import { type ComponentProps, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

/**
 * `<section>`, вешающий класс `in-view` при первом входе в viewport —
 * `.animate-*` из styles/animations.css запускаются от этого класса (см. secion-anim.ts).
 * Once-триггер: анимация не переигрывает при повторном скролле туда-сюда.
 */
export function AnimatedSection({
  className,
  children,
  ...rest
}: ComponentProps<"section">) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={twMerge(inView && "in-view", className)}
      {...rest}
    >
      {children}
    </section>
  );
}
