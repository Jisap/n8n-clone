import { NodeProps } from "@xyflow/react";
import { MousePointerIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { GoogleFormTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { MANUAL_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/manual-trigger";
import { fetchManualTriggerRealtimeToken } from "./actions";



export const GoogleFormTrigger = memo(
  (props: NodeProps) => {

    const nodeStatus = "initial";

    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpenSettings = () => {
      setDialogOpen(true);
    }

    return (
      <>
        <GoogleFormTriggerDialog 
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
        
        <BaseTriggerNode 
          {...props}
          icon="/logos/googleform.svg"
          name="Google Form"
          description="When form is submitted'"
          status={nodeStatus}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    )
  }
)