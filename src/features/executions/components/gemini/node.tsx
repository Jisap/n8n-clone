"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { GeminiDialog, GeminiFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchHttpRequestRealtimeToken } from "./actions";
import { HTTP_REQUEST_CHANNEL_NAME } from "@/inngest/channels/http-request";

type GeminiNodeData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
}

type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => {

  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow(); 

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: HTTP_REQUEST_CHANNEL_NAME, //httpRequestChannel().name
    topic: "status",
    refreshToken: fetchHttpRequestRealtimeToken
  })

  const handleOpenSettings = () => {
    setDialogOpen(true);
  }

  const handleSubmit = (values: GeminiFormValues) => {
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
  const description = nodeData?.endpoint
    ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
    : "Not configured"


  return (
    <>
      <GeminiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />

      <BaseExecutionNode 
        {...props}
        id={props.id}
        icon="/logos/gemini.svg"
        name="Gemini"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

GeminiNode.displayName = "GeminiNode";