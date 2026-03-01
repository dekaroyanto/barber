import { supabase } from "@/lib/supabase";

// STEP 5 - Register
export const signUpUser = async ({ name, email, password, no_telp }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return { error };

  // simpan ke tabel profiles
  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    name,
    email,
    no_telp,
    role: "pelanggan",
  });

  if (profileError) return { error: profileError };

  return { success: true };
};

// STEP 6 - Login Email atau No Telp
export const loginUser = async (identifier, password) => {
  let email = identifier;

  // jika angka → cari dari no_telp
  if (/^[0-9]+$/.test(identifier)) {
    const { data, error } = await supabase
      .from("profiles")
      .select("email")
      .eq("no_telp", identifier)
      .single();

    if (error || !data) {
      return { error: { message: "Nomor tidak ditemukan" } };
    }

    email = data.email;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error };

  return { success: true };
};

// STEP 7 - Ambil Role
export const getUserRole = async () => {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  return data?.role;
};

// STEP 10 - Logout
export const logoutUser = async () => {
  await supabase.auth.signOut();
};
