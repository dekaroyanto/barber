import { supabase } from "@/lib/supabase";

// Ambil semua barbers
export async function getBarbers() {
  try {
    const { data, error } = await supabase
      .from("barbers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching barbers:", error);
    return { data: null, error };
  }
}

// Ambil testimoni (jika ada tabel testimonials)
export async function getTestimonials() {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select(
        `
        *,
        users:user_id (name, email),
        barbers:barber_id (name)
      `,
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return { data: null, error };
  }
}

// Ambil layanan (jika ada tabel services)
export async function getServices() {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching services:", error);
    return { data: null, error };
  }
}

// Ambil informasi barbershop (jika ada tabel shop_info)
export async function getShopInfo() {
  try {
    const { data, error } = await supabase
      .from("shop_info")
      .select("*")
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching shop info:", error);
    return { data: null, error };
  }
}
