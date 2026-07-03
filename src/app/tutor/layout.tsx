import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TutorNav from "@/components/tutor/TutorNav";
import { Toaster } from "@/components/ui/toaster";

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-col">
      <TutorNav userEmail={user.email ?? ""} />
      <main className="flex-1 px-4 py-5 sm:py-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
