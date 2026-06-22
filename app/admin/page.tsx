import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export default async function AdminIndexPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  redirect(user ? "/admin/overview" : "/admin/login")
}
