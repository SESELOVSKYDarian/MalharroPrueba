import { apiFetch } from "@/app/lib/api";

// Función reutilizable para guardar cambios en el backend
export const handleSave = async ({ path, payload }) => {
  try {
    const response = await apiFetch(path, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    return response?.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};