import { prisma } from "../lib/prisma";

export async function generateUniqueSlug(title: string): Promise<string> {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

  let slug = base;
  let count = 0;

  while (await prisma.post.findUnique({ where: { slug } })) {
    count++;
    slug = `${base}-${count}`;
  }

  return slug;
}
