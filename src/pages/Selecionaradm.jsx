import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function SelecionarAdm() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src="/src/assets/sesc.png" alt="Sesc" className="w-14 h-auto" />
            <h1 className="text-3xl font-extrabold text-sky-700">Área Administrativa</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
              aria-label="Voltar"
            >
              <ArrowLeft /> Voltar
            </button>
          </div>
        </div>

        <p className="text-slate-600 mb-8">Selecione o painel que deseja acessar. Você pode acessar o painel central (Adm Master) ou os painéis por unidade.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow hover:shadow-xl transform hover:-translate-y-1 transition">
              <div className="flex items-center gap-4">
                <img src="/src/assets/sesc.png" alt="Sesc" className="w-16" />
                <div>
                  <h2 className="text-xl font-semibold text-sky-700">Sesc</h2>
                  <p className="text-sm text-slate-500">Painel específico para Sesc — acesse login ou recursos da unidade.</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={() => navigate('/loginAdm')} className="px-4 py-2 rounded bg-sky-600 text-white text-sm">Login Admin</button>
                <button onClick={() => navigate('/userAdm')} className="px-3 py-2 rounded border text-sm">Usuários</button>
              </div>
            </div>
          </div>

          <div className="sm:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow hover:shadow-xl transform hover:-translate-y-1 transition">
              <div className="flex items-center gap-4">
                <img src="/src/assets/senac.png" alt="Senac" className="w-16" />
                <div>
                  <h2 className="text-xl font-semibold text-amber-600">Senac</h2>
                  <p className="text-sm text-slate-500">Painel da unidade Senac — acesso rápido a funcionalidades desta unidade.</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={() => navigate('/loginAdm')} className="px-4 py-2 rounded bg-amber-600 text-white text-sm">Login Admin</button>
                <button onClick={() => navigate('/userAdm')} className="px-3 py-2 rounded border text-sm">Usuários</button>
              </div>
            </div>
          </div>

          <div className="sm:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-start justify-between h-full">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Adm Master</h2>
                <p className="text-sm text-slate-500 mt-2">Acesso mestre para gerenciar todas as áreas e configurações.</p>
              </div>

              <div className="mt-6 w-full">
                <button onClick={() => navigate('/adm-master')} className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md font-medium">Abrir Adm Master</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
