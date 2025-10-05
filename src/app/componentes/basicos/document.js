import { apiFetch } from "@/app/lib/api";

export default async function Document() {
  const { data: documentos } = await apiFetch("/documentos", { cache: "no-store" });

  return (
    <div className="documento">
      {documentos.map((doc) => {
        const titulo = doc.titulo || 'Sin título';
        const archivoUrl = doc.archivo?.url ?? null;

        // Se renderizan todos los links a pdfs
        return (
          <div key={doc.id} style={{ marginBottom: '1rem' }}>
            <h3>{titulo}</h3>
            {archivoUrl ? (
              <>
                <a
                  href={archivoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="documento-boton"
                >
                  Ver documento
                </a>
              </>
            ) : (
              <p>No hay archivo disponible</p>
            )}
          </div>
        );
      })}
    </div>
  );
}