import { auth } from "@/auth"

const ReplacementsReqs = async () => {
  const session = await auth();

  return <>
      <div>Replacement Requests for {session?.user?.role}</div>
  </>
}

export default ReplacementsReqs;