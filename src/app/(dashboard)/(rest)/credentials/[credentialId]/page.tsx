

interface PageProps {
  params: Promise<{
    credentialId: string;
  }>
}

const page = async({params}: PageProps) => {

  const { credentialId } = await params;

  return (
    <div>CredentialId page: {credentialId}</div>
  )
}

export default page