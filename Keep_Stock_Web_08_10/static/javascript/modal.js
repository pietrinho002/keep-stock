// Função para abrir modal de edição
function abrirModalEditarCliente(id, nome, cpf_cnpj, telefone, email, codigo_postal, imagem) {
    // Preencher os campos do formulário
    document.getElementById('edit_nome').value = nome || '';
    document.getElementById('edit_cpf_cnpj').value = cpf_cnpj || '';
    document.getElementById('edit_telefone').value = telefone || '';
    document.getElementById('edit_email').value = email || '';
    document.getElementById('edit_codigo_postal').value = codigo_postal || '';

    // Imagem atual
    const preview = document.getElementById('edit_imagem_preview');
    if (preview) {
        if (imagem) {
            preview.src = imagem;
            preview.style.display = 'block';
        } else {
            preview.src = '';
            preview.style.display = 'none';
        }
    }

    const inputImagem = document.getElementById('edit_imagem');
    if (inputImagem) {
        inputImagem.value = '';
    }

    // Atualizar a ação do formulário com o ID
    const form = document.getElementById('formEditar');
    if (form) {
        form.action = `/cliente/atualizar/${id}`;
    }

    // Armazenar o ID para ações de exclusão
    window.idAtualEditar = id;

    // Abrir o offcanvas
    const offcanvas = new bootstrap.Offcanvas(document.getElementById('offcanvasEditar'));
    offcanvas.show();
}


function abrirModalEditar(produto_id, nome,categoria, fornecedor, quantidade_minima, quantidade_atual, unidade_medida, controlado, valor_unitario_custo, valor_unitario_venda, descricao, imagem) {

    window.produtoIdEmEdicao = produto_id;

    const form = document.getElementById('formEditar');

    form.action =
        "/produto/atualizar/" +
        window.produtoIdEmEdicao;


    document.getElementById('edit_nome').value = nome || '';
    document.getElementById('edit_categoria').value = categoria || '';
    document.getElementById('edit_fornecedor').value = fornecedor || '';
    document.getElementById('edit_quantidade_minima').value = quantidade_minima || '';
    document.getElementById('edit_quantidade_atual').value = quantidade_atual || '';
    document.getElementById('edit_unidade_medida').value = unidade_medida || '';
    document.getElementById('edit_controlado').value = controlado || '';
    document.getElementById('edit_valor_unitario_custo').value = valor_unitario_custo || '';
    document.getElementById('edit_valor_unitario_venda').value = valor_unitario_venda || '';
    document.getElementById('edit_descricao').value = descricao || '';

    const preview =
        document.getElementById('edit_imagem_preview');

    if (imagem) {

        preview.src = imagem;
        preview.style.display = 'block';

    } else {

        preview.src = '';
        preview.style.display = 'none';
    }

    document.getElementById('edit_imagem').value = '';

    const offcanvasElement =
        document.getElementById('offcanvasEditar');

    const offcanvas =
        bootstrap.Offcanvas.getOrCreateInstance(
            offcanvasElement
        );

    offcanvas.show();
}

document.addEventListener(
    'DOMContentLoaded',
    function () {

        const inputImagem =
            document.getElementById(
                'edit_imagem'
            );

        const preview =
            document.getElementById(
                'edit_imagem_preview'
            );


        if (!inputImagem || !preview) {
            return;
        }


        inputImagem.addEventListener(
            'change',
            function () {

                const arquivo =
                    this.files[0];


                if (!arquivo) {
                    return;
                }


                // Verifica se é realmente uma imagem
                if (!arquivo.type.startsWith('image/')) {

                    alert(
                        'Selecione um arquivo de imagem válido.'
                    );

                    this.value = '';

                    return;
                }

                const url =
                    URL.createObjectURL(
                        arquivo
                    );


                preview.src = url;

                preview.style.display = 'block';
            }
        );
    }
);

// Função para abrir modal de edição de fornecedor
function abrirModalEditarFornecedor(id, nome, cnpj, telefone, email, cep, imagem) {
    // Preencher os campos do formulário
    document.getElementById('edit_nome').value = nome || '';
    document.getElementById('edit_cnpj').value = cnpj || '';
    document.getElementById('edit_telefone').value = telefone || '';
    document.getElementById('edit_email').value = email || '';
    document.getElementById('edit_cep').value = cep || '';

    // Imagem atual
    const preview = document.getElementById('edit_imagem_preview');
    if (preview) {
        if (imagem) {
            preview.src = imagem;
            preview.style.display = 'block';
        } else {
            preview.src = '';
            preview.style.display = 'none';
        }
    }

    const inputImagem = document.getElementById('edit_imagem');
    if (inputImagem) {
        inputImagem.value = '';
    }

    // Atualizar a ação do formulário com o ID
    const form = document.getElementById('formEditar');
    if (form) {
        form.action = `/fornecedor/atualizar/${id}`;
    }

    // Armazenar o ID para ações de exclusão
    window.idAtualEditar = id;

    // Abrir o offcanvas
    const offcanvas = new bootstrap.Offcanvas(document.getElementById('offcanvasEditar'));
    offcanvas.show();
}

// Função para abrir modal de edição de área
function abrirModalEditarArea(id, nome, descricao, area_rua, area_codigo, distancia_entre_prat, temperatura_max, temperatura_min) {
    // Preencher os campos do formulário
    document.getElementById('edit_nome').value = nome || '';
    document.getElementById('edit_descricao').value = descricao || '';
    document.getElementById('edit_area_rua').value = area_rua || '';
    document.getElementById('edit_area_codigo').value = area_codigo || '';
    document.getElementById('edit_distancia_entre_prat').value = distancia_entre_prat || '';
    document.getElementById('edit_temperatura_max').value = temperatura_max || '';
    document.getElementById('edit_temperatura_min').value = temperatura_min || '';
    
    // Atualizar a ação do formulário com o ID
    const form = document.getElementById('formEditar');
    if (form) {
        form.action = `/area/atualizar/${id}`;
    }
    
    // Armazenar o ID para ações de exclusão
    window.idAtualEditar = id;
    
    // Abrir o offcanvas
    const offcanvas = new bootstrap.Offcanvas(document.getElementById('offcanvasEditar'));
    offcanvas.show();
}

// Função para abrir modal de edição de pedido
function abrirModalEditarPedido(id, id_cliente, data_pedido, status_pedido, data_prevista) {
    // Preencher os campos do formulário
    document.getElementById('edit_id_cliente').value = id_cliente || '';
    document.getElementById('edit_data_pedido').value = data_pedido || '';
    document.getElementById('edit_status_pedido').value = status_pedido || '';
    document.getElementById('edit_data_prevista').value = data_prevista || '';

    // Atualizar a ação do formulário com o ID
    const form = document.getElementById('formEditar');
    if (form) {
        form.action = `/pedido/atualizar/${id}`;
    }

    // Armazenar o ID para ações de exclusão
    window.idAtualEditar = id;

    // Abrir o offcanvas
    const offcanvas = new bootstrap.Offcanvas(document.getElementById('offcanvasEditar'));
    offcanvas.show();
}

// Função para excluir pedido
function excluirPedido() {
    if (window.idAtualEditar && confirm('Tem certeza que deseja excluir este pedido?')) {
        window.location.href = `/pedido/excluir/${window.idAtualEditar}`;
    }
}

// Função para excluir cliente
function excluirCliente() {
    if (window.idAtualEditar && confirm('Tem certeza que deseja excluir este cliente?')) {
        window.location.href = `/cliente/excluir/${window.idAtualEditar}`;
    }
}

// Função para excluir produto
function excluirProduto() {
    if (window.idAtualEditar && confirm('Tem certeza que deseja excluir este produto?')) {
        window.location.href = `/produto/excluir/${window.idAtualEditar}`;
    }
}

// Função para excluir fornecedor
function excluirFornecedor() {
    if (window.idAtualEditar && confirm('Tem certeza que deseja excluir este fornecedor?')) {
        window.location.href = `/fornecedor/excluir/${window.idAtualEditar}`;
    }
}

// Função para excluir área
function excluirArea() {
    if (window.idAtualEditar && confirm('Tem certeza que deseja excluir esta área?')) {
        window.location.href = `/area/excluir/${window.idAtualEditar}`;
    }
}

// Função para excluir pedido
function excluirPedido() {
    if (window.idAtualEditar && confirm('Tem certeza que deseja excluir este pedido?')) {
        window.location.href = `/pedido/excluir/${window.idAtualEditar}`;
    }
}

// Event listeners para botões de exclusão
document.addEventListener('DOMContentLoaded', function() {
    const btnExcluirCliente = document.getElementById('btnExcluirCliente');
    const btnExcluirFornecedor = document.getElementById('btnExcluirFornecedor');
    const btnExcluirArea = document.getElementById('btnExcluirArea');
    const btnExcluirProduto = document.getElementById('btnExcluirProduto');
    const btnExcluirPedido = document.getElementById('btnExcluirPedido');
    
    if (btnExcluirCliente) {
        btnExcluirCliente.addEventListener('click', excluirCliente);
    }
    
    if (btnExcluirFornecedor) {
        btnExcluirFornecedor.addEventListener('click', excluirFornecedor);
    }
    
    if (btnExcluirArea) {
        btnExcluirArea.addEventListener('click', excluirArea);
    }

    if (btnExcluirProduto) {
        btnExcluirProduto.addEventListener('click', excluirProduto);
    }
    
    if (btnExcluirPedido) {
        btnExcluirPedido.addEventListener('click', excluirPedido);
    }
});