import { requireAuth } from '@/lib/auth-utils';
import React from 'react'

const page = async() => {

  await requireAuth();

  return (
    <div>Credentials page</div>
  )
}

export default page