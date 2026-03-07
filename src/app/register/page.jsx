"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/services/auth";
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
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingField, setCheckingField] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    no_telp: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Fungsi untuk cek email duplikat
  const checkEmailExists = async (email) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return false;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  // Fungsi untuk cek nomor telepon duplikat
  const checkPhoneExists = async (no_telp) => {
    if (!no_telp || !/^\d+$/.test(no_telp)) return false;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("no_telp")
        .eq("no_telp", no_telp)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("Error checking phone:", error);
      return false;
    }
  };

  const validateField = async (name, value, skipDuplicateCheck = false) => {
    switch (name) {
      case "name":
        if (!value) return "Nama wajib diisi";
        if (value.length < 3) return "Nama minimal 3 karakter";
        if (value.length > 50) return "Nama maksimal 50 karakter";
        return "";

      case "email":
        if (!value) return "Email wajib diisi";
        if (!/\S+@\S+\.\S+/.test(value)) return "Format email tidak valid";
        if (value.length > 255) return "Email terlalu panjang";

        // Cek duplikat email jika tidak sedang dalam mode skip
        if (!skipDuplicateCheck && value && !errors[name]) {
          setCheckingField(name);
          const exists = await checkEmailExists(value);
          setCheckingField(null);
          if (exists) return "Email sudah terdaftar";
        }
        return "";

      case "no_telp":
        if (!value) return "Nomor telepon wajib diisi";
        if (!/^\d+$/.test(value)) return "Nomor telepon harus angka";
        if (value.length < 10) return "Nomor telepon minimal 10 angka";
        if (value.length > 13) return "Nomor telepon maksimal 13 angka";

        // Cek duplikat nomor telepon jika tidak sedang dalam mode skip
        if (!skipDuplicateCheck && value && !errors[name]) {
          setCheckingField(name);
          const exists = await checkPhoneExists(value);
          setCheckingField(null);
          if (exists) return "Nomor telepon sudah terdaftar";
        }
        return "";

      case "password":
        if (!value) return "Password wajib diisi";
        if (value.length < 6) return "Password minimal 6 karakter";
        if (value.length > 100) return "Password maksimal 100 karakter";
        return "";

      default:
        return "";
    }
  };

  const handleBlur = async (field) => {
    setTouched({ ...touched, [field]: true });
    const error = await validateField(field, form[field], false);
    setErrors({ ...errors, [field]: error });
  };

  const handleChange = async (field, value) => {
    setForm({ ...form, [field]: value });

    // Real-time validation if field has been touched
    if (touched[field]) {
      // Untuk email dan no_telp, kita lakukan validasi dengan debounce
      if (field === "email" || field === "no_telp") {
        // Clear existing timeout
        if (window[`${field}Timeout`]) {
          clearTimeout(window[`${field}Timeout`]);
        }

        // Set new timeout untuk menghindari terlalu banyak request
        window[`${field}Timeout`] = setTimeout(async () => {
          const error = await validateField(field, value, false);
          setErrors((prev) => ({ ...prev, [field]: error }));
        }, 500);
      } else {
        const error = await validateField(field, value, true);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    }
  };

  const validate = async () => {
    const newErrors = {};
    const fields = ["name", "email", "no_telp", "password"];

    // Validasi semua field termasuk cek duplikat
    for (const field of fields) {
      const error = await validateField(field, form[field], false);
      if (error) newErrors[field] = error;
    }

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      no_telp: true,
      password: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any pending timeouts
    ["email", "no_telp"].forEach((field) => {
      if (window[`${field}Timeout`]) {
        clearTimeout(window[`${field}Timeout`]);
      }
    });

    const isValid = await validate();
    if (!isValid) return;

    setIsLoading(true);

    // Double check untuk memastikan tidak ada duplikasi saat submit
    const emailExists = await checkEmailExists(form.email);
    if (emailExists) {
      setErrors({ ...errors, email: "Email sudah terdaftar" });
      setIsLoading(false);
      return;
    }

    const phoneExists = await checkPhoneExists(form.no_telp);
    if (phoneExists) {
      setErrors({ ...errors, no_telp: "Nomor telepon sudah terdaftar" });
      setIsLoading(false);
      return;
    }

    const result = await registerUser(form);

    if (result.error) {
      // Parse error message from Supabase
      const errorMessage = result.error.message;

      if (
        errorMessage.includes("email already registered") ||
        (errorMessage.includes(
          "duplicate key value violates unique constraint",
        ) &&
          errorMessage.includes("email"))
      ) {
        setErrors({ ...errors, email: "Email sudah terdaftar" });
      } else if (
        errorMessage.includes("phone number already exists") ||
        (errorMessage.includes(
          "duplicate key value violates unique constraint",
        ) &&
          errorMessage.includes("no_telp"))
      ) {
        setErrors({ ...errors, no_telp: "Nomor telepon sudah terdaftar" });
      } else {
        setErrors({ ...errors, general: errorMessage });
      }

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

  const getInputClassName = (field) => {
    const baseClass =
      "pl-10 h-12 bg-zinc-800/50 border text-white placeholder:text-zinc-500";
    const errorClass = errors[field]
      ? "border-red-500 focus:border-red-500"
      : "border-zinc-700 focus:border-amber-500";
    const validClass =
      !errors[field] && touched[field] && form[field] ? "border-green-500" : "";

    return `${baseClass} ${errorClass} ${validClass}`;
  };

  const getFieldStatus = (field) => {
    if (checkingField === field) {
      return <span className="text-amber-500 text-xs">Memeriksa...</span>;
    }
    if (touched[field] && !errors[field] && form[field]) {
      return (
        <span className="text-green-500 text-xs flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Tersedia
        </span>
      );
    }
    return null;
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
              <Label className="text-zinc-300 flex items-center gap-2">
                Nama Lengkap
                {touched.name && !errors.name && form.name && (
                  <span className="text-green-500 text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Valid
                  </span>
                )}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={form.name}
                  className={getInputClassName("name")}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                />
                {errors.name && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-zinc-300 flex items-center gap-2">
                Email
                {getFieldStatus("email")}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="email"
                  placeholder="email@contoh.com"
                  value={form.email}
                  className={getInputClassName("email")}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                />
                {checkingField === "email" && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 animate-spin" />
                )}
                {errors.email && !checkingField && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* No Telp */}
            <div className="space-y-2">
              <Label className="text-zinc-300 flex items-center gap-2">
                Nomor Telepon
                {getFieldStatus("no_telp")}
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={form.no_telp}
                  className={getInputClassName("no_telp")}
                  onChange={(e) => handleChange("no_telp", e.target.value)}
                  onBlur={() => handleBlur("no_telp")}
                />
                {checkingField === "no_telp" && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 animate-spin" />
                )}
                {errors.no_telp && !checkingField && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.no_telp && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.no_telp}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-zinc-300 flex items-center gap-2">
                Password
                {touched.password && !errors.password && form.password && (
                  <span className="text-green-500 text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Valid
                  </span>
                )}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />

                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={form.password}
                  className={`${getInputClassName("password")} pr-20`}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                />

                {/* Password strength indicator */}
                {form.password && touched.password && !errors.password && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 flex gap-1">
                    {form.password.length >= 6 && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                )}

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
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}

              {/* Password hint */}
              {touched.password &&
                form.password &&
                form.password.length < 6 && (
                  <p className="text-amber-500 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Password harus minimal 6 karakter
                  </p>
                )}
            </div>

            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-500 text-sm text-center flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.general}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={
                isLoading ||
                checkingField !== null ||
                Object.keys(errors).some(
                  (key) => key !== "general" && errors[key],
                )
              }
              className="w-full h-12 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
