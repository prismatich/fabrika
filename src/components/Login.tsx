import { Button, Checkbox, Input } from "@heroui/react";
import React from "react";

const Login: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado ✅");
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-l from-[#0D1215] via-[#3C2865] via-[#653792] via-[#475AA5] to-[#2497B4]">
      <div className="flex w-[900px] h-[500px] rounded-4xl overflow-hidden shadow-2xl bg-white">
        {/* Panel izquierdo: Imagen */}
        <div
          className="flex-1"
          style={{
            backgroundImage: "url('/login.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        {/* Panel derecho: Formulario */}
        <div className="flex-1 flex flex-col justify-center items-center p-8">
          <h1 className="text-4xl font-bold mb-8 text-gray-800">Login</h1>

          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
            {/* Input Usuario */}
            <Input
              type="text"
              label="Usuario"
              placeholder="Escribe tu nombre de usuario"
              className="w-full rounded-xl border border-gray-300 px-3 py-3 focus:ring-2 focus:ring-blue-400"
              variant="flat"
              radius="sm"
            />

            {/* Input Contraseña */}
            <Input
              type="password"
              label="Contraseña"
              placeholder="Escribe tu contraseña"
              className="w-full rounded-xl border border-gray-300 px-3 py-3 focus:ring-2 focus:ring-blue-400"
              variant="flat"
              radius="sm"
            />

            {/* Checkbox Recordar */}
            <div className="flex items-center space-x-2">
              <Checkbox  radius="sm" color="default" className="text-gray-600">
                Recordar
              </Checkbox>
            </div>

            {/* Botón Ingresar */}
            <Button
              type="submit"
              className="w-full p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition"
              variant="solid"
              radius="sm"
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
