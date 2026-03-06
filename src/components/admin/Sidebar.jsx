"use client";

import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/services/auth";
import { toast } from "sonner";
import Swal from "sweetalert2";

// Icons
import { Scissors, Home, Settings, LogOut, X } from "lucide-react";

export default function Sidebar({ user, isOpen, onClose }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Keluar?",
      text: "Apakah Anda yakin ingin keluar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d97706",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      background: "#1f1f1f",
      color: "#fff",
      customClass: {
        popup: "rounded-xl border border-zinc-700",
        confirmButton:
          "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 font-semibold py-2 px-4 rounded-lg",
        cancelButton:
          "bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-2 px-4 rounded-lg",
      },
    });

    if (result.isConfirmed) {
      const { error } = await logoutUser();

      if (!error) {
        toast.success("Berhasil keluar", {
          description: "Sampai jumpa kembali!",
          duration: 2000,
          position: "top-center",
          className: "bg-green-500/20 border border-green-500/30 text-white",
        });
        router.push("/login");
      } else {
        toast.error("Gagal keluar", {
          description: error.message || "Terjadi kesalahan",
          duration: 3000,
          position: "top-center",
          className: "bg-red-500/20 border border-red-500/30 text-white",
        });
      }
    }
  };

  const handleNavigation = (path) => {
    router.push(path);
    onClose();
  };

  const isActive = (path) => {
    return pathname === path;
  };

  // Ambil nama dari user metadata atau email
  const displayName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const avatarSeed = user?.user_metadata?.name || user?.email || "User";

  return (
    <>
      {/* Overlay untuk mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800 z-50 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 space-y-6">
          {/* Tombol Close untuk mobile */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 lg:hidden text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3 pb-6 border-b border-zinc-800">
            <div className="p-3 bg-gradient-to-br from-amber-600/20 to-amber-500/10 rounded-xl">
              <Scissors className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent">
                THE BARBER
              </h1>
              <p className="text-xs text-zinc-500">Customer Dashboard</p>
            </div>
          </div>

          {/* Menu */}
          <nav className="space-y-2">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3",
                isActive("/admin")
                  ? "text-amber-500 bg-amber-500/10"
                  : "text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10",
              )}
              onClick={() => handleNavigation("/admin")}
            >
              <Home className="h-5 w-5" />
              Home
            </Button>

            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3",
                isActive("/customer/settings")
                  ? "text-amber-500 bg-amber-500/10"
                  : "text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10",
              )}
              onClick={() => handleNavigation("/admin/settings")}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Button>
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-6 left-6 right-6">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="h-5 w-5" />
              Keluar
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
