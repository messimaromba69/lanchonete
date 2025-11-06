import { useNavigate } from "react-router-dom";

export default function Select() {
  const navigate = useNavigate();

  return (
      
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">
      
      <h1 className="text-4xl font-bold mb-8">Selecione a Unidade</h1>

      <div className="flex flex-col space-y-4 w-64">
        <button
          onClick={() => navigate("/sesc")}
          className="border border-blue-600 text-white text-lg font-semibold py-4 rounded-xl bg-blue-600 transition"
        >
          SESC
        </button>

        <button
          onClick={() => navigate("/senac")}
          className="border border-blue-600 text-white text-lg font-semibold py-4 rounded-xl bg-blue-600 transition"
        >
          SENAC
        </button>
      </div>
    </div>
  );
}
