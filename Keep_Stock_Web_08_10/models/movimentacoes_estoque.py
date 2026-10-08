from datetime import datetime
from core.crud_base import CrudBase
from core.database import conectar_supabase
from core.validator import Validator


class Movimentacoes_estoque(CrudBase):
    table = "movimentacoes_estoque"
    primary_key = "id_movimentacoes_estoque" 
    fields = [
        "id_lote",
        "id_usuario",
        "tipo_movimentacao", 
        "quantidade", 
        "data_hora"
    ]

    def __init__(self, id_lote=None, id_usuario=None, tipo_movimentacao=None, quantidade=None, data_hora=None, id=None, **kwargs):
        self.id_lote = id_lote
        self.id_usuario = id_usuario
        self.tipo_movimentacao = tipo_movimentacao
        self.quantidade = quantidade
        self.data_hora = data_hora
        self.id = id
 
    @classmethod
    def find_all(cls, order_by=None):
        if order_by is None:
            order_by = cls.primary_key
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").order(order_by).execute()
        return response.data

    @classmethod
    def find_by_id(cls, id):
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").eq(cls.primary_key, id).execute()
        return response.data[0] if response.data else None

    @classmethod
    def delete(cls, id):
        supabase = conectar_supabase()
        response = supabase.table(cls.table).delete().eq(cls.primary_key, id).execute()
        return response.data

    def insert(self):
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).insert(dados).execute()
        return response.data

    def update(self, id):
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).update(dados).eq(self.primary_key, id).execute()
        return response.data

    def validate(self):
        erros = [
            Validator.required(self.id_lote, "id_lote"),
            Validator.required(self.id_usuario, "id_usuario"),
            Validator.required(self.tipo_movimentacao, "tipo_movimentacao"),
            Validator.required(self.quantidade, "quantidade"),
            Validator.required(self.data_hora, "data_hora"),
        ]
        return [erro for erro in erros if erro]
                    
    @classmethod
    def safe_delete(cls, id):
        supabase = conectar_supabase()
        movimentacao = cls.find_by_id(id)
        if not movimentacao:
            raise ValueError("Movimentação de estoque não encontrada.")
        cls.delete(id)

    @classmethod
    def buscar_por_movimentacao_estoque(cls, id_movimentacao_estoque):
        supabase = conectar_supabase()
        response = supabase.table("movimentacoes_estoque").select("*").eq(cls.primary_key, id_movimentacao_estoque).execute()
        
        if response.data:
            d = response.data[0]
            return cls(
                id_movimentacoes_estoque=d.get('id_movimentacoes_estoque'),
                id_lote=d.get('id_lote'),
                id_usuario=d.get('id_usuario'),
                tipo_movimentacao=d.get('tipo_movimentacao'),
                quantidade=d.get('quantidade'),
                data_hora=d.get('data_hora')
            )
        return None


 