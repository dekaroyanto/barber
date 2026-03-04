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
