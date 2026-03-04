import { supabase } from "@/lib/supabase";

// Get all active barbers
export const getBarbers = async () => {
  try {
    const { data, error } = await supabase
      .from("barbers")
      .select("*")
      .eq("status", "active")
      .order("name");

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get barber by ID
export const getBarberById = async (id) => {
  try {
    const { data, error } = await supabase
      .from("barbers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Create new booking
export const createBooking = async (bookingData) => {
  try {
    // Generate booking code (format: BRB + timestamp + random)
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const booking_code = `BRB${timestamp}${random}`;

    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          ...bookingData,
          booking_code,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update total_bookings count for barber
    await supabase.rpc("increment_booking_count", {
      barber_id: bookingData.barber_id,
    });

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get user's bookings
export const getUserBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        barbers (
          name,
          specialty,
          image
        )
      `,
      )
      .eq("user_id", userId)
      .order("booking_date", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Update booking
export const updateBooking = async (id, bookingData) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .update(bookingData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Cancel booking
export const cancelBooking = async (id) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Delete booking (soft delete with status cancelled)
export const deleteBooking = async (id) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Check available slots for a barber on a specific date
export const checkAvailableSlots = async (barberId, date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("booking_date")
      .eq("barber_id", barberId)
      .eq("status", "pending")
      .gte("booking_date", startOfDay.toISOString())
      .lte("booking_date", endOfDay.toISOString());

    if (error) throw error;

    // Generate time slots (9 AM - 8 PM)
    const allSlots = [];
    for (let hour = 9; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        allSlots.push(timeString);
      }
    }

    // Filter out booked slots
    const bookedSlots = bookings.map((booking) => {
      const bookingDate = new Date(booking.booking_date);
      return `${bookingDate.getHours().toString().padStart(2, "0")}:${bookingDate.getMinutes().toString().padStart(2, "0")}`;
    });

    const availableSlots = allSlots.filter(
      (slot) => !bookedSlots.includes(slot),
    );

    return { data: availableSlots, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
