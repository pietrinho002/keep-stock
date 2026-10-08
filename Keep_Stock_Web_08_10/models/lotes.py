from core.crud_base import CrudBase
from core.database import conectar_supabase
from core.validator import Validator


class Lotes(CrudBase):
    table = "lotes"
    primary_key = "id_lote" 
    fields = [
        "id_produto",
        "id_fornecedor",
        "data_fabricacao"
        "data_validade",
        "quantidade_lote",
        "quantidade_max",
        "quantidade_min"
    
    ]

    def __init__(self, id_lote, id_fornecedor, data_fabricacao, data_validade, quantidade_lote, quantidade_max, quantidade_min, id=None, id_lotes=None, **kwargs):
        self.id_lote = id_lote
        self.id_fornecedor = id_fornecedor
        self.id_produto = id_produto
        self.data_fabricacao = data_fabricacao
        self.data_validade = data_validade
        self.quantidade_lote = quantidade_lote
        self.quantidade_max = quantidade_max
        self.quantidade_min = quantidade_min
        self.db = Database.get_client() # Pega o cliente do Supabase
        self.id = id or id_lote
        self.id_lote = self.id
        self.db = database.conectar_supabase()  # Conecta o cliente do Supabase
 
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
            Validator.required(self.data_fabricacao, "data_fabricacao"),
            Validator.required(self.data_validade, "data_validade"),
            Validator.required(self.quantidade_lote, "quantidade_lote"),
            Validator.required(self.quantidade_max, "quantidade_max"),
            Validator.required(self.quantidade_min, "quantidade_min"),
        ]
        return [erro for erro in erros if erro]
                    
    @classmethod
    def safe_delete(cls, id):
        supabase = conectar_supabase()
        devolucao = cls.find_by_id(id)
        if not devolucao:
            raise ValueError("Lote não encontrado.")
        if cls.has_related_records(id):
            raise ValueError("Não é possível excluir o lote porque possui tabelas vinculadas.")
        cls.delete(id)

    @classmethod
    def buscar_por_lote(cls, id_lote):
        supabase = conectar_supabase()
        response = supabase.table("lotes").select("*").eq(cls.primary_key, id_lote).execute()
        
        if response.data:
            d = response.data[0]
            return cls(
                id=d.get('id_lote'),
                id_fornecedor=d.get('id_fornecedor'),
                id_produto=d.get('id_produto'),
                data_fabricacao=d.get('data_fabricacao'),
                data_validade=d.get('data_validade'),
                quantidade_lote=d.get('quantidade_lote'),
                quantidade_max=d.get('quantidade_max'),
                quantidade_min=d.get('quantidade_min')
            )
        return None
    
    def inserir_lote(self):
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).insert(dados).execute()
        return response.data

 