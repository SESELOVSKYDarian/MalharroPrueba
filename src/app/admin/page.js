"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { apiFetch, apiUpload, toAbsoluteURL } from "@/app/lib/api";

const SECTIONS = [
  { id: "slider", title: "Slider principal" },
  { id: "agenda", title: "Agenda" },
  { id: "usina", title: "Usina" },
  { id: "documentos", title: "Documentos" },
  { id: "textos", title: "Textos" },
  { id: "acordeon", title: "Acordeón de carreras" },
];

const INITIAL_STATE = {
  slider: null,
  agendas: [],
  usinas: [],
  documentos: [],
  textos: [],
  acordeon: null,
};

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
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>
      <input className="form-control" type="file" accept={accept} onChange={handleChange} />
      {helper && <small className="form-text text-muted">{helper}</small>}
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

function UploadHelper() {
  const [lastUpload, setLastUpload] = useState(null);
  return (
    <>
      <FileUpload
        label="Seleccionar archivo"
        helper="Se aceptan imágenes y PDF. Recordá copiar el ID generado para asociarlo en cada formulario."
        accept="image/*,application/pdf"
        onUpload={(media) => setLastUpload(media)}
      />
      {lastUpload && (
        <div className="alert alert-success mt-3" role="alert">
          Archivo cargado con éxito. Guardá este ID: <strong>{lastUpload.id}</strong>
        </div>
      )}
    </>
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
        <label className="form-label">Título</label>
        <input name="titulo" className="form-control" required />
      </div>
      <div className="col-md-6">
        <label className="form-label">Orden</label>
        <input name="order" type="number" defaultValue={0} className="form-control" />
      </div>
      <div className="col-12">
        <label className="form-label">Contenido</label>
        <textarea name="contenido" className="form-control" rows={3} required />
      </div>
      <div className="col-md-6">
        <label className="form-label">Color de fondo</label>
        <input name="color" className="form-control" placeholder="#FFFFFF" />
      </div>
      <div className="col-12 d-flex justify-content-end">
        <button className="btn btn-primary">Agregar elemento</button>
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

  const loadAll = async () => {
    const [sliderRes, agendasRes, usinasRes, docsRes, textosRes, acordeonRes] = await Promise.all([
      apiFetch("/slider"),
      apiFetch("/agendas"),
      apiFetch("/usinas"),
      apiFetch("/documentos"),
      apiFetch("/textos"),
      apiFetch("/acordeones/carreras").catch(() => null),
    ]);

    setState({
      slider: sliderRes?.data || null,
      agendas: agendasRes?.data || [],
      usinas: usinasRes?.data || [],
      documentos: docsRes?.data || [],
      textos: textosRes?.data || [],
      acordeon: acordeonRes?.data || null,
    });
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    apiFetch("/users/me")
      .then(async (currentUser) => {
        if (!currentUser || currentUser.role !== "Administrador") {
          setError("Necesitás permisos de administrador para acceder a este panel.");
          return;
        }
        setUser(currentUser);
        await loadAll();
      })
      .catch((err) => {
        console.error(err);
        if (err?.status === 401) {
          localStorage.removeItem("jwt");
          router.replace("/login");
          return;
        }
        let friendly = "No fue posible validar tu sesión.";
        if (err?.message === "Token inválido") {
          friendly = "Tu sesión expiró. Iniciá sesión nuevamente.";
        } else if (err?.message?.toLowerCase().includes("fetch")) {
          friendly = "No pudimos conectarnos al servidor. Verificá que el backend esté en ejecución.";
        } else if (err?.message) {
          friendly = err.message;
        }
        setError(friendly);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = async () => {
    try {
      await loadAll();
    } catch (err) {
      console.error(err);
      alert("No se pudieron refrescar los datos");
    }
  };

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
      alert(err.message || "No se pudo guardar el documento");
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

  const updateTexto = async (textKey, contenido) => {
    try {
      await apiFetch(`/textos/${textKey}`, { method: "PUT", body: JSON.stringify({ contenido }) });
      await refresh();
    } catch (err) {
      alert(err.message || "No se pudo actualizar el texto");
    }
  };

  const saveAccordionItem = async (item) => {
    try {
      await apiFetch(`/acordeones/carreras`, { method: "PUT", body: JSON.stringify(item) });
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

  const renderSlider = () => {
    const slider = state.slider;
    if (!slider) return <p className="text-muted">Aún no se cargaron slides.</p>;

    return (
      <>
        <div className="row g-3 mb-4">
          {slider.slides?.map((slide) => (
            <div className="col-md-6" key={slide.id}>
              <div className="card border-0 shadow-sm h-100">
                {slide.image?.url && (
                  <img src={toAbsoluteURL(slide.image.url)} alt={slide.headline || "Slide"} className="card-img-top" />
                )}
                <div className="card-body">
                  <label className="form-label">Título</label>
                  <input
                    defaultValue={slide.headline || ""}
                    className="form-control mb-2"
                    onBlur={(event) => updateSlide({ ...slide, headline: event.target.value })}
                  />
                  <label className="form-label">Descripción</label>
                  <textarea
                    defaultValue={slide.body || ""}
                    className="form-control mb-2"
                    rows={3}
                    onBlur={(event) => updateSlide({ ...slide, body: event.target.value })}
                  />
                  <div className="row g-2">
                    <div className="col-4">
                      <label className="form-label">Orden</label>
                      <input
                        type="number"
                        defaultValue={slide.order}
                        className="form-control"
                    onBlur={(event) => updateSlide({ ...slide, order: safeNumber(event.target.value, slide.order) })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label">Etiqueta CTA</label>
                      <input
                        defaultValue={slide.ctaLabel || ""}
                        className="form-control"
                        onBlur={(event) => updateSlide({ ...slide, ctaLabel: event.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label">URL CTA</label>
                      <input
                        defaultValue={slide.ctaUrl || ""}
                        className="form-control"
                        onBlur={(event) => updateSlide({ ...slide, ctaUrl: event.target.value })}
                      />
                    </div>
                  </div>
                  <label className="form-label mt-3">ID de media</label>
                  <input
                    defaultValue={slide.image?.id || slide.mediaId || ""}
                    className="form-control"
                    onBlur={(event) => updateSlide({ ...slide, mediaId: safeNumber(event.target.value, slide.mediaId) })}
                  />
                </div>
                <div className="card-footer bg-white border-0 text-end">
                  <button className="btn btn-outline-danger btn-sm" onClick={() => deleteSlide(slide.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="h5 fw-bold">Agregar slide</h3>
        <form className="row g-3" onSubmit={handleCreateSlide}>
          <div className="col-md-6">
            <label className="form-label">Título</label>
            <input name="headline" className="form-control" placeholder="Título principal" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Orden</label>
            <input name="order" type="number" className="form-control" defaultValue={slider.slides?.length || 0} />
          </div>
          <div className="col-12">
            <label className="form-label">Descripción</label>
            <textarea name="body" className="form-control" rows={3} placeholder="Texto descriptivo" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Etiqueta CTA</label>
            <input name="ctaLabel" className="form-control" placeholder="Texto del botón" />
          </div>
          <div className="col-md-6">
            <label className="form-label">URL CTA</label>
            <input name="ctaUrl" className="form-control" placeholder="https://" />
          </div>
          <div className="col-12">
            <label className="form-label">ID de media subida</label>
            <input name="mediaId" className="form-control" placeholder="Ej: 12" required />
            <small className="form-text text-muted">Utilizá el ID generado en la caja lateral de carga de archivos.</small>
          </div>
          <div className="col-12 d-flex justify-content-end">
            <button className="btn btn-primary">Crear slide</button>
          </div>
        </form>
      </>
    );
  };

  const renderAgenda = () => (
    <>
      <p className="text-muted">Eventos destacados mostrados en la sección agenda.</p>
      <div className="table-responsive mb-4">
        <table className="table align-middle">
          <thead>
            <tr>
              <th style={{ minWidth: 100 }}>Fecha</th>
              <th style={{ minWidth: 180 }}>Título</th>
              <th>Descripción</th>
              <th style={{ minWidth: 120 }}>ID media</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {state.agendas.map((agenda) => (
              <tr key={agenda.id}>
                <td>
                  <input
                    defaultValue={agenda.fecha}
                    className="form-control form-control-sm"
                    onBlur={(event) => updateAgenda({ ...agenda, fecha: event.target.value })}
                  />
                </td>
                <td>
                  <input
                    defaultValue={agenda.tituloActividad}
                    className="form-control form-control-sm"
                    onBlur={(event) => updateAgenda({ ...agenda, tituloActividad: event.target.value })}
                  />
                </td>
                <td>
                  <textarea
                    defaultValue={agenda.contenidoActividad || ""}
                    className="form-control form-control-sm"
                    rows={2}
                    onBlur={(event) => updateAgenda({ ...agenda, contenidoActividad: event.target.value })}
                  />
                </td>
                <td>
                  <input
                    defaultValue={agenda.imagen?.id || agenda.mediaId || ""}
                    className="form-control form-control-sm"
                  onBlur={(event) => updateAgenda({ ...agenda, mediaId: safeNumber(event.target.value, agenda.mediaId) })}
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

      <h3 className="h5 fw-bold">Agregar evento</h3>
      <form className="row g-3" onSubmit={handleCreateAgenda}>
        <div className="col-md-3">
          <label className="form-label">Fecha</label>
          <input name="fecha" className="form-control" placeholder="Ej: 12 NOV" required />
        </div>
        <div className="col-md-9">
          <label className="form-label">Título</label>
          <input name="titulo" className="form-control" placeholder="Título del evento" required />
        </div>
        <div className="col-12">
          <label className="form-label">Descripción</label>
          <textarea name="descripcion" className="form-control" rows={2} placeholder="Detalle opcional" />
        </div>
        <div className="col-md-6">
          <label className="form-label">ID de media</label>
          <input name="mediaId" className="form-control" placeholder="ID de imagen" required />
        </div>
        <div className="col-12 d-flex justify-content-end">
          <button className="btn btn-primary">Agregar evento</button>
        </div>
      </form>
    </>
  );

  const renderUsina = () => (
    <>
      <div className="row g-3 mb-4">
        {state.usinas.map((usina) => (
          <div className="col-md-6" key={usina.id}>
            <div className="card border-0 shadow-sm h-100">
              {usina.imagen?.url && (
                <img src={toAbsoluteURL(usina.imagen.url)} alt={usina.nombre} className="card-img-top" />
              )}
              <div className="card-body">
                <label className="form-label">Nombre</label>
                <input
                  defaultValue={usina.nombre}
                  className="form-control mb-2"
                  onBlur={(event) => updateUsina({ ...usina, nombre: event.target.value })}
                />
                <label className="form-label">Carrera</label>
                <input
                  defaultValue={usina.carrera}
                  className="form-control mb-2"
                  onBlur={(event) => updateUsina({ ...usina, carrera: event.target.value })}
                />
                <label className="form-label">Link</label>
                <input
                  defaultValue={usina.link}
                  className="form-control mb-2"
                  onBlur={(event) => updateUsina({ ...usina, link: event.target.value })}
                />
                <label className="form-label">ID de media</label>
                <input
                  defaultValue={usina.imagen?.id || usina.mediaId || ""}
                  className="form-control"
                  onBlur={(event) => updateUsina({ ...usina, mediaId: safeNumber(event.target.value, usina.mediaId) })}
                />
              </div>
              <div className="card-footer bg-white border-0 text-end">
                <button className="btn btn-outline-danger btn-sm" onClick={() => deleteUsina(usina.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="h5 fw-bold">Agregar referente</h3>
      <form className="row g-3" onSubmit={handleCreateUsina}>
        <div className="col-md-4">
          <label className="form-label">Nombre</label>
          <input name="nombre" className="form-control" required />
        </div>
        <div className="col-md-4">
          <label className="form-label">Carrera</label>
          <input name="carrera" className="form-control" required />
        </div>
        <div className="col-md-4">
          <label className="form-label">Link</label>
          <input name="link" className="form-control" placeholder="https://" required />
        </div>
        <div className="col-md-6">
          <label className="form-label">ID de media</label>
          <input name="mediaId" className="form-control" placeholder="ID de imagen" required />
        </div>
        <div className="col-12 d-flex justify-content-end">
          <button className="btn btn-primary">Agregar usina</button>
        </div>
      </form>
    </>
  );

  const renderDocumentos = () => (
    <>
      <div className="table-responsive mb-4">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Título</th>
              <th>Descripción</th>
              <th>Enlace</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {state.documentos.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.titulo}</td>
                <td>{doc.descripcion || "-"}</td>
                <td>
                  {doc.archivo?.url ? (
                    <a href={toAbsoluteURL(doc.archivo.url)} target="_blank" rel="noreferrer">
                      Ver archivo
                    </a>
                  ) : (
                    "Sin archivo"
                  )}
                </td>
                <td className="text-end">
                  <button className="btn btn-outline-danger btn-sm" onClick={() => deleteDocumento(doc.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="h5 fw-bold">Subir documento</h3>
      <form className="row g-3" onSubmit={handleCreateDocumento}>
        <div className="col-md-6">
          <label className="form-label">Título</label>
          <input name="titulo" className="form-control" required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Descripción</label>
          <input name="descripcion" className="form-control" placeholder="Opcional" />
        </div>
        <div className="col-md-6">
          <label className="form-label">ID de media</label>
          <input name="mediaId" className="form-control" placeholder="ID del archivo" required />
        </div>
        <div className="col-12 d-flex justify-content-end">
          <button className="btn btn-primary">Guardar documento</button>
        </div>
      </form>
    </>
  );

  const renderTextos = () => (
    <div className="row g-3">
      {state.textos.map((text) => (
        <div className="col-md-6" key={text.id}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h4 className="h6 text-uppercase text-muted">{text.textKey}</h4>
              <textarea
                defaultValue={text.contenido || ""}
                className="form-control"
                rows={5}
                onBlur={(event) => updateTexto(text.textKey, event.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAcordeon = () => (
    <>
      <div className="row g-3 mb-4">
        {state.acordeon?.items?.map((item) => (
          <div className="col-md-6" key={item.id}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <label className="form-label">Título</label>
                <input
                  defaultValue={item.titulo}
                  className="form-control mb-2"
                  onBlur={(event) => saveAccordionItem({ ...item, titulo: event.target.value })}
                />
                <label className="form-label">Contenido</label>
                <textarea
                  defaultValue={item.contenido}
                  className="form-control mb-2"
                  rows={3}
                  onBlur={(event) => saveAccordionItem({ ...item, contenido: event.target.value })}
                />
                <label className="form-label">Color</label>
                <input
                  defaultValue={item.color || ""}
                  className="form-control mb-2"
                  onBlur={(event) => saveAccordionItem({ ...item, color: event.target.value })}
                />
                <label className="form-label">Orden</label>
                <input
                  type="number"
                  defaultValue={item.order}
                  className="form-control"
                  onBlur={(event) => saveAccordionItem({ ...item, order: safeNumber(event.target.value, item.order) })}
                />
              </div>
              <div className="card-footer bg-white border-0 text-end">
                <button className="btn btn-outline-danger btn-sm" onClick={() => deleteAccordionItem(item.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="h5 fw-bold">Agregar elemento</h3>
      <AccordionForm onSave={saveAccordionItem} />
    </>
  );

  if (loading) {
    return <p className="text-center mt-5">Cargando panel...</p>;
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
    <>
      <Head>
        <title>Panel administrativo Malharro</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />
      </Head>
      <div className="bg-light min-vh-100">
        <header className="bg-dark text-white py-4 shadow-sm">
          <div className="container d-flex align-items-center justify-content-between">
            <div>
              <h1 className="h3 fw-bold mb-0">Panel administrativo Malharro</h1>
              <p className="mb-0 text-secondary">Gestioná contenidos y recursos del sitio institucional.</p>
            </div>
            <div className="text-end">
              <p className="mb-0 fw-semibold">{user?.username}</p>
              <button
                className="btn btn-sm btn-outline-light mt-2"
                onClick={() => {
                  localStorage.removeItem("jwt");
                  router.replace("/login");
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        <main className="container py-5">
          <div className="row g-4">
            <aside className="col-lg-3">
              <nav className="list-group shadow-sm">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    className={`list-group-item list-group-item-action ${
                      activeSection === section.id ? "active" : ""
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
              <div className="card border-0 shadow-sm mt-4">
                <div className="card-body">
                  <h2 className="h6 fw-bold">Cargar archivos</h2>
                  <UploadHelper />
                </div>
              </div>
            </aside>

            <section className="col-lg-9">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                  <h2 className="h5 mb-0">{SECTIONS.find((s) => s.id === activeSection)?.title}</h2>
                  <button className="btn btn-outline-secondary btn-sm" onClick={refresh}>
                    Actualizar datos
                  </button>
                </div>
                <div className="card-body bg-light">{(() => {
                  switch (activeSection) {
                    case "slider":
                      return renderSlider();
                    case "agenda":
                      return renderAgenda();
                    case "usina":
                      return renderUsina();
                    case "documentos":
                      return renderDocumentos();
                    case "textos":
                      return renderTextos();
                    case "acordeon":
                      return renderAcordeon();
                    default:
                      return null;
                  }
                })()}</div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
