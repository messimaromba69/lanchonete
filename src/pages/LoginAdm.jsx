import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "../hooks/use-toast";
import SescLogo from "../assets/sesc.png";
import SenacLogo from "../assets/senac.png";
import { supabase } from "../../supabase/supabase";

export default function LoginAdm() {
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
    // credenciais locais de fallback (apenas para desenvolvimento)
    const localAdmin = { email: "admin@gmail.com", password: "123456" };

    // Se for exatamente o admin local, não chamamos o Supabase (evita 400)
    if (email === localAdmin.email && password === localAdmin.password) {
      try {
        localStorage.setItem("isLocalAdmin", "1");
      } catch (e) {
        console.warn("Não foi possível salvar flag de admin local:", e);
      }
      toast({ title: "Bem-vindo, Administrador (modo local)!" });
      navigate("/selecionarAdm");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Se as credenciais do Supabase são inválidas, aceita fallback local
        console.warn("Supabase auth error:", error);
        if (email === localAdmin.email && password === localAdmin.password) {
          try {
            localStorage.setItem("isLocalAdmin", "1");
          } catch (e) {
            console.warn("Não foi possível salvar flag de admin local:", e);
          }
          toast({ title: "Bem-vindo, Administrador (modo local)!" });
          navigate("/selecionarAdm");
          return;
        }

        toast({ title: error.message || "Erro no login", variant: "destructive" });
        return;
      }

      const user = data?.user;
      if (!user) {
        console.error("Supabase returned no user, data:", data);
        toast({ title: "Erro inesperado ao buscar usuário!", variant: "destructive" });
        return;
      }

      // Verifica role na tabela user_roles
      const { data: roleData, error: roleErr } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (roleErr) {
        console.error("Erro ao checar role:", roleErr);
        toast({ title: "Erro ao verificar permissão", variant: "destructive" });
        return;
      }

      const role = roleData?.role || user.user_metadata?.role;
      if (role !== "admin") {
        // desloga caso não seja admin
        await supabase.auth.signOut();
        toast({ title: "Somente administradores podem acessar aqui!", variant: "destructive" });
        return;
      }

      toast({ title: "Bem-vindo, Administrador!" });
      navigate("/selecionarAdm");
    } catch (err) {
      console.error("Erro no login admin:", err);
      // último recurso: permitir login local se as credenciais baterem
      if (email === localAdmin.email && password === localAdmin.password) {
        try {
          localStorage.setItem("isLocalAdmin", "1");
        } catch (e) {
          console.warn("Não foi possível salvar flag de admin local:", e);
        }
        toast({ title: "Bem-vindo, Administrador (modo local)!" });
        navigate("/selecionarAdm");
        return;
      }
      toast({ title: "Erro no login. Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">
      <div className="absolute top-8 left-0 right-0 px-10 flex items-start justify-between">
        {/* Coluna esquerda: logo Sesc com seta abaixo */}
        <div className="flex flex-col items-center">
          <img src={SescLogo} alt="Sesc" className="w-40" />
          <button
            onClick={() => navigate("/")}
            className="text-black mt-3"
          >
            <ArrowLeft size={40} />
          </button>
        </div>

        {/* Logo Senac à direita */}
        <img src={SenacLogo} alt="Senac" className="w-40" />
      </div>
      <h1 className="text-4xl font-bold text-blue-800 mb-10">
        Login Administrativo
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

        {/* 🔹 NÃO USE onClick AQUI! Isso quebrava o login */}
        <button
          type="submit"
          className="bg-yellow-400 text-black font-bold rounded-lg px-10 py-4 w-1/2 text-2xl"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
