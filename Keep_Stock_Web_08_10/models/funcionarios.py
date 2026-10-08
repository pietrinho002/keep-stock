from core.crud_base import CrudBase
from core.database import conectar_supabase
from core.validator import Validator
 
class Funcionario(CrudBase):
    table = "funcionario"
    primary_key = "id_funcionario" 
    fields = [
        "id_usuario",
        "cargo",
        "setor",
        "salario",
        "imagem_url"
    ]

    def __init__(self, id_usuario, cargo, setor, salario, imagem_url=None, id=None, id_funcionario=None, **kwargs):
        self.id_usuario = id_usuario
        self.cargo = cargo
        self.setor = setor
        self.salario = salario
        self.imagem_url = imagem_url
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
            Validator.required(self.cargo, "cargo"),
            Validator.required(self.setor, "setor"),
            Validator.required(self.salario, "salario"),
            Validator.required(self.imagem_url, "imagem"),
            
        ]
        return [erro for erro in erros if erro]

    @classmethod
    def safe_delete(cls, id):
        supabase = conectar_supabase()
        devolucao = cls.find_by_id(id)
        if not devolucao:
            raise ValueError("Funcion´rio não encontrado.")
        if cls.has_related_records(id):
            raise ValueError("Não é possível excluir o funcionário porque possui tabelas vinculadas.")
        cls.delete(id)

    @classmethod
    def buscar_por_funcionario(cls, id_funcionario):
        supabase = conectar_supabase()
        response = supabase.table("funcionarios").select("*").eq(cls.primary_key, id_funcionario).execute()
        
        if response.data:
            d = response.data[0]
            return cls(
                id=d.get('id_funcionario'),
                id_usuario=d.get('id_usuario'),
                cargo=d.get('cargo'),
                setor=d.get('setor'),
                salario=d.get('salario'),
                imagem_url=d.get('imagem_url')
            )
        return None
    
    def inserir_funcionario(self):
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).insert(dados).execute()
        return response.data

 