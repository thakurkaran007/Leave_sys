import { PrismaClient, User, Subject, TimeSlot } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const delay = (ms: number = 50) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------
// USERS
// ---------------------------------------------


interface TeacherSeed {
  email: string;
  name: string;
  scheduleType: "MORNING" | "MID" | "EVENING";
}

async function createUsers() {
  const teacherData: TeacherSeed[] = [
    { email: "t1@example.com", name: "Dr. Rohan S", scheduleType: "MORNING" },
    { email: "t2@example.com", name: "Prof. Meera J", scheduleType: "MID" },
    { email: "t3@example.com", name: "Dr. Kunal N", scheduleType: "EVENING" },
    { email: "t4@example.com", name: "Dr. Anita D", scheduleType: "MORNING" },
    { email: "t5@example.com", name: "Prof. Karthik P", scheduleType: "MID" },
    { email: "t6@example.com", name: "Dr. Neha A", scheduleType: "EVENING" },
  ];

  const teachers: Array<User & { scheduleType: TeacherSeed["scheduleType"] }> = [];

  for (const t of teacherData) {
    const teacher = await prisma.user.create({
      data: {
        email: t.email,
        name: t.name,
        password: await bcrypt.hash("password123", 10),
        teacher_status: "ACTIVE",
        role: "TEACHER",
        emailVerified: new Date(),
      },
    });

    teachers.push({ ...teacher, scheduleType: t.scheduleType });
    await delay(10);
  }

  const hod = await prisma.user.create({
    data: {
      email: "hod@example.com",
      name: "Dr. Rajesh Patel",
      password: await bcrypt.hash("password123", 10),
      role: "HOD",
      teacher_status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      password: await bcrypt.hash("password123", 10),
      role: "ADMIN",
      teacher_status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  return { teachers, hod, admin };
}

// ---------------------------------------------
// SUBJECTS
// ---------------------------------------------


async function createSubjects(): Promise<Subject[]> {
  const subjects = ["Maths", "Physics", "DSA", "OS", "DBMS"];

  return await prisma.$transaction(
    subjects.map((name, i) =>
      prisma.subject.create({
        data: { name, code: `SUB${i + 1}` },
      })
    )
  );
}

// ---------------------------------------------
// TIMESLOTS
// ---------------------------------------------


async function createTimeSlots(): Promise<TimeSlot[]> {
  const baseDate = new Date("2025-01-01T00:00:00Z");

  const slotData = [
    ["08:00", "09:00", "Period 1"],
    ["09:00", "10:00", "Period 2"],
    ["10:00", "11:00", "Period 3"],
    ["11:00", "12:00", "Period 4"],
  ] as const;

  return await prisma.$transaction(
    slotData.map(([start, end, label]) => {
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);

      const startTime = new Date(baseDate);
      startTime.setUTCHours(sh, sm, 0, 0);

      const endTime = new Date(baseDate);
      endTime.setUTCHours(eh, em, 0, 0);

      return prisma.timeSlot.create({
        data: { startTime, endTime, label },
      });
    })
  );
}

// ---------------------------------------------
// PICK SLOTS BASED ON TYPE
// ---------------------------------------------


function pickSlots(
  type: TeacherSeed["scheduleType"],
  slots: TimeSlot[]
): TimeSlot[] {
  if (type === "MORNING") return slots.slice(0, 2);
  if (type === "MID") return slots.slice(1, 3);
  return slots.slice(2, 4);
}

// ---------------------------------------------
// CREATE LECTURES
// ---------------------------------------------


async function createLectures(
  teachers: Array<User & { scheduleType: TeacherSeed["scheduleType"] }>,
  subjects: Subject[],
  slots: TimeSlot[]
) {
  const today = new Date();
  const data: {
    teacherId: string;
    subjectId: string;
    timeSlotId: string;
    date: Date;
    weekDay: number;
    room: string;
  }[] = [];

  for (let day = 0; day < 5; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);

    for (const t of teachers) {
      const tSlots = pickSlots(t.scheduleType, slots);

      tSlots.forEach((slot, idx) => {
        data.push({
          teacherId: t.id,
          subjectId: subjects[(idx + day) % subjects.length].id,
          timeSlotId: slot.id,
          date,
          weekDay: date.getDay(),
          room: `R-${100 + Math.floor(Math.random() * 200)}`,
        });
      });
    }
  }

  await prisma.lecture.createMany({ data });
}

// ---------------------------------------------
// MAIN
// ---------------------------------------------


async function main() {
  console.log("🔄 Resetting...");
  await prisma.lecture.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  console.log("👥 Creating users...");
  const { teachers } = await createUsers();

  console.log("📚 Creating subjects...");
  const subjects = await createSubjects();

  console.log("⏰ Creating timeslots...");
  const slots = await createTimeSlots();

  console.log("📅 Creating lectures...");
  await createLectures(teachers, subjects, slots);

  console.log("🎉 Done! Only Users + Lectures seeded.");
}

main()
  .catch((err) => console.error(err))
  .finally(() => prisma.$disconnect());
