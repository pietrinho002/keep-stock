from core.crud_base import CrudBase
from core.database import conectar_supabase
from core.validator import Validator

class Produto(CrudBase):
    table = "camaras_frias"
    primary_key = "id_camara_fria" 
    fields = [
        "nome",
        "gavetas",
        "refrigeradores_disponiveis"
        "temperatura_atual",
        "temperatura_min",
        "temperatura_max",
        "id_camara_fria",
    ]

    def __init__(self, nome, gavetas, refrigeradores_disponiveis, temperatura_atual, temperatura_min, temperatura_max, id_camara_fria=None, **kwargs):
        self.nome = nome
        self.gavetas = gavetas
        self.refrigeradores_disponiveis = refrigeradores_disponiveis
        self.temperatura_atual = temperatura_atual
        self.temperatura_min = temperatura_min
        self.temperatura_max = temperatura_max
        self.id_camara_fria = id_camara_fria
        self.temperatura_max = temperatura_max
        self.temperatura_min = temperatura_min
        self.id_camara_fria = self.id
        self.db = database.conectar_supabase() # Pega o cliente do Supabase

    @classmethod
    def find_all(cls, order_by=None):
        if order_by is None:
            order_by = cls.primary_key
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").order(order_by).execute()
        return response.data

    @classmethod
    def find_by_id(cls, id):
        # Use find_by_id para usar id_camara_fria como chave primária
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").eq(cls.primary_key, id).execute()
        return response.data[0] if response.data else None

    @classmethod
    def delete(cls, id):
        #Sobrescreve delete para usar id_camara_fria como chave primária
        supabase = conectar_supabase()
        response = supabase.table(cls.table).delete().eq(cls.primary_key, id).execute()
        return response.data

    def insert(self):
        # Inserir 
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).insert(dados).execute()
        return response.data

    def update(self, id):
        # Sobrescreve update para usar id_camara_fria como chave primária
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).update(dados).eq(self.primary_key, id).execute()
        return response.data

    def validate(self):
        erros = [
            Validator.required(self.nome, "nome"),
            Validator.non_negative(self.gavetas, "gavetas"),
            Validator.non_negative(self.refrigeradores_disponiveis, "refrigeradores disponíveis"),
            Validator.required(self.temperatura_atual, "temperatura atual"),
            Validator.required(self.temperatura_max, "temperatura máxima"),
            Validator.required(self.temperatura_min, "temperatura mínima")
        ]
        return [erro for erro in erros if erro]
                    
    @classmethod
    def safe_delete(cls, id):
        supabase = conectar_supabase()
        # Busca câmara fria e verifica se ela existe
        camara_fria = cls.find_by_id(id)
        if not camara_fria:
            raise ValueError("Câmara fria não encontrada.")
        if cls.has_related_records(id):
            raise ValueError("Não é possível excluir a câmara fria porque possui tabelas vinculadas.")
        cls.delete(id)

    @classmethod
    def buscar_por_camara_fria(cls, id_camara_fria):
        # Busca uma câmara fria no banco e retorna uma instância da classe
        supabase = conectar_supabase()
        response = supabase.table("areas_estoque").select("*").eq(cls.primary_key, id_camara_fria).execute()
        
        if response.data:
            d = response.data[0]
            return cls(
                id=d.get('id_camara_fria'),
                nome=d.get('nome'),
                gavetas=d.get('gavetas'),
                refrigeradores_disponiveis=d.get('refrigeradores_disponiveis'),
                temperatura_atual=d.get('temperatura_atual'),
                temperatura_min=d.get('temperatura_min'),
                temperatura_max=d.get('temperatura_max'),
            )
        return None
    
    def inserir_camara_fria(self):
        #Insere a câmara fria usando o método da classe base
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).insert(dados).execute()
        return response.data