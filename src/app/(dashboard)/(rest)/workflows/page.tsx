import { requireAuth } from "@/lib/auth-utils";


const page = async() => {

  await requireAuth();

  return (
    <div>Workflows page</div>
  )
}

export default page