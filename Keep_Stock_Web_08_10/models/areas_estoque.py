from core.crud_base import CrudBase
from core.database import conectar_supabase
from core.validator import Validator

class Area(CrudBase):
    table = "areas_estoque"
    primary_key = "id_area" 
    fields = [
        "nome",
        "descricao",
        "area_rua",
        "area_codigo",
        "distancia_entre_prat",
        "temperatura_max",
        "temperatura_min",
    ]

    def __init__(self, nome=None, descricao=None, area_rua=None, area_codigo=None, distancia_entre_prat=None, temperatura_max=None, temperatura_min=None, id=None, id_area=None, **kwargs):
        self.nome = nome
        self.descricao = descricao
        self.area_rua = area_rua
        self.area_codigo = area_codigo
        self.distancia_entre_prat = distancia_entre_prat
        self.temperatura_max = temperatura_max
        self.temperatura_min = temperatura_min
        self.id = id or id_area
        self.id_area = self.id
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
            Validator.required(self.nome, "nome"),
            Validator.required(self.area_rua, "rua da área"),
            Validator.required(self.area_codigo, "código da área"),
            Validator.required(self.distancia_entre_prat, "distância entre prateleiras"),
            Validator.required(self.temperatura_max, "temperatura máxima"),
            Validator.required(self.temperatura_min, "temperatura mínima")
        ]
        return [erro for erro in erros if erro]

    @classmethod
    def safe_delete(cls, id):
        supabase = conectar_supabase()
        area = cls.find_by_id(id)
        if not area:
            raise ValueError("Área não encontrada.")
        cls.delete(id)

    @classmethod
    def buscar_por_area(cls, id_area):
        #Busca uma área no banco e retorna uma instância da classe
        supabase = conectar_supabase()
        response = supabase.table("areas_estoque").select("*").eq(cls.primary_key, id_area).execute()
        
        if response.data:
            d = response.data[0]
            return cls(
                nome=d.get('nome'),
                descricao=d.get('descricao'),
                area_rua=d.get('area_rua'),
                area_codigo=d.get('area_codigo'),
                distancia_entre_prat=d.get('distancia_entre_prat'),
                temperatura_max=d.get('temperatura_max'),
                temperatura_min=d.get('temperatura_min'),
                id_area=d.get('id_area')
            )
        return None


