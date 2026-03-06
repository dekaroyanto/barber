// services/barbers.js
import { supabase } from "@/lib/supabase";

export async function getBarbers() {
  try {
    const { data, error } = await supabase
      .from("barbers")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching barbers:", error);
    return [];
  }
}

export async function getBarberById(id) {
  try {
    const { data, error } = await supabase
      .from("barbers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching barber:", error);
    return null;
  }
}

export async function getActiveBarbers() {
  try {
    const { data, error } = await supabase
      .from("barbers")
      .select("*")
      .eq("status", "active")
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching active barbers:", error);
    return [];
  }
}

// Create new barber
export async function createBarber(barberData) {
  try {
    const { data, error } = await supabase
      .from("barbers")
      .insert([
        {
          ...barberData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating barber:", error);
    throw error;
  }
}

// Update barber
export async function updateBarber(id, barberData) {
  try {
    const { data, error } = await supabase
      .from("barbers")
      .update({
        ...barberData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating barber:", error);
    throw error;
  }
}

// Delete barber
export async function deleteBarber(id) {
  try {
    const { error } = await supabase.from("barbers").delete().eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting barber:", error);
    throw error;
  }
}

// Update barber rating
export async function updateBarberRating(id, rating) {
  try {
    const { data, error } = await supabase
      .from("barbers")
      .update({
        rating,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating barber rating:", error);
    throw error;
  }
}

// Increment total bookings
export async function incrementBarberBookings(id) {
  try {
    // First get current total_bookings
    const { data: barber, error: fetchError } = await supabase
      .from("barbers")
      .select("total_bookings")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Increment by 1
    const newTotal = (barber?.total_bookings || 0) + 1;

    const { data, error } = await supabase
      .from("barbers")
      .update({
        total_bookings: newTotal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error incrementing barber bookings:", error);
    throw error;
  }
}

// Upload barber image to Supabase Storage
export async function uploadBarberImage(file, barberId) {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${barberId}-${Date.now()}.${fileExt}`;
    const filePath = `barbers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("barber-images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("barber-images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

// Delete barber image from storage
export async function deleteBarberImage(imageUrl) {
  try {
    if (!imageUrl) return true;

    // Extract file path from URL
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `barbers/${fileName}`;

    const { error } = await supabase.storage
      .from("barber-images")
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}
