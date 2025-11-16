
import { auth } from "@/auth";
import { getReplacementsOffered } from "@/data/teachers/user";
import { Card, CardContent } from "@repo/ui/card";
import ReplacementOfferCard from "../_components/teacher/OfferCard";

const ReplacementPage = async () => {
  const session = await auth();
  const replacementsOffered = await getReplacementsOffered(session?.user.id!);

  if (!replacementsOffered || replacementsOffered.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Replacement Offers</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No replacement offers at the moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Replacement Offers</h1>
        <p className="text-muted-foreground mt-2">Review and respond to lecture replacement requests</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {replacementsOffered.map((offer) => (
          <ReplacementOfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
};


export default ReplacementPage;