"use client";
import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/app/lib/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });

      localStorage.setItem("jwt", data.jwt);
      toast.success(`Bienvenido, ${data.user.username}!`);
      router.push("/"); // 🔹 redirige al inicio
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="body-inicio-sesion">
      <div className="form-inicio-sesion">
        <h2 className="title-inicio-sesion">Iniciar sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="block form-label">Email o usuario</label>
            <input
              type="text"
              placeholder="Email o usuario"
              className="form-input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="block form-label">Contraseña</label>
            <input
              type="password"
              placeholder="Contraseña"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="form-button">Ingresar</button>
        </form>
        <div className="buttons-container">
          <Link href="/registrar/">
            <button className="return-button">Registrarse</button>
          </Link>
          <Link href="/">
            <button className="return-button">Volver</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
