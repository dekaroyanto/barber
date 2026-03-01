"use client";

import { useState } from "react";
import { signUpUser } from "@/services/auth";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    no_telp: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await signUpUser(form);

    if (result.error) {
      alert(result.error.message);
    } else {
      alert("Register berhasil");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Nama"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder="No Telp"
        onChange={(e) => setForm({ ...form, no_telp: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button>Register</button>
    </form>
  );
}
