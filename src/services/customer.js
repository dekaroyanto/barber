// services/customer.js
import { supabase } from "@/lib/supabase";

export const getBarbers = async () => {
  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .eq("status", "active")
    .order("name");

  if (error) throw error;
  return data;
};

export const getBookings = async (userId) => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("booking_date", { ascending: true });

  if (error) throw error;
  return data;
};

export const createBooking = async (bookingData) => {
  // Generate booking code
  const bookingCode = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const { data, error } = await supabase
    .from("bookings")
    .insert([{ ...bookingData, booking_code: bookingCode }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateBooking = async (bookingId, bookingData) => {
  const { data, error } = await supabase
    .from("bookings")
    .update(bookingData)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteBooking = async (bookingId) => {
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) throw error;
  return true;
};
