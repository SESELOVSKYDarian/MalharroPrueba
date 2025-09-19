import { API_URL } from "@/app/config";
import { normalizeStrapiData } from "@/app/lib/api";

// Función que obtiene un texto desde la API a partir de su textoID
export async function getTextoByTextoId(textoID) {
  try {
    // Realiza una consulta con filtro por textoID, incluyendo relaciones
    const res = await fetch(`${API_URL}/textos?filters[textoID][$eq]=${textoID}&populate=*`);
    
    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }

    const { data } = await res.json();
    const textos = normalizeStrapiData(data);
    const texto = Array.isArray(textos) ? textos[0] : textos;

    return texto || null;
  } catch (err) {
    console.error("Error al obtener texto:", err);
    return null;
  }
}
