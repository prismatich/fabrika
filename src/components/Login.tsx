import { Button, Checkbox, Input } from "@heroui/react";
import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore"; // Ajusta la ruta si es diferente

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginStore = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error de autenticación");
      }

      // Guarda el usuario y token en Zustand
      loginStore(data.user, data.user.token || data.token);

      // Redirige al dashboard o admin
      window.location.href = "/admin";
    } catch (err: any) {
      alert(err.message || "Fallo al iniciar sesión");
      console.error(err);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-l from-[#0D1215] via-[#3C2865] via-[#653792] via-[#475AA5] to-[#2497B4]">
      <div className="flex w-[900px] h-[500px] rounded-4xl overflow-hidden shadow-2xl bg-white">
        <div
          className="flex-1"
          style={{
            backgroundImage: "url('/login.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        <div className="flex-1 flex flex-col justify-center items-center p-8">
          <h1 className="text-4xl font-bold mb-8 text-gray-800">Login</h1>

          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
            <Input
              type="text"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Escribe tu email"
              className="w-full"
              variant="flat"
              radius="sm"
            />
            <Input
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Escribe tu contraseña"
              className="w-full"
              variant="flat"
              radius="sm"
            />
            <div className="flex items-center space-x-2">
              <Checkbox radius="sm" color="default">
                Recordar
              </Checkbox>
            </div>
            <Button
              type="submit"
              className="w-full p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition"
            >
              Ingresar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

