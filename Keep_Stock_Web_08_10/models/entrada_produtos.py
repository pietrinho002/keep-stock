from core.crud_base import CrudBase
from core.database import conectar_supabase
from core.validator import Validator


class Entradas_produtos(CrudBase):
    table = "entradas_produtos"
    primary_key = "id_entrada"
    fields = [
        "id_produto",
        "quantidade",
        "data_entrada",
        "id_usuario",
    ]

    def __init__(self, id_produto=None, quantidade=None, data_entrada=None, id_usuario=None, id=None, id_entrada=None, **kwargs):
        self.id_produto = id_produto
        self.quantidade = quantidade
        self.data_entrada = data_entrada
        self.id_usuario = id_usuario
        self.id = id or id_entrada
        self.id_entrada = self.id
        self.db = conectar_supabase()  # Pega o cliente do Supabase

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
            Validator.required(self.id_produto, "produto"),
            Validator.positive(self.quantidade, "quantidade"),
        ]
        return [erro for erro in erros if erro]

    @classmethod
    def safe_delete(cls, id):
        entrada = cls.find_by_id(id)
        if not entrada:
            raise ValueError("Entrada de produtos não encontrada.")
        cls.delete(id)

    @classmethod
    def buscar_por_entrada_produtos(cls, id_entrada):
        supabase = conectar_supabase()
        response = supabase.table("entradas_produtos").select("*").eq(cls.primary_key, id_entrada).execute()

        if response.data:
            d = response.data[0]
            return cls(
                id=d.get('id_entrada'),
                id_produto=d.get('id_produto'),
                quantidade=d.get('quantidade'),
                data_entrada=d.get('data_entrada'),
                id_usuario=d.get('id_usuario'),
            )
        return None

    def inserir_entrada_produtos(self):
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).insert(dados).execute()
        return response.data
