"use server";

import { db } from "@repo/db/src/index";
import bcrypt from "bcryptjs";
import { SignUpSchema } from "@/schema";
import * as z from "zod";

const signup = async (values: z.infer<typeof SignUpSchema>) => {
  const validation = SignUpSchema.safeParse(values);
  if (!validation.success) {
    return { error: "Invalid input" };
  }

  const { email, password1, password2, name } = validation.data;

  if (password1 !== password2) {
    return { error: "Passwords do not match" };
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email already registered" };
  }

  try {
    const hashedPassword = await bcrypt.hash(password1, 10);

    // Get all available time slots and subjects
    const timeSlots = await db.timeSlot.findMany({
      where: {
        // Exclude lunch break or any non-teaching slots
        label: {
          notIn: ["Lunch Break", "Break"],
        },
      },
      orderBy: { startTime: "asc" },
    });

    const subjects = await db.subject.findMany();

    if (timeSlots.length === 0 || subjects.length === 0) {
      return {
        error: "System not initialized. Please contact administrator.",
      };
    }

    // Create user and lectures in a transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Create the user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          teacher_status: "PENDING", // Will be activated by admin/HOD
          role: "TEACHER",
        },
      });

      // 2. Generate lecture schedule for the new teacher
      // Create lectures for the next 4 weeks (28 days)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lecturesData: any[] = [];

      for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + dayOffset);

        const weekDay = currentDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

        // Skip Sundays
        if (weekDay === 0) continue;

        // Assign 3-4 random lectures per day for the new teacher
        const lecturesPerDay = Math.floor(Math.random() * 2) + 3; // 3 or 4 lectures
        const selectedSlots = getRandomUniqueItems(timeSlots, lecturesPerDay);

        selectedSlots.forEach((slot, index) => {
          // Assign subjects in rotation
          const subject = subjects[(dayOffset + index) % subjects.length];

          // Generate room number based on teacher's first letter and random number
          const roomPrefix = name?.charAt(0).toUpperCase() || "T";
          const roomNumber = 100 + (dayOffset * 10 + index) % 500;

          lecturesData.push({
            weekDay,
            date: new Date(currentDate),
            room: `${roomPrefix}${roomNumber}`,
            teacherId: user.id,
            subjectId: subject.id,
            timeSlotId: slot.id,
          });
        });
      }

      // 3. Create all lectures
      await tx.lecture.createMany({
        data: lecturesData,
      });

      return {
        user,
        lecturesCount: lecturesData.length,
      };
    });

    return {
      success: `Account created successfully! ${result.lecturesCount} lectures scheduled. Your account is pending approval.`,
    };
  } catch (error) {
    console.error("Signup error:", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return { error: "Email already registered" };
      }
    }

    return {
      error: "Failed to create account. Please try again later.",
    };
  }
};

/**
 * Helper function to get random unique items from an array
 */
function getRandomUniqueItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

export default signup;