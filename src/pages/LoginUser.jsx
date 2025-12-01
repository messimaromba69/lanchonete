import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../supabase/supabase";
import { toast } from "../hooks/use-toast";
import SescLogo from "../assets/sesc.png";
import SenacLogo from "../assets/senac.png";

export default function LoginUser() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast({ title: "Preencha email e senha!", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 🔥 Login via Supabase AUTH
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase auth error:", error);
        // mostrar mensagem mais específica quando disponível
        const msg = error.message || "Email ou senha incorretos!";
        toast({ title: msg, variant: "destructive" });
        return;
      }

      const user = data?.user;

      if (!user) {
        console.error("Supabase returned no user, data:", data);
        toast({ title: "Erro inesperado ao buscar usuário!", variant: "destructive" });
        return;
      }

    // 🔎 PEGAR ROLE DOS METADADOS
    const role = user.user_metadata?.role;

    if (!role) {
      toast({ title: "Usuário sem permissão definida! Contate o suporte.", variant: "destructive" });
      return;
    }

    // 🚫 Impedir admin de logar aqui
    if (role === "admin") {
      toast({ title: "Admins devem usar o login administrativo!", variant: "destructive" });
      return;
    }

    toast({ title: "Login realizado com sucesso!" });
    navigate("/select");
    } catch (err) {
      console.error("Erro no login:", err);
      toast({ title: "Erro no login. Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">
      {/* Logos */}
      <div className="absolute top-8 left-0 right-0 px-10 flex items-start justify-between">
        {/* Coluna esquerda: logo Sesc com seta abaixo */}
        <div className="flex flex-col items-center">
          <img src={SescLogo} alt="Sesc" className="w-40" />
          <button onClick={() => navigate("/cadastro")} className="text-black mt-3">
            <ArrowLeft size={40} />
          </button>
        </div>

        {/* Logo Senac à direita */}
        <img src={SenacLogo} alt="Senac" className="w-40" />
      </div>

      <h1 className="text-4xl font-bold text-blue-800 mb-10">
        Login do Usuário
      </h1>

      <form
        onSubmit={handleLogin}
        className="flex flex-col items-center w-[80%] max-w-3xl space-y-8"
      >
        <div className="w-full">
          <label className="text-blue-800 text-xl font-semibold">Email</label>
          <input
            type="email"
            className="w-full bg-blue-700 text-white rounded-lg px-6 py-4 mt-2 text-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="w-full">
          <label className="text-blue-800 text-xl font-semibold">Senha</label>
          <input
            type="password"
            className="w-full bg-blue-700 text-white rounded-lg px-6 py-4 mt-2 text-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-400 text-black font-bold rounded-lg px-10 py-4 w-1/2 text-2xl disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
