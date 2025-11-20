import { auth } from "@/auth";
import { getReplacementsById, getReplacementsOffered } from "@/data/teachers/user";
import { ReplacementCard } from "../_components/teacher/ReplacementCard";
import { BookOpen } from "lucide-react";


const ReplacementPage = async () => {
    const session = await auth();
    const replacements = await getReplacementsById(session?.user.id!);
    
      return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Replacement Offers</h1>
        <p className="text-gray-600 mt-2">Track and manage your replacement lecture offers</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {replacements.map((replacement) => (
          <ReplacementCard key={replacement.id} replacement={replacement} />
        ))}
      </div>

      {replacements.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No Replacement Offers</h3>
          <p className="text-gray-500 mt-2">You haven't made any replacement offers yet</p>
        </div>
      )}
    </div>

    );
};

export default ReplacementPage;