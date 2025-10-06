"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { apiFetch, apiUpload, toAbsoluteURL } from "@/app/lib/api";
import "./admin.css";

const SECTIONS = [
  { id: "slider", title: "Slider principal" },
  { id: "agenda", title: "Agenda" },
  { id: "usina", title: "Usinas" },
  { id: "documentos", title: "Documentos" },
  { id: "imagenes", title: "Imágenes" },
  { id: "textos", title: "Textos" },
  { id: "acordeon", title: "Acordeón de carreras" },
];

const INITIAL_STATE = {
  slider: null,
  agendas: [],
  usinas: [],
  documentos: [],
  imagenes: [],
  textos: [],
  acordeon: null,
  media: [],
};

const MALHARRO_NAV = [
  {
    label: "Carreras",
    children: [
      { label: "Diseño Gráfico", href: "https://malharro.edu.ar/disenografico" },
      { label: "Escenografía", href: "https://malharro.edu.ar/escenografia" },
      { label: "Fotografía", href: "https://malharro.edu.ar/fotografia" },
      { label: "Ilustración", href: "https://malharro.edu.ar/ilustracion" },
      { label: "Medios Audiovisuales", href: "https://malharro.edu.ar/mediosav" },
      { label: "Profesorado", href: "https://malharro.edu.ar/profesorado" },
      { label: "Realizador", href: "https://malharro.edu.ar/realizador" },
    ],
  },
  {
    label: "Institucional",
    children: [
      { label: "Acerca de Malharro", href: "https://malharro.edu.ar/institucional" },
      { label: "Autoridades", href: "https://malharro.edu.ar/institucional/autoridades" },
      { label: "Biblioteca", href: "https://malharro.edu.ar/institucional/biblioteca" },
      { label: "Consejo Académico", href: "https://malharro.edu.ar/institucional/consejo" },
      { divider: true },
      { label: "Cooperadora", href: "https://malharro.edu.ar/institucional/cooperadora" },
      { label: "Docentes", href: "https://malharro.edu.ar/institucional/docentes" },
      { label: "Nuestros Estudiantes", href: "https://malharro.edu.ar/institucional/estudiantes" },
      { label: "Pasantías", href: "https://malharro.edu.ar/institucional/pasantias" },
      { label: "Planimetría", href: "https://malharro.edu.ar/institucional/planimetria" },
    ],
  },
  {
    label: "Estudiantes",
    children: [
      { label: "Convivencia", href: "https://malharro.edu.ar/estudiantes/convivencia" },
      { label: "Documentación", href: "https://malharro.edu.ar/estudiantes/documentacion" },
      { label: "Títulos", href: "https://malharro.edu.ar/estudiantes/titulos" },
    ],
  },
  {
    label: "Ciclo 2025",
    children: [
      { label: "Horarios", href: "https://malharro.edu.ar/ciclo2025/horarios" },
      { label: "Licencias docentes", href: "https://malharro.edu.ar/ciclo2025/licencias" },
      { label: "Mesas de examen", href: "https://malharro.edu.ar/ciclo2025/mesas" },
    ],
  },
  {
    label: "Talleres",
    children: [
      { label: "Jóvenes - Adultos", href: "https://malharro.edu.ar/talleres/adultos" },
      { label: "Infancias - Adolescentes", href: "https://malharro.edu.ar/talleres/infancias" },
    ],
  },
  { label: "Preguntas frecuentes", href: "https://malharro.edu.ar/faq" },
  { label: "CAMPUS", href: "https://esavmamalharro-bue.infd.edu.ar/aula/acceso.cgi" },
];

function FileUpload({ label, helper, accept = "image/*", onUpload }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadResponse = await apiUpload(formData);
      onUpload?.(uploadResponse?.data);
    } catch (error) {
      console.error(error);
      alert("No fue posible subir el archivo. Intentá nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="form-label fw-semibold text-uppercase small text-white-50">{label}</label>
      <input className="form-control form-control-lg bg-dark-subtle border-0" type="file" accept={accept} onChange={handleChange} />
      {helper && <small className="d-block mt-2 text-white-50">{helper}</small>}
      {preview && (
        <div className="mt-3">
          {accept.startsWith("image") ? (
            <img src={preview} alt="Vista previa" className="img-fluid rounded" />
          ) : (
            <span className="badge bg-secondary">Archivo seleccionado</span>
          )}
        </div>
      )}
      {uploading && <p className="text-muted small mt-2">Subiendo archivo...</p>}
    </div>
  );
}

function UploadHelper({ onUploaded }) {
  const [lastUpload, setLastUpload] = useState(null);
  return (
    <div className="admin-card dark">
      <h3 className="h6 text-uppercase text-white-50 mb-3">Cargar archivos</h3>
      <FileUpload
        label="Seleccionar archivo"
        helper="Se aceptan imágenes y PDF. Recordá copiar el ID generado para asociarlo en cada formulario."
        accept="image/*,application/pdf"
        onUpload={(media) => {
          setLastUpload(media);
          onUploaded?.(media);
        }}
      />
      {lastUpload && (
        <div className="alert alert-success mt-3" role="alert">
          Archivo cargado con éxito. Guardá este ID: <strong>{lastUpload.id}</strong>
        </div>
      )}
    </div>
  );
}

function MediaSelect({
  label,
  value,
  media,
  helper,
  placeholder = "Elegí un archivo",
  onChange,
  wrapperClassName,
  size = "lg",
}) {
  const key = `${label || "media"}-${value || "none"}`;
  const wrapperClass = wrapperClassName || "mb-3";
  const selectClass = `form-select form-select-${size} bg-dark-subtle border-0`;
  return (
    <div className={wrapperClass}>
      {label && <label className="form-label text-uppercase small text-white-50">{label}</label>}
      <select
        key={key}
        defaultValue={value || ""}
        className={selectClass}
        onChange={(event) => onChange?.(event.target.value ? Number(event.target.value) : null)}
      >
        <option value="">{placeholder}</option>
        {media.map((item) => (
          <option key={item.id} value={item.id}>
            {item.id} · {item.originalName}
          </option>
        ))}
      </select>
      {helper && <small className="d-block mt-1 text-white-50">{helper}</small>}
    </div>
  );
}

function AccordionForm({ onSave }) {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      titulo: form.titulo.value,
      contenido: form.contenido.value,
      color: form.color.value || undefined,
      order: Number(form.order.value) || 0,
    };

    await onSave(payload);
    form.reset();
  };

  return (
    <form className="row g-3" onSubmit={handleSubmit}>
      <div className="col-md-6">
        <label className="form-label text-uppercase small text-white-50">Título</label>
        <input name="titulo" className="form-control form-control-lg bg-dark-subtle border-0" required />
      </div>
      <div className="col-md-6">
        <label className="form-label text-uppercase small text-white-50">Orden</label>
        <input name="order" type="number" defaultValue={0} className="form-control form-control-lg bg-dark-subtle border-0" />
      </div>
      <div className="col-12">
        <label className="form-label text-uppercase small text-white-50">Contenido</label>
        <textarea name="contenido" className="form-control bg-dark-subtle border-0" rows={3} required />
      </div>
      <div className="col-md-6">
        <label className="form-label text-uppercase small text-white-50">Color de fondo</label>
        <input name="color" className="form-control form-control-lg bg-dark-subtle border-0" placeholder="#FFFFFF" />
      </div>
      <div className="col-12 d-flex justify-content-end">
        <button className="btn btn-highlight">Agregar elemento</button>
      </div>
    </form>
  );
}

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState("slider");
  const [state, setState] = useState(INITIAL_STATE);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const safeNumber = (value, fallback) => (value === "" ? fallback : Number(value));

  const refresh = async () => {
    await loadAll();
  };

  const loadAll = async () => {
    const [sliderRes, agendasRes, usinasRes, docsRes, imagenesRes, textosRes, acordeonRes, mediaRes] = await Promise.all([
      apiFetch("/slider"),
      apiFetch("/agendas"),
      apiFetch("/usinas"),
      apiFetch("/documentos"),
      apiFetch("/imagenes"),
      apiFetch("/textos"),
      apiFetch("/acordeones/carreras").catch(() => null),
      apiFetch("/media"),
    ]);

    setState({
      slider: sliderRes?.data || null,
      agendas: agendasRes?.data || [],
      usinas: usinasRes?.data || [],
      documentos: docsRes?.data || [],
      imagenes: imagenesRes?.data || [],
      textos: textosRes?.data || [],
      acordeon: acordeonRes?.data || null,
      media: mediaRes?.data || [],
    });
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const me = await apiFetch("/auth/me");
        if (!me?.data) throw new Error("No fue posible validar tu sesión.");
        setUser(me.data);
        await loadAll();
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || "No fue posible validar tu sesión.");
        localStorage.removeItem("jwt");
        router.replace("/login");
      }
    })();
  }, [router]);

  const handleCreateSlide = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      sliderSlug: "principal",
      headline: form.headline.value,
      body: form.body.value,
      order: Number(form.order.value) || 0,
      ctaLabel: form.ctaLabel.value || undefined,
      ctaUrl: form.ctaUrl.value || undefined,
      mediaId: Number(form.mediaId.value),
    };

    try {
      if (!payload.mediaId) throw new Error("Debes indicar el ID de la imagen subida");
      await apiFetch("/slider/slides", { method: "POST", body: JSON.stringify(payload) });
      form.reset();
      await refresh();
    } catch (err) {
      alert(err.message || "No fue posible crear el slide");
    }
  };

  const updateSlide = async (slide) => {
    try {
      await apiFetch(`/slider/slides/${slide.id}`, { method: "PUT", body: JSON.stringify(slide) });
      await refresh();
    } catch (err) {
      alert(err.message || "No se pudo actualizar el slide");
    }
  };

  const deleteSlide = async (id) => {
    if (!confirm("¿Eliminar este slide?")) return;
    try {
      await apiFetch(`/slider/slides/${id}`, { method: "DELETE" });
      await refresh();
    } catch (err) {
      alert(err.message || "No se pudo eliminar el slide");
    }
  };

  const handleCreateAgenda = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      tituloActividad: form.titulo.value,
      contenidoActividad: form.descripcion.value,
      fecha: form.fecha.value,
      mediaId: Number(form.mediaId.value),
    };

    try {
      await apiFetch("/agendas", { method: "POST", body: JSON.stringify(payload) });
      form.reset();
      await refresh();
    } catch (err) {
      alert(err.message || "No se pudo crear el evento");
    }
  };

  const updateAgenda = async (agenda) => {
    try {
      await apiFetch(`/agendas/${agenda.id}`, { method: "PUT", body: JSON.stringify(agenda) });
      await refresh();
    } catch (err) {
      alert(err.message || "No se pudo actualizar el evento");
    }
  };

  const deleteAgenda = async (id) => {
    if (!confirm("¿Eliminar este evento?")) return;
    try {
      await apiFetch(`/agendas/${id}`, { method: "DELETE" });
      await refresh();
    } catch (err) {
      alert(err.message || "No se pudo eliminar el evento");
    }
  };

  const handleCreateUsina = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      nombre: form.nombre.value,
      carrera: form.carrera.value,
      link: form.link.value,
      mediaId: Number(form.mediaId.value),
    };

    try {
      await apiFetch("/usinas", { method: "POST", body: JSON.stringify(payload) });
      form.reset();
      await refresh();
    } catch (err) {
      alert(err.message || "No se pudo crear la usina");
    }
  };

  const updateUsina = async (usina) => {
    try {
      await apiFetch(`/usinas/${usina.id}`, { method: "PUT", body: JSON.stringify(usina) });
      await refresh();
    } catch (err) {
      alert(err.message || "No se pudo actualizar la usina");
    }
  };

  const deleteUsina = async (id) => {
    if (!confirm("¿Eliminar esta usina?")) return;
    try {
      await apiFetch(`/usinas/${id}`, { method: "DELETE" });
      await refresh();
    } catch (err) {
      alert(err.message || "No se pudo eliminar la usina");
    }
  };

  const handleCreateDocumento = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      titulo: form.titulo.value,
      descripcion: form.descripcion.value,
      mediaId: Number(form.mediaId.value),
    };

    try {
      await apiFetch("/documentos", { method: "POST", body: JSON.stringify(payload) });
      form.reset();
      await refresh();
    } catch (err) {
      alert(err.message || "No se pudo crear el documento");
    }
  };

  const updateDocumento = async (documento) => {
    try {
      await apiFetch(`/documentos/${documento.id}`, { method: "PUT", body: JSON.stringify(documento) });
      await refresh();
    } catch (err) {
      alert(err.message || "No se pudo actualizar el documento");
    }
  };

  const deleteDocumento = async (id) => {
    if (!confirm("¿Eliminar este documento?")) return;
    try {
      await apiFetch(`/documentos/${id}`, { method: "DELETE" });
      await refresh();
    } catch (err) {
      alert(err.message || "No se pudo eliminar el documento");
    }
  };

  const updateTexto = async (key, contenido) => {
    try {
      await apiFetch(`/textos/${key}`, { method: "PUT", body: JSON.stringify({ contenido }) });
      await refresh();
    } catch (err) {
      alert(err.message || "No se pudo actualizar el texto");
    }
  };

  const saveAccordionItem = async (item) => {
    const payload = {
      titulo: item.titulo,
      contenido: item.contenido,
      color: item.color,
      order: item.order,
    };
    try {
      if (item.id) {
        await apiFetch(`/acordeones/carreras/${item.id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/acordeones/carreras", { method: "POST", body: JSON.stringify(payload) });
      }
      await refresh();
    } catch (err) {
      alert(err.message || "No se pudo guardar el elemento del acordeón");
    }
  };

  const deleteAccordionItem = async (id) => {
    if (!confirm("¿Eliminar este elemento?")) return;
    try {
      await apiFetch(`/acordeones/carreras/${id}`, { method: "DELETE" });
      await refresh();
    } catch (err) {
      alert(err.message || "No se pudo eliminar el elemento");
    }
  };

  const saveImageAsset = async ({ imageKey, mediaId, altText }) => {
    if (!mediaId) {
      alert("Debes seleccionar un archivo de imagen antes de guardar.");
      return false;
    }
    try {
      await apiFetch(`/imagenes/${imageKey}`, {
        method: "PUT",
        body: JSON.stringify({ mediaId: Number(mediaId), altText }),
      });
      await refresh();
      return true;
    } catch (err) {
      alert(err.message || "No se pudo actualizar la imagen");
      return false;
    }
  };

  const handleCreateImageAsset = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const imageKey = form.imageKey.value.trim();
    const mediaId = Number(form.mediaId.value);
    const altText = form.altText.value;

    if (!imageKey) {
      alert("Debes indicar un identificador para la imagen");
      return;
    }

    if (!mediaId) {
      alert("Elegí un archivo para asociar a la imagen.");
      return;
    }

    const success = await saveImageAsset({ imageKey, mediaId, altText });
    if (success) {
      form.reset();
    }
  };

  const onUploadFinished = (media) => {
    setState((prev) => ({
      ...prev,
      media: [media, ...prev.media.filter((item) => item.id !== media.id)],
    }));
  };

  const imageMedia = useMemo(() => state.media.filter((item) => item.kind === "image"), [state.media]);
  const documentMedia = useMemo(() => state.media.filter((item) => item.kind === "document"), [state.media]);

  const renderSlider = () => {
    const slider = state.slider;
    if (!slider) return <p className="text-white-50">Aún no se cargaron slides.</p>;

    return (
      <div className="admin-section-card">
        <div id="adminBannerCarousel" className="carousel slide malharro-carousel" data-bs-ride="carousel">
          <div className="carousel-indicators">
            {(slider.slides || []).map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                data-bs-target="#adminBannerCarousel"
                data-bs-slide-to={index}
                className={`indicador ${index === 0 ? "active" : ""}`}
                aria-current={index === 0}
                aria-label={`Slide ${index + 1}`}
              ></button>
            ))}
          </div>
          <div className="carousel-inner">
            {(slider.slides || []).map((slide, index) => (
              <div className={`carousel-item ${index === 0 ? "active" : ""}`} key={slide.id}>
                {slide.image?.url ? (
                  <img src={toAbsoluteURL(slide.image.url)} className="d-block w-100 banner-img" alt={slide.headline || "Slide"} />
                ) : (
                  <div className="placeholder-banner d-flex align-items-center justify-content-center">
                    <span className="text-white-50">Sin imagen asignada</span>
                  </div>
                )}
                <div className="carousel-caption d-flex flex-column justify-content-center align-items-start h-100">
                  <h2 className="textocarrusel fw-bold">{slide.headline}</h2>
                  {slide.ctaLabel && (
                    <a className="btn btn-highlight mt-3" href={slide.ctaUrl || "#"}>
                      {slide.ctaLabel}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="section-subtitle">Editar slides</h3>
          <div className="row g-4">
            {(slider.slides || []).map((slide) => (
              <div className="col-md-6" key={slide.id}>
                <div className="admin-form-card">
                  {slide.image?.url && (
                    <img src={toAbsoluteURL(slide.image.url)} alt={slide.headline || "Slide"} className="img-fluid rounded mb-3" />
                  )}
                  <label className="form-label text-uppercase small text-white-50">Título</label>
                  <input
                    key={`${slide.id}-headline-${slide.headline || ""}`}
                    defaultValue={slide.headline || ""}
                    className="form-control form-control-lg bg-dark-subtle border-0 mb-3"
                    onBlur={(event) => updateSlide({ ...slide, headline: event.target.value })}
                  />
                  <label className="form-label text-uppercase small text-white-50">Descripción</label>
                  <textarea
                    key={`${slide.id}-body-${slide.body || ""}`}
                    defaultValue={slide.body || ""}
                    className="form-control bg-dark-subtle border-0 mb-3"
                    rows={3}
                    onBlur={(event) => updateSlide({ ...slide, body: event.target.value })}
                  />
                  <div className="row g-3">
                    <div className="col-4">
                      <label className="form-label text-uppercase small text-white-50">Orden</label>
                      <input
                        type="number"
                        key={`${slide.id}-order-${slide.order}`}
                        defaultValue={slide.order}
                        className="form-control form-control-lg bg-dark-subtle border-0"
                        onBlur={(event) => updateSlide({ ...slide, order: safeNumber(event.target.value, slide.order) })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label text-uppercase small text-white-50">Etiqueta CTA</label>
                      <input
                        key={`${slide.id}-ctaLabel-${slide.ctaLabel || ""}`}
                        defaultValue={slide.ctaLabel || ""}
                        className="form-control form-control-lg bg-dark-subtle border-0"
                        onBlur={(event) => updateSlide({ ...slide, ctaLabel: event.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label text-uppercase small text-white-50">URL CTA</label>
                      <input
                        key={`${slide.id}-ctaUrl-${slide.ctaUrl || ""}`}
                        defaultValue={slide.ctaUrl || ""}
                        className="form-control form-control-lg bg-dark-subtle border-0"
                        onBlur={(event) => updateSlide({ ...slide, ctaUrl: event.target.value })}
                      />
                    </div>
                  </div>
                  <MediaSelect
                    label="Imagen del slide"
                    value={slide.image?.id || slide.mediaId || ""}
                    media={imageMedia}
                    onChange={(mediaId) => updateSlide({ ...slide, mediaId })}
                    helper="Elegí una imagen subida en el panel lateral."
                  />
                  <div className="text-end">
                    <button className="btn btn-outline-danger btn-sm" onClick={() => deleteSlide(slide.id)}>
                      Eliminar slide
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <h3 className="section-subtitle">Agregar slide</h3>
          <form className="row g-3" onSubmit={handleCreateSlide}>
            <div className="col-md-6">
              <label className="form-label text-uppercase small text-white-50">Título</label>
              <input name="headline" className="form-control form-control-lg bg-dark-subtle border-0" placeholder="Título principal" required />
            </div>
            <div className="col-md-6">
              <label className="form-label text-uppercase small text-white-50">Orden</label>
              <input name="order" type="number" className="form-control form-control-lg bg-dark-subtle border-0" defaultValue={slider.slides?.length || 0} />
            </div>
            <div className="col-12">
              <label className="form-label text-uppercase small text-white-50">Descripción</label>
              <textarea name="body" className="form-control bg-dark-subtle border-0" rows={3} placeholder="Texto descriptivo" />
            </div>
            <div className="col-md-6">
              <label className="form-label text-uppercase small text-white-50">Etiqueta CTA</label>
              <input name="ctaLabel" className="form-control form-control-lg bg-dark-subtle border-0" placeholder="Texto del botón" />
            </div>
            <div className="col-md-6">
              <label className="form-label text-uppercase small text-white-50">URL CTA</label>
              <input name="ctaUrl" className="form-control form-control-lg bg-dark-subtle border-0" placeholder="https://" />
            </div>
            <div className="col-md-6">
              <label className="form-label text-uppercase small text-white-50">Imagen asociada</label>
              <select name="mediaId" className="form-select form-select-lg bg-dark-subtle border-0" required>
                <option value="">Elegí una imagen</option>
                {imageMedia.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id} · {item.originalName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 d-flex justify-content-end">
              <button className="btn btn-highlight">Crear slide</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderAgenda = () => (
    <div className="admin-section-card">
      <p className="text-white-50 mb-4">Eventos destacados mostrados en la sección agenda.</p>
      <div className="table-responsive mb-4">
        <table className="table table-dark table-hover align-middle mb-0">
          <thead>
            <tr>
              <th style={{ minWidth: 100 }}>Fecha</th>
              <th style={{ minWidth: 180 }}>Título</th>
              <th>Descripción</th>
              <th style={{ minWidth: 180 }}>Imagen</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {state.agendas.map((agenda) => (
              <tr key={agenda.id}>
                <td>
                  <input
                    key={`${agenda.id}-fecha-${agenda.fecha}`}
                    defaultValue={agenda.fecha}
                    className="form-control form-control-sm bg-dark-subtle border-0"
                    onBlur={(event) => updateAgenda({ ...agenda, fecha: event.target.value })}
                  />
                </td>
                <td>
                  <input
                    key={`${agenda.id}-titulo-${agenda.tituloActividad}`}
                    defaultValue={agenda.tituloActividad}
                    className="form-control form-control-sm bg-dark-subtle border-0"
                    onBlur={(event) => updateAgenda({ ...agenda, tituloActividad: event.target.value })}
                  />
                </td>
                <td>
                  <textarea
                    key={`${agenda.id}-contenido-${agenda.contenidoActividad || ""}`}
                    defaultValue={agenda.contenidoActividad || ""}
                    className="form-control form-control-sm bg-dark-subtle border-0"
                    rows={2}
                    onBlur={(event) => updateAgenda({ ...agenda, contenidoActividad: event.target.value })}
                  />
                </td>
                <td>
                  <MediaSelect
                    value={agenda.imagen?.id || agenda.mediaId || ""}
                    media={imageMedia}
                    placeholder="Sin imagen"
                    size="sm"
                    wrapperClassName="mb-0"
                    onChange={(mediaId) => updateAgenda({ ...agenda, mediaId })}
                  />
                </td>
                <td className="text-end">
                  <button className="btn btn-outline-danger btn-sm" onClick={() => deleteAgenda(agenda.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="section-subtitle">Agregar evento</h3>
      <form className="row g-3" onSubmit={handleCreateAgenda}>
        <div className="col-md-3">
          <label className="form-label text-uppercase small text-white-50">Fecha</label>
          <input name="fecha" className="form-control form-control-lg bg-dark-subtle border-0" placeholder="Ej: 12 NOV" required />
        </div>
        <div className="col-md-9">
          <label className="form-label text-uppercase small text-white-50">Título</label>
          <input name="titulo" className="form-control form-control-lg bg-dark-subtle border-0" placeholder="Título del evento" required />
        </div>
        <div className="col-12">
          <label className="form-label text-uppercase small text-white-50">Descripción</label>
          <textarea name="descripcion" className="form-control bg-dark-subtle border-0" rows={2} placeholder="Detalle opcional" />
        </div>
        <div className="col-md-6">
          <label className="form-label text-uppercase small text-white-50">Imagen destacada</label>
          <select name="mediaId" className="form-select form-select-lg bg-dark-subtle border-0" required>
            <option value="">Elegí una imagen</option>
            {imageMedia.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} · {item.originalName}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 d-flex justify-content-end">
          <button className="btn btn-highlight">Agregar evento</button>
        </div>
      </form>
    </div>
  );

  const renderUsina = () => (
    <div className="admin-section-card">
      <div className="row g-4 mb-4">
        {state.usinas.map((usina) => (
          <div className="col-md-6" key={usina.id}>
            <div className="admin-form-card">
              {usina.imagen?.url && (
                <img src={toAbsoluteURL(usina.imagen.url)} alt={usina.nombre} className="img-fluid rounded mb-3" />
              )}
              <label className="form-label text-uppercase small text-white-50">Nombre</label>
              <input
                key={`${usina.id}-nombre-${usina.nombre}`}
                defaultValue={usina.nombre}
                className="form-control form-control-lg bg-dark-subtle border-0 mb-3"
                onBlur={(event) => updateUsina({ ...usina, nombre: event.target.value })}
              />
              <label className="form-label text-uppercase small text-white-50">Carrera</label>
              <input
                key={`${usina.id}-carrera-${usina.carrera}`}
                defaultValue={usina.carrera}
                className="form-control form-control-lg bg-dark-subtle border-0 mb-3"
                onBlur={(event) => updateUsina({ ...usina, carrera: event.target.value })}
              />
              <label className="form-label text-uppercase small text-white-50">Link</label>
              <input
                key={`${usina.id}-link-${usina.link}`}
                defaultValue={usina.link}
                className="form-control form-control-lg bg-dark-subtle border-0 mb-3"
                onBlur={(event) => updateUsina({ ...usina, link: event.target.value })}
              />
              <MediaSelect
                label="Imagen"
                value={usina.imagen?.id || usina.mediaId || ""}
                media={imageMedia}
                placeholder="Elegí una imagen"
                onChange={(mediaId) => updateUsina({ ...usina, mediaId })}
              />
              <div className="text-end">
                <button className="btn btn-outline-danger btn-sm" onClick={() => deleteUsina(usina.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-subtitle">Agregar referente</h3>
      <form className="row g-3" onSubmit={handleCreateUsina}>
        <div className="col-md-4">
          <label className="form-label text-uppercase small text-white-50">Nombre</label>
          <input name="nombre" className="form-control form-control-lg bg-dark-subtle border-0" required />
        </div>
        <div className="col-md-4">
          <label className="form-label text-uppercase small text-white-50">Carrera</label>
          <input name="carrera" className="form-control form-control-lg bg-dark-subtle border-0" required />
        </div>
        <div className="col-md-4">
          <label className="form-label text-uppercase small text-white-50">Link</label>
          <input name="link" className="form-control form-control-lg bg-dark-subtle border-0" placeholder="https://" required />
        </div>
        <div className="col-md-6">
          <label className="form-label text-uppercase small text-white-50">Imagen</label>
          <select name="mediaId" className="form-select form-select-lg bg-dark-subtle border-0" required>
            <option value="">Elegí una imagen</option>
            {imageMedia.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} · {item.originalName}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 d-flex justify-content-end">
          <button className="btn btn-highlight">Agregar usina</button>
        </div>
      </form>
    </div>
  );

  const renderDocumentos = () => (
    <div className="admin-section-card">
      <div className="table-responsive mb-4">
        <table className="table table-dark table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Título</th>
              <th>Descripción</th>
              <th>Archivo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {state.documentos.map((documento) => (
              <tr key={documento.id}>
                <td>
                  <input
                    key={`${documento.id}-titulo-${documento.titulo}`}
                    defaultValue={documento.titulo}
                    className="form-control form-control-sm bg-dark-subtle border-0"
                    onBlur={(event) => updateDocumento({ ...documento, titulo: event.target.value })}
                  />
                </td>
                <td>
                  <input
                    key={`${documento.id}-descripcion-${documento.descripcion || ""}`}
                    defaultValue={documento.descripcion || ""}
                    className="form-control form-control-sm bg-dark-subtle border-0"
                    onBlur={(event) => updateDocumento({ ...documento, descripcion: event.target.value })}
                  />
                </td>
                <td>
                  <select
                    key={`${documento.id}-media-${documento.mediaId || ""}`}
                    defaultValue={documento.mediaId || ""}
                    className="form-select form-select-sm bg-dark-subtle border-0"
                    onChange={(event) => updateDocumento({ ...documento, mediaId: Number(event.target.value) })}
                  >
                    <option value="">Elegí un archivo</option>
                    {documentMedia.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.id} · {item.originalName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="text-end">
                  <button className="btn btn-outline-danger btn-sm" onClick={() => deleteDocumento(documento.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="section-subtitle">Subir documento</h3>
      <form className="row g-3" onSubmit={handleCreateDocumento}>
        <div className="col-md-6">
          <label className="form-label text-uppercase small text-white-50">Título</label>
          <input name="titulo" className="form-control form-control-lg bg-dark-subtle border-0" required />
        </div>
        <div className="col-md-6">
          <label className="form-label text-uppercase small text-white-50">Descripción</label>
          <input name="descripcion" className="form-control form-control-lg bg-dark-subtle border-0" placeholder="Opcional" />
        </div>
        <div className="col-md-6">
          <label className="form-label text-uppercase small text-white-50">Archivo</label>
          <select name="mediaId" className="form-select form-select-lg bg-dark-subtle border-0" required>
            <option value="">Elegí un archivo</option>
            {documentMedia.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} · {item.originalName}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 d-flex justify-content-end">
          <button className="btn btn-highlight">Guardar documento</button>
        </div>
      </form>
    </div>
  );

  const renderImagenes = () => (
    <div className="admin-section-card">
      <p className="text-white-50 mb-4">Asociá cada identificador de imagen con un archivo subido.</p>
      <div className="row g-4 mb-4">
        {state.imagenes.map((imagen) => (
          <div className="col-md-6" key={imagen.imageKey}>
            <div className="admin-form-card">
              {imagen.url ? (
                <img src={toAbsoluteURL(imagen.url)} alt={imagen.altText || imagen.imageKey} className="img-fluid rounded mb-3" />
              ) : (
                <div className="placeholder-banner small">
                  <span className="text-white-50">Sin archivo asociado</span>
                </div>
              )}
              <h4 className="h6 text-uppercase text-white-50">{imagen.imageKey}</h4>
              <label className="form-label text-uppercase small text-white-50">Texto alternativo</label>
              <input
                key={`${imagen.imageKey}-alt-${imagen.altText || ""}`}
                defaultValue={imagen.altText || ""}
                className="form-control form-control-lg bg-dark-subtle border-0 mb-3"
                onBlur={(event) => saveImageAsset({ imageKey: imagen.imageKey, mediaId: imagen.mediaId, altText: event.target.value })}
              />
              <MediaSelect
                label="Archivo asociado"
                value={imagen.mediaId || ""}
                media={imageMedia}
                onChange={(mediaId) => saveImageAsset({ imageKey: imagen.imageKey, mediaId, altText: imagen.altText })}
              />
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-subtitle">Registrar nueva imagen</h3>
      <form className="row g-3" onSubmit={handleCreateImageAsset}>
        <div className="col-md-4">
          <label className="form-label text-uppercase small text-white-50">Identificador</label>
          <input name="imageKey" className="form-control form-control-lg bg-dark-subtle border-0" placeholder="Ej: hero-banner" required />
        </div>
        <div className="col-md-4">
          <label className="form-label text-uppercase small text-white-50">Texto alternativo</label>
          <input name="altText" className="form-control form-control-lg bg-dark-subtle border-0" placeholder="Descripción de la imagen" />
        </div>
        <div className="col-md-4">
          <label className="form-label text-uppercase small text-white-50">Archivo</label>
          <select name="mediaId" className="form-select form-select-lg bg-dark-subtle border-0" required>
            <option value="">Elegí una imagen</option>
            {imageMedia.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} · {item.originalName}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 d-flex justify-content-end">
          <button className="btn btn-highlight">Guardar imagen</button>
        </div>
      </form>
    </div>
  );

  const renderTextos = () => (
    <div className="admin-section-card">
      <div className="row g-4">
        {state.textos.map((text) => (
          <div className="col-md-6" key={text.id}>
            <div className="admin-form-card">
              <h4 className="h6 text-uppercase text-white-50">{text.textKey}</h4>
              <textarea
                key={`${text.textKey}-${text.contenido || ""}`}
                defaultValue={text.contenido || ""}
                className="form-control bg-dark-subtle border-0"
                rows={6}
                onBlur={(event) => updateTexto(text.textKey, event.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAcordeon = () => (
    <div className="admin-section-card">
      <div className="row g-4 mb-4">
        {state.acordeon?.items?.map((item) => (
          <div className="col-md-6" key={item.id}>
            <div className="admin-form-card">
              <label className="form-label text-uppercase small text-white-50">Título</label>
              <input
                key={`${item.id}-titulo-${item.titulo}`}
                defaultValue={item.titulo}
                className="form-control form-control-lg bg-dark-subtle border-0 mb-3"
                onBlur={(event) => saveAccordionItem({ ...item, titulo: event.target.value })}
              />
              <label className="form-label text-uppercase small text-white-50">Contenido</label>
              <textarea
                key={`${item.id}-contenido-${item.contenido}`}
                defaultValue={item.contenido}
                className="form-control bg-dark-subtle border-0 mb-3"
                rows={3}
                onBlur={(event) => saveAccordionItem({ ...item, contenido: event.target.value })}
              />
              <label className="form-label text-uppercase small text-white-50">Color</label>
              <input
                key={`${item.id}-color-${item.color || ""}`}
                defaultValue={item.color || ""}
                className="form-control form-control-lg bg-dark-subtle border-0 mb-3"
                onBlur={(event) => saveAccordionItem({ ...item, color: event.target.value })}
              />
              <label className="form-label text-uppercase small text-white-50">Orden</label>
              <input
                type="number"
                key={`${item.id}-order-${item.order}`}
                defaultValue={item.order}
                className="form-control form-control-lg bg-dark-subtle border-0 mb-3"
                onBlur={(event) => saveAccordionItem({ ...item, order: safeNumber(event.target.value, item.order) })}
              />
              <div className="text-end">
                <button className="btn btn-outline-danger btn-sm" onClick={() => deleteAccordionItem(item.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-subtitle">Agregar elemento</h3>
      <AccordionForm onSave={saveAccordionItem} />
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case "slider":
        return renderSlider();
      case "agenda":
        return renderAgenda();
      case "usina":
        return renderUsina();
      case "documentos":
        return renderDocumentos();
      case "imagenes":
        return renderImagenes();
      case "textos":
        return renderTextos();
      case "acordeon":
        return renderAcordeon();
      default:
        return null;
    }
  };

  if (loading) {
    return <p className="text-center mt-5 text-white">Cargando panel...</p>;
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning shadow-sm" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root">
      <Head>
        <title>Panel administrativo Malharro</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />
      </Head>
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossOrigin="anonymous"
      />

      <nav className="navbar navbar-expand-lg navbar-dark malharro-navbar">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="logo-lupa-box d-flex align-items-center bg-highlight p-2 rounded">
            <span className="navbar-brand botonlogo text-uppercase fw-bold">Malharro Admin</span>
          </div>

          <button className="navbar-toggler collapsed p-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
            <div className="menu-box-lg d-flex flex-column px-3 py-2 rounded">
              <button className="btn-close-menu d-lg-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-label="Cerrar menú">
                ×
              </button>
              <ul className="navbar-nav mt-4">
                {MALHARRO_NAV.map((item, index) => (
                  <li className={`nav-item ${item.children ? "dropdown" : ""}`} key={`${item.label}-${index}`}>
                    {item.children ? (
                      <>
                        <a className="nav-link dropdown-toggle texitem" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                          {item.label}
                        </a>
                        <ul className="dropdown-menu">
                          {item.children.map((child, childIndex) =>
                            child.divider ? (
                              <li key={`divider-${childIndex}`}>
                                <hr className="dropdown-divider" />
                              </li>
                            ) : (
                              <li key={`${child.label}-${childIndex}`}>
                                <a className="dropdown-item" href={child.href} target="_blank" rel="noreferrer">
                                  {child.label}
                                </a>
                              </li>
                            ),
                          )}
                        </ul>
                      </>
                    ) : (
                      <a className="nav-link" href={item.href} target="_blank" rel="noreferrer">
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
                <li className="nav-item">
                  <button
                    className="btn btn-highlight ms-lg-3 mt-3 mt-lg-0"
                    onClick={() => {
                      localStorage.removeItem("jwt");
                      router.replace("/login");
                    }}
                  >
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <main className="admin-main container-fluid py-5">
        <div className="row g-5">
          <div className="col-lg-8">
            <header className="mb-5">
              <h1 className="display-6 fw-bold text-gradient">Panel administrativo</h1>
              <p className="lead text-white-50 mb-0">Gestioná cada módulo del sitio con la misma estética de Malharro.</p>
              <div className="d-flex align-items-center gap-3 mt-3 text-white-50">
                <span className="badge bg-highlight text-dark">{user?.role?.name || "Administrador"}</span>
                <span>{user?.username}</span>
              </div>
            </header>

            <div className="section-tabs mb-4">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  className={`section-tab ${activeSection === section.id ? "active" : ""}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.title}
                </button>
              ))}
            </div>

            {renderSectionContent()}
          </div>

          <aside className="col-lg-4">
            <UploadHelper onUploaded={onUploadFinished} />
            <div className="admin-card dark mt-4">
              <h3 className="h6 text-uppercase text-white-50 mb-3">Biblioteca de medios</h3>
              <div className="media-grid">
                {state.media.length === 0 && <p className="text-white-50 mb-0">Aún no hay archivos cargados.</p>}
                {state.media.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="media-tile"
                    onClick={() => navigator.clipboard?.writeText(String(item.id))}
                    title="Copiar ID de media"
                  >
                    {item.kind === "image" ? (
                      <img src={toAbsoluteURL(item.url)} alt={item.originalName} className="img-fluid rounded" />
                    ) : (
                      <div className="document-tile d-flex flex-column justify-content-center align-items-center">
                        <span className="fw-bold">PDF</span>
                        <small className="text-white-50">{item.originalName}</small>
                      </div>
                    )}
                    <span className="badge bg-dark-subtle text-white position-absolute top-0 start-0 m-2">ID {item.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
