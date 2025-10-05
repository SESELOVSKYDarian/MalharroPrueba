import { apiFetch } from "@/app/lib/api";

export async function getTextoByTextoId(textoID) {
  try {
    const { data } = await apiFetch(`/textos/${textoID}`);
    return data?.contenido ?? null;
  } catch (error) {
    console.error("Error al obtener texto:", error);
    return null;
  }
}
