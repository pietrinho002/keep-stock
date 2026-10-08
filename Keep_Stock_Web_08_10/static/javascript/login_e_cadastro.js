// Encapsula todo o script para evitar redeclaração global
(function () {

    function switchAuthView(viewId) {
        document.querySelectorAll('.view-section').forEach((el) => {
            el.classList.remove('active');
        });
        const targetView = document.getElementById(viewId);
        if (targetView) targetView.classList.add('active');
    }

    // CADASTRO
    async function cadastrarUsuario(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');

        const nome = form.nome_completo.value.trim();
        const email = form.email.value.trim();
        const cpf = form.cpf.value.replace(/\D/g, '');
        const senha = form.senha.value;
        const confirmar_senha = form.confirmar_senha.value;

        if (senha !== confirmar_senha) {
            alert('As senhas não coincidem.');
            return;
        }

        if (senha.length < 6) {
            alert('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        if (submitBtn) submitBtn.disabled = true;

        try {
            const response = await fetch('/cadastrar_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: nome, email: email, cpf: cpf, senha: senha })
            });

            const dados = await response.json();

            if (!response.ok) {
                alert('Erro no cadastro: ' + (dados.erro || 'Tente novamente.'));
                return;
            }

            alert(dados.mensagem);
            form.reset();
            switchAuthView('view-login');

        } catch (err) {
            console.error(err);
            alert('Erro ao conectar com o servidor.');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    }

    // LOGIN
    async function realizarLogin(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');

        const email = form.email.value ? form.email.value.trim() : '';
        const senha = form.senha ? form.senha.value : '';

        if (!email || !senha) {
            alert('Preencha email e senha.');
            return;
        }

        if (submitBtn) submitBtn.disabled = true;

        try {
            const response = await fetch('/login', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, senha: senha })
            });

            const dados = await response.json();

            if (!response.ok) {
                alert('Erro no login: ' + (dados.erro || 'Tente novamente.'));
                return;
            }

            alert('Bem-vindo, ' + dados.nome + '!');
            // Redireciona para o sistema após 800ms
            setTimeout(() => {
                window.location.href = '/produtos';
            }, 800);

        } catch (err) {
            console.error(err);
            alert('Erro ao realizar o login. Veja o console para detalhes.');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const formLogin = document.getElementById('form_login');
        const formCadastro = document.getElementById('form_cadastro');
        const linkCadastro = document.getElementById('link-cadastro');
        const linkLogin = document.getElementById('link-login');

        if (formLogin) formLogin.addEventListener('submit', realizarLogin);
        if (formCadastro) formCadastro.addEventListener('submit', cadastrarUsuario);
        if (linkCadastro) linkCadastro.addEventListener('click', (e) => { e.preventDefault(); switchAuthView('view-cadastro'); });
        if (linkLogin) linkLogin.addEventListener('click', (e) => { e.preventDefault(); switchAuthView('view-login'); });
    });

    // expõe funções necessárias ao escopo global (para uso em templates/onclick)
    window.switchAuthView = switchAuthView;

})();
