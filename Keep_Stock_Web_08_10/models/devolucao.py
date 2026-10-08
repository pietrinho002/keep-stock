from core.crud_base import CrudBase
from core.database import conectar_supabase
from core.validator import Validator
 
class Devolucao(CrudBase):
    table = "devolucao"
    primary_key = "id_devolucao" 
    fields = [
        "id_lote",
        "motivo"
    ]
 
    def __init__(self, id_lote, motivo, id=None, id_devolucao=None, **kwargs):
        self.id_lote = id_lote
        self.motivo = motivo
        self.db = Database.get_client() # Pega o cliente do Supabase
        self.id = id or id_devolucao
        self.id_devolucao = self.id
        self.db = database.conectar_supabase()  # Pega o cliente do Supabase
 
    @classmethod
    def find_all(cls, order_by=None):
        # Sobrescreve find_all para usar id_devolução como chave primária
        if order_by is None:
            order_by = cls.primary_key
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").order(order_by).execute()
        return response.data

    @classmethod
    def find_by_id(cls, id):
        # Sobrescreve find_by_id para usar id_devoução como chave primária
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").eq(cls.primary_key, id).execute()
        return response.data[0] if response.data else None

    @classmethod
    def delete(cls, id):
        # Sobrescreve delete para usar id_desvolução como chave primária
        supabase = conectar_supabase()
        response = supabase.table(cls.table).delete().eq(cls.primary_key, id).execute()
        return response.data

    def insert(self):
        # Sobrescreve insert 
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).insert(dados).execute()
        return response.data

    def update(self, id):
        # Usar update para usar id_devolução como chave primária
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).update(dados).eq(self.primary_key, id).execute()
        return response.data

    def validate(self):
        erros = [
            Validator.required(self.motivo, "motivo"),
        ]
        return [erro for erro in erros if erro]
                    
    @classmethod
    def safe_delete(cls, id):
        supabase = conectar_supabase()
        # Busca a devolução e verifica se ela existe
        devolucao = cls.find_by_id(id)
        if not devolucao:
            raise ValueError("devolução não encontrada.")
        if cls.has_related_records(id):
            raise ValueError("Não é possível excluir a devolução porque possui tabelas vinculadas.")
        cls.delete(id)

    @classmethod
    def buscar_por_devolucao(cls, id_devolucao):
        # Busca uma devolução no banco e retorna uma instância da classe
        supabase = conectar_supabase()
        response = supabase.table("devolucao").select("*").eq(cls.primary_key, id_devolucao).execute()
        
        if response.data:
            d = response.data[0]
            return cls(
                id=d.get('id_devolucao'),
                motivo=d.get('motivo'),
            )
        return None
    
    def inserir_descarte(self):
        # Insere a devolução usando o método da classe base
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).insert(dados).execute()
        return response.data

 