import { sendWorkflowExecution } from "@/inngest/utils";
import { raw } from "@prisma/client/runtime/library";
import { timeStamp } from "console";
import { type NextRequest, NextResponse } from "next/server";


// Cuando alguien hace un pago por stripe, este hace una petición POST a este endpoint
// Se extrae el workflowId de la url y el body de la petición POST que contiene los datos del pago
// sendWorkflowExecution envia un evento a inngest y ejecuta un flujo de trabajo correspondiente a un channel "stripe-trigger-execution"



export async function POST(request: NextRequest) {

  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");
    if (!workflowId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Workflow ID is missing" 
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const stripeData = {
      eventId: body.id,
      eventType: body.type,
      timeStamp: body.created,
      livemode: body.livemode,
      raw: body.data?.object
    };
    
    await sendWorkflowExecution({
      workflowId,
      initialData: {
        stripe: stripeData
      }
    })

  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to process Stripe event" 
      },
      { status: 500 }
    );
  }
}