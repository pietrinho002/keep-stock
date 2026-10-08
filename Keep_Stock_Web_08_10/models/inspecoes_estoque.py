from core.crud_base import CrudBase
from core.database import conectar_supabase
from core.validator import Validator
 
class Inspecoes_produto(CrudBase):
    table = "inspecoes_produto"
    primary_key = "id_inspecao_estoque" 
    fields = [
        "id_lote",
        "quantidade_contada",
        "status_inspecoes_estoque",
        "observacao",
        "data_inspecao",
        "id_usuario"
    ]
 
    def __init__(self, id_lote, quantidade_contada, status_inspecoes_estoque, observacao, id_usuario, data_inspecao, id=None, id_inspeco_estoque=None, **kwargs):
        self.id_lote = id_lote
        self.quantidade_contada = quantidade_contada
        self.status_inspecoes_estoque = status_inspecoes_estoque
        self.observacao = observacao
        self.id_usuario = id_usuario
        self.data_inspecao = data_inspecao
        self.db = Database.get_client() # Pega o cliente do Supabase
        self.id = id or id_funcionario
        self.id_funcionario = self.id
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
            Validator.required(self.quantidade_contada, "quantidade_contada"),
            Validator.required(self.status_inspecoes_estoque, "status_inspecoes_estoque"),
            Validator.required(self.observacao, "observacao"),
            Validator.required(self.data_inspecao, "data_inspecao"),
        ]
        return [erro for erro in erros if erro]
                    
    @classmethod
    def safe_delete(cls, id):
        supabase = conectar_supabase()
        devolucao = cls.find_by_id(id)
        if not devolucao:
            raise ValueError("Inspeção do estoque não encontrada.")
        if cls.has_related_records(id):
            raise ValueError("Não é possível excluir a inspeção do estoque porque possui tabelas vinculadas.")
        cls.delete(id)

    @classmethod
    def buscar_por_inspecao_estoque(cls, id_inspecao_estoque):
        supabase = conectar_supabase()
        response = supabase.table("inspecoes_estoque").select("*").eq(cls.primary_key, id_funcionario).execute()
        
        if response.data:
            d = response.data[0]
            return cls(
                id=d.get('id_inspecao_estoque'),
                id_lote=d.get('id_lote')
                id_usuario=d.get('id_usuario'),
                quantidade_contada=d.get('quantidade_contada'),
                status_inspecoes_estoque=d.get('status_inspecoes_estoque'),
                observacao=d.get('observacao')
                data_inspecao=d.get('data_inspecao')
            )
        return None
    
    def inserir_inspecao_estoque(self):
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).insert(dados).execute()
        return response.data

 