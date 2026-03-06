// services/bookings.js
import { supabase } from "@/lib/supabase";

// Get all bookings
export async function getBookings() {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

// Get booking by ID
export async function getBookingById(id) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching booking:", error);
    return null;
  }
}

// Get bookings by user ID
export async function getBookingsByUser(userId) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("booking_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return [];
  }
}

// Get bookings by barber ID
export async function getBookingsByBarber(barberId) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("barber_id", barberId)
      .order("booking_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching barber bookings:", error);
    return [];
  }
}

// Get bookings by date
export async function getBookingsByDate(date) {
  try {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .gte("booking_date", startDate.toISOString())
      .lte("booking_date", endDate.toISOString())
      .order("booking_date");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching bookings by date:", error);
    return [];
  }
}

// Get bookings by status
export async function getBookingsByStatus(status) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", status)
      .order("booking_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching bookings by status:", error);
    return [];
  }
}

// Create new booking
export async function createBooking(bookingData) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          ...bookingData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

// Update booking
export async function updateBooking(id, bookingData) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .update({
        ...bookingData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating booking:", error);
    throw error;
  }
}

// Delete booking
export async function deleteBooking(id) {
  try {
    const { error } = await supabase.from("bookings").delete().eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
}

// Update booking status
export async function updateBookingStatus(id, status) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
}

/**
 * Check barber availability for a specific date and time
 * @param {string} barberId - ID barber
 * @param {string} date - ISO date string (UTC)
 * @param {string} excludeBookingId - Optional booking ID to exclude (for updates)
 * @returns {Promise<boolean>} True if available
 */
export async function checkBarberAvailability(
  barberId,
  date,
  excludeBookingId = null,
) {
  try {
    const bookingDate = new Date(date);

    // Tentukan range waktu +/- 1 jam untuk cek bentrok
    const startTime = new Date(bookingDate);
    startTime.setHours(bookingDate.getHours() - 1);

    const endTime = new Date(bookingDate);
    endTime.setHours(bookingDate.getHours() + 1);

    let query = supabase
      .from("bookings")
      .select("*")
      .eq("barber_id", barberId)
      .in("status", ["pending", "confirmed"])
      .gte("booking_date", startTime.toISOString())
      .lte("booking_date", endTime.toISOString());

    if (excludeBookingId) {
      query = query.neq("id", excludeBookingId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.length === 0;
  } catch (error) {
    console.error("Error checking availability:", error);
    return false;
  }
}

/**
 * Get booked hours for a barber on a specific date
 * @param {string} barberId - ID barber
 * @param {Date} date - Date in WIB
 * @returns {Promise<number[]>} Array of booked hours (0-23) in WIB
 */
export async function getBookedHours(barberId, date) {
  try {
    // date yang diterima adalah dalam WIB
    const wibDate = new Date(date);

    // Buat range untuk tanggal tersebut dalam UTC
    const startDate = new Date(
      Date.UTC(
        wibDate.getFullYear(),
        wibDate.getMonth(),
        wibDate.getDate(),
        0,
        0,
        0,
        0,
      ),
    );

    const endDate = new Date(
      Date.UTC(
        wibDate.getFullYear(),
        wibDate.getMonth(),
        wibDate.getDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const { data, error } = await supabase
      .from("bookings")
      .select("booking_date")
      .eq("barber_id", barberId)
      .in("status", ["pending", "confirmed"])
      .gte("booking_date", startDate.toISOString())
      .lte("booking_date", endDate.toISOString());

    if (error) throw error;

    // Ambil jam dari setiap booking dan konversi ke WIB
    return data.map((booking) => {
      const utcDate = new Date(booking.booking_date);
      // UTC ke WIB: tambah 7 jam
      const wibDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
      return wibDate.getHours();
    });
  } catch (error) {
    console.error("Error getting booked hours:", error);
    return [];
  }
}
