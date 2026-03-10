// app/admin/bookings/page.jsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  formatToWIB,
  formatDateOnlyWIB,
  formatTimeWIB,
  toWIB,
  nowInWIB,
  isTodayInWIB,
  toUTC,
  getHourWIB,
  formatRelativeWIB,
} from "@/utils/date";
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  checkBarberAvailability,
  getBookedHours,
  subscribeToNewBookings,
} from "@/services/bookings";
import { getBarbers } from "@/services/barbers";
import { getProfiles } from "@/services/profiles";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  User,
  Scissors,
  Loader2,
  RefreshCw,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Clock,
  X,
  Bell,
  BellRing,
} from "lucide-react";

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [statsDialogConfig, setStatsDialogConfig] = useState({
    title: "",
    status: "all",
    data: [],
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
  const [bookedHours, setBookedHours] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [formData, setFormData] = useState({
    booking_code: "",
    user_id: "",
    barber_id: "",
    booking_date: "",
    status: "pending",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk notifikasi
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastBookingCount, setLastBookingCount] = useState(0);
  const [isBrowser, setIsBrowser] = useState(false);

  // Set isBrowser to true when component mounts (client-side only)
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Fungsi untuk menampilkan notifikasi (tanpa suara)
  const showNotification = useCallback(
    (title, message, booking, isUrgent = false) => {
      console.log("showNotification called:", { title, message, isUrgent });

      const newNotification = {
        id: Date.now(),
        title,
        message,
        booking,
        timestamp: new Date(),
        read: false,
        urgent: isUrgent,
      };

      setNotifications((prev) => {
        return [newNotification, ...prev].slice(0, 50); // Maksimal 50 notifikasi
      });

      setUnreadCount((prev) => prev + 1);

      // Tampilkan toast notification dengan desain yang lebih menarik
      toast.custom(
        (t) => (
          <div
            className={cn(
              "border rounded-lg shadow-lg p-4 max-w-md pointer-events-auto",
              isUrgent
                ? "bg-red-900/90 border-red-600"
                : "bg-zinc-900 border-amber-600",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    isUrgent ? "bg-red-600/20" : "bg-amber-600/20",
                  )}
                >
                  {isUrgent ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <BellRing className="h-5 w-5 text-amber-500" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h4
                  className={cn(
                    "font-semibold",
                    isUrgent ? "text-red-400" : "text-white",
                  )}
                >
                  {title}
                </h4>
                <p className="text-zinc-400 text-sm mt-1">{message}</p>
                <p className="text-xs text-amber-500 mt-2">
                  {formatRelativeWIB(new Date())}
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ),
        {
          duration: isUrgent ? 15000 : 10000, // 15 detik untuk urgent, 10 detik untuk biasa
          position: "top-right",
        },
      );

      // Tampilkan notifikasi browser jika diizinkan (hanya di client-side)
      if (
        isBrowser &&
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification(title, {
            body: message,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: isUrgent ? "urgent-booking" : "new-booking",
            renotify: true,
            silent: true, // Silent karena kita tidak pakai suara
          });
        } catch (error) {
          console.error("Error showing browser notification:", error);
        }
      }
    },
    [isBrowser],
  );

  // Minta izin notifikasi browser (hanya di client-side)
  useEffect(() => {
    if (
      isBrowser &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, [isBrowser]);

  // Subscribe ke booking baru
  useEffect(() => {
    console.log("Setting up subscription...");

    const unsubscribe = subscribeToNewBookings((newBooking) => {
      console.log("New booking received:", newBooking);

      // Cek apakah ini benar-benar booking baru (bukan update)
      const isNewBooking = !bookings.some((b) => b.id === newBooking.id);
      console.log("Is new booking:", isNewBooking);

      if (isNewBooking) {
        // Update state bookings
        setBookings((prev) => {
          return [newBooking, ...prev];
        });

        // Dapatkan informasi customer dan barber
        const customer = customers.find((c) => c.id === newBooking.user_id);
        const barber = barbers.find((b) => b.id === newBooking.barber_id);

        console.log("Found customer:", customer);
        console.log("Found barber:", barber);

        // Cek apakah ini booking urgent (misalnya booking untuk hari ini)
        const bookingDate = new Date(newBooking.booking_date);
        const today = new Date();
        const isToday = bookingDate.toDateString() === today.toDateString();

        console.log("Is today:", isToday);

        // Tampilkan notifikasi
        const title = isToday ? "⚠️ Booking Mendesak!" : "🚀 Booking Baru!";
        const message = `${customer?.full_name || customer?.name || "Pelanggan"} telah booking dengan ${barber?.name || "barber"} pada ${formatDateOnlyWIB(newBooking.booking_date)} ${formatTimeWIB(newBooking.booking_date)} WIB`;

        console.log("Showing notification:", { title, message });

        showNotification(
          title,
          message,
          newBooking,
          isToday, // Urgent jika booking untuk hari ini
        );

        // Update lastBookingCount
        setLastBookingCount((prev) => prev + 1);
      } else {
        console.log("Booking already exists, skipping notification");
      }
    });

    return () => {
      console.log("Cleaning up subscription...");
      unsubscribe();
    };
  }, [bookings, customers, barbers, showNotification]);

  // Polling untuk cek booking baru (fallback jika realtime tidak berfungsi)
  useEffect(() => {
    let isMounted = true;

    const checkNewBookings = async () => {
      try {
        const currentBookings = await getBookings();
        if (currentBookings.length > lastBookingCount) {
          const newBookingsCount = currentBookings.length - lastBookingCount;
          if (newBookingsCount > 0 && isMounted) {
            // Ambil booking terbaru
            const latestBookings = currentBookings.slice(0, newBookingsCount);

            latestBookings.forEach((newBooking) => {
              const isNew = !bookings.some((b) => b.id === newBooking.id);
              if (isNew && isMounted) {
                const customer = customers.find(
                  (c) => c.id === newBooking.user_id,
                );
                const barber = barbers.find(
                  (b) => b.id === newBooking.barber_id,
                );

                const bookingDate = new Date(newBooking.booking_date);
                const today = new Date();
                const isToday =
                  bookingDate.toDateString() === today.toDateString();

                showNotification(
                  isToday ? "⚠️ Booking Mendesak!" : "📅 Booking Baru!",
                  `${customer?.full_name || customer?.name || "Pelanggan"} telah booking dengan ${barber?.name || "barber"} pada ${formatDateOnlyWIB(newBooking.booking_date)} ${formatTimeWIB(newBooking.booking_date)} WIB`,
                  newBooking,
                  isToday,
                );
              }
            });

            if (isMounted) {
              setBookings(currentBookings);
            }
          }
        }
        if (isMounted) {
          setLastBookingCount(currentBookings.length);
        }
      } catch (error) {
        console.error("Error checking new bookings:", error);
      }
    };

    // Cek setiap 30 detik sebagai fallback
    const interval = setInterval(checkNewBookings, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [lastBookingCount, bookings, customers, barbers, showNotification]);

  // Fetch data
  useEffect(() => {
    fetchAllData();
  }, []);

  // Update lastBookingCount setelah fetch data
  useEffect(() => {
    if (bookings.length > 0) {
      setLastBookingCount(bookings.length);
    }
  }, [bookings]);

  // Fetch booked hours when barber and date selected
  useEffect(() => {
    const fetchBookedHours = async () => {
      if (formData.barber_id && formData.booking_date) {
        try {
          // Konversi ke WIB untuk mendapatkan tanggal yang benar
          const wibDate = toWIB(formData.booking_date);
          const hours = await getBookedHours(formData.barber_id, wibDate);
          setBookedHours(hours);
        } catch (error) {
          console.error("Error fetching booked hours:", error);
        }
      }
    };

    fetchBookedHours();
  }, [formData.barber_id, formData.booking_date]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [bookingsData, barbersData, customersData] = await Promise.all([
        getBookings(),
        getBarbers(),
        getProfiles(),
      ]);

      setBookings(bookingsData || []);
      setBarbers(barbersData || []);
      setCustomers(customersData || []);
      setLastBookingCount(bookingsData?.length || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data", {
        description: "Silakan coba lagi nanti",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate booking code
  const generateBookingCode = () => {
    const now = nowInWIB();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `BK${year}${month}${day}${random}`;
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

  // Handle date change
  const handleDateChange = async (date) => {
    if (date) {
      // Date dari calendar adalah UTC, kita perlu konversi ke WIB
      const selectedDateUTC = new Date(date);

      // Konversi ke WIB untuk mendapatkan tanggal yang benar
      const selectedDateWIB = toWIB(selectedDateUTC);

      // Reset jam ke 00:00 WIB
      selectedDateWIB.setHours(0, 0, 0, 0);

      const nowWIB = nowInWIB();

      // Set default time ke jam 09:00 WIB atau jam berikutnya jika hari ini
      let hours = 9;

      // Cek apakah tanggal yang dipilih hari ini (berdasarkan WIB)
      const isToday = selectedDateWIB.toDateString() === nowWIB.toDateString();

      if (isToday) {
        // Set default ke jam berikutnya (tidak bisa sebelum sekarang)
        const nextHour = nowWIB.getHours() + 1;
        if (nextHour <= 23) {
          hours = nextHour;
        } else {
          toast.error("Tidak ada slot tersedia untuk hari ini", {
            description:
              "Semua jam hari ini sudah lewat. Silakan pilih tanggal lain.",
            duration: 3000,
          });
          return;
        }
      }

      // Set jam yang dipilih dalam WIB
      selectedDateWIB.setHours(hours, 0, 0, 0);

      // Konversi ke UTC untuk disimpan di database
      const utcDate = toUTC(selectedDateWIB);

      setFormData((prev) => ({
        ...prev,
        booking_date: utcDate.toISOString(),
      }));

      // Fetch booked hours untuk tanggal ini
      if (formData.barber_id) {
        try {
          const bookedHoursData = await getBookedHours(
            formData.barber_id,
            selectedDateWIB, // Kirim dalam WIB
          );
          setBookedHours(bookedHoursData);

          // Cek apakah jam default sudah dibooking
          if (bookedHoursData.includes(hours)) {
            toast.warning("Jam default sudah dibooking", {
              description: "Silakan pilih jam lain yang tersedia",
              duration: 3000,
            });
          }
        } catch (error) {
          console.error("Error fetching booked hours:", error);
        }
      }
    }
  };

  // Handle time selection
  const handleTimeSelect = async (hour) => {
    if (!formData.booking_date) {
      toast.error("Pilih tanggal terlebih dahulu");
      return;
    }

    // Ambil tanggal dari formData (dalam UTC)
    const currentDateUTC = new Date(formData.booking_date);

    // Konversi ke WIB untuk manipulasi jam
    const currentDateWIB = toWIB(currentDateUTC);

    const selectedHour = parseInt(hour);
    const nowWIB = nowInWIB();

    // Reset tanggal WIB ke 00:00 lalu set jam yang dipilih
    const selectedDateWIB = new Date(currentDateWIB);
    selectedDateWIB.setHours(0, 0, 0, 0);
    selectedDateWIB.setHours(selectedHour, 0, 0, 0);

    // VALIDASI 1: Tidak bisa memilih waktu sebelum sekarang untuk hari ini
    const isToday = selectedDateWIB.toDateString() === nowWIB.toDateString();

    if (isToday) {
      if (selectedHour < nowWIB.getHours()) {
        toast.error("Waktu tidak valid", {
          description: `Tidak bisa memilih jam yang sudah lewat. Sekarang jam ${nowWIB.getHours()}:00 WIB`,
          duration: 3000,
        });
        return;
      }

      if (selectedHour === nowWIB.getHours()) {
        toast.error("Waktu tidak valid", {
          description: "Tidak bisa memilih jam yang sama dengan sekarang",
          duration: 3000,
        });
        return;
      }
    }

    // VALIDASI 2: Cek apakah jam sudah dibooking
    if (bookedHours.includes(selectedHour)) {
      toast.error("Slot tidak tersedia", {
        description: "Barber sudah dibooking di jam ini",
        duration: 3000,
      });
      return;
    }

    // Cek ketersediaan barber (validasi tambahan)
    setCheckingAvailability(true);
    try {
      // Konversi ke UTC untuk cek ke database
      const utcDate = toUTC(selectedDateWIB);

      const isAvailable = await checkBarberAvailability(
        formData.barber_id,
        utcDate.toISOString(),
        selectedBooking?.id,
      );

      if (isAvailable) {
        setFormData((prev) => ({
          ...prev,
          booking_date: utcDate.toISOString(),
        }));
        toast.success(
          `Jam ${selectedHour.toString().padStart(2, "0")}:00 WIB tersedia`,
          {
            duration: 2000,
          },
        );
      } else {
        toast.error("Slot tidak tersedia", {
          description: "Barber sudah dibooking di jam ini",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      toast.error("Gagal cek ketersediaan", {
        description: "Silakan coba lagi",
        duration: 3000,
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      booking_code: generateBookingCode(),
      user_id: "",
      barber_id: "",
      booking_date: "",
      status: "pending",
    });
    setSelectedBooking(null);
    setBookedHours([]);
  };

  // Open edit dialog
  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setFormData({
      booking_code: booking.booking_code || "",
      user_id: booking.user_id || "",
      barber_id: booking.barber_id || "",
      booking_date: booking.booking_date || "",
      status: booking.status || "pending",
    });
    setIsDialogOpen(true);
  };

  // Open detail dialog
  const handleViewDetail = (booking) => {
    setSelectedBookingDetail(booking);
    setIsDetailDialogOpen(true);
  };

  // Handle row click
  const handleRowClick = (booking, e) => {
    // Cek apakah yang diklik adalah tombol aksi (select, button, atau icon)
    const target = e.target;
    const isActionElement =
      target.closest("button") ||
      target.closest("select") ||
      target.closest('[role="combobox"]') ||
      target.closest(".lucide-trash2") ||
      target.closest(".lucide-eye") ||
      target.closest("[data-radix-select-trigger]");

    // Jika bukan elemen aksi, buka detail
    if (!isActionElement) {
      handleViewDetail(booking);
    }
  };

  // Open delete dialog
  const handleDeleteClick = (booking, e) => {
    e.stopPropagation(); // Mencegah row click
    setSelectedBooking(booking);
    setIsDeleteDialogOpen(true);
  };

  // Handle stats card click
  const handleStatsCardClick = (title, status) => {
    let filteredData = [];

    if (status === "all") {
      filteredData = bookings;
    } else {
      filteredData = bookings.filter((booking) => booking.status === status);
    }

    // Sort by date descending
    filteredData.sort(
      (a, b) => new Date(b.booking_date) - new Date(a.booking_date),
    );

    setStatsDialogConfig({
      title,
      status,
      data: filteredData,
    });
    setIsStatsDialogOpen(true);
  };

  // Handle stats row click
  const handleStatsRowClick = (booking, e) => {
    // Cek apakah yang diklik adalah tombol aksi
    const target = e.target;
    const isActionElement = target.closest("button");

    if (!isActionElement) {
      setIsStatsDialogOpen(false);
      handleViewDetail(booking);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validasi
    if (!formData.user_id) {
      toast.error("Pilih pelanggan");
      setIsSubmitting(false);
      return;
    }

    if (!formData.barber_id) {
      toast.error("Pilih barber");
      setIsSubmitting(false);
      return;
    }

    if (!formData.booking_date) {
      toast.error("Pilih tanggal booking");
      setIsSubmitting(false);
      return;
    }

    // VALIDASI TAMBAHAN SEBELUM SUBMIT
    const bookingDateUTC = new Date(formData.booking_date);
    const wibBookingDate = toWIB(bookingDateUTC);
    const bookingHour = wibBookingDate.getHours();
    const nowWIB = nowInWIB();

    // Validasi untuk hari ini
    if (isTodayInWIB(bookingDateUTC)) {
      if (bookingHour < nowWIB.getHours()) {
        toast.error("Waktu booking tidak valid", {
          description: "Tidak bisa memilih jam yang sudah lewat",
          duration: 3000,
        });
        setIsSubmitting(false);
        return;
      }

      if (bookingHour === nowWIB.getHours()) {
        toast.error("Waktu booking tidak valid", {
          description: "Tidak bisa memilih jam yang sama dengan sekarang",
          duration: 3000,
        });
        setIsSubmitting(false);
        return;
      }
    }

    // Cek apakah jam sudah dibooking
    if (bookedHours.includes(bookingHour)) {
      toast.error("Slot tidak tersedia", {
        description: "Barber sudah dibooking di jam ini",
        duration: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    // Cek ketersediaan ke database
    try {
      const isAvailable = await checkBarberAvailability(
        formData.barber_id,
        formData.booking_date,
        selectedBooking?.id,
      );

      if (!isAvailable) {
        toast.error("Slot tidak tersedia", {
          description:
            "Barber sudah dibooking di jam ini. Silakan pilih jam lain.",
          duration: 4000,
        });
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      toast.error("Gagal memverifikasi ketersediaan", {
        description: "Silakan coba lagi",
        duration: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    // Lanjutkan submit jika semua validasi lolos
    try {
      const bookingData = {
        ...formData,
        booking_date: new Date(formData.booking_date).toISOString(),
      };

      let result;
      if (selectedBooking) {
        result = await updateBooking(selectedBooking.id, bookingData);
        if (result) {
          toast.success("Berhasil memperbarui booking", {
            description: `Booking ${result.booking_code} telah diperbarui`,
            duration: 3000,
          });
        }
      } else {
        result = await createBooking(bookingData);
        if (result) {
          toast.success("Berhasil menambahkan booking", {
            description: `Booking ${result.booking_code} telah ditambahkan`,
            duration: 3000,
          });

          // Notifikasi untuk booking baru yang dibuat oleh admin
          const customer = customers.find((c) => c.id === result.user_id);
          const barber = barbers.find((b) => b.id === result.barber_id);

          const bookingDate = new Date(result.booking_date);
          const today = new Date();
          const isToday = bookingDate.toDateString() === today.toDateString();

          showNotification(
            isToday ? "⚠️ Booking Mendesak (Admin)" : "📝 Booking Ditambahkan",
            `Admin menambahkan booking untuk ${customer?.full_name || customer?.name || "pelanggan"} dengan ${barber?.name || "barber"}`,
            result,
            isToday,
          );
        }
      }

      if (result) {
        setIsDialogOpen(false);
        resetForm();
        fetchAllData();
      }
    } catch (error) {
      console.error("Error saving booking:", error);
      toast.error("Gagal menyimpan data", {
        description: error.message || "Terjadi kesalahan",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete booking
  const handleDelete = async () => {
    if (!selectedBooking) return;

    try {
      const result = await deleteBooking(selectedBooking.id);
      if (result) {
        toast.success("Berhasil menghapus booking", {
          description: `Booking ${selectedBooking.booking_code} telah dihapus`,
          duration: 3000,
        });
        setIsDeleteDialogOpen(false);
        setSelectedBooking(null);
        fetchAllData();
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Gagal menghapus booking", {
        description: error.message || "Terjadi kesalahan",
        duration: 3000,
      });
    }
  };

  // Update status
  const handleStatusUpdate = async (booking, newStatus, e) => {
    e?.stopPropagation(); // Mencegah row click

    try {
      const result = await updateBooking(booking.id, {
        ...booking,
        status: newStatus,
      });

      if (result) {
        toast.success(
          `Status berhasil diubah menjadi ${getStatusText(newStatus)}`,
          {
            duration: 3000,
          },
        );
        fetchAllData();

        // Notifikasi untuk perubahan status (opsional)
        if (newStatus === "confirmed") {
          showNotification(
            "✅ Booking Dikonfirmasi",
            `Booking ${booking.booking_code} telah dikonfirmasi`,
            booking,
            false,
          );
        } else if (newStatus === "completed") {
          showNotification(
            "🎉 Booking Selesai",
            `Booking ${booking.booking_code} telah selesai`,
            booking,
            false,
          );
        } else if (newStatus === "cancelled") {
          showNotification(
            "❌ Booking Dibatalkan",
            `Booking ${booking.booking_code} telah dibatalkan`,
            booking,
            false,
          );
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Gagal mengubah status", {
        description: error.message || "Terjadi kesalahan",
        duration: 3000,
      });
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Filter bookings
  const filterBookings = () => {
    let filtered = [...bookings];

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.booking_code
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          getCustomerName(booking.user_id)
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          getBarberName(booking.barber_id)
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.booking_date).toDateString();
        return bookingDate === filterDate;
      });
    }

    filtered.sort(
      (a, b) => new Date(b.booking_date) - new Date(a.booking_date),
    );

    return filtered;
  };

  // Get customer name by ID
  const getCustomerName = (userId) => {
    const customer = customers.find((c) => c.id === userId);
    return (
      customer?.full_name || customer?.name || customer?.email || "Unknown"
    );
  };

  // Get barber name by ID
  const getBarberName = (barberId) => {
    const barber = barbers.find((b) => b.id === barberId);
    return barber?.name || "Unknown";
  };

  // Get barber details by ID
  const getBarberDetails = (barberId) => {
    return barbers.find((b) => b.id === barberId) || null;
  };

  // Get customer details by ID
  const getCustomerDetails = (userId) => {
    return customers.find((c) => c.id === userId) || null;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return {
          class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          text: "Pending",
        };
      case "confirmed":
        return {
          class: "bg-blue-500/10 text-blue-500 border-blue-500/20",
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          text: "Dikonfirmasi",
        };
      case "completed":
        return {
          class: "bg-green-500/10 text-green-500 border-green-500/20",
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          text: "Selesai",
        };
      case "cancelled":
        return {
          class: "bg-red-500/10 text-red-500 border-red-500/20",
          icon: <XCircle className="h-3 w-3 mr-1" />,
          text: "Dibatalkan",
        };
      default:
        return {
          class: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
          icon: null,
          text: status,
        };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Dikonfirmasi";
      case "completed":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  // Get initial for avatar
  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const filteredBookings = filterBookings();

  // Stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed",
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status === "completed",
  ).length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === "cancelled",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header dengan Notifikasi */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Bookings</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Kelola daftar booking pelanggan
          </p>
        </div>

        {/* Notifikasi Bell */}
        <div className="flex items-center gap-2">
          {/* Tombol Notifikasi */}
          <Popover open={showNotifications} onOpenChange={setShowNotifications}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700/50"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 p-0 bg-zinc-900 border-zinc-800"
              align="end"
            >
              <div className="flex items-center justify-between p-3 border-b border-zinc-800">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-amber-500" />
                  Notifikasi
                  {unreadCount > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-red-500/10 text-red-500 border-red-500/20 text-xs"
                    >
                      {unreadCount} baru
                    </Badge>
                  )}
                </h3>
                <div className="flex gap-1">
                  {notifications.length > 0 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        onClick={markAllAsRead}
                        title="Tandai semua telah dibaca"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        onClick={clearAllNotifications}
                        title="Hapus semua notifikasi"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        "p-3 border-b border-zinc-800 hover:bg-zinc-800/50 cursor-pointer transition-colors",
                        !notif.read && notif.urgent && "bg-red-500/10",
                        !notif.read && !notif.urgent && "bg-amber-500/5",
                      )}
                      onClick={() => {
                        markAsRead(notif.id);
                        setShowNotifications(false);
                        handleViewDetail(notif.booking);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              notif.read
                                ? "bg-zinc-600"
                                : notif.urgent
                                  ? "bg-red-500 animate-pulse"
                                  : "bg-amber-500 animate-pulse",
                            )}
                          />
                        </div>
                        <div className="flex-1">
                          <p
                            className={cn(
                              "text-sm font-medium",
                              notif.urgent ? "text-red-400" : "text-white",
                            )}
                          >
                            {notif.title}
                          </p>
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            {formatRelativeWIB(notif.timestamp)}
                          </p>
                        </div>
                        {notif.urgent && (
                          <Badge
                            variant="outline"
                            className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] px-1"
                          >
                            Mendesak
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">
                      Tidak ada notifikasi
                    </p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Stats Cards - Dengan klik handler */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card
          className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl cursor-pointer hover:bg-zinc-800/50 transition-colors"
          onClick={() => handleStatsCardClick("Semua Booking", "all")}
        >
          <CardContent className="p-4">
            <p className="text-sm text-zinc-400">Total</p>
            <p className="text-2xl font-bold text-white mt-1">
              {totalBookings}
            </p>
          </CardContent>
        </Card>
        <Card
          className="border-zinc-800 bg-yellow-500/5 backdrop-blur-xl cursor-pointer hover:bg-yellow-500/10 transition-colors"
          onClick={() => handleStatsCardClick("Booking Pending", "pending")}
        >
          <CardContent className="p-4">
            <p className="text-sm text-yellow-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-500 mt-1">
              {pendingBookings}
            </p>
          </CardContent>
        </Card>
        <Card
          className="border-zinc-800 bg-blue-500/5 backdrop-blur-xl cursor-pointer hover:bg-blue-500/10 transition-colors"
          onClick={() =>
            handleStatsCardClick("Booking Dikonfirmasi", "confirmed")
          }
        >
          <CardContent className="p-4">
            <p className="text-sm text-blue-400">Dikonfirmasi</p>
            <p className="text-2xl font-bold text-blue-500 mt-1">
              {confirmedBookings}
            </p>
          </CardContent>
        </Card>
        <Card
          className="border-zinc-800 bg-green-500/5 backdrop-blur-xl cursor-pointer hover:bg-green-500/10 transition-colors"
          onClick={() => handleStatsCardClick("Booking Selesai", "completed")}
        >
          <CardContent className="p-4">
            <p className="text-sm text-green-400">Selesai</p>
            <p className="text-2xl font-bold text-green-500 mt-1">
              {completedBookings}
            </p>
          </CardContent>
        </Card>
        <Card
          className="border-zinc-800 bg-red-500/5 backdrop-blur-xl cursor-pointer hover:bg-red-500/10 transition-colors"
          onClick={() =>
            handleStatsCardClick("Booking Dibatalkan", "cancelled")
          }
        >
          <CardContent className="p-4">
            <p className="text-sm text-red-400">Dibatalkan</p>
            <p className="text-2xl font-bold text-red-500 mt-1">
              {cancelledBookings}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Cari berdasarkan kode booking, pelanggan, atau barber..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-600 focus:ring-amber-600/20"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48 bg-zinc-800/50 border-zinc-700 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full lg:w-48 justify-start text-left font-normal border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700/50",
                    !dateFilter && "text-zinc-500",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter
                    ? formatDateOnlyWIB(dateFilter)
                    : "Filter Tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                  className="bg-zinc-800 text-white"
                />
                {dateFilter && (
                  <div className="p-2 border-t border-zinc-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDateFilter(null)}
                      className="w-full text-zinc-400 hover:text-white hover:bg-zinc-700"
                    >
                      Reset Filter
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* Refresh Button */}
            <Button
              variant="outline"
              onClick={fetchAllData}
              className="border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700/50 hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-zinc-400">Kode Booking</TableHead>
                  <TableHead className="text-zinc-400">Pelanggan</TableHead>
                  <TableHead className="text-zinc-400">Barber</TableHead>
                  <TableHead className="text-zinc-400">
                    Tanggal Booking (WIB)
                  </TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400 text-right">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="border-zinc-800">
                      <TableCell>
                        <Skeleton className="h-4 w-24 bg-zinc-800" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full bg-zinc-800" />
                          <Skeleton className="h-4 w-32 bg-zinc-800" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full bg-zinc-800" />
                          <Skeleton className="h-4 w-32 bg-zinc-800" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32 bg-zinc-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full bg-zinc-800" />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded bg-zinc-800" />
                          <Skeleton className="h-8 w-8 rounded bg-zinc-800" />
                          <Skeleton className="h-8 w-8 rounded bg-zinc-800" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => {
                    const status = getStatusBadge(booking.status);
                    const customer = getCustomerDetails(booking.user_id);
                    const barber = getBarberDetails(booking.barber_id);

                    return (
                      <TableRow
                        key={booking.id}
                        className="border-zinc-800 hover:bg-zinc-800/50 cursor-pointer transition-colors"
                        onClick={(e) => handleRowClick(booking, e)}
                      >
                        <TableCell>
                          <span className="font-mono text-sm font-medium text-amber-500">
                            {booking.booking_code}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border border-zinc-700">
                              <AvatarImage src={customer?.avatar} />
                              <AvatarFallback className="bg-zinc-800 text-xs">
                                {getInitials(
                                  customer?.full_name ||
                                    customer?.name ||
                                    customer?.email,
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-white text-sm">
                                {customer?.full_name ||
                                  customer?.name ||
                                  "Unknown"}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {customer?.email || ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border border-zinc-700">
                              <AvatarImage src={barber?.image} />
                              <AvatarFallback className="bg-zinc-800 text-xs">
                                {getInitials(barber?.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-white text-sm">
                              {barber?.name || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-white text-sm">
                              {formatDateOnlyWIB(booking.booking_date)}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {formatTimeWIB(booking.booking_date)} WIB
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "border flex items-center w-fit",
                              status.class,
                            )}
                          >
                            {status.icon}
                            {status.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className="flex justify-end gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Select
                              value={booking.status}
                              onValueChange={(value) =>
                                handleStatusUpdate(booking, value)
                              }
                            >
                              <SelectTrigger className="h-8 w-24 bg-zinc-800/50 border-zinc-700 text-white text-xs">
                                <SelectValue placeholder="Ubah Status" />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">
                                  Konfirmasi
                                </SelectItem>
                                <SelectItem value="completed">
                                  Selesai
                                </SelectItem>
                                <SelectItem value="cancelled">Batal</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(booking);
                              }}
                              className="text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {/* <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(booking);
                              }}
                              className="text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button> */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleDeleteClick(booking, e)}
                              className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-zinc-500"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <CalendarIcon className="h-12 w-12 text-zinc-600" />
                        <div>
                          <p className="text-lg font-medium text-white mb-1">
                            Tidak ada data booking
                          </p>
                          <p className="text-sm">
                            {searchTerm || statusFilter !== "all" || dateFilter
                              ? "Coba gunakan filter lain"
                              : "Tidak ada data booking yang tersedia"}
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

      {/* Stats Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-zinc-900 pb-4 border-b border-zinc-800 z-10">
            <DialogTitle className="text-xl font-bold text-white flex items-center justify-between">
              <span>{statsDialogConfig.title}</span>
              <Badge
                variant="outline"
                className={cn(
                  "border",
                  statsDialogConfig.status === "all" &&
                    "bg-zinc-500/10 text-zinc-500",
                  statsDialogConfig.status === "pending" &&
                    "bg-yellow-500/10 text-yellow-500",
                  statsDialogConfig.status === "confirmed" &&
                    "bg-blue-500/10 text-blue-500",
                  statsDialogConfig.status === "completed" &&
                    "bg-green-500/10 text-green-500",
                  statsDialogConfig.status === "cancelled" &&
                    "bg-red-500/10 text-red-500",
                )}
              >
                {statsDialogConfig.data.length} Data
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Daftar booking dengan status{" "}
              {statsDialogConfig.title.toLowerCase()}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {statsDialogConfig.data.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableHead className="text-zinc-400">
                        Kode Booking
                      </TableHead>
                      <TableHead className="text-zinc-400">Pelanggan</TableHead>
                      <TableHead className="text-zinc-400">Barber</TableHead>
                      <TableHead className="text-zinc-400">
                        Tanggal (WIB)
                      </TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400 text-right">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statsDialogConfig.data.map((booking) => {
                      const status = getStatusBadge(booking.status);
                      const customer = getCustomerDetails(booking.user_id);
                      const barber = getBarberDetails(booking.barber_id);

                      return (
                        <TableRow
                          key={booking.id}
                          className="border-zinc-800 hover:bg-zinc-800/50 cursor-pointer transition-colors"
                          onClick={(e) => handleStatsRowClick(booking, e)}
                        >
                          <TableCell>
                            <span className="font-mono text-sm font-medium text-amber-500">
                              {booking.booking_code}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6 border border-zinc-700">
                                <AvatarImage src={customer?.avatar} />
                                <AvatarFallback className="bg-zinc-800 text-xs">
                                  {getInitials(
                                    customer?.full_name ||
                                      customer?.name ||
                                      customer?.email,
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white text-sm">
                                {customer?.full_name ||
                                  customer?.name ||
                                  "Unknown"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6 border border-zinc-700">
                                <AvatarImage src={barber?.image} />
                                <AvatarFallback className="bg-zinc-800 text-xs">
                                  {getInitials(barber?.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white text-sm">
                                {barber?.name || "Unknown"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-white text-sm">
                                {formatDateOnlyWIB(booking.booking_date)}
                              </span>
                              <span className="text-xs text-zinc-500">
                                {formatTimeWIB(booking.booking_date)} WIB
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "border flex items-center w-fit",
                                status.class,
                              )}
                            >
                              {status.icon}
                              {status.text}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setIsStatsDialogOpen(false);
                                  handleViewDetail(booking);
                                }}
                                className="text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500">
                <div className="flex flex-col items-center gap-3">
                  <CalendarIcon className="h-12 w-12 text-zinc-600" />
                  <div>
                    <p className="text-lg font-medium text-white mb-1">
                      Tidak ada data booking
                    </p>
                    <p className="text-sm">
                      Tidak ada booking dengan status{" "}
                      {statsDialogConfig.title.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="sticky bottom-0 bg-zinc-900 pt-4 border-t border-zinc-800">
            <Button
              variant="outline"
              onClick={() => setIsStatsDialogOpen(false)}
              className="border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700/50"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - HANYA UNTUK EDIT, BUKAN TAMBAH */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-zinc-900 pb-4 border-b border-zinc-800 z-10">
            <DialogTitle className="text-xl font-bold text-white">
              Edit Booking
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Edit informasi booking yang sudah ada
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Booking Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Kode Booking
              </label>
              <Input
                name="booking_code"
                value={formData.booking_code}
                onChange={handleInputChange}
                placeholder="Otomatis dibuat"
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-600"
                readOnly
              />
            </div>

            {/* Customer Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Pelanggan <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.user_id}
                onValueChange={(value) => handleSelectChange("user_id", value)}
              >
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white focus:border-amber-600">
                  <SelectValue placeholder="Pilih pelanggan" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white max-h-60">
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.full_name || customer.name || customer.email}{" "}
                      {customer.role === "admin" ? "(Admin)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Barber Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Barber <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.barber_id}
                onValueChange={(value) => {
                  handleSelectChange("barber_id", value);
                  setBookedHours([]);
                }}
              >
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white focus:border-amber-600">
                  <SelectValue placeholder="Pilih barber" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white max-h-60">
                  {barbers
                    .filter((barber) => barber.status === "active")
                    .map((barber) => (
                      <SelectItem key={barber.id} value={barber.id}>
                        {barber.name} - {barber.specialty || "General"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Booking Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Tanggal Booking (WIB) <span className="text-red-500">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700/50",
                      !formData.booking_date && "text-zinc-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.booking_date ? (
                      formatToWIB(formData.booking_date, "dd MMM yyyy HH:mm") +
                      " WIB"
                    ) : (
                      <span>Pilih tanggal dan waktu</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                  <Calendar
                    mode="single"
                    selected={
                      formData.booking_date
                        ? new Date(formData.booking_date)
                        : undefined
                    }
                    onSelect={handleDateChange}
                    initialFocus
                    disabled={(date) => {
                      const today = nowInWIB();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                    className="bg-zinc-800 text-white"
                    classNames={{
                      day_selected:
                        "bg-amber-600 text-white hover:bg-amber-600",
                      day_today: "bg-amber-600/20 text-amber-500",
                      day_disabled: "text-zinc-700 cursor-not-allowed",
                    }}
                  />
                  {formData.booking_date && formData.barber_id && (
                    <div className="p-3 border-t border-zinc-700">
                      <p className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pilih Waktu (WIB):
                      </p>

                      {/* Dropdown 24 Jam */}
                      <Select
                        value={
                          formData.booking_date
                            ? getHourWIB(formData.booking_date).toString()
                            : "9"
                        }
                        onValueChange={handleTimeSelect}
                        disabled={checkingAvailability}
                      >
                        <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue placeholder="Pilih jam" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700 text-white max-h-60">
                          {Array.from({ length: 24 }, (_, i) => i).map(
                            (hour) => {
                              const date = formData.booking_date
                                ? new Date(formData.booking_date)
                                : new Date();
                              const isToday = isTodayInWIB(date);
                              const isBooked = bookedHours.includes(hour);
                              const isPast =
                                isToday && hour < nowInWIB().getHours();
                              const isSelected =
                                formData.booking_date &&
                                getHourWIB(formData.booking_date) === hour;

                              // Format jam dengan leading zero
                              const hourFormatted = hour
                                .toString()
                                .padStart(2, "0");

                              return (
                                <SelectItem
                                  key={hour}
                                  value={hour.toString()}
                                  disabled={isBooked || isPast}
                                  className={cn(
                                    "text-white focus:bg-amber-600/20",
                                    isBooked &&
                                      "text-red-500/50 cursor-not-allowed",
                                    isPast &&
                                      "text-zinc-600 cursor-not-allowed",
                                    isSelected &&
                                      !isBooked &&
                                      !isPast &&
                                      "bg-amber-600/20 text-amber-500",
                                  )}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>{hourFormatted}:00 WIB</span>
                                    {isBooked && (
                                      <span className="text-xs text-red-500 ml-2">
                                        (Sudah dibooking)
                                      </span>
                                    )}
                                    {isPast && !isBooked && (
                                      <span className="text-xs text-zinc-500 ml-2">
                                        (Sudah lewat)
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            },
                          )}
                        </SelectContent>
                      </Select>

                      {/* Informasi Tambahan */}
                      {checkingAvailability && (
                        <div className="mt-2 text-xs text-amber-500 flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Mengecek ketersediaan...
                        </div>
                      )}

                      {isTodayInWIB(formData.booking_date) && (
                        <div className="mt-2 text-xs text-amber-500 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                          <p>
                            ⚠️ Hari ini hanya bisa memilih jam yang belum lewat
                          </p>
                          <p className="text-zinc-400 mt-1">
                            Sekarang: {formatTimeWIB(new Date())} WIB
                          </p>
                        </div>
                      )}

                      {/* Legend */}
                      <div className="mt-3 flex flex-wrap gap-3 text-xs border-t border-zinc-700 pt-3">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-zinc-800 border border-zinc-700 rounded"></div>
                          <span className="text-zinc-400">Tersedia</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-amber-600/20 border border-amber-600/20 rounded"></div>
                          <span className="text-zinc-400">Dipilih</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-500/20 border border-red-500/20 rounded"></div>
                          <span className="text-zinc-400">Sudah dibooking</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-zinc-700 rounded"></div>
                          <span className="text-zinc-400">
                            Waktu sudah lewat
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white focus:border-amber-600">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="sticky bottom-0 bg-zinc-900 pt-4 border-t border-zinc-800">
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
                disabled={isSubmitting || checkingAvailability}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-zinc-900 pb-4 border-b border-zinc-800 z-10">
            <DialogTitle className="text-xl font-bold text-white">
              Detail Booking
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Informasi lengkap booking pelanggan
            </DialogDescription>
          </DialogHeader>

          {selectedBookingDetail && (
            <div className="space-y-6 py-4">
              {/* Booking Code & Status */}
              <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div>
                  <p className="text-sm text-zinc-400">Kode Booking</p>
                  <p className="text-2xl font-mono font-bold text-amber-500">
                    {selectedBookingDetail.booking_code}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "border px-3 py-1",
                    getStatusBadge(selectedBookingDetail.status).class,
                  )}
                >
                  {getStatusBadge(selectedBookingDetail.status).icon}
                  {getStatusBadge(selectedBookingDetail.status).text}
                </Badge>
              </div>

              {/* Tanggal & Waktu Booking */}
              <div className="space-y-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-amber-500" />
                  Informasi Booking
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
                  <div className="col-span-2">
                    <p className="text-xs text-zinc-500 mb-1">
                      Tanggal Booking (WIB)
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-white text-lg font-semibold">
                        {formatDateOnlyWIB(selectedBookingDetail.booking_date)}
                      </span>
                      <span className="text-sm text-amber-500 font-medium">
                        {formatTimeWIB(selectedBookingDetail.booking_date)} WIB
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Dibuat Pada</p>
                    <p className="text-sm text-white">
                      {selectedBookingDetail.created_at
                        ? formatToWIB(
                            selectedBookingDetail.created_at,
                            "dd MMM yyyy HH:mm",
                          ) + " WIB"
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Terakhir Diupdate</p>
                    <p className="text-sm text-white">
                      {selectedBookingDetail.updated_at
                        ? formatToWIB(
                            selectedBookingDetail.updated_at,
                            "dd MMM yyyy HH:mm",
                          ) + " WIB"
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-500" />
                  Informasi Pelanggan
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
                  {(() => {
                    const customer = getCustomerDetails(
                      selectedBookingDetail.user_id,
                    );
                    return (
                      <>
                        <div className="col-span-2 flex items-center gap-3 pb-2 border-b border-zinc-700 mb-2">
                          <Avatar className="h-10 w-10 border border-zinc-700">
                            <AvatarImage src={customer?.avatar} />
                            <AvatarFallback className="bg-zinc-800">
                              {getInitials(
                                customer?.full_name ||
                                  customer?.name ||
                                  customer?.email,
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">
                              {customer?.full_name ||
                                customer?.name ||
                                "Unknown"}
                            </p>
                            <p className="text-xs text-zinc-500">
                              ID: {customer?.id || "-"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Email</p>
                          <p className="text-sm text-white break-all">
                            {customer?.email || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">No. Telepon</p>
                          <p className="text-sm text-white">
                            {customer?.no_telp || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Role</p>
                          <p className="text-sm text-white capitalize">
                            {customer?.role || "-"}
                          </p>
                        </div>
                        {customer?.address && (
                          <div className="col-span-2">
                            <p className="text-xs text-zinc-500">Alamat</p>
                            <p className="text-sm text-white">
                              {customer.address}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Barber Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-amber-500" />
                  Informasi Barber
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
                  {(() => {
                    const barber = getBarberDetails(
                      selectedBookingDetail.barber_id,
                    );
                    return (
                      <>
                        <div className="col-span-2 flex items-center gap-3 pb-2 border-b border-zinc-700 mb-2">
                          <Avatar className="h-10 w-10 border border-zinc-700">
                            <AvatarImage src={barber?.image} />
                            <AvatarFallback className="bg-zinc-800">
                              {getInitials(barber?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">
                              {barber?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-zinc-500">
                              ID: {barber?.id || "-"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Spesialis</p>
                          <p className="text-sm text-white">
                            {barber?.specialty || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Pengalaman</p>
                          <p className="text-sm text-white">
                            {barber?.experience
                              ? `${barber.experience} tahun`
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Rating</p>
                          <p className="text-sm text-white flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            {barber?.rating?.toFixed(1) || "0.0"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Status</p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "mt-1",
                              barber?.status === "active"
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20",
                            )}
                          >
                            {barber?.status === "active"
                              ? "Aktif"
                              : "Tidak Aktif"}
                          </Badge>
                        </div>
                        {barber?.bio && (
                          <div className="col-span-2">
                            <p className="text-xs text-zinc-500">Bio</p>
                            <p className="text-sm text-white">{barber.bio}</p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-zinc-900 pt-4 border-t border-zinc-800 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700/50"
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
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
              Hapus Booking
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Apakah Anda yakin ingin menghapus booking dengan kode{" "}
              <span className="font-semibold text-white">
                {selectedBooking?.booking_code}
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
