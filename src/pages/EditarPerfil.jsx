import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // ← FALTAVA ISSO!
import { supabase } from "../../supabase/supabase";

import fundoSesc from "./assets/sesc.png";
import fundoSenac from "./assets/senac.png";

export default function EditarPerfil() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    cep: "",
    cidade: "",
    estado: "",
    rua: "",
    bairro: "",
    complemento: "",
    sexo: "",
    telefone: "",
    data_nascimento: "",
    foto: "",
  });

  // MÁSCARAS
  function maskPhone(v) {
    return v
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  }

  function maskCEP(v) {
    return v
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);
  }

  function maskDate(v) {
    return v
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .slice(0, 10);
  }

  function convertDateToISO(br) {
    if (!br.includes("/")) return br;
    const [d, m, y] = br.split("/");
    return `${y}-${m}-${d}`;
  }

  // CARREGAR DADOS
  async function loadData() {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    const { data } = await supabase
      .from("perfil")
      .select("*")
      .eq("id_user", user.id)
      .single();

    if (data) {
      setForm({
        ...data,
        telefone: maskPhone(data.telefone ?? ""),
        cep: maskCEP(data.cep ?? ""),
        data_nascimento: data.data_nascimento
          ? data.data_nascimento.split("-").reverse().join("/")
          : "",
      });
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // SALVAR
  async function salvarEdicao() {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    if (!form.nome || !form.telefone) {
      alert("Nome e telefone são obrigatórios!");
      return;
    }

    const dados = { ...form };
    delete dados.id_user;
    dados.data_nascimento = convertDateToISO(form.data_nascimento);

    const { error } = await supabase
      .from("perfil")
      .upsert({ ...dados, id_user: user.id }, { onConflict: ["id_user"] });

    if (error) {
      console.log(error);
      alert("Erro ao salvar alterações");
    } else {
      alert("Perfil atualizado com sucesso!");
      navigate(-1);
    }
  }

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Logos */}
      <div className="flex justify-between px-6 mt-4">
        <img src={fundoSesc} className="w-28" />
        <img src={fundoSenac} className="w-28" />
      </div>

      {/* Botão voltar */}
      <button onClick={() => navigate(-1)} className="text-black mt-2">
        <ArrowLeft size={28} />
      </button>

      <h1 className="text-3xl text-center mt-4 mb-6 text-blue-700 font-semibold">
        Editar Perfil
      </h1>

      <div className="max-w-md mx-auto">
        {[
          { key: "nome", placeholder: "Nome" },
          { key: "cep", placeholder: "CEP", mask: maskCEP },
          { key: "cidade", placeholder: "Cidade" },
          { key: "estado", placeholder: "Estado" },
          { key: "rua", placeholder: "Rua" },
          { key: "bairro", placeholder: "Bairro" },
          { key: "complemento", placeholder: "Complemento" },
          { key: "sexo", placeholder: "Sexo" },
          { key: "telefone", placeholder: "Telefone", mask: maskPhone },
          {
            key: "data_nascimento",
            placeholder: "Data de Nascimento (DD/MM/AAAA)",
            mask: maskDate,
          },
        ].map((item) => (
          <input
            key={item.key}
            className="w-full bg-gray-200 p-3 rounded mb-3"
            placeholder={item.placeholder}
            value={form[item.key]}
            onChange={(e) =>
              setForm({
                ...form,
                [item.key]: item.mask
                  ? item.mask(e.target.value)
                  : e.target.value,
              })
            }
          />
        ))}

        <button
          onClick={salvarEdicao}
          className="w-full bg-yellow-400 py-3 rounded font-bold mt-4 mb-10"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
