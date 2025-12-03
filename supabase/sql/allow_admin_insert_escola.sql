-- SQL para permitir INSERT em `escola` apenas para usuários com role = 'admin' em `user_roles`
-- Execute no Supabase SQL Editor (Dashboard → SQL)

-- 1) Habilita RLS na tabela (se ainda não estiver)
ALTER TABLE IF EXISTS public.escola ENABLE ROW LEVEL SECURITY;

-- 2) Remove policies antigas (seguro run multiple times)
DROP POLICY IF EXISTS allow_admin_insert_escola ON public.escola;
DROP POLICY IF EXISTS allow_admin_select_escola ON public.escola;
DROP POLICY IF EXISTS allow_admin_update_escola ON public.escola;
DROP POLICY IF EXISTS allow_admin_delete_escola ON public.escola;

-- 3) Policy correta para INSERT — para INSERT só é permitido usar WITH CHECK
CREATE POLICY allow_admin_insert_escola
ON public.escola
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- 4) Policies opcionais para SELECT/UPDATE/DELETE (controle de leitura/alteração/exclusão)
CREATE POLICY allow_admin_select_escola
ON public.escola
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

CREATE POLICY allow_admin_update_escola
ON public.escola
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

CREATE POLICY allow_admin_delete_escola
ON public.escola
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Observações:
-- - Certifique-se de que a tabela `user_roles` existe e contém colunas `user_id` e `role`.
-- - `auth.uid()` só funciona se a requisição vier com um JWT válido (usuário autenticado via Supabase).
-- - Em desenvolvimento rápido, você pode desabilitar RLS ou criar uma policy permissiva, mas NÃO faça isso em produção.

-- Como usar:
-- 1) Cole e execute este script no SQL Editor do Supabase.
-- 2) Crie um usuário admin no Auth do Supabase (painel Auth → Users) ou via script.
-- 3) Insira na tabela `user_roles` uma linha com `user_id = '<UID_DO_ADMIN>'` e `role = 'admin'`.
-- 4) No frontend, faça login com esse usuário via Supabase (signInWithPassword). A sessão com token JWT permitirá INSERTs.
