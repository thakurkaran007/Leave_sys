import { auth } from "@/auth"
import { db } from "@repo/db/src"
import WeeklyTimetable from "../_components/calender/TimeTable";

const Calender = async () => {
  const session = await auth();
  const lecture = await db.lecture.findMany({
    where: {
      teacherId: session?.user?.id
    },
    include: {
      subject: true,
      teacher: true,
      timeSlot: true
    },
    orderBy: [
      { weekDay: 'asc' },
      { timeSlot: { startTime: 'asc' } }
    ]
  });
  return <>
      <WeeklyTimetable sampleLectures={lecture}/>  
  </>
}

export default Calender;