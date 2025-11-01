import { requireAuth } from '@/lib/auth-utils';


const page = async() => {

  await requireAuth();

  return (
    <div>Executions page</div>
  )
}

export default page