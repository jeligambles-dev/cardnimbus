import { getActiveSlides } from "@/services/hero-slide.service";
import { HeroCarousel } from "./hero-carousel";

export async function HeroCarouselWrapper() {
  const slides = await getActiveSlides();
  return <HeroCarousel slides={slides} />;
}
