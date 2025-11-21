import { sendWorkflowExecution } from "@/inngest/utils";
import { type NextRequest, NextResponse } from "next/server";


// Cuando alguien envía el Google Form el script de Google Apps Script hace una petición POST a este endpoint
// Se extrae el workflowId de la url y el body de la petición POST que contiene los datos del formulario
// sendWorkflowExecution envia un evento a inngest y ejecuta un flujo de trabajo correspondiente a un channel "google-form-trigger-execution"



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

    const formData = {
      formId: body.formId,
      formTitle: body.formTitle,
      responseId: body.responseId,
      timestamp: body.timestamp,
      respondentEmail: body.respondentEmail,
      responses: body.responses,
      raw: body
    };
    
    await sendWorkflowExecution({
      workflowId,
      initialData: {
        googleForm: formData
      }
    })

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )

  } catch (error) {
    console.error("Google form webhook error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to process Google Form Submision" 
      },
      { status: 500 }
    );
  }
}