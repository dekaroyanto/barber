"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/services/auth";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const role = await getUserRole();
      if (role !== "admin") {
        router.push("/login");
      }
    };
    check();
  }, []);

  return <div>Dashboard Admin</div>;
}
