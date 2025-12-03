import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	// ...ambiente pode estar mal configurado em desenvolvimento...
	console.warn('VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não definidos. Verifique o .env.local');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Helpers de autenticação para uso em componentes/rotinas
export async function getSession() {
	// Retorna a sessão atual (ou null)
	const { data, error } = await supabase.auth.getSession();
	if (error) throw error;
	return data.session;
}

export async function getUser() {
	// Retorna o usuário autenticado (ou null)
	const { data, error } = await supabase.auth.getUser();
	if (error) throw error;
	return data.user;
}

export async function requireAuth() {
	// Lança erro se não houver sessão — útil para validar antes de operações que exigem login.
	const session = await getSession();
	if (!session) {
		throw new Error('Usuário não autenticado. Faça login antes de continuar.');
	}
	return session.user;
}

export function onAuthStateChange(callback) {
	// callback recebe (event, session) conforme API do supabase
	// Retorna o método unsubscribe
	const { data: subscription } = supabase.auth.onAuthStateChange(callback);
	return subscription;
}

// Operações comuns de autenticação (email/senha)
export async function signInWithEmail(email, password) {
	const { data, error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) throw error;
	return data;
}

export async function signOutUser() {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
	return true;
}
