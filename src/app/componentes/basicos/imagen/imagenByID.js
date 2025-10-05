import { apiFetch } from "@/app/lib/api";

// Obtiene la URL de una imagen a partir de su imagenID
export async function getImagenbyImagenID(ImagenID) {
  try {
    const { data } = await apiFetch(`/imagenes/${ImagenID}`);
    return data?.url || null;
  } catch (error) {
    console.error('Error al obtener la imagen:', error);
    return null; // En caso de error devuelve null
  }
}
