-- Script Supabase 

-- Atualização: 26/05/2026

-- Atualização: 02/06/2026

-- Atualização: 16/06/2026

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.areas_estoque (
  id_area bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome character varying,
  descricao character varying,
  area_rua character varying,
  area_codigo character varying,
  distancia_entre_prat character varying,
  temperatura_max integer,
  temperatura_min integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT areas_estoque_pkey PRIMARY KEY (id_area)
);
CREATE TABLE public.produtos (
  id_produto bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome character varying NOT NULL,
  categoria character varying,
  descricao text,
  fornecedor character varying,
  valor_unitario_venda numeric,
  quantidade_minima integer,
  controlado character varying,
  unidade_medida character varying,
  valor_unitario_custo numeric,
  quantidade_atual integer,
  imagem_url character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT produtos_pkey PRIMARY KEY (id_produto)
);
CREATE TABLE public.fornecedores (
  id_fornecedor bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome character varying,
  cnpj character varying,
  telefone character varying,
  email character varying,
  cep character varying,
  imagem_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fornecedores_pkey PRIMARY KEY (id_fornecedor)
);
CREATE TABLE public.clientes (
  id_cliente bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome character varying,
  cpf_cnpj character varying,
  telefone character varying,
  email character varying,
  codigo_postal character varying,
  imagem_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clientes_pkey PRIMARY KEY (id_cliente)
);
CREATE TABLE public.descarte_motivos (
  id_motivo bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  descricao character varying,
  CONSTRAINT descarte_motivos_pkey PRIMARY KEY (id_motivo)
);
CREATE TABLE public.usuarios (
  id_usuario bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome character varying,
  email character varying NOT NULL UNIQUE,
  senha character varying,
  cpf character varying UNIQUE,
  criado_em timestamp with time zone DEFAULT now(),
  imagem_url text,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario)
);
CREATE TABLE public.permissoes (
  id_permissao bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  recurso character varying,
  acao character varying,
  CONSTRAINT permissoes_pkey PRIMARY KEY (id_permissao)
);
CREATE TABLE public.camaras_frias (
  id_camara_fria bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome character varying,
  temperatura_atual numeric,
  temperatura_min numeric,
  temperatura_max numeric,
  id_area bigint,
  CONSTRAINT camaras_frias_pkey PRIMARY KEY (id_camara_fria),
  CONSTRAINT camaras_frias_id_area_fkey FOREIGN KEY (id_area) REFERENCES public.areas_estoque(id_area)
);
CREATE TABLE public.funcionarios (
  id_funcionario bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_usuario bigint,
  cargo character varying,
  setor character varying,
  imagem_url text,
  CONSTRAINT funcionarios_pkey PRIMARY KEY (id_funcionario),
  CONSTRAINT funcionarios_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.lotes (
  id_lote bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_fornecedor bigint,
  id_produto bigint NOT NULL,
  numero_lote character varying,
  data_fabricacao date,
  data_validade date,
  quantidade_minima integer NOT NULL,
  quantidade integer NOT NULL,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT lotes_pkey PRIMARY KEY (id_lote),
  CONSTRAINT lotes_id_fornecedor_fkey FOREIGN KEY (id_fornecedor) REFERENCES public.fornecedores(id_fornecedor),
  CONSTRAINT lotes_id_produto_fkey FOREIGN KEY (id_produto) REFERENCES public.produtos(id_produto)
);
CREATE TABLE public.pedidos (
  id_pedido bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_cliente bigint,
  data_pedido date DEFAULT now(),
  status_pedido character varying,
  data_prevista date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pedidos_pkey PRIMARY KEY (id_pedido),
  CONSTRAINT pedidos_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente)
);
CREATE TABLE public.sensores (
  id_sensor bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  tipo character varying,
  localizacao character varying,
  id_camara bigint,
  id_area bigint,
  CONSTRAINT sensores_pkey PRIMARY KEY (id_sensor),
  CONSTRAINT sensores_id_camara_fkey FOREIGN KEY (id_camara) REFERENCES public.camaras_frias(id_camara_fria),
  CONSTRAINT sensores_id_area_fkey FOREIGN KEY (id_area) REFERENCES public.areas_estoque(id_area)
);
CREATE TABLE public.pedido_itens (
  id_item bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_pedido bigint NOT NULL,
  id_produto bigint NOT NULL,
  quantidade integer NOT NULL,
  preco_unitario numeric,
  CONSTRAINT pedido_itens_pkey PRIMARY KEY (id_item),
  CONSTRAINT pedido_itens_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido),
  CONSTRAINT pedido_itens_id_produto_fkey FOREIGN KEY (id_produto) REFERENCES public.produtos(id_produto)
);
CREATE TABLE public.entradas_produtos (
  id_entrada bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_produto bigint NOT NULL,
  quantidade integer NOT NULL,
  data_entrada timestamp with time zone DEFAULT now(),
  id_usuario bigint,
  CONSTRAINT entradas_produtos_pkey PRIMARY KEY (id_entrada),
  CONSTRAINT entradas_produtos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario),
  CONSTRAINT entradas_produtos_id_produto_fkey FOREIGN KEY (id_produto) REFERENCES public.produtos(id_produto)
);
CREATE TABLE public.movimentacoes_estoque (
  id_movimentacoes_estoque bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_lote bigint NOT NULL,
  tipo_movimentacao character varying,
  quantidade integer,
  data_hora timestamp with time zone DEFAULT now(),
  id_usuario bigint,
  CONSTRAINT movimentacoes_estoque_pkey PRIMARY KEY (id_movimentacoes_estoque),
  CONSTRAINT movimentacoes_estoque_id_lote_fkey FOREIGN KEY (id_lote) REFERENCES public.lotes(id_lote),
  CONSTRAINT movimentacoes_estoque_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.descartes (
  id_descarte bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_lote bigint NOT NULL,
  id_motivo bigint NOT NULL,
  quantidade integer NOT NULL,
  data_descarte timestamp with time zone DEFAULT now(),
  id_usuario bigint NOT NULL,
  observacao character varying,
  CONSTRAINT descartes_pkey PRIMARY KEY (id_descarte),
  CONSTRAINT descartes_id_lote_fkey FOREIGN KEY (id_lote) REFERENCES public.lotes(id_lote),
  CONSTRAINT descartes_id_motivo_fkey FOREIGN KEY (id_motivo) REFERENCES public.descarte_motivos(id_motivo),
  CONSTRAINT descartes_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.alertas (
  id_alerta bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  tipo_alerta character varying,
  mensagem text,
  nivel character varying,
  id_lote bigint,
  id_camara bigint,
  data_criacao timestamp with time zone DEFAULT now(),
  CONSTRAINT alertas_pkey PRIMARY KEY (id_alerta),
  CONSTRAINT alertas_id_lote_fkey FOREIGN KEY (id_lote) REFERENCES public.lotes(id_lote),
  CONSTRAINT alertas_id_camara_fkey FOREIGN KEY (id_camara) REFERENCES public.camaras_frias(id_camara_fria)
);
CREATE TABLE public.temperaturas_controladas (
  id_registro bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_sensor bigint NOT NULL,
  valor numeric NOT NULL,
  data_hora timestamp with time zone DEFAULT now(),
  status_sensor character varying,
  CONSTRAINT temperaturas_controladas_pkey PRIMARY KEY (id_registro),
  CONSTRAINT temperaturas_controladas_id_sensor_fkey FOREIGN KEY (id_sensor) REFERENCES public.sensores(id_sensor)
);
CREATE TABLE public.devolucao (
  id_devolucao bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_lote bigint NOT NULL,
  motivo text NOT NULL,
  data_inicio date DEFAULT CURRENT_DATE,
  data_fim date,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT devolucao_pkey PRIMARY KEY (id_devolucao),
  CONSTRAINT devolucao_id_lote_fkey FOREIGN KEY (id_lote) REFERENCES public.lotes(id_lote)
);
CREATE TABLE public.inspecoes_estoque (
  id_inspecao_estoque bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_lote bigint NOT NULL,
  quantidade_contada integer NOT NULL,
  status_inspecoes_estoque character varying,
  observacao character varying,
  id_usuario bigint NOT NULL,
  data_inspecao timestamp with time zone DEFAULT now(),
  CONSTRAINT inspecoes_estoque_pkey PRIMARY KEY (id_inspecao_estoque),
  CONSTRAINT inspecoes_estoque_id_lote_fkey FOREIGN KEY (id_lote) REFERENCES public.lotes(id_lote),
  CONSTRAINT inspecoes_estoque_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.inspecoes_recebimento (
  id_inspecao bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_entrada bigint NOT NULL,
  id_usuario bigint NOT NULL,
  status_inspecoes_recebimento character varying,
  observacao character varying,
  data_inspecao timestamp with time zone DEFAULT now(),
  CONSTRAINT inspecoes_recebimento_pkey PRIMARY KEY (id_inspecao),
  CONSTRAINT inspecoes_recebimento_id_entrada_fkey FOREIGN KEY (id_entrada) REFERENCES public.entradas_produtos(id_entrada),
  CONSTRAINT inspecoes_recebimento_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.notificacoes (
  id_notificacao bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_usuario bigint NOT NULL,
  titulo character varying,
  mensagem text,
  lida boolean DEFAULT false,
  data_envio timestamp with time zone DEFAULT now(),
  CONSTRAINT notificacoes_pkey PRIMARY KEY (id_notificacao),
  CONSTRAINT notificacoes_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.saidas_produtos (
  id_saida bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_produto bigint NOT NULL,
  id_usuario bigint,
  id_cliente bigint,
  quantidade integer NOT NULL,
  tipo_saida character varying,
  data_saida timestamp with time zone DEFAULT now(),
  CONSTRAINT saidas_produtos_pkey PRIMARY KEY (id_saida),
  CONSTRAINT saidas_produtos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario),
  CONSTRAINT saidas_produtos_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente),
  CONSTRAINT saidas_produtos_id_produto_fkey FOREIGN KEY (id_produto) REFERENCES public.produtos(id_produto)
);
CREATE TABLE public.auditoria (
  id_log bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_usuario bigint,
  acao text,
  tabela_afetada character varying,
  data_hora timestamp with time zone DEFAULT now(),
  CONSTRAINT auditoria_pkey PRIMARY KEY (id_log),
  CONSTRAINT logs_sistema_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.leituras (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  device_id character varying NOT NULL,
  sensor character varying NOT NULL,
  temperatura double precision,
  umidade double precision,
  distancia double precision,
  rfid_uid character varying,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT leituras_pkey PRIMARY KEY (id)
);