interface PageProps {
  params: Promise<{
    workflowId: string;
  }>
}

const page = async ({ params }: PageProps) => {

  const { workflowId } = await params;

  return (
    <div>WorkflowlId page: {workflowId}</div>
  )
}

export default page