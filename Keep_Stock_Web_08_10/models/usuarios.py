from core.database import conectar_supabase
from core.validator import Validator
from datetime import datetime
 
class Usuarios:
    table = "usuarios"
    primary_key = "id_usuario" 
    fields = [
        "nome",
        "email",
        "senha",
        "cpf",
        "criado_em",
        "imagem_url"
    ]

    def __init__(self, nome=None, email=None, senha=None, cpf=None, criado_em=None, imagem_url=None, id_usuario=None, **kwargs):
        self.id_usuario = id_usuario
        self.nome = nome
        self.email = email
        self.senha = senha
        self.cpf = cpf
        self.imagem_url = imagem_url
        self.criado_em = criado_em or datetime.now().isoformat()
 
    @classmethod
    def find_all(cls, order_by=None):
        if order_by is None:
            order_by = cls.primary_key
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").order(order_by).execute()
        return [cls(**usuario) for usuario in response.data] if response.data else []

    @classmethod
    def find_by_id(cls, id_usuario):
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").eq(cls.primary_key, id_usuario).execute()
        return cls(**response.data[0]) if response.data else None

    @classmethod
    def delete(cls, id_usuario):
        supabase = conectar_supabase()
        response = supabase.table(cls.table).delete().eq(cls.primary_key, id_usuario).execute()
        return response.data

    def insert(self):
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo, None) for campo in self.fields}
        response = supabase.table(self.table).insert(dados).execute()
        return response.data

    def update(self):
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo, None) for campo in self.fields if campo != "id_usuario"}
        response = supabase.table(self.table).update(dados).eq(self.primary_key, self.id_usuario).execute()
        return response.data

    def validate(self):
        erros = [
            Validator.required(self.nome, "nome"),
            Validator.required(self.email, "email"),
            Validator.required(self.cpf, "cpf"),
            Validator.required(self.senha, "senha"),
            Validator.required(self.imagem_url, "imagem"),
        ]
        return [erro for erro in erros if erro]
    
    @classmethod
    def safe_delete(cls, id_usuario):
        supabase = conectar_supabase()
        usuario = cls.find_by_id(id_usuario)
        if not usuario:
            raise ValueError("Usuário não encontrado.")
        cls.delete(id_usuario)

    @classmethod
    def buscar_por_usuario(cls, id_usuario):
        """Alias para find_by_id"""
        return cls.find_by_id(id_usuario)

    @classmethod
    def find_by_email(cls, email):
        """Busca usuário pelo email"""
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").eq("email", email).execute()
        return cls(**response.data[0]) if response.data else None

    def to_dict(self):
        """Converte objeto para dicionário"""
        return {
            'id_usuario': self.id_usuario,
            'nome': self.nome,
            'email': self.email,
            'cpf': self.cpf,
            'criado_em': self.criado_em,
            'imagem_url': self.imagem_url
        }
