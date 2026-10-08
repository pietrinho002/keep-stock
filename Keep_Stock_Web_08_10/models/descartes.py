from core.crud_base import CrudBase
from core.database import conectar_supabase
from core.validator import Validator
 
class Descartes(CrudBase):
    table = "descartes"
    primary_key = "id_descarte" 
    fields = [
        "id_lote",
        "id_produto",
        "motivo",
        "quantidade",
        "data_descarte",
        "observacao"
    ]

    def __init__(self, id_lote, id_produto, motivo, quantidade, data_descarte, observacao, id=None, id_descarte=None, **kwargs):
        self.id_lote = id_lote
        self.id_produto = id_produto
        self.motivo = id_motivo
        self.quantidade = quantidade
        self.data_descarte = data_descarte
        self.observacao = observacao
        self.id = id or id_descarte
        self.id_descarte = self.id
        self.db = database.conectar_supabase()  # Pega o cliente do Supabase
 
    @classmethod
    def find_all(cls, order_by=None):
        # Sobrescreve find_all para usar id_descarte como chave primária
        if order_by is None:
            order_by = cls.primary_key
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").order(order_by).execute()
        return response.data

    @classmethod
    def find_by_id(cls, id):
        # Sobrescreve find_by_id para usar id_descarte como chave primária
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").eq(cls.primary_key, id).execute()
        return response.data[0] if response.data else None

    @classmethod
    def delete(cls, id):
        # Sobrescreve delete para usar id_descarte como chave primária
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
        # Usar update para usar id_descarte como chave primária
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).update(dados).eq(self.primary_key, id).execute()
        return response.data

    def validate(self):
        erros = [
            Validator.required(self.motivo, "motivo"),
            Validator.required(self.quantidade, "quantidade"),
            Validator.required(self.data_descarte, "data de descarte"),
            Validator.required(self.observacao, "observação"),
        ]
        return [erro for erro in erros if erro]
                    
    @classmethod
    def safe_delete(cls, id):
        supabase = conectar_supabase()
        # Busca o descarte e verifica se ele existe
        descarte = cls.find_by_id(id)
        if not descarte:
            raise ValueError("descarte não encontrado.")
        if cls.has_related_records(id):
            raise ValueError("Não é possível excluir o descarte porque possui tabelas vinculadas.")
        cls.delete(id)

    @classmethod
    def buscar_por_descarte(cls, id_descarte):
        # Busca um descarte no banco e retorna uma instância da classe
        supabase = conectar_supabase()
        response = supabase.table("descartes").select("*").eq(cls.primary_key, id_descarte).execute()
        
        if response.data:
            d = response.data[0]
            return cls(
                id=d.get('id_descarte'),
                id_lote=d.get('id_lote'),
                id_produto=d.get('id_produto'),
                motivo=d.get('motivo'),
                quantidade=d.get('quantidade'),
                data_descarte=d.get('data_descarte'),
                observacao=d.get('observacao')
            )
        return None
    
    def inserir_descarte(self):
        # Insere o descarte usando o método da classe base
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).insert(dados).execute()
        return response.data
