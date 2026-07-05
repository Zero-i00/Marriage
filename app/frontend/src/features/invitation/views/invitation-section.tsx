import { cookies } from "next/headers";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { InvitationForm } from "@/features/invitation/components/forms/invitation-form";
import { TitleImage } from "@/shared/components/elements/title-image";
import { AnimatedSection } from "@/shared/components/layout/animated-section";
import { Typography } from "@/shared/components/ui/typography";
import { ROOT_SECTION } from "@/shared/configs/section.config";
import { COOKIE_INVITATION_PASSED } from "@/shared/constants/cookie.constant";
import { delay } from "@/shared/lib/section-animation";

export async function InvitationSection({
  id = ROOT_SECTION.INVITATION,
  className,
  ...rest
}: ComponentProps<"section">) {
  const isPassed =
    (await cookies()).get(COOKIE_INVITATION_PASSED)?.value === "true";

  if (isPassed) return null;

  return (
    <AnimatedSection
      id={id}
      className={twMerge(
        "container-section relative flex flex-col gap-10 overflow-hidden bg-natural-100",
        className,
      )}
      {...rest}
    >
      <svg
        className="pointer-events-none absolute left-0 top-[22%] h-[70%] w-auto max-[900px]:hidden"
        viewBox="0 0 352 1203"
        fill="none"
        preserveAspectRatio="xMinYMin meet"
        aria-hidden="true"
      >
        <path
          className="animate-draw"
          style={delay(0.3)}
          d="M-108.694 0.876953C-50.0073 82.3015 52.0584 229.421 155.395 240.9C284.567 255.248 372.858 184.392 344.777 133.022C295.708 43.2552 -26.0191 308.389 39.6768 667.626C105.373 1026.86 353.917 845.679 315.129 786.309C251.131 688.352 196.537 1242.8 -110 1198.33"
          stroke="var(--color-primary-900)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          pathLength="1"
        />
      </svg>

      <div className="flex justify-end">
        <Typography variant="h2" as="h2" className="sr-only">
          Анкета гостя
        </Typography>
        <TitleImage
          src="/invitation/title.webp"
          alt="Анкета"
          intrinsic={[1688, 320]}
          width="clamp(169px,30vw,390px)"
          priority
          className="animate-fade-in-up"
        />
      </div>

      <div className="flex justify-center">
        <InvitationForm />
      </div>
    </AnimatedSection>
  );
}
