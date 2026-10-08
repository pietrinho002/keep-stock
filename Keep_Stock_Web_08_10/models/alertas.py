from core.crud_base import CrudBase
from core.database import conectar_supabase
from core.validator import Validator
 
class Alertas(CrudBase):
    table = "alertas"
    primary_key = "id_alerta" 
    fields = [
        "id_camara",
        "id_produto",
        "tipo_alerta",
        "mensagem",
        "nivel",
        "data_criacao"
    ]
 
    def __init__(self, tipo_alerta, mensagem, nivel, data_criacao, id=None, id_alerta=None, **kwargs):
        self.tipo_alerta = tipo_alerta
        self.mensagem = mensagem
        self.nivel = nivel
        self.data_criacao = data_criacao
        self.id = id or id_alerta
        self.id_alerta = self.id
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
        # Use find_by_id para usar id_alerta como chave primária
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").eq(cls.primary_key, id).execute()
        return response.data[0] if response.data else None

    @classmethod
    def delete(cls, id):
        #Sobrescreve delete para usar id_alerta como chave primária
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
        # Sobrescreve update para usar id_alerta como chave primária
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).update(dados).eq(self.primary_key, id).execute()
        return response.data

    def validate(self):
        erros = [
            Validator.required(self.tipo_alerta, "tipo de alerta"),
            Validator.required(self.mensagem, "mensagem"),
            Validator.required(self.nivel, "nivel"),
            Validator.required(self.data_criacao, "data de criação")
        ]
        return [erro for erro in erros if erro]

    @classmethod
    def has_related_records(cls, id):
        #Verifica se o produto possui registros relacionados em outras tabelas
            Validator.non_negative(self.tipo_alerta, "tipo_alerta"),
            Validator.non_negative(self.mensagem, "mensagem"),
            Validator.non_negative(self.nivel, "nivel"),
            Validator.required(self.data_criacao, "data_criacao")
        ]
        return [erro for erro in erros if erro]

    @classmethod
    def has_related_records(cls, id):
        #Verifica se o alerta possui registros relacionados em outras tabelas
        supabase = conectar_supabase()
        try:
            # Verifica se existem alertas ou outras relações com este alerta
            response = supabase.table("alertas").select("*", count="exact").eq("id_alerta", id).execute()
            if response.count and response.count > 0:
                return True
            
            response = supabase.table("notificacoes").select("*", count="exact").eq("id_alerta", id).execute()
            if response.count and response.count > 0:
                return True
                
            return False
        except Exception as e:
            print(f"Erro ao verificar registros relacionados: {e}")
            return False
                    
    @classmethod
    def safe_delete(cls, id):
        supabase = conectar_supabase()
        # Busca alerta e verifica se ele existe
        alerta = cls.find_by_id(id)
        if not alerta:
            raise ValueError("alerta não encontrado.")
        if cls.has_related_records(id):
            raise ValueError("Não é possível excluir o alerta porque possui tabelas vinculadas.")
        cls.delete(id)

    @classmethod
    def buscar_por_alerta(cls, id_alerta):
        #Busca um alerta no banco e retorna uma instância da classe
        supabase = conectar_supabase()
        response = supabase.table("alertas").select("*").eq(cls.primary_key, id_alerta).execute()
        
        if response.data:
            d = response.data[0]
            return cls(
                id=d.get('id_alerta'),
                tipo_alerta=d.get('tipo_alerta'),
                mensagem=d.get('mensagem'),
                nivel=d.get('nivel'),
                data_criacao=d.get('data_criacao'),
            )
        return None
    
    def inserir_alerta(self):
        #Insere o alerta usando o método da classe base
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).insert(dados).execute()
        return response.data
