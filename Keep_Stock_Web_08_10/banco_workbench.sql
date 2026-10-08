CREATE DATABASE IF NOT EXISTS keep_stock;
USE keep_stock;

DROP DATABASE keep_stock;
 
-- Para Workbench (Maria DB)
 
-- Tabela fornecedores
CREATE TABLE fornecedores (
	id_fornecedor INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150),
    cnpj VARCHAR(14),
    telefone INT,
    email VARCHAR(30),
    endereco VARCHAR(90),
    prod_fornecido VARCHAR(100)
);
 
 
-- Tabela produtos
CREATE TABLE produtos (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    categoria VARCHAR(80),
    unidade_medida VARCHAR(80),
    descricao TEXT,
    fabricante VARCHAR(150),
    valor_unitario_venda INT,
    valor_unitario_custo INT,
    quantidade_produto INT,
    quantidade_minima INT,
    controlado VARCHAR(3)
);
 
 
-- Tabela lotes
CREATE TABLE lotes (
    id_lote INT AUTO_INCREMENT PRIMARY KEY,
    data_fabricacao DATE,
    data_validade DATE,
    quantidade_lote INT NOT NULL,
    quantidade_minima INT NOT NULL,
    codigo VARCHAR(250),
    CONSTRAINT fk_lote_produto FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
    CONSTRAINT fk_fornecedor_do_lote FOREIGN KEY (id_fornecedor) REFERENCES fornecedores(id_fornecedor)
);
 
-- Tabela areas_estoque    
CREATE TABLE areas_estoque (
    id_area INTEGER PRIMARY KEY AUTO_INCREMENT,
    rua_prat VARCHAR(14), -- de A - Z
    area_prat INT(2),
    nivel_prat INT(6), -- Vertical y
    vao_prat INT(9), -- horizontal x
    descricao VARCHAR(90),
    FOREIGN KEY (id_lote) REFERENCES lotes(id_lote) -- lote tem a caixa de produtos NÃO resfriados
);
 
-- Tabela camaras_frias   
CREATE TABLE camaras_frias (
    id_camara_fria INTEGER PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(80), -- nome produto
    gavetas VARCHAR(4),
    refrigeradores_dispoiveis VARCHAR(10),
    temperatura_atual DECIMAL(10),
    temperatura_min DECIMAL(10),
    temperatura_max DECIMAL(10),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
);
 
-- Tabela alertas
CREATE TABLE alertas (
    id_alerta INTEGER PRIMARY KEY AUTO_INCREMENT,
    tipo_alerta VARCHAR(100),
    mensagem VARCHAR(90),
    nivel VARCHAR(3), -- leve, grave, urgente
    data_criacao DATE,
    FOREIGN KEY (id_camara) REFERENCES camaras_frias(id_camara),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
);
 
-- Tabela clientes
CREATE TABLE clientes (
    id_cliente INTEGER PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150),
    cpf_cnpj VARCHAR(14),
    telefone INT,
    email VARCHAR(30),
    endereco VARCHAR(90)
);
 
-- Tabela usuarios do sistema (funcionarios)
CREATE TABLE usuarios (
    id_usuario INTEGER PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(120),
    email VARCHAR(120) NOT NULL UNIQUE,
    senha VARCHAR(20),
    cpf VARCHAR(11) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    ativo VARCHAR(3),
    criado_em DATE
);
 
-- Tabela  cargo de funcionarios
CREATE TABLE funcionarios (
	id_funcionario INTEGER PRIMARY KEY AUTO_INCREMENT,
    cargo VARCHAR(80),
    setor VARCHAR(20),
    salario DECIMAL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
 
-- Tabela descartes
CREATE TABLE descartes (
    id_descarte INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_motivo INT NOT NULL,
    quantidade INT NOT NULL,
    data_descarte DATE,
    observacao VARCHAR(90),
    FOREIGN KEY (id_lote) REFERENCES lotes(id_lote),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
);
 
-- Tabela devolucao
CREATE TABLE devolucao (
    id_devolucao INTEGER PRIMARY KEY AUTO_INCREMENT,
    motivo TEXT NOT NULL,
    FOREIGN KEY (id_lote) REFERENCES lotes(id_lote)
);
 
-- Tabela entrada_produtos
CREATE TABLE entrada_produtos (
    id_entrada INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_lote INT NOT NULL,
    quantidade INT NOT NULL,
    data_entrada DATE,
    id_usuario INT,
    FOREIGN KEY (id_lote) REFERENCES lotes(id_lote),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
 
-- Tabela inspecoes_estoque
CREATE TABLE inspecoes_estoque (
    id_inspecao_estoque INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_lote INT NOT NULL,
    quantidade_contada INT NOT NULL,
    status_inspecoes_estoque VARCHAR(50),
    observacao VARCHAR(90),
    id_usuario INT NOT NULL,
    data_inspecao DATE,
    FOREIGN KEY (id_lote) REFERENCES lotes(id_lote),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
 
 
-- Tabela movimentacoes_estoque
CREATE TABLE movimentacoes_estoque (
    id_movimentacoes_estoque INTEGER PRIMARY KEY AUTO_INCREMENT,
    tipo_movimentacao INT(6), -- entrada no est, entrada nas camaras frias, saida
    quantidade INT,
    data_hora TIMESTAMP,
    FOREIGN KEY (id_lote) REFERENCES lotes(id_lote),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
 
-- Tabela notificacoes
CREATE TABLE notificacoes (
    id_notificacao INTEGER PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(90),
    mensagem VARCHAR(150),
    data_envio DATE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
 
-- Tabela pedidos
CREATE TABLE pedidos (
    id_pedido INTEGER PRIMARY KEY AUTO_INCREMENT,
    data_pedido DATE,
    status_pedido VARCHAR(50), -- durante a viagem
    data_prevista DATE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) -- registro de quem pediu
);
 
-- Tabela pedido_itens
CREATE TABLE pedido_itens (
    id_item INTEGER PRIMARY KEY AUTO_INCREMENT,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2),
    FOREIGN KEY (id_lote) REFERENCES lotes(id_lote),   -- produtos não controlados
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)  -- produtos controlados
);
 
-- Tabela permissoes
CREATE TABLE permissoes (
    id_permissao INTEGER PRIMARY KEY AUTO_INCREMENT,
    recurso VARCHAR(100),
    acao VARCHAR(100)
);
 
-- Tabela saidas_produtos
CREATE TABLE saidas_produtos (
    id_saida INTEGER PRIMARY KEY AUTO_INCREMENT,
    quantidade INT NOT NULL,
    data_saida DATE,
    FOREIGN KEY (id_lote) REFERENCES lotes(id_lote),  -- produto impacotado
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario), -- quem faz esse processo
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) -- pra quem vai
);
 
-- Tabela sensores
CREATE TABLE sensores (
    id_sensor INTEGER PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(50), -- qual sensor
    FOREIGN KEY (id_camara) REFERENCES camaras_frias(id_camara),
    FOREIGN KEY (id_area) REFERENCES areas_estoque(id_area)
);
 
-- Tabela temperaturas_controladas
CREATE TABLE temperaturas_controladas (
    id_registro INTEGER PRIMARY KEY AUTO_INCREMENT,
    valor DECIMAL(6,2) NOT NULL,
    data_hora TIMESTAMP,
    status_sensor VARCHAR(30),
    FOREIGN KEY (id_sensor) REFERENCES sensores(id_sensor)
);