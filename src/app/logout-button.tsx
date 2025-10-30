"use client"

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut(
      {},
      {
      onSuccess: () => {
        router.push("/login");
      },
      onError: (ctx) => {
        toast.error(ctx.error.message);
      }
    })
  }

  return <Button onClick={handleLogout}>Logout</Button>
}