-- Remove entradas de Sesc e Senac da tabela `escola`
-- ATENÇÃO: execute este script apenas se tiver certeza.

begin;

-- Remove escolas Sesc e Senac
delete from public.escola where nome_escola in ('Sesc','Senac');

-- Optionally remove related lanchonete entries that reference Sesc/Senac by name
delete from public.lanchonete where nome_lanchonete in ('Sesc','Senac');

commit;

-- Observação: se houver FK ou outras referências, verifique constraints antes de executar.
