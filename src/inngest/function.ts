
import prisma from "@/lib/db";
import { inngest } from "./client";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";




export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {

    await step.sleep("wait-a-moment", "1s");

    await step.run("create-workflow",() => {
      return prisma.workflow.create({
        data: {
          name: "test-workflow-from-inngest"
        }
      });
    })  
  },
);


const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
})

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    const { steps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        model: google("gemini-2.5-flash"), 
        system: "Your are a helpful assistant.",
        prompt: "What is 2 * 2 / 1.5"
      });
    return steps;
  },
)