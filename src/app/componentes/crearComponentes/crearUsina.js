"use client";

import { useState, useEffect } from "react";
import { apiFetch, apiUpload } from "@/app/lib/api";

export default function CrearUsina() {
  const [nombre, setNombre] = useState("");
  const [carrera, setCarrera] = useState("");
  const [link, setLink] = useState("");
  const [imagen, setImagen] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleToggleFormulario = () => {
    setMostrarFormulario(!mostrarFormulario);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Subir imagen
      const formData = new FormData();
      formData.append("file", imagen);

      const uploadData = await apiUpload(formData);
      const mediaId = uploadData?.data?.id;

      if (!mediaId) throw new Error("Error al subir la imagen.");

      await apiFetch(`/usinas`, {
        method: "POST",
        body: JSON.stringify({
          nombre,
          carrera,
          link,
          mediaId,
        }),
      });

      // Limpiar formulario
      setNombre("");
      setCarrera("");
      setLink("");
      setImagen(null);
      setMostrarFormulario(false);
    } catch (error) {
      console.error(error);
    }
  };

  // 🔒 Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (mostrarFormulario) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mostrarFormulario]);

  return (
    <div className="usina-contenedor">
      <div className="usina-rectangulo" onClick={handleToggleFormulario}>
        <span className="usina-signo-mas">+</span>
      </div>

      {mostrarFormulario && (
        <>
          {/* 🔵 Overlay con blur */}
          <div
            className="usina-overlay"
            onClick={() => setMostrarFormulario(false)}
          ></div>

          {/* 🔵 Modal */}
          <div className="usina-modal">
            <button
              type="button"
              className="usina-cerrar"
              onClick={() => setMostrarFormulario(false)}
            >
              ×
            </button>

            <form onSubmit={handleSubmit} className="usina-formulario">
              <h2 className="usina-titulo">Agregar nueva usina</h2>

              <div className="usina-grupo">
                <label className="usina-etiqueta">Nombre Completo</label>
                <input
                  className="usina-input"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="usina-grupo">
                <label className="usina-etiqueta">Carrera</label>
                <input
                  className="usina-input"
                  type="text"
                  value={carrera}
                  onChange={(e) => setCarrera(e.target.value)}
                  required
                />
              </div>

              <div className="usina-grupo">
                <label className="usina-etiqueta">Contacto</label>
                <input
                  className="usina-input"
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required
                />
              </div>

              <div className="usina-grupo">
                <label className="usina-etiqueta">Trabajo</label>
                <input
                  className="usina-input"
                  type="file"
                  onChange={(e) => setImagen(e.target.files[0])}
                  accept="image/*"
                  required
                />
              </div>

              <button type="submit" className="usina-boton">
                Crear Usina
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
