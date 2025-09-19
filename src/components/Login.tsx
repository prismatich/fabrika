import { Button, Checkbox, Input } from "@heroui/react";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, isLoading, error, clearError } = useAuthStore();

  // Limpiar errores cuando el componente se monta
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Limpiar errores previos
    
    if (!email || !password) {
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      // Redirigir al dashboard o página principal
      window.location.href = '/admin';
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

          {/* Mostrar error si existe */}
          {error && (
            <div className="w-full max-w-sm mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
            {/* Input Email */}
            <Input
              type="email"
              label="Email"
              placeholder="Escribe tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-3 focus:ring-2 focus:ring-blue-400"
              variant="flat"
              radius="sm"
              isRequired
            />
            <Input
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Escribe tu contraseña"
              className="w-full rounded-xl border border-gray-300 px-3 py-3 focus:ring-2 focus:ring-blue-400"
              variant="flat"
              radius="sm"
              isRequired
            />
            <div className="flex items-center space-x-2">
              <Checkbox 
                radius="sm" 
                color="default" 
                className="text-gray-600"
                isSelected={rememberMe}
                onValueChange={setRememberMe}
              >
                Recordar
              </Checkbox>
            </div>
            <Button
              type="submit"
              className="w-full p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
              variant="solid"
              radius="sm"
              isLoading={isLoading}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? "Iniciando sesión..." : "Ingresar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

