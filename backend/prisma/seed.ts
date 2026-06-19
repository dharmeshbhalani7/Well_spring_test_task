import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PROGRAM_TITLES = [
  "30-Day Sleep Reset",
  "Beginner Yoga Foundations",
  "Mindful Morning Routine",
];

const INSTRUCTORS = [
  "Dr. Sarah Chen",
  "Marcus Rivera",
  "Elena Volkov",
  "James Okonkwo",
];

const TAG_POOL = [
  "sleep",
  "relaxation",
  "yoga",
  "beginner",
  "mindfulness",
  "breathing",
  "stretching",
  "meditation",
  "morning",
  "wellness",
];

const SESSION_TEMPLATES = [
  { title: "Introduction & Overview", duration: 600 },
  { title: "Breathing Fundamentals", duration: 900 },
  { title: "Body Scan Practice", duration: 1200 },
  { title: "Gentle Movement Flow", duration: 1500 },
  { title: "Deep Relaxation", duration: 1800 },
  { title: "Guided Meditation", duration: 1200 },
  { title: "Evening Wind-Down", duration: 900 },
  { title: "Progress Check-In", duration: 600 },
  { title: "Advanced Techniques", duration: 1500 },
  { title: "Integration & Next Steps", duration: 1200 },
];

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.importRow.deleteMany();
  await prisma.importJob.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.program.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.creator.deleteMany();

  const creators = await Promise.all([
    prisma.creator.create({
      data: {
        email: "creator1@demo.com",
        passwordHash,
        displayName: "Wellness Studio One",
      },
    }),
    prisma.creator.create({
      data: {
        email: "creator2@demo.com",
        passwordHash,
        displayName: "Harmony Health Co",
      },
    }),
  ]);

  for (const creator of creators) {
    for (let p = 0; p < PROGRAM_TITLES.length; p++) {
      const program = await prisma.program.create({
        data: {
          tenantId: creator.id,
          title: `${PROGRAM_TITLES[p]} — ${creator.displayName}`,
          description: `A comprehensive ${PROGRAM_TITLES[p].toLowerCase()} program.`,
        },
      });

      for (let s = 0; s < SESSION_TEMPLATES.length; s++) {
        const template = SESSION_TEMPLATES[s];
        const isVideo = s % 2 === 0;
        const mediaType = isVideo ? "video" : "audio";
        const ext = isVideo ? "mp4" : "mp3";

        await prisma.session.create({
          data: {
            tenantId: creator.id,
            programId: program.id,
            position: s + 1,
            title: template.title,
            durationSeconds: template.duration,
            instructorName: INSTRUCTORS[s % INSTRUCTORS.length],
            tags: [
              TAG_POOL[s % TAG_POOL.length],
              TAG_POOL[(s + 3) % TAG_POOL.length],
            ],
            mediaUrl: `https://cdn.example.com/${creator.id}/${program.id}/session-${s + 1}.${ext}`,
          },
        });

        if (s === 0) {
          await prisma.auditLog.create({
            data: {
              tenantId: creator.id,
              actorId: creator.id,
              action: "CREATE",
              entityType: "program",
              entityId: program.id,
              metadata: { title: program.title, seeded: true },
            },
          });
        }
      }
    }
  }

  console.log("Seed completed:");
  console.log(`  - ${creators.length} creators`);
  console.log(`  - ${creators.length * PROGRAM_TITLES.length} programs`);
  console.log(
    `  - ${creators.length * PROGRAM_TITLES.length * SESSION_TEMPLATES.length} sessions`,
  );
  console.log("  Login: creator1@demo.com / password123");
  console.log("  Login: creator2@demo.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
