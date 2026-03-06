// services/profiles.js
import { supabase } from "@/lib/supabase";

// Get all profiles
export async function getProfiles() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
}

// Get profile by ID
export async function getProfileById(id) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

// Get customers only
export async function getCustomers() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "pelanggan")
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

// Update profile
export async function updateProfile(id, profileData) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}
