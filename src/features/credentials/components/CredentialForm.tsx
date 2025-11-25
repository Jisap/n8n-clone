"use client"

import { CredentialType } from "@/generated/prisma/enums";
import { useRouter } from "next/navigation";
import { 
  useCreateCredential, 
  useUpdateCcredentials, 
  useSuspenseCredential 
} from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Image from "next/image";
import Link from "next/link";


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

export const CredentialForm = ({ initialData }: CredentialFormProps) => {

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
  });

  const onSubmit = async (values: FormValues) => {
    if (isEdit && initialData?.id) {                     // Si es una edición
      await updateCredential.mutateAsync({               // Se actualiza las credenciales
        id: initialData?.id,
        ...values
      });
    } else {                                             // En caso contrario, se crea una nueva credencial
      await createCredential.mutateAsync(values,{
        onSuccess: (data) => {
          router.push(`/credentials/${data.id}`);
        },
        onError: (error) => {                            // Si ocurre algún error (FORBIDDEN -> no tiene una suscripción válida)
          handleError(error);                            // Se muestra el modal de actualización para pasar a la versión Pro
          console.error(error);
        }
      });
    }
  }

  return (
    <>
      {modal}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            {isEdit ? "Edit Credential" : "Create Credential"}
          </CardTitle>

          <CardDescription>
            {isEdit ? "Update your API key or credential details" : "Add a new API Key or credential to your account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField 
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="My API Key" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField 
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}  
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {credentialTypeOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value}
                          >
                            <div className="flex items-center gap-2">
                              <Image 
                                src={option.logo} 
                                alt={option.label} 
                                width={16} 
                                height={16}
                              />
                              {option.label}
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
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="sk-...."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={
                    createCredential.isPending || 
                    updateCredential.isPending
                  }
                >
                  {isEdit ? "Update" : "Create"}
                </Button>

                <Button 
                  type="button"
                  variant="outline"
                  asChild
                >
                  <Link href="/credentials" prefetch>
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}

export const CredentialView = ({ credentialId }:{credentialId:string}) => {

  const { data: credential } = useSuspenseCredential(credentialId); // GetOne credential con Suspense

  return (
    <CredentialForm initialData={credential} />
  )
}