"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Calendar, Clock, LogOut, User, Loader2 } from "lucide-react";

export default function CustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Customer");

  useEffect(() => {
    // Simulasi ambil data user (nanti bisa dari API)
    setTimeout(() => {
      setUserName("Deka");
      setLoading(false);
    }, 800);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-3">
          <Scissors className="text-amber-500" />
          <h1 className="text-xl font-bold text-amber-500">THE BARBER</h1>
        </div>

        <Button
          variant="ghost"
          className="text-red-500 hover:bg-red-500/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8 max-w-5xl mx-auto">
        {/* Greeting */}
        <div>
          <h2 className="text-3xl font-bold">
            Halo, <span className="text-amber-500">{userName}</span> 👋
          </h2>
          <p className="text-zinc-400 mt-2">
            Siap tampil fresh hari ini? Booking sekarang!
          </p>
        </div>

        {/* Quick Action */}
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-amber-500 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Baru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400 mb-4">
              Pilih barber dan jadwal yang tersedia.
            </p>
            <Button
              onClick={() => router.push("/booking")}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400"
            >
              Booking Sekarang
            </Button>
          </CardContent>
        </Card>

        {/* Riwayat Booking */}
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-amber-500 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Riwayat Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Example booking item */}
              <div className="p-4 bg-zinc-800 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold">Haircut Premium</p>
                  <p className="text-sm text-zinc-400">
                    20 Februari 2026 - 14:00
                  </p>
                </div>
                <span className="px-3 py-1 text-sm rounded-full bg-green-500/20 text-green-400">
                  Selesai
                </span>
              </div>

              <div className="p-4 bg-zinc-800 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold">Haircut + Styling</p>
                  <p className="text-sm text-zinc-400">5 Maret 2026 - 16:00</p>
                </div>
                <span className="px-3 py-1 text-sm rounded-full bg-yellow-500/20 text-yellow-400">
                  Menunggu
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
