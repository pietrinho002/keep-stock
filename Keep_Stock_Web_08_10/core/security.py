import bcrypt


def gerar_hash_senha(senha):
    """
    Recebe uma senha em texto puro e retorna a senha criptografada.
    """
    senha_hash = bcrypt.hashpw(
        senha.encode("utf-8"),
        bcrypt.gensalt()
    )

    return senha_hash.decode("utf-8")


def verificar_senha(senha_digitada, senha_hash_banco):
    """
    Compara a senha digitada com a senha criptografada salva no banco.
    """
    return bcrypt.checkpw(
        senha_digitada.encode("utf-8"),
        senha_hash_banco.encode("utf-8")
    )
