import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------
// USERS (Teachers, HOD, Admin)
// ---------------------------------------------
async function createUsers() {
  const teacherData = [
    { email: "t1@example.com", name: "Dr. Rohan S", scheduleType: "MORNING" },
    { email: "t2@example.com", name: "Prof. Meera J", scheduleType: "MID" },
    { email: "t3@example.com", name: "Dr. Kunal N", scheduleType: "EVENING" },
    { email: "t4@example.com", name: "Dr. Anita D", scheduleType: "MORNING" },
    { email: "t5@example.com", name: "Prof. Karthik P", scheduleType: "MID" },
    { email: "t6@example.com", name: "Dr. Neha A", scheduleType: "EVENING" },
  ];

  const teachers: any[] = [];

  for (let t of teacherData) {
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
  }

  const hod = await prisma.user.create({
    data: {
      email: "hod@example.com",
      name: "Dr. Rajesh Patel (HOD)",
      password: await bcrypt.hash("password123", 10),
      teacher_status: "ACTIVE",
      role: "HOD",
      emailVerified: new Date(),
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      password: await bcrypt.hash("password123", 10),
      teacher_status: "ACTIVE",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  return { teachers, hod, admin };
}

// ---------------------------------------------
// SUBJECTS
// ---------------------------------------------
async function createSubjects() {
  const subjectNames = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Computer Science",
    "Data Structures",
    "English Literature",
    "Operating Systems",
    "DBMS",
    "Circuits",
    "Networks",
  ];

  const subjects: any[] = [];

  for (let i = 0; i < subjectNames.length; i++) {
    const sub = await prisma.subject.create({
      data: { name: subjectNames[i], code: `SUB${i + 1}` },
    });

    subjects.push(sub);
  }

  return subjects;
}

// ---------------------------------------------
// TIMESLOTS
// ---------------------------------------------
async function createTimeSlots() {
  const baseDate = new Date("2025-01-01T00:00:00Z");
  const slotData = [
    ["08:00", "09:00", "Period 1"],
    ["09:00", "10:00", "Period 2"],
    ["10:00", "11:00", "Period 3"],
    ["11:00", "12:00", "Period 4"],
    ["12:00", "13:00", "Lunch Break"],
    ["13:00", "14:00", "Period 5"],
    ["14:00", "15:00", "Period 6"],
    ["15:00", "16:00", "Period 7"],
  ];

  const timeSlots: any[] = [];

  for (const [start, end, label] of slotData) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const startTime = new Date(baseDate);
    startTime.setUTCHours(sh, sm, 0, 0);

    const endTime = new Date(baseDate);
    endTime.setUTCHours(eh, em, 0, 0);

    const slot = await prisma.timeSlot.create({
      data: { startTime, endTime, label },
    });

    timeSlots.push(slot);
  }

  return timeSlots;
}

function pickSlots(type: string, slots: any[]) {
  const teaching = slots.filter((s) => !s.label.includes("Lunch"));
  if (type === "MORNING") return teaching.slice(0, 3);
  if (type === "MID") return teaching.slice(2, 5);
  return teaching.slice(4, 7);
}

// ---------------------------------------------
// LECTURES (7 days timetable)
// ---------------------------------------------
async function createLectures(teachers: any[], subjects: any[], slots: any[]) {
  const today = new Date();
  const payload: any[] = [];

  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);

    if (date.getDay() === 0) continue;

    for (const t of teachers) {
      const tSlots = pickSlots(t.scheduleType, slots);

      tSlots.forEach((slot, idx) => {
        payload.push({
          teacherId: t.id,
          subjectId: subjects[(idx + day) % subjects.length].id,
          timeSlotId: slot.id,
          date: new Date(date),
          weekDay: date.getDay(),
          room: `R-${100 + Math.floor(Math.random() * 200)}`,
        });
      });
    }
  }

  await prisma.lecture.createMany({ data: payload });

  return prisma.lecture.findMany();
}

// ---------------------------------------------
// LEAVE + REPLACEMENT SCENARIOS
// ---------------------------------------------
async function createScenarios(teachers: any[], hod: any, admin: any, lectures: any[]) {
  const t1 = teachers[0];
  const t2 = teachers[1];
  const t3 = teachers[2];
  const t4 = teachers[3];

  // Get any available lectures
  const l1 = lectures.find((l) => l.teacherId === t1.id);
  const l2 = lectures.find((l) => l.teacherId === t2.id);
  const l3 = lectures.find((l) => l.teacherId === t3.id);
  const l4 = lectures.find((l) => l.teacherId === t4.id);

  // Scenario 1 — Pending leave + pending offer
  if (l1) {
    await prisma.leaveRequest.create({
      data: {
        requesterId: t1.id,
        lectureId: l1.id,
        reason: "Medical leave",
        status: "PENDING",
      },
    });

    await prisma.replacementOffer.create({
      data: {
        lectureId: l1.id,
        offererId: t2.id,
        accepterId: t1.id,
        status: "PENDING",
        message: "I can take this class.",
      },
    });
  }

  // Scenario 2 — Approved leave (HOD approves) + accepted replacement
  if (l2) {
    await prisma.leaveRequest.create({
      data: {
        requesterId: t2.id,
        lectureId: l2.id,
        reason: "Conference",
        status: "APPROVED",
        approverId: hod.id,
        assignedToId: t3.id,
      },
    });

    await prisma.replacementOffer.create({
      data: {
        lectureId: l2.id,
        offererId: t3.id,
        accepterId: t2.id,
        approverId: hod.id,
        status: "ACCEPTED",
        message: "I'll take this class.",
      },
    });
  }

  // Scenario 3 — Multiple offers pending
  if (l3) {
    await prisma.leaveRequest.create({
      data: {
        requesterId: t3.id,
        lectureId: l3.id,
        reason: "Urgent family matter",
        status: "PENDING",
      },
    });

    await prisma.replacementOffer.createMany({
      data: [
        {
          lectureId: l3.id,
          offererId: t1.id,
          accepterId: t3.id,
          status: "PENDING",
          message: "I am free.",
        },
        {
          lectureId: l3.id,
          offererId: t2.id,
          accepterId: t3.id,
          status: "PENDING",
          message: "Can cover this if needed.",
        },
      ],
    });
  }

  // Scenario 4 — Admin approves a replacement (admin path)
  if (l4) {
    await prisma.leaveRequest.create({
      data: {
        requesterId: t4.id,
        lectureId: l4.id,
        reason: "Workshop",
        status: "APPROVED",
        approverId: admin.id,
        assignedToId: t1.id,
      },
    });

    await prisma.replacementOffer.create({
      data: {
        lectureId: l4.id,
        offererId: t1.id,
        accepterId: t4.id,
        approverId: admin.id,
        status: "ACCEPTED",
        message: "Approved by admin.",
      },
    });
  }

  // Scenario 5 — Signup Requests
  await prisma.signupRequest.createMany({
    data: [
      { email: "new1@example.com", teacherId: t1.id, name: "New User 1" },
      { email: "new2@example.com", teacherId: t2.id, name: "New User 2" },
    ],
  });
}

// ---------------------------------------------
// MAIN
// ---------------------------------------------
async function main() {
  console.log("🔥 Reset Database...");
  await prisma.replacementOffer.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.lecture.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.signupRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.applicationLeave.deleteMany(); // even though not creating any

  console.log("➡ Creating Users...");
  const { teachers, hod, admin } = await createUsers();

  console.log("➡ Creating Subjects...");
  const subjects = await createSubjects();

  console.log("➡ Creating Time Slots...");
  const timeSlots = await createTimeSlots();

  console.log("➡ Creating Lectures...");
  const lectures = await createLectures(teachers, subjects, timeSlots);

  console.log("➡ Creating Leave + Replacement Scenarios...");
  await createScenarios(teachers, hod, admin, lectures);

  console.log("🎉 SEED COMPLETE !");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => prisma.$disconnect());
