"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  getBarbers,
  createBooking,
  getUserBookings,
  cancelBooking,
  checkAvailableSlots,
  isSlotAvailable,
} from "@/services/booking";
import { getUserRole } from "@/services/auth";
import { toast, Toaster } from "sonner";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Icons
import {
  Scissors,
  Star,
  Calendar as CalendarIcon,
  Clock,
  Phone,
  Mail,
  MapPin,
  User,
  ScissorsLineDashed,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarClock,
  ChevronRight,
  History,
  Home,
  Menu,
  LogOut,
  Loader2,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale/id";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";

export default function CustomerPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form state
  const [bookingForm, setBookingForm] = useState({
    booking_date: null,
    booking_time: "",
    notes: "",
  });

  useEffect(() => {
    checkUser();
    loadData();
  }, []);

  const checkUser = async () => {
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
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load barbers
      const { data: barbersData } = await getBarbers();
      if (barbersData) setBarbers(barbersData);

      // Load user bookings
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: bookingsData } = await getUserBookings(user.id);
        if (bookingsData) setBookings(bookingsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarberSelect = (barber) => {
    setSelectedBarber(barber);
    setBookingForm({
      booking_date: null,
      booking_time: "",
      notes: "",
    });
    setAvailableSlots([]);
    setIsBookingDialogOpen(true);
  };

  const handleDateSelect = async (date) => {
    setBookingForm({ ...bookingForm, booking_date: date, booking_time: "" });

    if (date && selectedBarber) {
      const { data: slots } = await checkAvailableSlots(
        selectedBarber.id,
        date,
      );
      if (slots) {
        // Filter hanya slot yang available
        const availableOnly = slots.filter((slot) => slot.available);
        setAvailableSlots(availableOnly);
      }
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!bookingForm.booking_date || !bookingForm.booking_time) {
      toast.error("Pilih tanggal dan waktu booking", {
        description: "Lengkapi semua field yang diperlukan",
        duration: 3000,
        position: "top-center",
        className: "bg-red-500/20 border border-red-500/30 text-white",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Parse tanggal dan waktu
      const [hours, minutes] = bookingForm.booking_time.split(":");
      const bookingDateTime = new Date(bookingForm.booking_date);
      bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Validasi: tidak bisa booking waktu yang sudah lewat
      const now = new Date();
      if (bookingDateTime <= now) {
        toast.error("Waktu Tidak Valid", {
          description: "Tidak bisa booking waktu yang sudah lewat",
          duration: 3000,
          position: "top-center",
          className: "bg-red-500/20 border border-red-500/30 text-white",
        });
        setIsSubmitting(false);
        return;
      }

      // Validasi: double-check ketersediaan slot
      const { available, error: checkError } = await isSlotAvailable(
        selectedBarber.id,
        bookingDateTime.toISOString(),
      );

      if (checkError) throw checkError;

      if (!available) {
        toast.error("Slot Tidak Tersedia", {
          description:
            "Maaf, slot ini sudah dibooking. Silakan pilih waktu lain",
          duration: 4000,
          position: "top-center",
          className: "bg-red-500/20 border border-red-500/30 text-white",
        });

        // Refresh available slots
        await refreshAvailableSlots();

        setIsSubmitting(false);
        return;
      }

      // Lanjutkan booking
      const bookingData = {
        user_id: user.id,
        barber_id: selectedBarber.id,
        booking_date: bookingDateTime.toISOString(),
        status: "pending",
      };

      const { data, error } = await createBooking(bookingData);

      if (error) throw error;

      // TUTUP DIALOG TERLEBIH DAHULU
      setIsBookingDialogOpen(false);

      // SweetAlert untuk success booking
      await Swal.fire({
        icon: "success",
        title: "Booking Berhasil!",
        html: `
        <div class="space-y-2">
          <p>Kode booking Anda:</p>
          <p class="text-2xl font-bold text-amber-500">${data.booking_code}</p>
          <p class="text-sm text-zinc-400">Simpan kode ini untuk keperluan konfirmasi</p>
        </div>
      `,
        background: "#1f1f1f",
        color: "#fff",
        confirmButtonColor: "#d97706",
        confirmButtonText: "OK",
        backdrop: true,
        allowOutsideClick: true,
        allowEscapeKey: true,
        customClass: {
          popup: "rounded-xl border border-zinc-700",
          confirmButton:
            "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 font-semibold py-2 px-4 rounded-lg",
          htmlContainer: "text-zinc-300",
        },
      });

      loadData(); // Reload bookings
    } catch (error) {
      toast.error("Gagal Booking", {
        description: error.message || "Terjadi kesalahan",
        duration: 4000,
        position: "top-center",
        className: "bg-red-500/20 border border-red-500/30 text-white",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi tambahan untuk refresh slot
  const refreshAvailableSlots = async () => {
    if (bookingForm.booking_date && selectedBarber) {
      const { data: slots } = await checkAvailableSlots(
        selectedBarber.id,
        bookingForm.booking_date,
      );
      if (slots) {
        setAvailableSlots(slots.filter((slot) => slot.available));
      }
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const result = await Swal.fire({
      title: "Batalkan Booking?",
      text: "Booking yang dibatalkan tidak dapat dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d97706",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Batalkan",
      cancelButtonText: "Kembali",
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
      const { error } = await cancelBooking(bookingId);

      if (!error) {
        await Swal.fire({
          icon: "success",
          title: "Dibatalkan!",
          text: "Booking berhasil dibatalkan",
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
        loadData();
      } else {
        toast.error("Gagal membatalkan", {
          description: error.message || "Terjadi kesalahan",
          duration: 3000,
          position: "top-center",
          className: "bg-red-500/20 border border-red-500/30 text-white",
        });
      }
    }
  };

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
      await supabase.auth.signOut();
      toast.success("Berhasil keluar", {
        description: "Sampai jumpa kembali!",
        duration: 2000,
        position: "top-center",
        className: "bg-green-500/20 border border-green-500/30 text-white",
      });
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: Clock,
        text: "Pending",
        className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      },
      confirmed: {
        icon: CheckCircle2,
        text: "Dikonfirmasi",
        className: "bg-green-500/20 text-green-500 border-green-500/30",
      },
      completed: {
        icon: CheckCircle2,
        text: "Selesai",
        className: "bg-blue-500/20 text-blue-500 border-blue-500/30",
      },
      cancelled: {
        icon: XCircle,
        text: "Dibatalkan",
        className: "bg-red-500/20 text-red-500 border-red-500/30",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={cn("border", config.className)}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
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
      {/* Toaster untuk notifikasi */}
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

      {/* Sidebar for mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800 z-50 transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 space-y-6">
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

          {/* User Info */}
          <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
            <Avatar className="h-12 w-12 border-2 border-amber-500/50">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`}
              />
              <AvatarFallback className="bg-amber-500/20 text-amber-500">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.email}</p>
              <p className="text-xs text-zinc-500">Pelanggan</p>
            </div>
          </div>

          {/* Menu */}
          <nav className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10"
            >
              <Home className="h-5 w-5" />
              Home
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10"
            >
              <Settings className="h-5 w-5" />
              Setting
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

      {/* Main Content */}
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
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="lg:hidden text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Welcome Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-transparent border border-amber-500/20 p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">
                Selamat Datang,{" "}
                <span className="bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent">
                  {user?.email?.split("@")[0]}
                </span>
              </h1>
              <p className="text-zinc-400 max-w-2xl">
                Pilih barber favorit Anda dan booking waktu yang tepat. Nikmati
                pengalaman potong rambut terbaik dengan barber profesional kami.
              </p>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="book" className="space-y-6">
            <TabsList className="bg-zinc-800/50 border border-zinc-700 p-1">
              <TabsTrigger
                value="book"
                className="text-zinc-300 data-[state=active]:bg-amber-500 data-[state=active]:text-white hover:text-zinc-300"
              >
                Booking Baru
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="text-zinc-300 data-[state=active]:bg-amber-500 data-[state=active]:text-white hover:text-zinc-300"
              >
                Riwayat Booking
              </TabsTrigger>
            </TabsList>

            {/* Booking Tab */}
            <TabsContent value="book" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ScissorsLineDashed className="h-5 w-5 text-amber-500" />
                  Pilih Barber
                </h3>

                {barbers.length === 0 ? (
                  <Card className="bg-zinc-800/50 border-zinc-700">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Scissors className="h-12 w-12 text-zinc-600 mb-4" />
                      <p className="text-zinc-400 text-center">
                        Belum ada barber tersedia
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Carousel
                    opts={{
                      align: "start",
                      loop: true,
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {barbers.map((barber) => (
                        <CarouselItem
                          key={barber.id}
                          className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                        >
                          <Card
                            className="group bg-zinc-800/50 border-zinc-700 hover:border-amber-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
                            onClick={() => handleBarberSelect(barber)}
                          >
                            <div className="relative h-48 overflow-hidden">
                              <Image
                                src={
                                  barber.image ||
                                  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                }
                                alt={barber.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                              <div className="absolute bottom-4 left-4 right-4">
                                <div className="flex items-center justify-between">
                                  <Badge
                                    variant="secondary"
                                    className="bg-amber-500/90 text-white border-0"
                                  >
                                    <Star className="w-3 h-3 mr-1 fill-current" />
                                    {barber.rating || "5.0"}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="bg-black/50 text-white border-zinc-600"
                                  >
                                    {barber.total_bookings || 0} bookings
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <CardHeader>
                              <CardTitle className="text-white group-hover:text-amber-500 transition-colors">
                                {barber.name}
                              </CardTitle>
                              <CardDescription className="text-zinc-400">
                                {barber.specialty || "Master Barber"}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-sm">
                                <p className="text-zinc-400">
                                  Pengalaman: {barber.experience || 5}+ tahun
                                </p>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                                Pilih Barber
                                <ChevronRight className="ml-2 h-4 w-4" />
                              </Button>
                            </CardFooter>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex -left-4 bg-zinc-800 border-zinc-700 text-white hover:bg-amber-500 hover:text-white" />
                    <CarouselNext className="hidden sm:flex -right-4 bg-zinc-800 border-zinc-700 text-white hover:bg-amber-500 hover:text-white" />
                  </Carousel>
                )}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white">Riwayat Booking</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Daftar booking Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {bookings.length === 0 ? (
                        <div className="text-center py-12">
                          <CalendarClock className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                          <p className="text-zinc-400">Belum ada booking</p>
                        </div>
                      ) : (
                        bookings.map((booking) => (
                          <Card
                            key={booking.id}
                            className="bg-zinc-900/50 border-zinc-700"
                          >
                            <CardContent className="p-6">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge
                                      variant="outline"
                                      className="bg-amber-500/10 text-amber-500 border-amber-500/30"
                                    >
                                      {booking.booking_code}
                                    </Badge>
                                    {getStatusBadge(booking.status)}
                                  </div>
                                  <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-2 text-zinc-300">
                                      <User className="h-4 w-4 text-amber-500" />
                                      <span>{booking.barbers?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-300">
                                      <CalendarIcon className="h-4 w-4 text-amber-500" />
                                      <span>
                                        {format(
                                          new Date(booking.booking_date),
                                          "dd MMM yyyy",
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-300">
                                      <Clock className="h-4 w-4 text-amber-500" />
                                      <span>
                                        {format(
                                          new Date(booking.booking_date),
                                          "HH:mm",
                                        )}{" "}
                                        WIB
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {booking.status === "pending" && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      handleCancelBooking(booking.id)
                                    }
                                    className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Batalkan
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Scissors className="h-6 w-6 text-amber-500" />
              Booking dengan {selectedBarber?.name}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Pilih tanggal dan waktu yang tersedia
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBookingSubmit} className="space-y-6">
            {/* Barber Info */}
            {selectedBarber && (
              <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                  <Image
                    src={
                      selectedBarber.image ||
                      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    }
                    alt={selectedBarber.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{selectedBarber.name}</h4>
                  <p className="text-sm text-zinc-400">
                    {selectedBarber.specialty || "Master Barber"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-3 w-3 text-amber-500 fill-current" />
                    <span className="text-xs text-zinc-400">
                      {selectedBarber.rating || "5.0"} •{" "}
                      {selectedBarber.experience || 5} tahun exp
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Pilih Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-800 hover:text-white",
                      !bookingForm.booking_date && "text-zinc-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bookingForm.booking_date ? (
                      format(bookingForm.booking_date, "EEEE, dd MMMM yyyy", {
                        locale: localeId,
                      })
                    ) : (
                      <span>Pilih tanggal booking</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                  <Calendar
                    mode="single"
                    selected={bookingForm.booking_date}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                    initialFocus
                    className="bg-zinc-800 text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            {bookingForm.booking_date && (
              <div className="space-y-2">
                <Label>Pilih Waktu</Label>
                <Select
                  value={bookingForm.booking_time}
                  onValueChange={(value) =>
                    setBookingForm({ ...bookingForm, booking_time: value })
                  }
                >
                  <SelectTrigger className="border-zinc-700 bg-zinc-800/50 text-white">
                    <SelectValue placeholder="Pilih jam tersedia" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white max-h-60">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot) => (
                        <SelectItem
                          key={slot.time}
                          value={slot.time}
                          className="hover:bg-amber-500/20 focus:bg-amber-500/20"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{slot.time} WIB</span>
                            {new Date(
                              bookingForm.booking_date,
                            ).toDateString() === new Date().toDateString() && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs bg-amber-500/10 text-amber-500 border-amber-500/30"
                              >
                                Hari Ini
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-zinc-500">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Tidak ada slot tersedia</p>
                        <p className="text-xs mt-1">Coba pilih tanggal lain</p>
                      </div>
                    )}
                  </SelectContent>
                </Select>

                {/* Info tambahan */}
                {bookingForm.booking_date &&
                  new Date(bookingForm.booking_date).toDateString() ===
                    new Date().toDateString() && (
                    <p className="text-xs text-amber-500 flex items-center gap-1 mt-2">
                      <AlertCircle className="h-3 w-3" />
                      Slot sebelum jam sekarang tidak ditampilkan
                    </p>
                  )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>Catatan (Opsional)</Label>
              <Textarea
                placeholder="Tambahkan catatan untuk barber (model rambut, dll)"
                value={bookingForm.notes}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, notes: e.target.value })
                }
                className="border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBookingDialogOpen(false)}
                className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Konfirmasi Booking"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
