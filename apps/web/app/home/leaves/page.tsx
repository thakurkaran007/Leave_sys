import { auth } from "@/auth";
import { getLeaveReqsById } from "@/data/teachers/user";
import LeaveCard from "../_components/teacher/LeaveCard";

const leaves = [
  // Scenario 1: Newly created leave (no approver yet)
  {
    id: "leave_001",
    reason: "Family emergency - Need to travel out of town urgently",
    status: "PENDING",
    createdAt: new Date("2024-11-15T08:30:00"),
    updatedAt: new Date("2024-11-15T08:30:00"),
    lecture: {
      date: new Date("2024-11-18T14:00:00"),
      weekDay: 1,
      room: "A-101",
      subject: {
        name: "Operating Systems",
        code: "CS401"
      },
      timeSlot: {
        label: "2:00 PM - 3:00 PM",
        startTime: new Date("2024-11-18T14:00:00"),
        endTime: new Date("2024-11-18T15:00:00")
      }
    },
    requester: {
      name: "Dr. Sarah Johnson",
      email: "sarah.j@university.edu",
      image: null
    },
    approver: null, // No approver yet - Stage 1
    assignedTo: {
      name: "Dr. Robert Martinez",
      email: "robert.m@university.edu",
      image: null
    }
  },
  
  // Scenario 2: HOD approved, waiting for Admin
  {
    id: "leave_002",
    reason: "Medical appointment - Annual health checkup",
    status: "PENDING",
    createdAt: new Date("2024-11-10T09:00:00"),
    updatedAt: new Date("2024-11-14T14:30:00"),
    lecture: {
      date: new Date("2024-11-20T10:00:00"),
      weekDay: 3,
      room: "B-204",
      subject: {
        name: "Data Structures",
        code: "CS301"
      },
      timeSlot: {
        label: "10:00 AM - 11:00 AM",
        startTime: new Date("2024-11-20T10:00:00"),
        endTime: new Date("2024-11-20T11:00:00")
      }
    },
    requester: {
      name: "Dr. Sarah Johnson",
      email: "sarah.j@university.edu",
      image: null
    },
    approver: {
      name: "Prof. Michael Chen",
      email: "michael.c@university.edu",
      role: "HOD"
    },
    assignedTo: {
      name: "Dr. Emily Rodriguez",
      email: "emily.r@university.edu",
      image: null
    }
  },
  
  // Scenario 3: Fully approved by Admin
  {
    id: "leave_003",
    reason: "Conference attendance - International AI Symposium in Singapore",
    status: "APPROVED",
    createdAt: new Date("2024-11-05T10:15:00"),
    updatedAt: new Date("2024-11-13T16:45:00"),
    lecture: {
      date: new Date("2024-11-22T09:00:00"),
      weekDay: 5,
      room: "C-305",
      subject: {
        name: "Machine Learning",
        code: "CS502"
      },
      timeSlot: {
        label: "9:00 AM - 10:00 AM",
        startTime: new Date("2024-11-22T09:00:00"),
        endTime: new Date("2024-11-22T10:00:00")
      }
    },
    requester: {
      name: "Dr. Sarah Johnson",
      email: "sarah.j@university.edu",
      image: null
    },
    approver: {
      name: "Dr. Amanda Williams",
      email: "amanda.w@university.edu",
      role: "ADMIN"
    },
    assignedTo: {
      name: "Dr. James Thompson",
      email: "james.t@university.edu",
      image: null
    }
  }
];


const LeavePage = async () => {
    const session = await auth();
    const leaves = await getLeaveReqsById(session?.user.id!)
    console.log("Leaves fetched for user:", leaves);
    return (
  <div className="p-6 space-y-4">
    {leaves.map(leave => (
      <LeaveCard key={leave.id} leave={leave} />
    ))}
  </div>
);
};

export default LeavePage;