"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getUserRole } from "@/services/auth";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale/id";
import Sidebar from "@/components/customer/sidebar";

export default function CustomerLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const role = await getUserRole();

      if (role !== "pelanggan") {
        router.push("/admin");
        return;
      }

      setUser(user);
    } catch (error) {
      console.error("Error checking user:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-stone-900 to-zinc-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-zinc-400 animate-pulse">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-stone-900 to-zinc-900 text-white">
      <Toaster
        position="top-center"
        richColors
        closeButton
        theme="dark"
        toastOptions={{
          style: {
            background: "transparent",
            border: "none",
            color: "#fff",
          },
          className: "border rounded-xl backdrop-blur-xl",
        }}
      />

      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="lg:ml-72 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-zinc-400 hover:text-amber-500"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold">Dashboard Customer</h2>
                <p className="text-sm text-zinc-500">
                  {format(new Date(), "EEEE, dd MMMM yyyy", {
                    locale: localeId,
                  })}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
