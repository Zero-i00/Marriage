import { Fragment } from "react";
import { AboutSection } from "@/features/about";
import { GladToSeeYouSection } from "@/features/glad-to-see-you";
import { HeroSection } from "@/features/hero/views/hero-section";
import { InvitationSection } from "@/features/invitation";
import { PlaceSection } from "@/features/place";
import { PlanSection } from "@/features/plan";

export default function Home() {
  return (
    <Fragment>
      <HeroSection />
      <AboutSection />
      <PlaceSection />
      <PlanSection />
      <InvitationSection />
      <GladToSeeYouSection />
    </Fragment>
  );
}
