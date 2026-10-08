import os
import uuid

from supabase import create_client


SUPABASE_URL = "https://gysiqyxpmlxmlolqzaqs.supabase.co"

# Chave Anon (abaixo)
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5c2lxeXhwbWx4bWxvbHF6YXFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk2MDcwNiwiZXhwIjoyMDkwNTM2NzA2fQ.DRqq9majrxnIT8oUnhrY2qQFB-OG6V4yOfTSGg27lpQ"

supabase = create_client(SUPABASE_URL,SUPABASE_KEY)

BUCKET = "Produtos"
BUCKET_CLIENTES = "Clientes"
BUCKET_FORNECEDORES = "Fornecedores"

EXTENSOES_PERMITIDAS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


def upload_imagem(arquivo, bucket=BUCKET):

    if not arquivo or not arquivo.filename:
        return None

    extensao = os.path.splitext(arquivo.filename)[1].lower()

    # Formato permitidos
    if extensao not in EXTENSOES_PERMITIDAS:
        raise ValueError("Formato de imagem não permitido. " "Use JPEG, PNG ou WEBP.")

    nome_arquivo = f"{uuid.uuid4()}{extensao}"
    caminho = nome_arquivo
    arquivo_bytes = arquivo.read()

    # Caminho para o storage
    supabase.storage \
        .from_(bucket) \
        .upload(
            caminho,
            arquivo_bytes,
            {
                "content-type": arquivo.content_type
            }
        )

    url_publica = supabase.storage \
        .from_(bucket) \
        .get_public_url(caminho)

    return url_publica


def deletar_imagem(url, bucket=BUCKET):

    if not url:
        return

    try:
        prefixo = f"/storage/v1/object/public/{bucket}/"

        if prefixo not in url:
            print("URL de imagem inválida:", url)
            return

        caminho = url.split(prefixo, 1)[1]

        supabase.storage \
            .from_(bucket) \
            .remove([caminho])

    except Exception as e:
        print(f"Erro ao deletar imagem: {e}")