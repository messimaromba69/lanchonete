import { useNavigate } from "react-router-dom";

export default function Select() {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">

      {/* 🔹 Logos no topo */}
      <div className="absolute top-8 w-full flex justify-between px-8">
        <img src="/src/assets/sesc.png" className="w-28" alt="Sesc" />
        <img src="/src/assets/senac.png" className="w-28" alt="Senac" />
      </div>


      {/* 🔹 Título */}
      <h1 className="text-4xl font-semibold text-blue-700 mt-20 mb-8">
        lanchonetes
      </h1>

      {/* 🔹 Botões */}
      <div className="flex flex-col w-[420px] space-y-8">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-700 text-white py-5 rounded-2xl text-2xl font-medium w-full"
        >
          Sesc
        </button>

        <button
          onClick={() => navigate("")}
          className="bg-blue-700 text-white py-5 rounded-2xl text-2xl font-medium w-full"
        >
          Senac
        </button>
      </div>
    </div>
  );
}
