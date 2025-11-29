"use client"


import { Button } from "@/components/ui/button";
import { ExecutionStatus } from "@/generated/prisma/enums";
import { formatDistanceToNow } from "date-fns";
import { ClockIcon, XCircleIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useSuspenseExecution } from "../hooks/use-executions";
import { Workflow } from '../../../generated/prisma/browser';




const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 text-blue-600 animate-spin" />
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-500" />
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-600" />
    default:
      return <ClockIcon className="size-5 text-muted-foreground" />
  }
};

const formatStatus = (status: ExecutionStatus) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
}


export const ExecutionView = ({ executionId } : { executionId: string }) => {

  const { data: execution } = useSuspenseExecution(executionId);

  const [showStackTrace, setShowStackTrace] = useState(false);

  const duration = execution.completedAt
    ? Math.round(
      (new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000,
    )
    : null

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          {getStatusIcon(execution.status)}
          <div>
            <CardTitle>
              {formatStatus(execution.status)}
            </CardTitle>

            <CardDescription>
              Execution for {execution.workflow.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <p className="text-sm font-medium text-muted-foreground">
            Workflow
          </p>

          <Link 
            prefetch
            className="text-sm hover:underline text-primary"
            href={`/workflows/${execution.workflow.id}`}
          >
            {execution.workflow.name}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}