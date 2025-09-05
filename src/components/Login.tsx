import React from "react";


const Login: React.FC = () => {
  return (
    
    <div className="h-screen w-screen e-screen flex items-center justify-center bg-gradient-to-l from-[#0D1215] via-[#3C2865] via-[#653792] via-[#475AA5] to-[#2497B4]">
      
      
      <div className="flex w-[900px] h-[500px] rounded-4xl overflow-hidden shadow-2xl bg-white">
        <div
          className="flex-1"
          style={{
            backgroundImage: "url('/login.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        <div className="flex-1 flex flex-col justify-center items-center p-5">
          <h1 className="text-4xl font-bold mb-8">Login</h1>

          <form
            className="w-full max-w-sm space-y-5"
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              console.log("Formulario enviado ✅");
            }}
          >
            <div>
              <input
                type="text"
                placeholder="Username"
                aria-placeholder="escribe tu nombre de usuario"
                className="w-full p-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="remember" className="text-gray-600">
                Remember
              </label>
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
