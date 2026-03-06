"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser, getUserProfile } from "@/services/auth";

export default function Header() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Booking baru",
      message: "John Doe membooking pukul 14:00",
      time: "5 menit lalu",
    },
    {
      id: 2,
      title: "Pembayaran dikonfirmasi",
      message: "Pembayaran dari Alex telah dikonfirmasi",
      time: "1 jam lalu",
    },
  ]);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setProfile(data);
    }
  };

  const handleLogout = async () => {
    await logoutUser(); // Gunakan logoutUser
    router.push("/login");
  };

  return (
    <header className="h-16 bg-gradient-to-r from-zinc-900 to-black border-b border-zinc-800/50 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Cari booking, barber, atau pelanggan..."
            className="pl-10 bg-zinc-800/30 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-zinc-400 hover:text-amber-500 hover:bg-zinc-800"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  {notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 bg-zinc-900 border-zinc-800"
          >
            <DropdownMenuLabel className="text-zinc-200">
              Notifikasi
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            {notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className="flex flex-col items-start p-3 cursor-pointer hover:bg-zinc-800"
              >
                <p className="font-medium text-zinc-200">{notif.title}</p>
                <p className="text-sm text-zinc-400">{notif.message}</p>
                <p className="text-xs text-zinc-500 mt-1">{notif.time}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-2 hover:bg-zinc-800"
            >
              <Avatar className="h-8 w-8 border-2 border-zinc-700">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${profile?.name || "Admin"}`}
                />
                <AvatarFallback className="bg-zinc-800 text-amber-500">
                  {profile?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium text-zinc-200">
                  {profile?.name || "Admin"}
                </span>
                <span className="text-xs text-zinc-500">Administrator</span>
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-zinc-900 border-zinc-800"
          >
            <DropdownMenuLabel className="text-zinc-200">
              Akun Saya
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              asChild
              className="cursor-pointer hover:bg-zinc-800 text-zinc-300"
            >
              <Link href="/admin/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer hover:bg-zinc-800 text-zinc-300"
            >
              <Link href="/admin/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Pengaturan</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer hover:bg-red-500/10 text-red-500 focus:text-red-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
