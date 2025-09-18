import { API_URL } from "@/app/config";
import { normalizeStrapiData } from "@/app/lib/api";

// Obtiene los textos del acordeón según el ID proporcionado
export async function getAcordeonByAcordeonID(acordeonID) {
  try {
    // Llama a la API de acordeones filtrando por acordeonID y expandiendo relaciones
    const response = await fetch(`${API_URL}/acordeons?filters[acordeonID][$eq]=${(acordeonID)}&populate=*`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const { data } = await response.json();
    const acordeones = normalizeStrapiData(data);
    const acordeon = Array.isArray(acordeones) ? acordeones[0] : acordeones;

    return Array.isArray(acordeon?.textos) ? acordeon.textos : [];

  } catch (error) {
    console.error('Error al obtener acordeon:', error);
    return []; // Devuelve array vacío en caso de error
  }
}
