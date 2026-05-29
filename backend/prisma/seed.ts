import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@blogspace.dev" },
    update: {},
    create: {
      email: "admin@blogspace.dev",
      username: "admin",
      password: adminPassword,
      name: "Admin User",
      role: Role.ADMIN,
    },
  });

  // Create author user
  const authorPassword = await bcrypt.hash("author123456", 12);
  const author = await prisma.user.upsert({
    where: { email: "author@blogspace.dev" },
    update: {},
    create: {
      email: "author@blogspace.dev",
      username: "janewriter",
      password: authorPassword,
      name: "Jane Writer",
      role: Role.AUTHOR,
    },
  });

  // Create sample posts
  const posts = [
    {
      title: "Getting Started with BlogSpace",
      slug: "getting-started-with-blogspace",
      content: `<h2>Welcome to BlogSpace!</h2><p>BlogSpace is a modern multi-user blogging platform built with React, Node.js, and PostgreSQL. This guide will help you get started.</p><h3>Features</h3><ul><li>Rich text editing with React Quill</li><li>Markdown support</li><li>Dark mode</li><li>Role-based access control</li><li>Comments and reactions</li></ul><p>Start by creating an account and exploring the platform!</p>`,
      excerpt: "A quick guide to getting started with BlogSpace, the modern blogging platform.",
      published: true,
      authorId: admin.id,
    },
    {
      title: "The Art of Writing Compelling Blog Posts",
      slug: "art-of-writing-compelling-blog-posts",
      content: `<h2>Writing That Connects</h2><p>Great blog posts don't just inform — they connect with readers on a deeper level. Here are the key principles to keep in mind.</p><h3>1. Start with a Hook</h3><p>Your opening sentence is everything. Make it count. Ask a question, share a surprising fact, or tell a micro-story.</p><h3>2. Know Your Audience</h3><p>Write for a specific person, not everyone. The more targeted your writing, the more it resonates.</p><h3>3. Use Short Paragraphs</h3><p>Online readers scan. Break up your text. Make it easy to consume.</p>`,
      excerpt: "Learn the key principles behind writing blog posts that truly connect with your audience.",
      published: true,
      authorId: author.id,
    },
    {
      title: "Why TypeScript is a Game Changer",
      slug: "why-typescript-is-a-game-changer",
      content: `<h2>TypeScript in 2024</h2><p>TypeScript has transformed how we write JavaScript applications. Here's why you should be using it.</p><h3>Type Safety</h3><p>Catch bugs at compile time, not runtime. TypeScript's type system helps you write more reliable code.</p><h3>Better DX</h3><p>Autocomplete, refactoring, and inline documentation make development faster and more enjoyable.</p><blockquote>TypeScript is not just a type checker — it's a productivity multiplier.</blockquote>`,
      excerpt: "Discover why TypeScript has become the go-to choice for modern web development.",
      published: true,
      authorId: author.id,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }

  console.log("✅ Seed complete!");
  console.log("   Admin: admin@blogspace.dev / admin123456");
  console.log("   Author: author@blogspace.dev / author123456");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
