import { apiFetch } from "@/app/lib/api";

// Función que verifica el rol del usuario autenticado
export async function checkUserRole() {
  try {
    const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    if (!jwt) return null;

    const user = await apiFetch("/users/me");
    return user?.role || null;
  } catch (err) {
    console.error("Error al verificar el rol:", err);
    return null;
  }
}
