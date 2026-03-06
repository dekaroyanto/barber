"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Lock, Save } from "lucide-react";
import Swal from "sweetalert2";
import { getUserProfile, updateUserProfile } from "@/services/auth";

export default function AdminSettingsPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    no_telp: "",
  });

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Ambil data dari tabel profiles menggunakan service
        const { data, error } = await getUserProfile(user.id);

        if (error) throw error;

        setProfile(data);
        setFormData({
          name: data?.name || "",
          email: user.email || "",
          no_telp: data?.no_telp || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Gagal memuat data profil", {
        description: error.message,
        duration: 3000,
        position: "top-center",
        className: "bg-red-500/20 border border-red-500/30 text-white",
      });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update di tabel profiles menggunakan service
      const { data, error } = await updateUserProfile(user.id, {
        name: formData.name,
        no_telp: formData.no_telp,
      });

      if (error) throw error;

      // Update juga di auth metadata (opsional)
      await supabase.auth.updateUser({
        data: {
          name: formData.name,
          phone: formData.no_telp,
        },
      });

      toast.success("Profil berhasil diperbarui", {
        description: "Data profil Anda telah disimpan",
        duration: 3000,
        position: "top-center",
        className: "bg-green-500/20 border border-green-500/30 text-white",
      });

      // Refresh data
      setProfile(data);
    } catch (error) {
      toast.error("Gagal memperbarui profil", {
        description: error.message,
        duration: 3000,
        position: "top-center",
        className: "bg-red-500/20 border border-red-500/30 text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (newPassword !== confirmPassword) {
      toast.error("Password tidak cocok", {
        description: "Password baru dan konfirmasi password harus sama",
        duration: 3000,
        position: "top-center",
        className: "bg-red-500/20 border border-red-500/30 text-white",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      await Swal.fire({
        icon: "success",
        title: "Password Berhasil Diubah!",
        text: "Silakan login kembali dengan password baru Anda",
        background: "#1f1f1f",
        color: "#fff",
        confirmButtonColor: "#d97706",
        confirmButtonText: "OK",
        customClass: {
          popup: "rounded-xl border border-zinc-700",
          confirmButton:
            "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 font-semibold py-2 px-4 rounded-lg",
        },
      });

      e.target.reset();
    } catch (error) {
      toast.error("Gagal memperbarui password", {
        description: error.message,
        duration: 3000,
        position: "top-center",
        className: "bg-red-500/20 border border-red-500/30 text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-zinc-400 mt-1">Kelola pengaturan akun Anda</p>
      </div>

      {/* Profile Card */}
      <div className="grid gap-6">
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-amber-500" />
              Informasi Profil
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Update informasi profil Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-6">
              <Avatar className="h-20 w-20 border-2 border-amber-500/50">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${formData.name || user?.email}`}
                />
                <AvatarFallback className="bg-amber-500/20 text-amber-500 text-xl">
                  {(formData.name || user?.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {formData.name || "Belum ada nama"}
                </h3>
                <p className="text-zinc-400">{user?.email}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Role: {profile?.role || "pelanggan"}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Masukkan nama lengkap"
                  className="border-zinc-700 bg-zinc-900/50 text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="border-zinc-700 bg-zinc-900/50 text-zinc-400"
                />
                <p className="text-xs text-zinc-500">
                  Email tidak dapat diubah
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_telp" className="text-white">
                  Nomor Telepon
                </Label>
                <Input
                  id="no_telp"
                  value={formData.no_telp}
                  onChange={(e) =>
                    setFormData({ ...formData, no_telp: e.target.value })
                  }
                  placeholder="Masukkan nomor telepon"
                  className="border-zinc-700 bg-zinc-900/50 text-white placeholder:text-zinc-500"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-500" />
              Ubah Password
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Ganti password akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white">
                  Password Baru
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Masukkan password baru"
                  className="border-zinc-700 bg-zinc-900/50 text-white placeholder:text-zinc-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Konfirmasi Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Konfirmasi password baru"
                  className="border-zinc-700 bg-zinc-900/50 text-white placeholder:text-zinc-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Ubah Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Tambahan */}
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white">Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-zinc-700">
                <span className="text-zinc-400">ID Akun</span>
                <span className="text-white font-mono">{user?.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-700">
                <span className="text-zinc-400">Role</span>
                <span className="text-white capitalize">
                  {profile?.role || "pelanggan"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-700">
                <span className="text-zinc-400">Bergabung Sejak</span>
                <span className="text-white">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
