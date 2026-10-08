from core.crud_base import CrudBase
from core import database
from core.database import conectar_supabase
from core.validator import Validator

class Produto(CrudBase):
    table = "produtos"
    primary_key = "id_produto"  
    fields = [
        "nome",
        "categoria",
        "unidade_medida",
        "descricao",
        "fornecedor",
        "valor_unitario_venda",
        "valor_unitario_custo",
        "quantidade_atual",  
        "quantidade_minima",
        "controlado",
        "imagem_url"
    ]

    def __init__(self, nome, categoria, unidade_medida, descricao, fornecedor, valor_unitario_venda, valor_unitario_custo, quantidade_atual, quantidade_minima, controlado, imagem_url=None, id=None, id_produto=None, **kwargs):
        self.nome = nome
        self.categoria = categoria
        self.unidade_medida = unidade_medida
        self.descricao = descricao
        self.fornecedor = fornecedor
        self.valor_unitario_venda = valor_unitario_venda
        self.valor_unitario_custo = valor_unitario_custo
        self.quantidade_atual = quantidade_atual
        self.quantidade_minima = quantidade_minima
        self.controlado = controlado
        self.imagem_url = imagem_url
        self.id = id or id_produto
        self.id_produto = self.id
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
        # Use find_by_id para usar id_produto como chave primária
        supabase = conectar_supabase()
        response = supabase.table(cls.table).select("*").eq(cls.primary_key, id).execute()
        return response.data[0] if response.data else None

    @classmethod
    def delete(cls, id):
        #Sobrescreve delete para usar id_produto como chave primária
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
        # Sobrescreve update para usar id_produto como chave primária
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        response = supabase.table(self.table).update(dados).eq(self.primary_key, id).execute()
        return response.data

    def validate(self):
        erros = [
            Validator.required(self.nome, "nome"),
            Validator.required(self.categoria, "categoria"),
            Validator.required(self.unidade_medida, "unidade de medida"),
            Validator.required(self.descricao, "descrição"),
            Validator.required(self.fornecedor, "fornecedor"),
            Validator.non_negative(self.valor_unitario_venda, "valor_unitario_venda"),
            Validator.non_negative(self.valor_unitario_custo, "valor_unitario_custo"),
            Validator.non_negative(self.quantidade_atual, "quantidade_atual"),
            Validator.non_negative(self.quantidade_minima, "quantidade_minima"),
            Validator.required(self.controlado, "controlado"),
        ]
        return [erro for erro in erros if erro]

    @classmethod
    def has_related_records(cls, id):
        #Verifica se o produto possui registros relacionados em outras tabelas
        supabase = conectar_supabase()
        try:
            # Verifica se existem movimentações, pedidos ou outras relações com este produto
            response = supabase.table("movimentacoes_estoque").select("*", count="exact").eq("id_produto", id).execute()
            if response.count and response.count > 0:
                return True
            
            response = supabase.table("pedidos").select("*", count="exact").eq("id_produto", id).execute()
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
        produto = cls.find_by_id(id)
        if not produto:
            raise ValueError("produto não encontrado.")
        if cls.has_related_records(id):
            raise ValueError("Não é possível excluir o produto porque possui tabelas vinculadas.")
        cls.delete(id)

    @classmethod
    def buscar_por_produto(cls, id_produto):
        #Busca um produto no banco e retorna uma instância da classe
        supabase = conectar_supabase()
        response = supabase.table("produtos").select("*").eq(cls.primary_key, id_produto).execute()
        
        if response.data:
            d = response.data[0]
            return cls(
                id=d.get('id_produto'),
                nome=d.get('nome'),
                categoria=d.get('categoria'),
                unidade_medida=d.get('unidade_medida'),
                descricao=d.get('descricao'),
                fornecedor=d.get('fornecedor'),
                valor_unitario_venda=d.get('valor_unitario_venda'),
                valor_unitario_custo=d.get('valor_unitario_custo'),
                quantidade_atual=d.get('quantidade_atual'),  
                quantidade_minima=d.get('quantidade_minima'),
                controlado=d.get('controlado'),
                imagem_url=d.get('imagem_url'),
            )
        return None
    
    def inserir_produto(self):
        #Insere o produto usando o método da classe base
        supabase = conectar_supabase()
        dados = {campo: getattr(self, campo) for campo in self.fields}
        
        response = supabase.table(self.table).insert(dados).execute()
        return response.data


