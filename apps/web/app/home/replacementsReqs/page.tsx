import { auth } from "@/auth"
import { db } from "@repo/db/src";
import ReplacementRequestCard from "./_components/card";

const ReplacementsReqs = async () => {
  const session = await auth();
  if (!session || session.user.role !== 'HOD') return <>X</>;

  const replacements = await db.replacementOffer.findMany({
    where: {
      status: 'ACCEPTED',
      approverId: null,
      leaveId: null
    },
    include: {
      offerer: true,
      accepter: true,
      lecture: {
        include: {
          timeSlot: true,
          subject: true,
        }
      }
    }
  });

  return (
    <div className="p-6">
      {replacements.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 opacity-70">
          <div className="text-xl font-semibold text-gray-700">
            No Replacement Requests Available
          </div>
          <p className="text-gray-500 mt-1">You’ll see requests here once teachers send them.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {replacements.map((offer) => (
            <ReplacementRequestCard
              key={offer.id}
              offer={offer}
              userRole={session.user.role}
              userId={session?.user?.id || ""}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplacementsReqs;
