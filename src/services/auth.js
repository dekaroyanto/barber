import { supabase } from "@/lib/supabase";

export async function loginUser(identifier, password) {
  try {
    let email = identifier;

    // If identifier is phone number (contains only digits)
    if (/^\d+$/.test(identifier)) {
      // Get email from users table based on phone number
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("email")
        .eq("no_telp", identifier)
        .single();

      if (userError || !userData) {
        return { error: { message: "Nomor telepon tidak terdaftar" } };
      }

      email = userData.email;
    }

    // Login with email
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error logging in:", error);
    return { error };
  }
}

export async function getUserRole() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return data?.role || "pelanggan";
  } catch (error) {
    console.error("Error getting user role:", error);
    return "pelanggan";
  }
}

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error logging out:", error);
    return { error };
  }
}

export async function registerUser(userData) {
  try {
    // Register auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) throw authError;

    if (authData.user) {
      // Insert user data into users table
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          no_telp: userData.no_telp,
          role: "pelanggan",
          created_at: new Date().toISOString(),
        },
      ]);

      if (profileError) throw profileError;
    }

    return { success: true, data: authData };
  } catch (error) {
    console.error("Error registering user:", error);
    return { error };
  }
}
