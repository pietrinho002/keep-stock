from core.crud_base import CrudBase
from core.database import conectar_supabase
from core.validator import Validator


class Saidas_produtos(CrudBase):
    table = "saidas_produtos"
    primary_key = "id_saida"
    fields = [
        "id_produto",
        "id_usuario",
        "id_cliente",
        "quantidade",
        "tipo_saida",
        "data_saida",
    ]

    def __init__(self, id_produto=None, id_usuario=None, id_cliente=None, quantidade=None, tipo_saida=None, data_saida=None, id=None, id_saida=None, **kwargs):
        self.id_produto = id_produto
        self.id_usuario = id_usuario
        self.id_cliente = id_cliente
        self.quantidade = quantidade
        self.tipo_saida = tipo_saida
        self.data_saida = data_saida
        self.id = id or id_saida
        self.id_saida = self.id
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
        saida = cls.find_by_id(id)
        if not saida:
            raise ValueError("Saída de produtos não encontrada.")
        cls.delete(id)

    @classmethod
    def buscar_por_saida_produtos(cls, id_saida):
        supabase = conectar_supabase()
        response = supabase.table("saidas_produtos").select("*").eq(cls.primary_key, id_saida).execute()

        if response.data:
            d = response.data[0]
            return cls(
                id=d.get('id_saida'),
                id_produto=d.get('id_produto'),
                id_usuario=d.get('id_usuario'),
                id_cliente=d.get('id_cliente'),
                quantidade=d.get('quantidade'),
                tipo_saida=d.get('tipo_saida'),
                data_saida=d.get('data_saida'),
            )
        return None

    def inserir_saida_produtos(self):
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).insert(dados).execute()
        return response.data
