interface PageProps {
  params: Promise<{
    executionId: string;
  }>
}

const page = async({params}: PageProps) => {
  
  const { executionId } = await params;
  
  return (
    <div>ExecutionId page: {executionId}</div>
  )
}

export default page