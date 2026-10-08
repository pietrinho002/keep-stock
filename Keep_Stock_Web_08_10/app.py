from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from core.validator import Validator
from core.security import gerar_hash_senha, verificar_senha
from flask_cors import CORS
from supabase import create_client, Client
from models.produto import Produto
from models.clientes import Cliente
from models.fornecedores import Fornecedor
from models.pedidos import Pedido
from models.movimentacoes_estoque import Movimentacoes_estoque
from models.entrada_produtos import Entradas_produtos
from models.saidas_produtos import Saidas_produtos
from models.areas_estoque import Area
from models.usuarios import Usuarios
from core.database import conectar_supabase
from datetime import datetime
from services.imagem_storage import upload_imagem, deletar_imagem
import requests
import urllib.parse
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# CONFIGURAÇÕES - TOKENS E URLS
app.secret_key = '133829382937huu92uwnsjw2iqjka93uend9nsmiwnd2982ubnsk'  
INVERTEXTO_TOKEN = "25384|j9ZTOhnY61kbOHY59QagFaLy86QvrCeY"

SUPABASE_URL = "https://gysiqyxpmlxmlolqzaqs.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5c2lxeXhwbWx4bWxvbHF6YXFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk2MDcwNiwiZXhwIjoyMDkwNTM2NzA2fQ.DRqq9majrxnIT8oUnhrY2qQFB-OG6V4yOfTSGg27lpQ"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ROTAS DE USUÁRIOS (LOGIN E CADASTRO)

@app.route('/cadastrar_user', methods=['POST'])
def cadastrar():
    # Recebe os dados do JavaScript
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "Dados não fornecidos"}), 400

    # Validações Básicas de Presença
    nome = dados.get('nome')
    email_cliente = dados.get('email', '').strip().lower()
    cpf_cliente = dados.get('cpf', '').strip()
    senha = dados.get('senha')

    erro_nome = Validator.required(nome, "Nome")
    if erro_nome:
        return jsonify({"erro": erro_nome}), 400

    if not Validator.validar_nome(dados):
        return jsonify({"erro": "O nome deve ter entre 1 e 120 caracteres."}), 400

    # Validação de E-mail
    resultado_api_email = Validator.validar_email(email_cliente, INVERTEXTO_TOKEN)

    if not resultado_api_email:
        return jsonify({"erro": "Falha ao conectar com o validador de e-mail."}), 500

    if not resultado_api_email.get("valid_format") or not resultado_api_email.get("valid_mx"):
        return jsonify({"erro": "E-mail informado é inválido ou não existe."}), 400

    # Validação de CPF
    resultado_api_cpf = Validator.validar_cpf(cpf_cliente, INVERTEXTO_TOKEN)

    if not resultado_api_cpf:
        return jsonify({"erro": "Falha técnica ao validar CPF. Tente novamente mais tarde."}), 500

    if not resultado_api_cpf.get("valid"):
        return jsonify({
            "erro": "CPF inválido.",
            "detalhes": "O número informado não passou na validação oficial."
        }), 400

    # Gravação no Supabase
    try:
        # Cria o usuário no Auth do Supabase 
        supabase.auth.sign_up({"email": email_cliente, "password": senha})

        novo_usuario = {
            "nome": nome,
            "email": email_cliente,
            "cpf": cpf_cliente,
            "senha": gerar_hash_senha(senha)  
        }

        supabase.table("usuarios").insert(novo_usuario).execute()

        return jsonify({"mensagem": "Cadastro realizado com sucesso!"}), 201

    except Exception as e:
        print(f"Erro no Supabase: {e}")
        return jsonify({"erro": "Erro ao salvar no banco de dados. Verifique se o CPF ou E-mail já existem."}), 500

@app.route('/login', methods=['PUT'])
def login():
    try:
        dados = request.get_json()
        email_login = dados.get('email').strip().lower()
        senha_login = dados.get('senha')

        resposta = supabase.table("usuarios") \
            .select("*") \
            .eq("email", email_login) \
            .execute()

        # Verifica se o usuário existe mesmo
        if not resposta.data:
            return jsonify({"erro": "E-mail não cadastrado."}), 404

        usuario = resposta.data[0]

        # Verifica se a senha coincide 
        if verificar_senha(senha_login, usuario.get('senha')):
            # Autentica no Auth do Supabase para gerar a sessão do usuário
            try:
                auth_resposta = supabase.auth.sign_in_with_password({
                    "email": email_login,
                    "password": senha_login
                })
                session['access_token'] = auth_resposta.session.access_token
                session['refresh_token'] = auth_resposta.session.refresh_token
            except Exception as erro_auth:
                print(f"Aviso: falha ao autenticar no Supabase Auth: {erro_auth}")

            # Guarda os dados do usuário logado na sessão
            session['usuario'] = {
                "id": usuario.get('id_usuario'),
                "nome": usuario.get('nome'),
                "email": usuario.get('email')
            }

            return jsonify({
                "mensagem": "Login realizado com sucesso!",
                "nome": usuario.get('nome')
            }), 200
        else:
            return jsonify({"erro": "Senha incorreta."}), 401

    # Se houver erro
    except Exception as e:
        print(f"Erro interno no Login: {e}")
        return jsonify({"erro": "Erro interno no servidor."}), 500
    
@app.route('/')
def index():
    # Rota raiz abre o dashboard com os dados das demais telas
    produtos = Produto.find_all(order_by="nome")
    pedidos = Pedido.find_all(order_by="id_pedido")
    entradas = Entradas_produtos.find_all(order_by="id_entrada")
    saidas = Saidas_produtos.find_all(order_by="id_saida")
    clientes = Cliente.find_all(order_by="nome")

    produtos_map = {p["id_produto"]: p["nome"] for p in produtos}
    clientes_map = {c["id_cliente"]: c["nome"] for c in clientes}

    # Produtos que atingiram ou passaram da quantidade minima
    estoque_baixo = [
        p for p in produtos
        if (p.get("quantidade_atual") or 0) <= (p.get("quantidade_minima") or 0)
    ]

    pedidos_pendentes = [
        p for p in pedidos
        if (p.get("status_pedido") or "").strip().lower() not in STATUS_PEDIDO_FINALIZADO
    ]

    valor_estoque = sum(
        (p.get("quantidade_atual") or 0) * to_float(p.get("valor_unitario_venda"))
        for p in produtos
    )

    return render_template(
        'index.html',
        total_produtos=len(produtos),
        total_estoque_baixo=len(estoque_baixo),
        total_pedidos_pendentes=len(pedidos_pendentes),
        total_movimentacoes=len(entradas) + len(saidas),
        valor_estoque=valor_estoque,
        estoque_baixo=estoque_baixo[:5],
        entradas=sorted(entradas, key=lambda e: e.get("data_entrada") or "", reverse=True)[:5],
        saidas=sorted(saidas, key=lambda s: s.get("data_saida") or "", reverse=True)[:5],
        produtos_map=produtos_map,
        clientes_map=clientes_map,
    )

@app.route('/login.html')
def login_html():
    # Renderiza a página de login
    return render_template('login.html')

@app.route('/logout')
def logout():
    # Encerra a sessão no Supabase Auth
    try:
        supabase.auth.sign_out()
    except Exception as erro_auth:
        print(f"Aviso: falha ao encerrar sessão no Supabase Auth: {erro_auth}")

    # Limpa a sessão local do Flask
    session.clear()

    # Volta para a tela de login
    return redirect(url_for('login_html'))


# Rotas que não exigem uma sessão ativa
ROTAS_PUBLICAS = {'login', 'login_html', 'cadastrar', 'logout', 'static'}

@app.before_request
def exigir_login():
    # Libera as rotas públicas (login, cadastro, logout e arquivos estáticos)
    if request.endpoint is None or request.endpoint in ROTAS_PUBLICAS:
        return
    # Bloqueia o acesso ao restante do sistema sem sessão de usuário
    if 'usuario' not in session:
        return redirect(url_for('login_html'))

# Status que indicam um pedido ja finalizado
STATUS_PEDIDO_FINALIZADO = {"concluido", "concluído", "entregue", "finalizado", "cancelado"}

# Funções Auxiliares

def filtrar_por_termo(registros, termo, campos):
    # Filtra os registros da tela pelo termo digitado na barra de pesquisa
    if not termo:
        return registros
    termo = termo.lower()
    return [
        registro for registro in registros
        if any(termo in str(registro.get(campo) or "").lower() for campo in campos)
    ]


def to_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def to_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


# Get dos Formulários

def get_produto_form():
    return {
        "nome": request.form.get("nome", "").strip(),
        "fornecedor": request.form.get("fornecedor", "").strip(),
        "categoria": request.form.get("categoria", "").strip(),
        "unidade_medida": request.form.get("unidade_medida", "").strip(),
        "descricao": request.form.get("descricao", "").strip(),
        "valor_unitario_venda": to_float(request.form.get("valor_unitario_venda")),
        "valor_unitario_custo": to_float(request.form.get("valor_unitario_custo")),
        "quantidade_atual": to_int(request.form.get("quantidade_atual")),
        "quantidade_minima": to_int(request.form.get("quantidade_minima")),
        "controlado": request.form.get("controlado"),
    }

def get_cliente_form():
    return {
        "nome": request.form.get("nome", "").strip(),
        "cpf_cnpj": request.form.get("cpf_cnpj", "").strip(),
        "telefone": request.form.get("telefone", "").strip(),
        "email": request.form.get("email", "").strip(),
        "codigo_postal": request.form.get("codigo_postal", "").strip()
    }
    
def get_fornecedor_form():
    return {
        "nome": request.form.get("nome", "").strip(),
        "cnpj": request.form.get("cnpj", "").strip(),
        "telefone": request.form.get("telefone", "").strip(),
        "email": request.form.get("email", "").strip(),
        "cep": request.form.get("cep", "").strip(),
    }

def get_pedido_form():
    return {
        "id_cliente": to_int(request.form.get("id_cliente")),
        "data_pedido": request.form.get("data_pedido", "").strip(),
        "status_pedido": request.form.get("status_pedido", "").strip(),
        "data_prevista": request.form.get("data_prevista", "").strip()
    }

def get_movimentacao_form():
    return {
        "id_produto": to_int(request.form.get("id_produto")),
        "id_usuario": to_int(request.form.get("id_usuario")),
        "tipo_movimentacao": request.form.get("tipo_movimentacao", "").strip(),
        "quantidade": to_int(request.form.get("quantidade")),
        "data_hora": request.form.get("data_hora", "").strip()
    }

def get_area_form():
    return {
        "nome": request.form.get("nome", "").strip(),
        "descricao": request.form.get("descricao", "").strip(),
        "area_rua": request.form.get("area_rua", "").strip(),
        "area_codigo": request.form.get("area_codigo", "").strip(),
        "distancia_entre_prat": request.form.get("distancia_entre_prat", "").strip(),
        "temperatura_max": to_int(request.form.get("temperatura_max")),
        "temperatura_min": to_int(request.form.get("temperatura_min"))
    }

def get_entrada_form():
    return {
        "id_produto": to_int(request.form.get("id_produto"), default=None),
        "quantidade": to_int(request.form.get("quantidade")),
        "data_entrada": request.form.get("data_entrada", "").strip() or datetime.now().isoformat(),
        "id_usuario": to_int(request.form.get("id_usuario"), default=None)
    }

def get_saida_form():
    return {
        "id_produto": to_int(request.form.get("id_produto"), default=None),
        "quantidade": to_int(request.form.get("quantidade")),
        "tipo_saida": request.form.get("tipo_saida", "").strip(),
        "id_cliente": to_int(request.form.get("id_cliente"), default=None),
        "data_saida": request.form.get("data_saida", "").strip() or datetime.now().isoformat(),
        "id_usuario": to_int(request.form.get("id_usuario"), default=None)
    }

# ROTAS DE TELAS

@app.errorhandler(404)
def page_not_found(e):
    # Retorna o template 404.html com status 404
    return render_template('404.html'), 404

# Produtos
@app.route("/produtos")
def produtos():
    termo = request.args.get("q", "").strip()
    fornecedores = supabase.table("fornecedores").select("*").execute().data
    produtos = filtrar_por_termo(
        Produto.find_all(order_by="nome"), termo,
        ["nome", "categoria", "fornecedor", "descricao", "unidade_medida"]
    )
    return render_template("produtos.html", produtos=produtos, fornecedores=fornecedores, termo=termo)

# Lotes
@app.route("/lotes")
def lotes():
    return render_template("lotes.html", lotes=Lote.find_all(order_by="id_lote"))

# Clientes
@app.route("/clientes")
def clientes():
    termo = request.args.get("q", "").strip()
    clientes = filtrar_por_termo(
        Cliente.find_all(order_by="nome"), termo,
        ["nome", "cpf_cnpj", "telefone", "email", "codigo_postal"]
    )
    return render_template("clientes.html" , clientes=clientes, termo=termo)

# Fornecedoes
@app.route("/fornecedores")
def fornecedores():
    termo = request.args.get("q", "").strip()
    fornecedores = filtrar_por_termo(
        Fornecedor.find_all(order_by="nome"), termo,
        ["nome", "cnpj", "telefone", "email", "cep"]
    )
    return render_template("fornecedores.html", fornecedores=fornecedores, termo=termo)

# Pedidos
@app.route("/pedidos")
def pedidos():
    termo = request.args.get("q", "").strip()
    clientes = Cliente.find_all(order_by="nome")
    clientes_map = {c["id_cliente"]: c["nome"] for c in clientes}
    pedidos = [
        dict(p, cliente=clientes_map.get(p.get("id_cliente"), ""))
        for p in Pedido.find_all(order_by="id_pedido")
    ]
    pedidos = filtrar_por_termo(
        pedidos, termo,
        ["id_pedido", "cliente", "status_pedido", "data_pedido", "data_prevista"]
    )
    return render_template("pedidos.html", pedidos=pedidos, clientes=clientes, termo=termo)

# Movimentações
@app.route("/movimentacoes")
def movimentacoes():
    termo = request.args.get("q", "").strip()
    produtos = Produto.find_all(order_by="nome")
    clientes = Cliente.find_all(order_by="nome")
    produtos_map = {p["id_produto"]: p["nome"] for p in produtos}
    clientes_map = {c["id_cliente"]: c["nome"] for c in clientes}

    # Adiciona o nome do produto e do cliente para permitir a pesquisa por eles
    entradas = [
        dict(e, produto=produtos_map.get(e.get("id_produto"), ""))
        for e in Entradas_produtos.find_all(order_by="id_entrada")
    ]
    saidas = [
        dict(s, produto=produtos_map.get(s.get("id_produto"), ""), cliente=clientes_map.get(s.get("id_cliente"), ""))
        for s in Saidas_produtos.find_all(order_by="id_saida")
    ]

    entradas = filtrar_por_termo(entradas, termo, ["produto", "data_entrada"])
    saidas = filtrar_por_termo(saidas, termo, ["produto", "cliente", "tipo_saida", "data_saida"])

    return render_template(
        "movimentacoes.html",
        entradas=entradas,
        saidas=saidas,
        produtos=produtos,
        clientes=clientes,
        produtos_map=produtos_map,
        clientes_map=clientes_map,
        termo=termo,
    )

# Áreas
@app.route("/areas")
def areas():
    termo = request.args.get("q", "").strip()
    areas = filtrar_por_termo(
        Area.find_all(order_by="id_area"), termo,
        ["nome", "descricao", "area_rua", "area_codigo"]
    )
    return render_template("areas.html" , areas=areas, termo=termo)

# Conformidades
@app.route("/conformidades")
def conformidades():
    return render_template("conformidades.html")

# Configurações
@app.route("/configuracoes")
def configuracoes():
    return render_template("configuracoes.html", usuario=session.get("usuario"))

# Relatórios
@app.route("/relatorios")
def relatorios():
    return render_template("relatorios.html")


# TABELAS E SUAS RESPECTIVAS TELAS NO FRONTEND
# -- Dashboard = Um pouco de tudo
# -- Produtos: produtos.html
# -- Clientes: clientes.html
# -- Fornecedores: fornecedores.html
# -- Pedidos e Pedido_Itens: pedidos.html
# -- Movimentações, Lotes, Entradas e Saídas: movimentacoes.html
# -- Áreas, Áreas_Controladas, Sensores, Temperaturas_Controladas: areas.html
# -- Relatórios: relatorios.html
# -- Permissões, Notificações, Informações de usuário, Sensores, Alertas: configuracoes.html


# Produtos

@app.route("/produto/salvar", methods=["POST"])
def salvar_produto():

    dados = get_produto_form()
    imagem = request.files.get("imagem")
    imagem_enviada = None
    
    try:
        if imagem and imagem.filename:
            imagem_enviada = upload_imagem(imagem)
            dados["imagem_url"] = imagem_enviada
        else:
            dados["imagem_url"] = None
        produto = Produto(**dados)
        erros = produto.validate()
        
        if erros:
            if imagem_enviada:
                deletar_imagem(imagem_enviada)

            for erro in erros:
                flash(erro, "erro")
            return render_template("produtos.html",produto=dados)

        produto.inserir_produto()
        flash("Produto cadastrado com sucesso.","sucesso")

        return redirect(url_for("produtos"))

    except Exception as e:

        if imagem_enviada:
            deletar_imagem(imagem_enviada)
        flash(f"Erro ao cadastrar produto: {e}","erro")
        return render_template("produtos.html",produto=dados, produtos=Produto.find_all(order_by="nome"), fornecedores=fornecedores)

@app.route("/produto/atualizar/<int:id>", methods=["POST"])
def atualizar_produto(id):

    dados = get_produto_form()
    dados["id"] = id
    imagem = request.files.get("imagem")
    nova_imagem = None

    try:
        produto_atual = Produto.find_by_id(id)

        if not produto_atual:
            flash("Produto não encontrado.","erro")
            return redirect(url_for("produtos"))
        dados["imagem_url"] = produto_atual.get("imagem_url")

        if imagem and imagem.filename:
            nova_imagem = upload_imagem(imagem)
            dados["imagem_url"] = nova_imagem

        produto = Produto(**dados)
        erros = produto.validate()

        if erros:
            if nova_imagem:
                deletar_imagem(nova_imagem)
            for erro in erros:
                flash(erro, "erro")
            return render_template("produtos.html",produto=dados)

        produto.update(id)

        if nova_imagem:
            imagem_antiga = produto_atual.get("imagem_url")
            if imagem_antiga:
                deletar_imagem(imagem_antiga)
        flash("Produto atualizado com sucesso.","sucesso")

        return redirect(url_for("produtos"))
    except Exception as e:
        if nova_imagem:
            deletar_imagem(nova_imagem)

        dados["id"] = id

        flash( f"Erro ao atualizar produto: {e}","erro")
        return render_template( "produtos.html",produto=dados)

@app.route("/produto/excluir/<int:id>")
def excluir_produto(id):
    try:
        produto = Produto.find_by_id(id)
        if not produto:
            flash("Produto não encontrado.","erro")
            return redirect(url_for("produtos"))
        imagem = produto.get("imagem_url")
        Produto.safe_delete(id)
        if imagem:
            deletar_imagem(imagem)
        flash("Produto excluído com sucesso.","sucesso")
    except ValueError as e:
        flash(str(e),"erro")
    except Exception as e:
        flash( f"Erro ao excluir produto: {e}","erro")

    return redirect(url_for("produtos"))

@app.route("/cliente/salvar", methods=["POST"])
def salvar_cliente():

    dados = get_cliente_form()
    imagem = request.files.get("imagem")
    imagem_enviada = None

    try:
        if imagem and imagem.filename:
            imagem_enviada = upload_imagem(imagem, bucket="Clientes")
            dados["imagem_url"] = imagem_enviada
        else:
            dados["imagem_url"] = None

        cliente = Cliente(**dados)
        erros = cliente.validate()

        if erros:
            if imagem_enviada:
                deletar_imagem(imagem_enviada, bucket="Clientes")

            for erro in erros:
                flash(erro, "erro")

            return render_template("clientes.html", cliente=dados)

        cliente.inserir_cliente()
        flash("Cliente cadastrado com sucesso.", "sucesso")
        return redirect(url_for("clientes"))

    except Exception as e:
        if imagem_enviada:
            deletar_imagem(imagem_enviada, bucket="Clientes")
        flash(f"Erro ao cadastrar cliente: {e}", "erro")
        return render_template("clientes.html", cliente=dados)

@app.route("/cliente/atualizar/<int:id>", methods=["POST"])
def atualizar_cliente(id):

    dados = get_cliente_form()
    dados["id"] = id
    imagem = request.files.get("imagem")
    nova_imagem = None

    try:
        cliente_atual = Cliente.find_by_id(id)

        if not cliente_atual:
            flash("Cliente não encontrado.", "erro")
            return redirect(url_for("clientes"))
        dados["imagem_url"] = cliente_atual.get("imagem_url")

        if imagem and imagem.filename:
            nova_imagem = upload_imagem(imagem, bucket="Clientes")
            dados["imagem_url"] = nova_imagem

        cliente = Cliente(**dados)
        erros = cliente.validate()

        if erros:
            if nova_imagem:
                deletar_imagem(nova_imagem, bucket="Clientes")

            for erro in erros:
                flash(erro, "erro")
            return render_template("clientes.html", cliente=dados)

        cliente.update(id)

        if nova_imagem:
            imagem_antiga = cliente_atual.get("imagem_url")
            if imagem_antiga:
                deletar_imagem(imagem_antiga, bucket="Clientes")

        flash("Cliente atualizado com sucesso.", "sucesso")

        return redirect(url_for("clientes"))
    except Exception as e:
        if nova_imagem:
            deletar_imagem(nova_imagem, bucket="Clientes")

        dados["id"] = id
        flash(f"Erro ao atualizar cliente: {e}", "erro")
        return render_template("clientes.html", cliente=dados)

@app.route("/cliente/excluir/<int:id>")
def excluir_cliente(id):
    try:
        cliente = Cliente.find_by_id(id)
        if not cliente:
            flash("Cliente não encontrado.", "erro")
            return redirect(url_for("clientes"))

        imagem = cliente.get("imagem_url")
        Cliente.safe_delete(id)

        if imagem:
            deletar_imagem(imagem, bucket="Clientes")

        flash("Cliente excluído com sucesso.", "sucesso")
    except ValueError as e:
        flash(str(e), "erro")
    except Exception as e:
        flash(f"Erro ao excluir cliente: {e}", "erro")
    return redirect(url_for("clientes"))

# Fornecedores

@app.route("/fornecedor/salvar", methods=["POST"])
def salvar_fornecedor():

    dados = get_fornecedor_form()
    imagem = request.files.get("imagem")
    imagem_enviada = None

    try:
        if imagem and imagem.filename:
            imagem_enviada = upload_imagem(imagem, bucket="Fornecedores")
            dados["imagem_url"] = imagem_enviada
        else:
            dados["imagem_url"] = None

        fornecedor = Fornecedor(**dados)
        erros = fornecedor.validate()

        if erros:
            if imagem_enviada:
                deletar_imagem(imagem_enviada, bucket="Fornecedores")
                
            for erro in erros:
                flash(erro, "erro")

            return render_template("fornecedores.html", fornecedor=dados)
        fornecedor.inserir_fornecedor()
        flash("Fornecedor cadastrado com sucesso.", "sucesso")
        return redirect(url_for("fornecedores"))

    except Exception as e:
        if imagem_enviada:
            deletar_imagem(imagem_enviada, bucket="Fornecedores")

        flash(f"Erro ao cadastrar fornecedor: {e}", "erro")
        return render_template("fornecedores.html", fornecedor=dados)

@app.route("/fornecedor/atualizar/<int:id>", methods=["POST"])
def atualizar_fornecedor(id):

    dados = get_fornecedor_form()
    dados["id"] = id

    imagem = request.files.get("imagem")

    nova_imagem = None

    try:
        fornecedor_atual = Fornecedor.find_by_id(id)

        if not fornecedor_atual:
            flash("Fornecedor não encontrado.", "erro")
            return redirect(url_for("fornecedores"))

        dados["imagem_url"] = fornecedor_atual.get("imagem_url")

        if imagem and imagem.filename:
            nova_imagem = upload_imagem(imagem, bucket="Fornecedores")
            dados["imagem_url"] = nova_imagem

        fornecedor = Fornecedor(**dados)
        erros = fornecedor.validate()

        if erros:
            if nova_imagem:
                deletar_imagem(nova_imagem, bucket="Fornecedores")

            for erro in erros:
                flash(erro, "erro")

            return render_template("fornecedores.html", fornecedor=dados)

        fornecedor.update(id)

        if nova_imagem:
            imagem_antiga = fornecedor_atual.get("imagem_url")
            if imagem_antiga:
                deletar_imagem(imagem_antiga, bucket="Fornecedores")

        flash("Fornecedor atualizado com sucesso.", "sucesso")

        return redirect(url_for("fornecedores"))
    except Exception as e:
        if nova_imagem:
            deletar_imagem(nova_imagem, bucket="Fornecedores")

        dados["id"] = id

        flash(f"Erro ao atualizar fornecedor: {e}", "erro")

        return render_template("fornecedores.html", fornecedor=dados)

@app.route("/fornecedor/excluir/<int:id>")
def excluir_fornecedor(id):
    try:
        fornecedor = Fornecedor.find_by_id(id)
        if not fornecedor:
            flash("Fornecedor não encontrado.", "erro")
            return redirect(url_for("fornecedores"))

        imagem = fornecedor.get("imagem_url")
        Fornecedor.safe_delete(id)

        if imagem:
            deletar_imagem(imagem, bucket="Fornecedores")

        flash("Fornecedor excluído com sucesso.", "sucesso")
    except ValueError as e:
        flash(str(e), "erro")
    except Exception as e:
        flash(f"Erro ao excluir fornecedor: {e}", "erro")
    return redirect(url_for("fornecedores"))

# Pedidos

@app.route("/pedido/salvar", methods=["POST"])
def salvar_pedido():
    dados = get_pedido_form()
    pedido = Pedido(**dados)
    erros = pedido.validate()

    try:
        pedido.insert()
        flash("Pedido cadastrado com sucesso.", "sucesso")
        return redirect(url_for("pedidos"))
    except Exception as e:
        flash(f"Erro ao cadastrar pedido: {e}", "erro")
        return render_template("pedidos.html", pedido=dados)

@app.route("/pedido/atualizar/<int:id>", methods=["POST"])
def atualizar_pedido(id):
    dados = get_pedido_form()
    dados["id"] = id
    pedido = Pedido(**dados)
    erros = pedido.validate()

    if erros:
        for erro in erros:
            flash(erro, "erro")
        return render_template("pedidos.html", pedido=dados)

    try:
        if not Pedido.find_by_id(id):
            flash("Pedido não encontrado.", "erro")
            return redirect(url_for("pedidos"))

        pedido.update(id)
        flash("Pedido atualizado com sucesso.", "sucesso")
        return redirect(url_for("pedidos"))
    except Exception as e:
        dados["id"] = id
        flash(f"Erro ao atualizar pedido: {e}", "erro")
        return render_template("pedidos.html", pedido=dados)

@app.route("/pedido/excluir/<int:id>")
def excluir_pedido(id):
    try:
        Pedido.safe_delete(id)
        flash("Pedido excluído com sucesso.", "sucesso")
    except ValueError as e:
        flash(str(e), "erro")
    except Exception as e:
        flash(f"Erro ao excluir pedido: {e}", "erro")
    return redirect(url_for("pedidos"))

# Movimentações

@app.route("/movimentacao/salvar", methods=["POST"])
def salvar_movimentacao():
    dados = get_movimentacao_form()
    movimentacao = Movimentacoes_estoque(**dados)
    erros = movimentacao.validate()

    try:
        movimentacao.insert()
        flash("Movimentação cadastrada com sucesso.", "sucesso")
        return redirect(url_for("movimentacoes"))
    except Exception as e:
        flash(f"Erro ao cadastrar movimentação: {e}", "erro")
        return render_template("movimentacoes.html", movimentacao=dados)

@app.route("/movimentacao/atualizar/<int:id>", methods=["POST"])
def atualizar_movimentacao(id):
    dados = get_movimentacao_form()
    dados["id_movimentacoes_estoque"] = id
    movimentacao = Movimentacoes_estoque(**dados)
    erros = movimentacao.validate()

    if erros:
        for erro in erros:
            flash(erro, "erro")
        return render_template("movimentacoes.html", movimentacao=dados)

    try:
        if not Movimentacoes_estoque.find_by_id(id):
            flash("Movimentação não encontrada.", "erro")
            return redirect(url_for("movimentacoes"))

        movimentacao.update(id)
        flash("Movimentação atualizada com sucesso.", "sucesso")
        return redirect(url_for("movimentacoes"))
    except Exception as e:
        dados["id_movimentacoes_estoque"] = id
        flash(f"Erro ao atualizar movimentação: {e}", "erro")
        return render_template("movimentacoes.html", movimentacao=dados)

@app.route("/movimentacao/excluir/<int:id>")
def excluir_movimentacao(id):
    try:
        Movimentacoes_estoque.safe_delete(id)
        flash("Movimentação excluída com sucesso.", "sucesso")
    except ValueError as e:
        flash(str(e), "erro")
    except Exception as e:
        flash(f"Erro ao excluir movimentação: {e}", "erro")
    return redirect(url_for("movimentacoes"))

# Entradas de produtos

@app.route("/entrada/salvar", methods=["POST"])
def salvar_entrada():
    dados = get_entrada_form()
    entrada = Entradas_produtos(**dados)
    erros = entrada.validate()

    if erros:
        for erro in erros:
            flash(erro, "erro")
        return redirect(url_for("movimentacoes"))

    try:
        entrada.insert()
        ajustar_estoque_produto(dados["id_produto"], dados["quantidade"])
        flash("Entrada registrada com sucesso.", "sucesso")
    except Exception as e:
        flash(f"Erro ao registrar entrada: {e}", "erro")
    return redirect(url_for("movimentacoes"))

@app.route("/entrada/atualizar/<int:id>", methods=["POST"])
def atualizar_entrada(id):
    dados = get_entrada_form()
    entrada = Entradas_produtos(**dados)
    erros = entrada.validate()

    if erros:
        for erro in erros:
            flash(erro, "erro")
        return redirect(url_for("movimentacoes"))

    try:
        antiga = Entradas_produtos.find_by_id(id)
        if not antiga:
            flash("Entrada não encontrada.", "erro")
            return redirect(url_for("movimentacoes"))

        # Reverte o efeito da entrada antiga e aplica o da nova
        ajustar_estoque_produto(antiga["id_produto"], -(antiga.get("quantidade") or 0))
        entrada.update(id)
        ajustar_estoque_produto(dados["id_produto"], dados["quantidade"])
        flash("Entrada atualizada com sucesso.", "sucesso")
    except Exception as e:
        flash(f"Erro ao atualizar entrada: {e}", "erro")
    return redirect(url_for("movimentacoes"))

@app.route("/entrada/excluir/<int:id>")
def excluir_entrada(id):
    try:
        antiga = Entradas_produtos.find_by_id(id)
        if not antiga:
            flash("Entrada não encontrada.", "erro")
            return redirect(url_for("movimentacoes"))

        Entradas_produtos.delete(id)
        # Excluir uma entrada desfaz o que ela somou ao estoque
        ajustar_estoque_produto(antiga["id_produto"], -(antiga.get("quantidade") or 0))
        flash("Entrada excluída com sucesso.", "sucesso")
    except Exception as e:
        flash(f"Erro ao excluir entrada: {e}", "erro")
    return redirect(url_for("movimentacoes"))

# Saídas de produtos

@app.route("/saida/salvar", methods=["POST"])
def salvar_saida():
    dados = get_saida_form()
    saida = Saidas_produtos(**dados)
    erros = saida.validate()

    if erros:
        for erro in erros:
            flash(erro, "erro")
        return redirect(url_for("movimentacoes"))

    # Bloqueia a saída se não houver estoque suficiente
    produto = Produto.find_by_id(dados["id_produto"])
    estoque = (produto.get("quantidade_atual") or 0) if produto else 0
    if dados["quantidade"] > estoque:
        flash(f"Estoque insuficiente para a saída. Disponível: {estoque}.", "erro")
        return redirect(url_for("movimentacoes"))

    try:
        saida.insert()
        ajustar_estoque_produto(dados["id_produto"], -dados["quantidade"])
        flash("Saída registrada com sucesso.", "sucesso")
    except Exception as e:
        flash(f"Erro ao registrar saída: {e}", "erro")
    return redirect(url_for("movimentacoes"))

@app.route("/saida/atualizar/<int:id>", methods=["POST"])
def atualizar_saida(id):
    dados = get_saida_form()
    saida = Saidas_produtos(**dados)
    erros = saida.validate()

    if erros:
        for erro in erros:
            flash(erro, "erro")
        return redirect(url_for("movimentacoes"))

    try:
        antiga = Saidas_produtos.find_by_id(id)
        if not antiga:
            flash("Saída não encontrada.", "erro")
            return redirect(url_for("movimentacoes"))

        # Estoque disponível considerando o retorno da saída antiga e a aplicação da nova
        produto = Produto.find_by_id(dados["id_produto"])
        estoque = (produto.get("quantidade_atual") or 0) if produto else 0
        if antiga["id_produto"] == dados["id_produto"]:
            estoque += (antiga.get("quantidade") or 0)
        if dados["quantidade"] > estoque:
            flash(f"Estoque insuficiente para a saída. Disponível: {estoque}.", "erro")
            return redirect(url_for("movimentacoes"))

        ajustar_estoque_produto(antiga["id_produto"], (antiga.get("quantidade") or 0))
        saida.update(id)
        ajustar_estoque_produto(dados["id_produto"], -dados["quantidade"])
        flash("Saída atualizada com sucesso.", "sucesso")
    except Exception as e:
        flash(f"Erro ao atualizar saída: {e}", "erro")
    return redirect(url_for("movimentacoes"))

@app.route("/saida/excluir/<int:id>")
def excluir_saida(id):
    try:
        antiga = Saidas_produtos.find_by_id(id)
        if not antiga:
            flash("Saída não encontrada.", "erro")
            return redirect(url_for("movimentacoes"))

        Saidas_produtos.delete(id)
        # Excluir uma saída retorna o valor da saída ao estoque
        ajustar_estoque_produto(antiga["id_produto"], (antiga.get("quantidade") or 0))
        flash("Saída excluída com sucesso.", "sucesso")
    except Exception as e:
        flash(f"Erro ao excluir saída: {e}", "erro")
    return redirect(url_for("movimentacoes"))

# Para entradas e saídas de produtos

def ajustar_estoque_produto(id_produto, delta):
    # Soma o valor a quantidade_atual do produto
    if not id_produto or not delta:
        return
    produto = Produto.find_by_id(id_produto)
    if not produto:
        return
    atual = produto.get("quantidade_atual") or 0
    supabase.table("produtos").update({"quantidade_atual": atual + delta}).eq("id_produto", id_produto).execute()

# Áreas

@app.route("/area/salvar", methods=["POST"])
def salvar_area():
    dados = get_area_form()
    area = Area(**dados)
    erros = area.validate()
    try:
        area.insert()
        flash("Área de estoque cadastrada com sucesso.", "sucesso")
        return redirect(url_for("areas"))
    except Exception as e:
        flash(f"Erro ao cadastrar área: {e}", "erro")
        return render_template("areas.html", area=dados)

@app.route("/area/atualizar/<int:id>", methods=["POST"])
def atualizar_area(id):
    dados = get_area_form()
    dados["id_area"] = id
    area = Area(**dados)
    erros = area.validate()

    if erros:
        for erro in erros:
            flash(erro, "erro")
        return render_template("areas.html", area=dados)

    try:
        if not Area.find_by_id(id):
            flash("Área do estoque não encontrada.", "erro")
            return redirect(url_for("areas"))

        area.update(id)
        flash("Área do estoque atualizada com sucesso.", "sucesso")
        return redirect(url_for("areas"))
    except Exception as e:
        dados["id_area"] = id
        flash(f"Erro ao atualizar área do estoque: {e}", "erro")
        return render_template("areas.html", area=dados)

@app.route("/area/excluir/<int:id>")
def excluir_area(id):
    try:
        Area.safe_delete(id)
        flash("Área do estoque excluída com sucesso.", "sucesso")
    except ValueError as e:
        flash(str(e), "erro")
    except Exception as e:
        flash(f"Erro ao excluir área do estoque: {e}", "erro")
    return redirect(url_for("areas"))

# Conformidades
# A fazer

# Relatórios 
# A fazer

# Configurações

@app.route("/usuario/alterar_senha", methods=["POST"])
def alterar_senha():
    senha_atual = request.form.get("senha_atual", "")
    nova_senha = request.form.get("nova_senha", "")
    confirmar_senha = request.form.get("confirmar_senha", "")

    if not senha_atual or not nova_senha:
        flash("Preencha a senha atual e a nova senha.", "erro")
        return redirect(url_for("configuracoes"))

    if nova_senha != confirmar_senha:
        flash("A nova senha e a confirmação não coincidem.", "erro")
        return redirect(url_for("configuracoes"))

    if len(nova_senha) < 6:
        flash("A nova senha deve ter no mínimo 6 caracteres.", "erro")
        return redirect(url_for("configuracoes"))

    try:
        usuario = Usuarios.find_by_id(session["usuario"]["id"])

        if not usuario:
            flash("Usuário não encontrado.", "erro")
            return redirect(url_for("configuracoes"))

        if not verificar_senha(senha_atual, usuario.senha):
            flash("Senha atual incorreta.", "erro")
            return redirect(url_for("configuracoes"))

        if verificar_senha(nova_senha, usuario.senha):
            flash("A nova senha deve ser diferente da atual.", "erro")
            return redirect(url_for("configuracoes"))

        usuario.senha = gerar_hash_senha(nova_senha)
        usuario.update()

        # Mantém a senha do Supabase Auth sincronizada com a do banco

        try:
            if session.get("access_token"):
                supabase.auth.set_session(session["access_token"], session["refresh_token"])
            supabase.auth.update_user({"password": nova_senha})
        except Exception as erro_auth:
            print(f"Aviso: falha ao atualizar senha no Supabase Auth: {erro_auth}")

        flash("Senha alterada com sucesso.", "sucesso")
    except Exception as e:
        flash(f"Erro ao alterar senha: {e}", "erro")

    return redirect(url_for("configuracoes"))

if __name__ == "__main__":
    app.run(debug=True)

