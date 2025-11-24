import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // ✔ IMPORTAÇÃO FALTANDO
import { supabase } from "../../supabase/supabase";

import fundoSesc from "./assets/sesc.png";
import fundoSenac from "./assets/senac.png";

export default function Profile() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  async function buscarPerfil() {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      alert("Nenhum usuário logado");
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("perfil")
      .select("*")
      .eq("id_user", user.id)
      .maybeSingle();

    if (error) {
      console.log(error);
      alert("Erro ao carregar informações do perfil");
      setPerfil(null);
    } else if (!data) {
      setPerfil(null);
    } else {
      if (data?.data_nascimento) {
        const [ano, mes, dia] = data.data_nascimento.split("-");
        data.data_nascimento = `${dia}/${mes}/${ano}`;
      }

      setPerfil(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    buscarPerfil();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <p className="mt-3 text-gray-700">Carregando perfil...</p>
      </div>
    );

  if (!perfil)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-700 text-lg">Nenhum perfil encontrado</p>

        <button
          className="mt-4 text-blue-600 underline"
          onClick={() => navigate("/editar-perfil")}
        >
          Criar Perfil
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Logos */}
      <div className="flex justify-between px-4 mt-4">
        <img src={fundoSesc} className="w-28" />
        <img src={fundoSenac} className="w-28" />
      </div>

      {/* Voltar */}
      <button onClick={() => navigate(-1)} className="text-black mt-2">
        <ArrowLeft size={28} />
      </button>

      <h1 className="text-center text-4xl font-light text-blue-700 my-6">
        Perfil
      </h1>

      {/* Avatar */}
      <div className="flex justify-center">
        <img
          src={
            perfil.foto ||
            "https://cdn-icons-png.flaticon.com/512/847/847969.png"
          }
          className="w-44 h-44 rounded-full border-4 border-blue-400 object-cover"
        />
      </div>

      {/* Infos */}
      <div className="max-w-md mx-auto mt-6 space-y-3">
        {[
          ["Nome", "nome"],
          ["Telefone", "telefone"],
          ["Sexo", "sexo"],
          ["Nascimento", "data_nascimento"],
          ["CEP", "cep"],
          ["Cidade", "cidade"],
          ["Estado", "estado"],
          ["Rua", "rua"],
          ["Bairro", "bairro"],
          ["Complemento", "complemento"],
        ].map(([label, key]) => (
          <div className="bg-blue-700 text-white rounded p-3" key={key}>
            {label}: {perfil[key] || "—"}
          </div>
        ))}

        {/* Sair */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate("/login");
          }}
          className="w-full bg-yellow-400 text-black py-3 rounded mt-6 font-semibold"
        >
          Sair do perfil
        </button>

        {/* Editar */}
        <button
          onClick={() => navigate("/editar-perfil")}
          className="w-full bg-blue-700 text-white py-3 rounded mt-4 font-semibold"
        >
          Editar Perfil
        </button>
      </div>
    </div>
  );
}
