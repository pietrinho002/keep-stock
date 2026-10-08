import urllib.parse
import requests

class Validator:
    @staticmethod
    def required(value, field_name):
        if value is None or str(value).strip() == "":
            return f"O campo {field_name} é obrigatório."
        return None

    @staticmethod
    def non_negative(value, field_name):
        try:
            if float(value) < 0:
                return f"O campo {field_name} não pode ser negativo."
        except (TypeError, ValueError):
            return f"O campo {field_name} deve ser numérico."
        return None

    @staticmethod
    def positive(value, field_name):
        try:
            if int(value) <= 0:
                return f"O campo {field_name} deve ser maior que zero."
        except (TypeError, ValueError):
            return f"O campo {field_name} deve ser numérico."
        return None

    @staticmethod
    def validar_email(email, token):
        base_url = "https://api.invertexto.com/v1/email-validator"

        # Codifica o e-mail para garantir que a URL fique correta
        email_encoded = urllib.parse.quote(email)

        # Monta a URL com o e-mail na rota
        url = f"{base_url}/{email_encoded}"

        # Parametros da query string (neste caso, apenas o token)
        params = {"token": token}

        try:
        # Realiz a requisição GET passando os parametros na URL
            response = requests.get(url, params=params)
            response.raise_for_status() # Levanta exceção para status HTTP de erro

            # Converte a respost para JSON
            data = response.json()

            return data
    
        except requests.exceptions.HTTPError as errh:
            print("Erro HTTP:", errh)
        except requests.exceptions.ConnectionError as errc:
            print("Erro de conexão:", errc)
        except requests.exceptions.Timeout as errt:
            print("Timeout:", errt)
        except requests.exceptions.RequestException as err:
            print("Erro:", err)

        return None

    if __name__ == "__main__":
        token = "25384|j9ZTOhnY61kbOHY59QagFaLy86QvrCeY"
        email = "allysson.santos1717@gmail.com"

        resultado = validar_email(email, token)

        if resultado:
            print("Resposta da API:")
            print(resultado)
        else:
            print("Não foi possível validar o Email.")

    @staticmethod
    def validar_cep(cep, token):
        url = f"https://api.invertexto.com/v1/cep/{cep}"
        params = {"token": token}
        resposta = requests.get(url, params=params).json()
        return resposta

    if __name__ == "__main__":
        cep = "71205060"
        token = "25384|j9ZTOhnY61kbOHY59QagFaLy86QvrCeY"

        resultado = validar_cep(cep, token)

        if resultado:
            print("Resposta da API:")
            print(resultado)
        else:
            print("Não foi possível validar o CEP.")

    @staticmethod
    def validar_cnpj(cnpj, token):
        # URL base da API
        url = "https://api.invertexto.com/v1/validator"

        # Parametros que serão enviados via query
        params = {
            "token": token,
            "value" : cnpj
        } 

        try:
        # Envia a requisição GET com os parâmetros
            response = requests.get(url, params=params)
            response.raise_for_status()

            # Converte a resposta para json
            data = response.json()
            return data
    
        except requests.exceptions.HTTPError as errh:
            print("Erro HTTP:", errh)
        except requests.exceptions.ConnectionError as errc:
            print("Erro de conexão:", errc)
        except requests.exceptions.Timeout as erry:
            print("Timeout:", erry)

        return None

    if __name__ == "__main__":
        cnpj = "83.329.827/0001-70"
        token = "25384|j9ZTOhnY61kbOHY59QagFaLy86QvrCeY"

        resultado = validar_cnpj(cnpj, token)

        if resultado:
            print("Resposta da API:")
            print(resultado)
        else:
            print("Não foi possível validar o CNPJ.")

    @staticmethod
    def validar_cpf(cpf, token):
        # URL base da API
        url = "https://api.invertexto.com/v1/validator"

        # Parametros que serão enviados via query
        params = {
            "token": token,
            "value" : cpf
        }

        try:
        # Envia a requisição GET com os parâmetros
            response = requests.get(url, params=params)
            response.raise_for_status()

            # Converte a resposta para json
            data = response.json()
            return data
    
        except requests.exceptions.HTTPError as errh:
            print("Erro HTTP:", errh)
        except requests.exceptions.ConnectionError as errc:
            print("Erro de conexão:", errc)
        except requests.exceptions.Timeout as erry:
            print("Timeout:", erry)

        return None

    if __name__ == "__main__":
        cpf = "49747663848"
        token = "25384|j9ZTOhnY61kbOHY59QagFaLy86QvrCeY"

        resultado = validar_cpf(cpf, token)

        if resultado:
            print("Resposta da API:")
            print(resultado)
        else:
            print("Não foi possível validar o CPF.")
    
    @staticmethod
    def validar_nome(dados_usuario):
        if len(dados_usuario["nome"]) > 0:
            if len(dados_usuario["nome"]) < 120:
                return True
            return False

