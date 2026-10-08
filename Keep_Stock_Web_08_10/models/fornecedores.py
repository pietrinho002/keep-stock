from core.crud_base import CrudBase
from core import database
from core.database import conectar_supabase
from core.validator import Validator
 
class Fornecedor(CrudBase):
    table = "fornecedores"
    primary_key = "id_fornecedor" 
    fields = [
        "nome",
        "cnpj",
        "telefone",
        "email",
        "cep",
        "imagem_url",
    ]

    def __init__(self, nome, cnpj, telefone, email, cep, imagem_url=None, id=None, id_fornecedor=None, **kwargs):
        self.nome = nome
        self.cnpj = cnpj
        self.telefone = telefone
        self.email = email
        self.cep = cep
        self.imagem_url = imagem_url
        self.id = id or id_fornecedor
        self.id_fornecedor = self.id
        self.db = conectar_supabase() # Pega o fornecedor do Supabase

    @classmethod
    def find_all(cls, order_by=None):
        # Sobrescreve find_all para usar id_fornecedor como chave primária
        if order_by is None:
            order_by = cls.primary_key
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").order(order_by).execute()
        return response.data

    @classmethod
    def find_by_id(cls, id):
        # Sobrescreve find_by_id para usar id_fornecedor como chave primária
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").eq(cls.primary_key, id).execute()
        return response.data[0] if response.data else None

    @classmethod
    def delete(cls, id):
        # Sobrescreve delete para usar id_fornecedor como chave primária
        supabase = conectar_supabase()
        response = supabase.table(cls.table).delete().eq(cls.primary_key, id).execute()
        return response.data

    def insert(self):
        # Insert
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
            Validator.required(self.nome, "nome"),
            Validator.required(self.cnpj, "cnpj"),
            Validator.required(self.telefone, "telefone"),
            Validator.required(self.email, "email"),
            Validator.required(self.cep, "cep"),
        ]
        return [erro for erro in erros if erro]
                    
    @classmethod
    def has_related_records(cls, id):
        # Verifica se o fornecedor possui registros vinculados (ex.: lotes)
        supabase = conectar_supabase()
        try:
            response = supabase.table("lotes").select("*", count="exact").eq("id_fornecedor", id).execute()
            if response.count and response.count > 0:
                return True
            return False
        except Exception as e:
            print(f"Erro ao verificar registros relacionados: {e}")
            return False

    @classmethod
    def safe_delete(cls, id):
        supabase = conectar_supabase()
        # Busca produto e verifica se ele existe
        fornecedor = cls.find_by_id(id)
        if not fornecedor:
            raise ValueError("fornecedor não encontrado.")
        if cls.has_related_records(id):
            raise ValueError("Não é possível excluir o fornecedor porque possui tabelas vinculadas.")
        cls.delete(id)

    @classmethod
    def buscar_por_fornecedor(cls, id_fornecedor):
        # Busca um fornecedor no banco e retorna uma instância da classe
        supabase = conectar_supabase()
        response = supabase.table("fornecedores").select("*").eq(cls.primary_key, id_fornecedor).execute()
        
        if response.data:
            d = response.data[0]
            return cls(
                id=d.get('id_fornecedor'),
                nome=d.get('nome'),
                cnpj=d.get('cnpj'),
                telefone=d.get('telefone'),
                email=d.get('email'),
                cep=d.get('cep'),
                imagem_url=d.get('imagem_url'),
            )
        return None
    
    def inserir_fornecedor(self):
        # Insere o fornecedor usando o método da classe base
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).insert(dados).execute()
        return response.data
