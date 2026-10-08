from core.crud_base import CrudBase
from core import database
from core.database import conectar_supabase
from core.validator import Validator
 
class Cliente(CrudBase):
    table = "clientes"
    primary_key = "id_cliente" 
    fields = [
        "nome",
        "cpf_cnpj",
        "telefone",
        "email",
        "codigo_postal",
        "imagem_url"
    ]

    def __init__(self, nome, cpf_cnpj, telefone, email, codigo_postal, imagem_url=None, id=None, id_cliente=None, **kwargs):
        self.nome = nome
        self.cpf_cnpj = cpf_cnpj
        self.telefone = telefone
        self.email = email
        self.codigo_postal = codigo_postal
        self.imagem_url = imagem_url
        self.id = id or id_cliente
        self.id_cliente = self.id
        self.db = conectar_supabase()  # Pega o cliente do Supabase
 
    @classmethod
    def find_all(cls, order_by=None):
        # Sobrescreve find_all para usar id_cliente como chave primária
        if order_by is None:
            order_by = cls.primary_key
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").order(order_by).execute()
        return response.data

    @classmethod
    def find_by_id(cls, id):
        # Sobrescreve find_by_id para usar id_cliente como chave primária
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").eq(cls.primary_key, id).execute()
        return response.data[0] if response.data else None

    @classmethod
    def delete(cls, id):
        # Sobrescreve delete para usar id_cliente como chave primária
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
        # Usar update para usar id_cliente como chave primária
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).update(dados).eq(self.primary_key, id).execute()
        return response.data

    def validate(self):
        erros = [
            Validator.required(self.nome, "nome"),
            Validator.required(self.cpf_cnpj, "cpf/cnpj"),
            Validator.required(self.telefone, "telefone"),
            Validator.required(self.email, "email"),
            Validator.required(self.codigo_postal, "código postal"),
        ]
        return [erro for erro in erros if erro]
                    
    @classmethod
    def has_related_records(cls, id):
        # Verifica se o cliente possui registros relacionados (pedidos, saídas)
        supabase = conectar_supabase()
        try:
            response = supabase.table("pedidos").select("*", count="exact").eq("id_cliente", id).execute()
            if getattr(response, "count", None) and response.count > 0:
                return True

            response = supabase.table("saidas_produtos").select("*", count="exact").eq("id_cliente", id).execute()
            if getattr(response, "count", None) and response.count > 0:
                return True

            return False
        except Exception as e:
            print(f"Erro ao verificar registros relacionados do cliente: {e}")
            return False
                    
    @classmethod
    def safe_delete(cls, id):
        supabase = conectar_supabase()
        # Busca cliente e verifica se ele existe
        cliente = cls.find_by_id(id)
        if not cliente:
            raise ValueError("cliente não encontrado.")
        if cls.has_related_records(id):
            raise ValueError("Não é possível excluir o cliente porque possui tabelas vinculadas.")
        cls.delete(id)

    @classmethod
    def buscar_por_cliente(cls, id_cliente):
        # Busca um cliente no banco e retorna uma instância da classe
        supabase = conectar_supabase()
        response = supabase.table("clientes").select("*").eq(cls.primary_key, id_cliente).execute()

        if response.data:
            d = response.data[0]
            return cls(
                id=d.get('id_cliente'),
                nome=d.get('nome'),
                cpf_cnpj=d.get('cpf_cnpj'),
                telefone=d.get('telefone'),
                email=d.get('email'),
                codigo_postal=d.get('codigo_postal'),
                imagem_url=d.get('imagem_url')
            )
        return None
    
    def inserir_cliente(self):
        # Insere o cliente usando o método da classe base
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).insert(dados).execute()
        return response.data
