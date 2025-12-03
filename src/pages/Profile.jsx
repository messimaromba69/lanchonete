import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // ✔ IMPORTAÇÃO FALTANDO
import { supabase } from "../../supabase/supabase";
import { toast } from "../hooks/use-toast";

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
      toast({
        title: "Nenhum usuário logado",
        description: "Faça login para continuar.",
        variant: "destructive",
      });
      navigate("/loginUser");
      return;
    }

    const { data, error } = await supabase
      .from("perfil")
      .select("*")
      .eq("id_user", user.id)
      .maybeSingle();

    if (error) {
      console.log(error);
      toast({
        title: "Erro ao carregar perfil",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
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
      {/* Header compacto: botão voltar + logo Sesc à esquerda, logo Senac à direita */}
      <div className="absolute top-8 left-0 right-0 px-10 flex items-start justify-between">
        {/* Coluna esquerda: logo Sesc com seta abaixo */}
        <div className="flex flex-col items-center">
          <img src="./src/assets/sesc.png" alt="Sesc" className="w-40" />
          <button onClick={() => navigate(-1)} className="text-black mt-3">
            <ArrowLeft size={40} />
          </button>
        </div>

        {/* Logo Senac à direita */}
        <img src="./src/assets/senac.png" alt="Senac" className="w-40" />
      </div>

      <h1 className="text-center text-3xl md:text-4xl font-semibold text-blue-700 mt-10 mb-10">
        Meu Perfil
      </h1>

      {/* Avatar + Card */}
      <div className="max-w-lg mx-auto mb-20">
        {/* Avatar */}
        <div className="flex justify-center -mt-8">
          <div className="bg-white rounded-full p-2 shadow-xl">
            <img
              src={
                perfil.foto ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt=""
              className="w-40 h-40 rounded-full object-cover"
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white shadow-lg rounded-2xl pt-16 px-8 pb-10 mt-6">
          <h2 className="text-center text-2xl font-semibold text-gray-800">
            {perfil.nome || "—"}
          </h2>

          <p className="text-center text-sm text-gray-500 mt-2">
            {perfil.email || ""}
          </p>

          {/* Informações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {[
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
              <div key={key} className="p-4 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-500">{label}</div>
                <div className="text-sm text-gray-800 font-medium">
                  {perfil[key] || "—"}
                </div>
              </div>
            ))}
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button
              onClick={() => navigate("/editar-perfil")}
              className="flex-1 bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Editar Perfil
            </button>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/loginUser");
              }}
              className="flex-1 bg-yellow-400 text-black py-3.5 rounded-lg font-semibold hover:brightness-95 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
