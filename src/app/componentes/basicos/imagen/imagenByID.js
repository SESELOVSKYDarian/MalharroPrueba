import { API_URL } from "@/app/config";
import { normalizeStrapiData, toAbsoluteURL } from "@/app/lib/api";

// Obtiene la URL de una imagen a partir de su imagenID
export async function getImagenbyImagenID(ImagenID) {
  try {
    const response = await fetch(`${API_URL}/imagens?filters[imagenID][$eq]=${(ImagenID)}&populate=imagen`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`); // Si la respuesta no es OK, lanza error
    }
    
    const { data } = await response.json();
    const imagenes = normalizeStrapiData(data);
    const imagen = Array.isArray(imagenes) ? imagenes[0]?.imagen : imagenes?.imagen;

    const url =
      toAbsoluteURL(imagen?.formats?.thumbnail?.url) ||
      toAbsoluteURL(imagen?.formats?.medium?.url) ||
      toAbsoluteURL(imagen?.url);

    return url || null; // Devuelve la URL si existe
  } catch (error) {
    console.error('Error al obtener la imagen:', error);
    return null; // En caso de error devuelve null
  }
}
