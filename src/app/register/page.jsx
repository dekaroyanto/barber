"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// import { signUpUser } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Scissors,
  User,
  Mail,
  Phone,
  Lock,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    no_telp: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};

    if (!form.name) newErrors.name = "Nama wajib diisi";
    if (!form.email) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!form.no_telp) {
      newErrors.no_telp = "Nomor telepon wajib diisi";
    } else if (!/^\d+$/.test(form.no_telp)) {
      newErrors.no_telp = "Nomor telepon harus angka";
    }

    if (!form.password) {
      newErrors.password = "Password wajib diisi";
    } else if (form.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    const result = await signUpUser(form);

    if (result.error) {
      setErrors({ general: result.error.message });
      setIsLoading(false);
      return;
    }

    await Swal.fire({
      icon: "success",
      title: "Registrasi Berhasil!",
      text: "Silakan login menggunakan akun Anda",
      background: "#1f1f1f",
      color: "#fff",
      confirmButtonColor: "#d97706",
      confirmButtonText: "Ke Login",
      customClass: {
        popup: "rounded-xl border border-zinc-700",
        title: "text-amber-500 font-bold",
        confirmButton:
          "bg-gradient-to-r from-amber-600 to-amber-500 font-semibold px-4 py-2 rounded-lg",
      },
    });

    router.push("/login");
  };
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=2074&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <Card className="w-full max-w-md relative z-20 border-zinc-800 bg-zinc-900/95 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-zinc-800 to-stone-900 rounded-2xl border border-zinc-700 shadow-lg">
              <Scissors className="h-10 w-10 text-amber-500" />
            </div>
          </div>

          <CardTitle className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              DAFTAR AKUN
            </span>
          </CardTitle>

          <CardDescription className="text-zinc-400">
            Buat akun baru untuk mulai booking
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Nama */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  required
                  className={`pl-10 h-12 bg-zinc-800/50 border ${
                    errors.name ? "border-red-500" : "border-zinc-700"
                  } text-white placeholder:text-zinc-500`}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="email"
                  placeholder="email@contoh.com"
                  required
                  className={`pl-10 h-12 bg-zinc-800/50 border ${
                    errors.email ? "border-red-500" : "border-zinc-700"
                  } text-white placeholder:text-zinc-500`}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* No Telp */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Nomor Telepon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  required
                  className={`pl-10 h-12 bg-zinc-800/50 border ${
                    errors.no_telp ? "border-red-500" : "border-zinc-700"
                  } text-white placeholder:text-zinc-500`}
                  onChange={(e) =>
                    setForm({ ...form, no_telp: e.target.value })
                  }
                />
              </div>
              {errors.no_telp && (
                <p className="text-red-500 text-sm">{errors.no_telp}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Password</Label>
              <div className="relative">
                {/* Icon Lock */}
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />

                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  className={`pl-10 pr-10 h-12 bg-zinc-800/50 border ${
                    errors.password ? "border-red-500" : "border-zinc-700"
                  } text-white placeholder:text-zinc-500`}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />

                {/* Eye Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-amber-500 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            {errors.general && (
              <p className="text-red-500 text-sm text-center">
                {errors.general}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 font-semibold shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Daftar"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="border-t border-zinc-800 pt-6 flex justify-center">
          <p className="text-sm text-zinc-400">
            Sudah punya akun?{" "}
            <a
              href="/login"
              className="text-amber-500 font-semibold hover:underline"
            >
              Masuk
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
