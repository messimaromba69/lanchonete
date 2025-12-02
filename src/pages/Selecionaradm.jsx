import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SelecionarAdm() {
	const navigate = useNavigate();
	return (
		<div className="min-h-screen flex flex-col items-center justify-center">
			<h1 className="text-2xl font-semibold mb-4">Área administrativa</h1>
			<p className="mb-4">Escolha o painel que deseja acessar:</p>
			<div className="flex gap-4">
				<button onClick={() => navigate('/loginAdm')} className="px-4 py-2 bg-blue-600 text-white rounded">Login Admin</button>
				<button onClick={() => navigate('/userAdm')} className="px-4 py-2 bg-gray-200 rounded">Painel Usuários</button>
			</div>
		</div>
	);
}
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SelecionarAdm() {
	const navigate = useNavigate();
	return (
		<div className="min-h-screen flex flex-col items-center justify-center">
			<h1 className="text-2xl font-semibold mb-4">Área administrativa</h1>
			<p className="mb-4">Escolha o painel que deseja acessar:</p>
			<div className="flex gap-4">
				<button onClick={() => navigate('/loginAdm')} className="px-4 py-2 bg-blue-600 text-white rounded">Login Admin</button>
				<button onClick={() => navigate('/userAdm')} className="px-4 py-2 bg-gray-200 rounded">Painel Usuários</button>
			</div>
		</div>
	);
}
