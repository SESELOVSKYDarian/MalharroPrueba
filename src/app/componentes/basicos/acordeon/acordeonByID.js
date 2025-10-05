import { apiFetch } from "@/app/lib/api";

// Obtiene los textos del acordeón según el ID proporcionado
export async function getAcordeonByAcordeonID(acordeonID) {
  try {
    const { data } = await apiFetch(`/acordeones/${acordeonID}`);
    return data?.items || [];
  } catch (error) {
    console.error('Error al obtener acordeon:', error);
    return [];
  }
}
