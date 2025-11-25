"use client"

import { CredentialType } from "@/generated/prisma/enums";
import { useRouter } from "next/navigation";
import { useCreateCredential, useUpdateCcredentials } from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"


const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(CredentialType),
  value: z.string().min(1, "API Key is required"),
});

type FormValues = z.infer<typeof formSchema>;

const credentialTypeOptions = [
  { label: "OpenAI", value: CredentialType.OPENAI, logo: "/logos/openai.svg" },
  { label: "Anthropic", value: CredentialType.ANTHROPIC, logo: "/logos/anthropic.svg" },
  { label: "Gemini", value: CredentialType.GEMINI, logo: "/logos/gemini.svg" },  
]

interface CredentialFormProps {
  initialData?: {
    id?: string;
    name: string;
    type: CredentialType;
    value: string;
  }
}

const CredentialForm = ({ initialData }: CredentialFormProps) => {

  const router = useRouter();
  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCcredentials();
  const { handleError, modal} = useUpgradeModal();

  const isEdit = !!initialData?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      type: CredentialType.OPENAI,
      value: ""
    }
  })

  return (
    <div>

    </div>
  )
}

export default CredentialForm