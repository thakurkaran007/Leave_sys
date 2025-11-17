import { auth } from "@/auth";
import { getLeaveReqsById } from "@/data/teachers/user";
import LeaveCard from "../_components/teacher/LeaveCard";


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