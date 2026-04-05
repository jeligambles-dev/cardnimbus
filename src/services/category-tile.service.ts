import { db } from "@/lib/db";

export async function getActiveTiles() {
  return db.categoryTile.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });
}

export async function getAllTiles() {
  return db.categoryTile.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getTileById(id: string) {
  return db.categoryTile.findUnique({ where: { id } });
}

interface TileInput {
  label: string;
  imageUrl: string;
  href: string;
  displayOrder?: number;
  isActive?: boolean;
}

export async function createTile(input: TileInput) {
  return db.categoryTile.create({
    data: {
      label: input.label,
      imageUrl: input.imageUrl,
      href: input.href,
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
    },
  });
}

export async function updateTile(id: string, input: Partial<TileInput>) {
  return db.categoryTile.update({ where: { id }, data: input });
}

export async function deleteTile(id: string) {
  return db.categoryTile.delete({ where: { id } });
}
