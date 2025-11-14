import { NodeProps } from "@xyflow/react";
import { MousePointerIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { ManualTriggerDialog } from "./dialog";


export const ManualTriggerNode = memo(
  (props: NodeProps) => {

    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpenSettings = () => {
      setDialogOpen(true);
    }

    return (
      <>
        <ManualTriggerDialog 
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
        
        <BaseTriggerNode 
          {...props}
          icon={MousePointerIcon}
          name="When clicking 'Execute workflow'"
          //status={NodeStatus}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    )
  }
)