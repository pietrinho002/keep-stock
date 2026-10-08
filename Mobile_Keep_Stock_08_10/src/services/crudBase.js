import { supabase } from './supabase';

// CRUD genérico das tabelas (espelha core/crud_base.py do sistema web)
export function criarCrud(tabela, chavePrimaria) {
  return {
    tabela,

    chavePrimaria,

    async findAll(orderBy = chavePrimaria) {
      const { data, error } = await supabase
        .from(tabela)
        .select('*')
        .order(orderBy);

      if (error) throw error;

      return data || [];
    },

    async findById(id) {
      const { data, error } = await supabase
        .from(tabela)
        .select('*')
        .eq(chavePrimaria, id);

      if (error) throw error;

      return data && data.length ? data[0] : null;
    },

    async insert(dados) {
      const { data, error } = await supabase
        .from(tabela)
        .insert(dados)
        .select();

      if (error) throw error;

      return data;
    },

    async update(id, dados) {
      const { data, error } = await supabase
        .from(tabela)
        .update(dados)
        .eq(chavePrimaria, id)
        .select();

      if (error) throw error;

      return data;
    },

    async delete(id) {
      const { data, error } = await supabase
        .from(tabela)
        .delete()
        .eq(chavePrimaria, id)
        .select();

      if (error) throw error;

      return data;
    },

    // Conta registros por um campo, usado nas verificações de vínculo antes de excluir
    async contarPor(campo, valor) {
      const { count, error } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true })
        .eq(campo, valor);

      if (error) throw error;

      return count || 0;
    },
  };
}
