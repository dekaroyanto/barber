"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Scissors, Upload, X, Loader2, Star } from "lucide-react";
import Swal from "sweetalert2";

const specialties = [
  "Haircut Expert",
  "Beard Stylist",
  "Color Specialist",
  "Fade Master",
  "Classic Cutter",
  "Kids Barber",
  "All Rounder",
];

export default function BarberForm({ open, onClose, barber, mode, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    experience: "",
    image: "",
    status: "active",
    rating: 0,
    total_bookings: 0,
    bio: "",
  });

  useEffect(() => {
    if (barber && mode === "edit") {
      setFormData({
        name: barber.name || "",
        specialty: barber.specialty || "",
        experience: barber.experience?.toString() || "",
        image: barber.image || "",
        status: barber.status || "active",
        rating: barber.rating || 0,
        total_bookings: barber.total_bookings || 0,
        bio: barber.bio || "",
      });
    } else {
      // Reset form untuk mode add
      setFormData({
        name: "",
        specialty: "",
        experience: "",
        image: "",
        status: "active",
        rating: 0,
        total_bookings: 0,
        bio: "",
      });
    }
  }, [barber, mode, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "File harus berupa gambar",
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#d97706",
      });
      return;
    }

    // Validasi ukuran file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ukuran file maksimal 2MB",
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#d97706",
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `barbers/${fileName}`;

      // Upload ke Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("barber-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("barber-images").getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        image: publicUrl,
      }));

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Gambar berhasil diupload",
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#d97706",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengupload gambar",
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#d97706",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Nama barber harus diisi",
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#d97706",
      });
      return false;
    }

    if (!formData.specialty) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Spesialisasi harus dipilih",
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#d97706",
      });
      return false;
    }

    if (
      formData.experience &&
      (isNaN(formData.experience) || parseInt(formData.experience) < 0)
    ) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Pengalaman harus berupa angka positif",
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#d97706",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const barberData = {
        name: formData.name,
        specialty: formData.specialty,
        experience: formData.experience ? parseInt(formData.experience) : null,
        image: formData.image || null,
        status: formData.status,
        bio: formData.bio || null,
        updated_at: new Date().toISOString(),
      };

      let result;

      if (mode === "add") {
        // Tambah barber baru
        result = await supabase
          .from("barbers")
          .insert([
            {
              ...barberData,
              rating: 0,
              total_bookings: 0,
              created_at: new Date().toISOString(),
            },
          ])
          .select();
      } else {
        // Edit barber
        result = await supabase
          .from("barbers")
          .update(barberData)
          .eq("id", barber.id)
          .select();
      }

      if (result.error) throw result.error;

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text:
          mode === "add"
            ? "Barber berhasil ditambahkan"
            : "Barber berhasil diperbarui",
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#d97706",
        timer: 1500,
        showConfirmButton: false,
      });

      onSuccess();
    } catch (error) {
      console.error("Error saving barber:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal menyimpan data barber",
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#d97706",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <Scissors className="h-5 w-5 text-amber-500" />
            {mode === "add" ? "Tambah Barber Baru" : "Edit Barber"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {mode === "add"
              ? "Isi data barber baru dengan lengkap"
              : "Ubah data barber sesuai kebutuhan"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-zinc-300">Foto Barber</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg bg-zinc-800 overflow-hidden border-2 border-zinc-700">
                {formData.image ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800">
                    <Scissors className="h-8 w-8 text-zinc-500" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                  disabled={uploading}
                  className="border-zinc-700 text-zinc-300 hover:text-amber-500 hover:border-amber-500"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Foto
                    </>
                  )}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Format: JPG, PNG. Maks: 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Nama */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">
              Nama Barber <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan nama barber"
              className="bg-zinc-800/30 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-amber-500/50"
              required
            />
          </div>

          {/* Spesialisasi */}
          <div className="space-y-2">
            <Label htmlFor="specialty" className="text-zinc-300">
              Spesialisasi <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.specialty}
              onValueChange={(value) => handleSelectChange("specialty", value)}
            >
              <SelectTrigger className="bg-zinc-800/30 border-zinc-800 text-white">
                <SelectValue placeholder="Pilih spesialisasi" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {specialties.map((specialty) => (
                  <SelectItem
                    key={specialty}
                    value={specialty}
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-amber-500"
                  >
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pengalaman */}
          <div className="space-y-2">
            <Label htmlFor="experience" className="text-zinc-300">
              Pengalaman (tahun)
            </Label>
            <Input
              id="experience"
              name="experience"
              type="number"
              min="0"
              step="1"
              value={formData.experience}
              onChange={handleChange}
              placeholder="Contoh: 5"
              className="bg-zinc-800/30 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-amber-500/50"
            />
          </div>

          {/* Bio/Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-zinc-300">
              Bio / Deskripsi
            </Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Deskripsikan keahlian dan pengalaman barber..."
              className="bg-zinc-800/30 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-amber-500/50 min-h-[100px]"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">Aktif</div>
                </SelectItem>
                <SelectItem value="inactive">
                  <div className="flex items-center gap-2">Nonaktif</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jika mode edit, tampilkan statistik */}
          {mode === "edit" && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
              <div>
                <p className="text-sm text-zinc-500">Rating</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="text-white font-medium">
                    {formData.rating}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Total Booking</p>
                <p className="text-white font-medium mt-1">
                  {formData.total_bookings}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : mode === "add" ? (
                "Tambah Barber"
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
