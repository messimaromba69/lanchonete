-- Insere a role 'admin' para o usuário especificado
-- Substitua se necessário. Execute no Supabase SQL Editor.

INSERT INTO public.user_roles (user_id, role)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'admin');

-- Verifique a inserção
SELECT * FROM public.user_roles WHERE user_id = '123e4567-e89b-12d3-a456-426614174000';
