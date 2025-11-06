import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  // Se você salva o usuário logado, pegue do localStorage. Aqui assumimos que email salvo em 'currentUser'
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    // opcional: limpar carrinhos
    // localStorage.removeItem("carrinhoSesc");
    // localStorage.removeItem("carrinhoSenac");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex items-center justify-between">
      </div>

      <div className="max-w-md mx-auto mt-8 bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mb-4">👤</div>
          <h3 className="text-lg font-semibold mb-2">Perfil</h3>

          <div className="w-full space-y-3">
            <div className="bg-blue-700 text-white rounded px-3 py-2">
              Email: {currentUser?.email || "—"}
            </div>
            <div className="bg-blue-700 text-white rounded px-3 py-2">
              Senha: {currentUser ? "●●●●●●●●" : "—"}
            </div>

            <button onClick={handleLogout} className="w-full bg-yellow-400 py-2 rounded mt-4 font-semibold">
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
