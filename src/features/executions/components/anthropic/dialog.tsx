"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import z from "zod"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect, use } from 'react';
import Image from "next/image"
import { CredentialType } from "@/generated/prisma/enums"
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials"


// Si se quieren obtener los modelos disponibles:
// Obten de forma gratuita tu API Key de pruebas en groq.com

export const AVAILABLE_MODELS = [
  "openai/gpt-oss-20b",    // Modelo de código abierto de OpenAI servido por Groq
  "openai/gpt-oss-120b",   // Modelo más grande de código abierto
  "llama-3.3-70b-versatile", // Modelo Llama servido por Groq
  "llama-3.1-8b-instant",  // Modelo Llama rápido
  "mixtral-8x7b-32768",    // Modelo Mixtral servido por Groq
  "gpt-4o",                // Modelo OpenAI (requiere API key de OpenAI)
  "gpt-4o-mini",           // Modelo OpenAI (requiere API key de OpenAI)
  "qwen/qwen3-32b",        // Modelo Qwen servido por Groq
  "moonshotai/kimi-k2-instruct-0905",  // Modelo Kimi servido por Groq

] as const;

const formSchema = z.object({
  variableName: z 
    .string()
    .min(1, "Variable name is required")
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message: "Variable name must start with a letter or underscore and container only letters, numbers, and underscores"
    }),
  credentialId: z.string().min(1, "Credential is required"),
  model: z.string().min(1, "Model is required"),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
})

export type AnthropicFormValues =  z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: z.infer<typeof formSchema>) => void
  defaultValues?: Partial<AnthropicFormValues>
}

export const AnthropicDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues={}
}: Props) => {

  const {
    data: credentials,
    isLoading: isLoadingCredentials,
  } = useCredentialsByType(CredentialType.ANTHROPIC);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:{
      variableName: defaultValues.variableName || "",
      credentialId: defaultValues.credentialId || "",
      model: defaultValues.model || AVAILABLE_MODELS[0],
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
    }
  });

  useEffect(() => {
    if (open){
      form.reset({
        variableName: defaultValues.variableName || "",
        credentialId: defaultValues.credentialId || "",
        model: defaultValues.model || AVAILABLE_MODELS[0],
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",
      })
    }
  },[open, defaultValues, form])

  const watchVariableName = form.watch("variableName") || "My OpenAI Call";  // Permite obtener el valor del campo "variableName" en el formulario

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    {
      onSubmit(values);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anthropic AI Configuration</DialogTitle>
            <DialogDescription> 
            Configure the AI model and prompts for this node.
          </DialogDescription>
        </DialogHeader>      

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 mt-4"
          >

            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      placeholder="myOpenAICall"
                    />
                  </FormControl>

                  <FormDescription>
                    Use this name to reference the result in other nodes:{" "}
                    {`{{${watchVariableName}.text}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anthropic Credential</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingCredentials || !credentials?.length}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a credential" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {credentials?.map((credential) => (
                        <SelectItem
                          key={credential.id}
                          value={credential.id}
                        >
                          <div className="flex items-center gap-2">
                            <Image
                              src="/logos/anthropic.svg"
                              alt="Anthropic"
                              width={16}
                              height={16}
                            />
                            {credential.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>

                 <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                 >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {AVAILABLE_MODELS.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                 </Select>

                  <FormDescription>
                    The Anthropic model to use for completion
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField 
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt (optional)</FormLabel>

                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="You are a helpful assistant."
                      className="min-h-[80px] font-mono text-sm"
                    />
                  </FormControl>

                  <FormDescription>
                    Sets the behavior of the assistant. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects	
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField 
              control={form.control}
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Prompt</FormLabel>

                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Sumarize the following text: {{json httpResponse.data}}"
                      className="min-h-[120px] font-mono text-sm"
                    />
                  </FormControl>

                  <FormDescription>
                    The prompt to send to the AI. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects	
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>

      </DialogContent>
    </Dialog>
  )
}