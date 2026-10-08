from core.crud_base import CrudBase
from core.database import conectar_supabase
from core.validator import Validator
 
class pedido_itens(CrudBase):
    table = "pedido_itens"
    primary_key = "id_item" 
    fields = [
        "id_pedido",
        "id_lote",
        "id_produto",
        "quantidade",
        "preco_unitario"
    ]
 
    def __init__(self, id_pedido, id_lote, id_produto, quantidade, preco_unitario, id=None, id_lotes=None, **kwargs):
        self.id_pedido = id_pedido
        self.id_lote = id_lote
        self.id_produto = id_produto
        self.quantidade = quantidade
        self.preco_unitario = preco_unitario
        self.db = Database.get_client() # Pega o cliente do Supabase
        self.id = id or id_item
        self.id_item = self.id
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
            Validator.required(self.quantidade, "quantidade"),
            Validator.required(self.preco_unitario, "preco_unitario"),
        ]
        return [erro for erro in erros if erro]
                    
    @classmethod
    def safe_delete(cls, id):
        supabase = conectar_supabase()
        devolucao = cls.find_by_id(id)
        if not devolucao:
            raise ValueError("Itens do pedido não encontrado.")
        if cls.has_related_records(id):
            raise ValueError("Não é possível excluir o item do pedido porque possui tabelas vinculadas.")
        cls.delete(id)

    @classmethod
    def buscar_por_itens_pedido(cls, id_lote):
        supabase = conectar_supabase()
        response = supabase.table("pedido_itens").select("*").eq(cls.primary_key, id_item).execute()
        
        if response.data:
            d = response.data[0]
            return cls(
                id=d.get('id_item'),
                id_pedido=d.get('id_pedido'),
                id_produto=d.get('id_produto'),
                quantidade=d.get('quantidade'),
                preco_unitario=d.get('preco_unitario')
            )
        return None
    
    def inserir_item_pedido(self):
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).insert(dados).execute()
        return response.data

 