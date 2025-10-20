import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    console.log("🌱 Seeding database...");
    // 🧹 Clean existing data
    await prisma.lecture.deleteMany();
    await prisma.timeSlot.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.user.deleteMany();
    // 👨‍🏫 Create one teacher
    const teacher = await prisma.user.create({
        data: {
            email: "teacher@example.com",
            name: "Mr. Verma",
            password: "password123",
            teacher_status: "ACTIVE",
            role: "TEACHER",
        },
    });
    // 📘 Create Subjects
    await prisma.subject.createMany({
        data: [
            { name: "Mathematics", code: "MATH101" },
            { name: "Physics", code: "PHY102" },
            { name: "Chemistry", code: "CHEM103" },
            { name: "Computer Science", code: "CS104" },
            { name: "English", code: "ENG105" },
        ],
    });
    const allSubjects = await prisma.subject.findMany();
    // ⏰ Create TimeSlots (8 AM - 4 PM hourly)
    const baseDate = new Date("2025-01-01T00:00:00Z");
    const slotData = [
        ["08:00", "09:00"],
        ["09:00", "10:00"],
        ["10:00", "11:00"],
        ["11:00", "12:00"],
        ["13:00", "14:00"],
        ["14:00", "15:00"],
        ["15:00", "16:00"],
    ];
    const timeSlots = await Promise.all(slotData.map(async ([start, end]) => {
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        const startTime = new Date(baseDate);
        startTime.setUTCHours(sh, sm, 0, 0);
        const endTime = new Date(baseDate);
        endTime.setUTCHours(eh, em, 0, 0);
        return prisma.timeSlot.create({
            data: { startTime, endTime, label: `${start}-${end}` },
        });
    }));
    // 🗓️ Create lectures for each weekday (Mon-Sat)
    const weekDays = [1, 2, 3, 4, 5, 6]; // Mon-Sat
    const lecturesData = [];
    for (const day of weekDays) {
        // pick 3 random time slots for that day
        const selectedSlots = getRandomSubset(timeSlots, 3);
        selectedSlots.forEach((slot, i) => {
            const subject = allSubjects[(day + i) % allSubjects.length];
            // Ensure each lecture has a unique date-time (avoid P2002 error)
            const lectureDate = new Date();
            lectureDate.setDate(lectureDate.getDate() + day); // different date per weekday
            lecturesData.push({
                weekDay: day,
                date: lectureDate,
                room: `10${day}`,
                teacherId: teacher.id,
                subjectId: subject.id,
                timeSlotId: slot.id,
            });
        });
    }
    await prisma.lecture.createMany({ data: lecturesData });
    console.log("✅ Seed completed successfully!");
}
// helper: pick n random unique slots
function getRandomSubset(array, n) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}
main()
    .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
