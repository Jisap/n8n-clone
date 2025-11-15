

import { inngest } from "./client";





export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflow/execute.workflow" },
  async ({ event, step }) => {
    await step.sleep("test", "5s") 
  },
)