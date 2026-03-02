"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, getUserRole } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Scissors, Mail, Phone, Lock, Loader2, User, Zap } from "lucide-react";
import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: message,
      background: "#1f1f1f",
      color: "#fff",
      confirmButtonColor: "#d97706",
      confirmButtonText: "Coba Lagi",
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: "rounded-xl border border-zinc-700",
        title: "text-amber-500 font-bold",
        confirmButton:
          "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 font-semibold py-2 px-4 rounded-lg",
      },
    });
  };

  const showSuccessAlert = (role) => {
    Swal.fire({
      icon: "success",
      title: "Berhasil Masuk!",
      text:
        role === "admin" ? "Selamat datang Admin" : "Selamat datang kembali",
      background: "#1f1f1f",
      color: "#fff",
      confirmButtonColor: "#d97706",
      timer: 1500,
      showConfirmButton: false,
      customClass: {
        popup: "rounded-xl border border-zinc-700",
        title: "text-amber-500 font-bold",
      },
    });
  };

  const getErrorMessage = () => {
    if (identifier.includes("@")) {
      return "Email atau password salah";
    }

    if (identifier.match(/^\d+$/)) {
      return "No Telp atau password salah";
    }

    return error;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!identifier || !password) {
      setIsLoading(false);
      showErrorAlert("Email/No Telp dan Password harus diisi");
      return;
    }

    try {
      const result = await loginUser(identifier, password);

      if (result.error) {
        setIsLoading(false);
        setError(result.error.message || "Login gagal. Silakan coba lagi.");
        showErrorAlert(getErrorMessage());
        return;
      }

      const role = await getUserRole();

      // Tampilkan success alert
      await showSuccessAlert(role);

      // Redirect setelah alert sukses
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setIsLoading(false);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      showErrorAlert("Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  const isEmail = identifier.includes("@");
  const inputIcon = isEmail ? (
    <Mail className="h-4 w-4" />
  ) : (
    <Phone className="h-4 w-4" />
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image - Barbershop from Unsplash */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark Overlay for better contrast */}
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* Animated Gradient Orbs (dengan opacity lebih rendah) */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-zinc-700 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse z-0"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-zinc-800 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse z-0"></div>

      {/* Top & Bottom Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent z-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent z-10"></div>

      <Card className="w-full max-w-md relative z-20 border-zinc-800 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/50">
        <CardHeader className="space-y-2 text-center pb-8">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-zinc-800 to-stone-900 rounded-2xl border border-zinc-700 shadow-lg">
              <Scissors className="h-10 w-10 text-amber-500" />
            </div>
          </div>

          <CardTitle className="text-3xl font-bold text-white">
            <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              THE BARBER
            </span>
          </CardTitle>

          <CardDescription className="text-base text-zinc-400">
            Masuk ke akun Anda untuk mengelola booking
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Identifier */}
            <div className="space-y-2">
              <Label
                htmlFor="identifier"
                className="text-sm font-medium text-zinc-300"
              >
                Email atau Nomor Telepon
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors">
                  {identifier ? inputIcon : <User className="h-4 w-4" />}
                </div>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="admin@barbershop.com / 08123456789"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-10 h-12 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-600 focus:ring-amber-600/20"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-zinc-300"
                >
                  Password
                </Label>
                <a
                  href="/lupa-password"
                  className="text-xs text-amber-500 hover:text-amber-400 hover:underline"
                >
                  Lupa password?
                </a>
              </div>

              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-600 focus:ring-amber-600/20"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold text-base shadow-lg shadow-amber-600/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 border-t border-zinc-800 pt-6">
          <p className="text-sm text-zinc-400">
            Belum punya akun?{" "}
            <a
              href="/register"
              className="text-amber-500 hover:text-amber-400 font-semibold hover:underline"
            >
              Daftar sekarang
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
