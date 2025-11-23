"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { AVAILABLE_MODELS, OpenAiDialog, OpenAiFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchOpenAitRealtimeToken } from "./actions";
import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openai";


type OpenAiNodeData = {
  variableName?: string;
  //model?: "gemini-1.5-flash" | "gemini-1.5flash-8b" | "gemini-1.5-pro" | "gemini-1.0-pro" | "gemini-pro";
  //model?: typeof AVAILABLE_MODELS[number];
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
}

type OpenAiNodeType = Node<OpenAiNodeData>;

export const OpenAiNode = memo((props: NodeProps<OpenAiNodeType>) => {

  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow(); 

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: OPENAI_CHANNEL_NAME, //httpRequestChannel().name
    topic: "status",
    refreshToken: fetchOpenAitRealtimeToken
  })

  const handleOpenSettings = () => {
    setDialogOpen(true);
  }

  const handleSubmit = (values: OpenAiFormValues) => {
    setNodes((nodes) => nodes.map((node) => {
      if(node.id === props.id) {
        return {
          ...node,
          data: {
            ...node.data,
            ...values
          }
        }
      }
      return node;
    }))
  }

  const nodeData = props.data; 
  const description = nodeData?.userPrompt
    ? `${nodeData.model || AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(0, 50)}...`
    : "Not configured"


  return (
    <>
      <OpenAiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />

      <BaseExecutionNode 
        {...props}
        id={props.id}
        icon="/logos/opnenai.svg"
        name="OpenAI"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

OpenAiNode.displayName = "OpenAiNode";