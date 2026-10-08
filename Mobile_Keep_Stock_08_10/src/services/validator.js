// Validações dos formulários (espelha core/validator.py do sistema web)

const INVERTEXTO_TOKEN = '25384|j9ZTOhnY61kbOHY59QagFaLy86QvrCeY';

function limparDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

// Consulta a API do Invertexto e devolve null quando a chamada falha
async function consultarInvertexto(url) {
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) {
      console.log('Erro HTTP:', resposta.status);
      return null;
    }
    return await resposta.json();
  } catch (erro) {
    console.log('Erro na validação:', erro);
    return null;
  }
}

export const Validator = {
  required(valor, campo) {
    if (valor === null || valor === undefined || String(valor).trim() === '') {
      return `O campo ${campo} é obrigatório.`;
    }
    return null;
  },
  nonNegative(valor, campo) {
    const numero = parseFloat(valor);
    if (Number.isNaN(numero)) return `O campo ${campo} deve ser numérico.`;
    if (numero < 0) return `O campo ${campo} não pode ser negativo.`;
    return null;
  },

  positive(valor, campo) {
    const numero = parseInt(valor, 10);
    if (Number.isNaN(numero)) return `O campo ${campo} deve ser numérico.`;
    if (numero <= 0) return `O campo ${campo} deve ser maior que zero.`;
    return null;
  },

  telefone(valor, campo = 'telefone') {
    const telefone = limparDigitos(valor);
    if (valor === null || valor === undefined || String(valor).trim() === '') {
      return null;
    }
    if (!/^(\d{10}|\d{11})$/.test(telefone)) {
      return `O campo ${campo} deve conter um telefone válido.`;
    }
    return null;
  },

  cep(valor, campo = 'cep') {
    const cep = limparDigitos(valor);
    if (valor === null || valor === undefined || String(valor).trim() === '') {
      return null;
    }
    if (!/^\d{8}$/.test(cep)) {
      return `O campo ${campo} deve conter um CEP válido.`;
    }
    return null;
  },

  email(valor, campo = 'email') {
    const email = String(valor ?? '').trim();
    if (email === '') {
      return null;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      return `O campo ${campo} deve conter um e-mail válido.`;
    }
    return null;
  },

  async validarEmail(email, token = INVERTEXTO_TOKEN) {
    const emailCodificado = encodeURIComponent(email);
    return consultarInvertexto(
      `https://api.invertexto.com/v1/email-validator/${emailCodificado}?token=${token}`
    );
  },

  async validarCep(cep, token = INVERTEXTO_TOKEN) {
    return consultarInvertexto(
      `https://api.invertexto.com/v1/cep/${cep}?token=${token}`
    );
  },

  async validarCnpj(cnpj, token = INVERTEXTO_TOKEN) {
    return consultarInvertexto(
      `https://api.invertexto.com/v1/validator?token=${token}&value=${encodeURIComponent(cnpj)}`
    );
  },

  async validarCpf(cpf, token = INVERTEXTO_TOKEN) {
    return consultarInvertexto(
      `https://api.invertexto.com/v1/validator?token=${token}&value=${encodeURIComponent(cpf)}`
    );
  },

  validarNome(nome) {
    return Boolean(nome) && nome.length > 0 && nome.length < 120;
  },
};

export default Validator;
