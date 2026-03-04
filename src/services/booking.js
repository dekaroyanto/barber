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

// Check if slot is available
export const isSlotAvailable = async (barberId, dateTime) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("id")
      .eq("barber_id", barberId)
      .eq("booking_date", dateTime)
      .in("status", ["pending", "confirmed"]); // Booking aktif

    if (error) throw error;
    return { available: data.length === 0, error: null };
  } catch (error) {
    return { available: false, error };
  }
};

// Check available slots with current time validation
export const checkAvailableSlots = async (barberId, date) => {
  try {
    const selectedDate = new Date(date);
    const now = new Date();

    // Set time boundaries
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all bookings for the day
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("booking_date")
      .eq("barber_id", barberId)
      .in("status", ["pending", "confirmed"])
      .gte("booking_date", startOfDay.toISOString())
      .lte("booking_date", endOfDay.toISOString());

    if (error) throw error;

    // Generate time slots (9 AM - 8 PM)
    const allSlots = [];
    const isToday = selectedDate.toDateString() === now.toDateString();

    for (let hour = 9; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hour, minute, 0, 0);

        // Skip if time is in the past (for today only)
        if (isToday && slotTime <= now) {
          continue;
        }

        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        allSlots.push({
          time: timeString,
          datetime: slotTime.toISOString(),
          available: true,
        });
      }
    }

    // Mark booked slots as unavailable
    const bookedSlots = bookings.map((booking) => {
      const bookingDate = new Date(booking.booking_date);
      return `${bookingDate.getHours().toString().padStart(2, "0")}:${bookingDate.getMinutes().toString().padStart(2, "0")}`;
    });

    const availableSlots = allSlots.map((slot) => ({
      ...slot,
      available: !bookedSlots.includes(slot.time),
    }));

    return { data: availableSlots, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
