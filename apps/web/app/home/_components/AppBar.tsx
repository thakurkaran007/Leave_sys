import { auth } from "@/auth";
import { AppBarClient } from "./AppBarClient";


export async function AppBar() {
  const session = await auth(); // server-side fetch
  return <AppBarClient session={session} />;
}
