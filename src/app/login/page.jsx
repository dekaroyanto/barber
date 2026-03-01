"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, getUserRole } from "@/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const result = await loginUser(identifier, password);

    if (result.error) {
      alert(result.error.message);
      return;
    }

    const role = await getUserRole();

    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        placeholder="Email atau No Telp"
        onChange={(e) => setIdentifier(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button>Login</button>
    </form>
  );
}
