from core.crud_base import CrudBase
from core.database import conectar_supabase
from core.validator import Validator
 
class Pedido(CrudBase):
    table = "pedidos"
    primary_key = "id_pedido" 
    fields = [
        "id_cliente",
        "data_pedido",
        "status_pedido",
        "data_prevista"
    ]
 
    def __init__(self, id_cliente, data_pedido, status_pedido, data_prevista, id=None, id_pedido=None, **kwargs):
        self.id_cliente = id_cliente
        self.data_pedido = data_pedido
        self.status_pedido = status_pedido
        self.data_prevista = data_prevista
        self.id = id or id_pedido
        self.id_pedido = self.id
        self.db = conectar_supabase() # Pega o cliente do Supabase
 
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
            Validator.required(self.id_cliente, "id_cliente"),
            Validator.required(self.data_pedido, "data_pedido"),
            Validator.required(self.status_pedido, "status_pedido"),
            Validator.required(self.data_prevista, "data_prevista"),
        ]
        return [erro for erro in erros if erro]
                    
    @classmethod
    def safe_delete(cls, id):
        supabase = conectar_supabase()
        pedido = cls.find_by_id(id)
        if not pedido:
            raise ValueError("Pedido não encontrado.")
        cls.delete(id)

    @classmethod
    def buscar_por_pedido(cls, id_pedido):
        supabase = conectar_supabase()
        response = supabase.table("pedidos").select("*").eq(cls.primary_key, id_pedido).execute()
        
        if response.data:
            d = response.data[0]
            return cls(
                id_pedido=d.get('id_pedido'),
                id_cliente=d.get('id_cliente'),
                data_pedido=d.get('data_pedido'),
                status_pedido=d.get('status_pedido'),
                data_prevista=d.get('data_prevista')
            )
        return None

 
 
 