// app/admin/barbers/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  getBarbers,
  createBarber,
  updateBarber,
  deleteBarber,
} from "@/services/barbers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Calendar,
  Scissors,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";

export default function BarbersPage() {
  const router = useRouter();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    experience: "",
    image: "",
    status: "active",
    rating: 0,
    total_bookings: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch barbers
  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    setLoading(true);
    try {
      const data = await getBarbers();
      setBarbers(data || []);
    } catch (error) {
      console.error("Error fetching barbers:", error);
      toast.error("Gagal memuat data barbers", {
        description: "Silakan coba lagi nanti",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle select change
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      specialty: "",
      experience: "",
      image: "",
      status: "active",
      rating: 0,
      total_bookings: 0,
    });
    setSelectedBarber(null);
  };

  // Open create dialog
  const handleCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Open edit dialog
  const handleEdit = (barber) => {
    setSelectedBarber(barber);
    setFormData({
      name: barber.name || "",
      specialty: barber.specialty || "",
      experience: barber.experience?.toString() || "",
      image: barber.image || "",
      status: barber.status || "active",
      rating: barber.rating || 0,
      total_bookings: barber.total_bookings || 0,
    });
    setIsDialogOpen(true);
  };

  // Open delete dialog
  const handleDeleteClick = (barber) => {
    setSelectedBarber(barber);
    setIsDeleteDialogOpen(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validasi
    if (!formData.name) {
      toast.error("Nama barber harus diisi");
      setIsSubmitting(false);
      return;
    }

    try {
      const barberData = {
        ...formData,
        experience: formData.experience ? parseInt(formData.experience) : null,
      };

      let result;
      if (selectedBarber) {
        // Update
        result = await updateBarber(selectedBarber.id, barberData);
        if (result) {
          toast.success("Berhasil memperbarui barber", {
            description: `${formData.name} telah diperbarui`,
            duration: 3000,
          });
        }
      } else {
        // Create
        result = await createBarber(barberData);
        if (result) {
          toast.success("Berhasil menambahkan barber", {
            description: `${formData.name} telah ditambahkan`,
            duration: 3000,
          });
        }
      }

      if (result) {
        setIsDialogOpen(false);
        resetForm();
        fetchBarbers();
      }
    } catch (error) {
      console.error("Error saving barber:", error);
      toast.error("Gagal menyimpan data", {
        description: error.message || "Terjadi kesalahan",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete barber
  const handleDelete = async () => {
    if (!selectedBarber) return;

    try {
      const result = await deleteBarber(selectedBarber.id);
      if (result) {
        toast.success("Berhasil menghapus barber", {
          description: `${selectedBarber.name} telah dihapus`,
          duration: 3000,
        });
        setIsDeleteDialogOpen(false);
        setSelectedBarber(null);
        fetchBarbers();
      }
    } catch (error) {
      console.error("Error deleting barber:", error);
      toast.error("Gagal menghapus barber", {
        description: error.message || "Terjadi kesalahan",
        duration: 3000,
      });
    }
  };

  // Filter barbers based on search
  const filteredBarbers = barbers.filter(
    (barber) =>
      barber.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barber.specialty?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "inactive":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  // Get initial for avatar fallback
  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Barbers</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Kelola daftar barber yang tersedia
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold shadow-lg shadow-amber-600/20"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Barber
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Cari barber berdasarkan nama atau spesialis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-600 focus:ring-amber-600/20"
              />
            </div>
            <Button
              variant="outline"
              onClick={fetchBarbers}
              className="border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700/50 hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-zinc-400">Barber</TableHead>
                  <TableHead className="text-zinc-400">Spesialis</TableHead>
                  <TableHead className="text-zinc-400">Pengalaman</TableHead>
                  <TableHead className="text-zinc-400">Rating</TableHead>
                  <TableHead className="text-zinc-400">Total Booking</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400 text-right">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="border-zinc-800">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full bg-zinc-800" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32 bg-zinc-800" />
                            <Skeleton className="h-3 w-24 bg-zinc-800" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24 bg-zinc-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 bg-zinc-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 bg-zinc-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 bg-zinc-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full bg-zinc-800" />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded bg-zinc-800" />
                          <Skeleton className="h-8 w-8 rounded bg-zinc-800" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredBarbers.length > 0 ? (
                  filteredBarbers.map((barber) => (
                    <TableRow
                      key={barber.id}
                      className="border-zinc-800 hover:bg-zinc-800/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-zinc-700">
                            <AvatarImage src={barber.image} alt={barber.name} />
                            <AvatarFallback className="bg-zinc-800 text-zinc-400">
                              {getInitials(barber.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">
                              {barber.name}
                            </p>
                            <p className="text-sm text-zinc-500">
                              ID: {barber.id?.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {barber.specialty || "-"}
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {barber.experience ? `${barber.experience} tahun` : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          <span className="text-white">
                            {barber.rating?.toFixed(1) || "0.0"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {barber.total_bookings || 0}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "border",
                            getStatusBadge(barber.status),
                          )}
                        >
                          {barber.status === "active" ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(barber)}
                            className="text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(barber)}
                            className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-zinc-500"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Scissors className="h-12 w-12 text-zinc-600" />
                        <div>
                          <p className="text-lg font-medium text-white mb-1">
                            Tidak ada data barber
                          </p>
                          <p className="text-sm">
                            {searchTerm
                              ? "Coba gunakan kata kunci lain"
                              : "Klik tombol Tambah Barber untuk menambahkan data"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {selectedBarber ? "Edit Barber" : "Tambah Barber Baru"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {selectedBarber
                ? "Edit informasi barber yang sudah ada"
                : "Isi informasi untuk menambahkan barber baru"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Nama Barber <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama barber"
                    className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-600"
                    required
                  />
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Spesialis
                  </label>
                  <Input
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    placeholder="Contoh: Haircut, Beard Styling, dll"
                    className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-600"
                  />
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Pengalaman (tahun)
                  </label>
                  <Input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Contoh: 5"
                    min="0"
                    className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white focus:border-amber-600">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectItem
                        value="active"
                        className="text-white focus:bg-amber-600/20"
                      >
                        Aktif
                      </SelectItem>
                      <SelectItem
                        value="inactive"
                        className="text-white focus:bg-amber-600/20"
                      >
                        Nonaktif
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    URL Gambar
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-600"
                    />
                  </div>
                  <p className="text-xs text-zinc-500">
                    Masukkan URL gambar (dari internet atau upload manual)
                  </p>
                </div>

                {/* Rating (readonly) */}
                {selectedBarber && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">
                        Rating
                      </label>
                      <div className="flex items-center gap-2 p-2 bg-zinc-800/50 border border-zinc-700 rounded-md">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="text-white">
                          {formData.rating || 0}
                        </span>
                      </div>
                    </div>

                    {/* Total Bookings (readonly) */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">
                        Total Booking
                      </label>
                      <div className="flex items-center gap-2 p-2 bg-zinc-800/50 border border-zinc-700 rounded-md">
                        <Calendar className="h-4 w-4 text-amber-500" />
                        <span className="text-white">
                          {formData.total_bookings || 0}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Preview Image (if URL exists) */}
            {formData.image && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Preview Gambar
                </label>
                <div className="relative h-40 w-40 rounded-lg overflow-hidden border border-zinc-700">
                  <Image
                    src={formData.image}
                    alt="Preview"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/150?text=Error";
                    }}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                className="border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700/50 hover:text-white"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : selectedBarber ? (
                  "Simpan Perubahan"
                ) : (
                  "Tambah Barber"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Hapus Barber
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-semibold text-white">
                {selectedBarber?.name}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
