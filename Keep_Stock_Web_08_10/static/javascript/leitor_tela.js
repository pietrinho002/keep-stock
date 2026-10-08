// Leitor de tela: lê o conteúdo da página em voz alta usando a Web Speech API
(function () {

    const sintese = window.speechSynthesis;

    // Navegadores sem suporte a síntese de voz não exibem o recurso
    if (!sintese) return;

    const CHAVE_ESTADO = 'leitorTelaAtivo';
    const SELETOR_LEITURA = 'h1, h2, h3, h4, h5, h6, p, a, button, label, li, td, th, address, img, input, select, textarea';

    let ativo = false;
    let ultimoElemento = null;
    let botaoAlternar, botaoPagina, botaoParar;

    function lerEstadoSalvo() {
        try {
            return localStorage.getItem(CHAVE_ESTADO) === '1';
        } catch (e) {
            return false;
        }
    }

    function salvarEstado() {
        try {
            localStorage.setItem(CHAVE_ESTADO, ativo ? '1' : '0');
        } catch (e) {
            // Sem acesso ao armazenamento o estado vale apenas para a página atual
        }
    }

    function vozPortugues() {
        return sintese.getVoices().find(voz => voz.lang && voz.lang.toLowerCase().indexOf('pt') === 0) || null;
    }

    function falar(texto) {
        if (!texto) return;

        const limpo = texto.replace(/\s+/g, ' ').trim();
        if (!limpo) return;

        sintese.cancel();

        const fala = new SpeechSynthesisUtterance(limpo);
        fala.lang = 'pt-BR';
        fala.rate = 1;

        const voz = vozPortugues();
        if (voz) fala.voice = voz;

        sintese.speak(fala);
    }

    function textoDoCampo(elemento) {
        const rotulo = elemento.id ? document.querySelector('label[for="' + elemento.id + '"]') : null;
        const nome = (rotulo ? rotulo.innerText : '') || elemento.placeholder || elemento.name || 'sem nome';

        // O conteúdo de campos de senha nunca é lido em voz alta
        if (elemento.type === 'password') {
            return 'Campo de senha ' + nome + '.';
        }

        if (elemento.tagName === 'SELECT') {
            const opcao = elemento.options[elemento.selectedIndex];
            return 'Seleção ' + nome + '. Opção atual: ' + (opcao ? opcao.text : 'nenhuma');
        }

        return 'Campo ' + nome + '. ' + (elemento.value ? 'Preenchido com ' + elemento.value : 'Vazio');
    }

    function textoDoElemento(elemento) {
        const rotulo = elemento.getAttribute('aria-label');
        if (rotulo) return rotulo;

        const tag = elemento.tagName.toLowerCase();

        if (tag === 'img') return elemento.alt ? 'Imagem: ' + elemento.alt : '';
        if (tag === 'input' || tag === 'select' || tag === 'textarea') return textoDoCampo(elemento);
        if (tag === 'a') return 'Link: ' + elemento.innerText;
        if (tag === 'button') return 'Botão: ' + (elemento.innerText || 'sem texto');
        if (/^h[1-6]$/.test(tag)) return 'Título: ' + elemento.innerText;

        return elemento.innerText;
    }

    function lerPagina() {
        const alvo = document.querySelector('main') || document.querySelector('.main-content') || document.body;

        // Ignora o próprio painel do leitor ao ler a página inteira
        const conteudo = Array.from(alvo.children)
            .filter(filho => filho.id !== 'leitor-tela')
            .map(filho => filho.innerText)
            .join('. ');

        falar(document.title + '. ' + conteudo);
    }

    function alternar(ativar) {
        ativo = ativar;
        salvarEstado();

        botaoAlternar.setAttribute('aria-pressed', ativo ? 'true' : 'false');
        botaoAlternar.classList.toggle('ativo', ativo);
        botaoPagina.hidden = !ativo;
        botaoParar.hidden = !ativo;

        if (ativo) {
            falar('Leitor de tela ativado. ' + document.title + '. Passe o mouse ou use a tecla Tab para ouvir os itens da tela.');
        } else {
            sintese.cancel();
        }
    }

    function criarPainel() {
        const painel = document.createElement('div');
        painel.id = 'leitor-tela';
        painel.innerHTML =
            '<button type="button" id="leitor_alternar" aria-pressed="false" aria-label="Leitor de tela" title="Ativar ou desativar o leitor de tela (Alt + L)">' +
            '<img src="../static/Icons/Brancos/acessibilidade_branca.svg" alt=""></button>' +
            '<button type="button" id="leitor_pagina" hidden>Ler página</button>' +
            '<button type="button" id="leitor_parar" hidden>Parar</button>';

        document.body.appendChild(painel);

        botaoAlternar = document.getElementById('leitor_alternar');
        botaoPagina = document.getElementById('leitor_pagina');
        botaoParar = document.getElementById('leitor_parar');

        botaoAlternar.addEventListener('click', () => alternar(!ativo));
        botaoPagina.addEventListener('click', lerPagina);
        botaoParar.addEventListener('click', () => sintese.cancel());
    }

    function lerElementoDoEvento(evento) {
        if (!ativo) return;

        const elemento = evento.target.closest(SELETOR_LEITURA);
        if (!elemento || elemento === ultimoElemento || elemento.closest('#leitor-tela')) return;

        ultimoElemento = elemento;
        falar(textoDoElemento(elemento));
    }

    document.addEventListener('DOMContentLoaded', function () {
        criarPainel();

        document.addEventListener('mouseover', lerElementoDoEvento);
        document.addEventListener('focusin', lerElementoDoEvento);

        // Atalho de teclado para ligar e desligar o leitor
        document.addEventListener('keydown', function (evento) {
            if (evento.altKey && evento.key.toLowerCase() === 'l') {
                evento.preventDefault();
                alternar(!ativo);
            }
        });

        if (lerEstadoSalvo()) alternar(true);
    });

    // A voz em português só fica disponível depois que o navegador carrega a lista
    sintese.onvoiceschanged = vozPortugues;

})();
