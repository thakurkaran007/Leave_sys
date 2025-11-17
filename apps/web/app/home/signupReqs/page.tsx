import { auth } from "@/auth"

const SignupReqs = async () => {
  const session = await auth();

  return <>
      <div>Signup Reqs</div>
  </>
}

export default SignupReqs;