import { db } from "@/lib/db";

export async function getActiveSlides() {
  return db.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });
}

export async function getAllSlides() {
  return db.heroSlide.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getSlideById(id: string) {
  return db.heroSlide.findUnique({ where: { id } });
}

interface SlideInput {
  title: string;
  subtitle?: string;
  imageUrl: string;
  buttonLabel: string;
  buttonLink: string;
  displayOrder?: number;
  isActive?: boolean;
}

export async function createSlide(input: SlideInput) {
  return db.heroSlide.create({
    data: {
      title: input.title,
      subtitle: input.subtitle,
      imageUrl: input.imageUrl,
      buttonLabel: input.buttonLabel,
      buttonLink: input.buttonLink,
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
    },
  });
}

export async function updateSlide(id: string, input: Partial<SlideInput>) {
  return db.heroSlide.update({ where: { id }, data: input });
}

export async function deleteSlide(id: string) {
  return db.heroSlide.delete({ where: { id } });
}
