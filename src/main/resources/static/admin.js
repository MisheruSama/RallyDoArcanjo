// Estado global para armazenar o modo de edição
let modoEdicao = false;

// --- Autenticação helper ---
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function clearCookie(name) {
    document.cookie = `${name}=;path=/;max-age=0`;
}

function handleAuthClick(e) {
    e.preventDefault();
    const token = getCookie('token');
    if (token) {
        // logout client-side (stateless JWT)
        clearCookie('token');
        window.location.href = '/login.html';
    } else {
        window.location.href = '/login.html';
    }
}

// Função para alternar a visibilidade do formulário
function toggleForm() {
    const formCard = document.getElementById('formCard');
    const formTitle = document.getElementById('formTitle');
    const addButton = document.querySelector('.btn-primary[onclick="toggleForm()"]');
    
    if (formCard.style.display === 'none') {
        formCard.style.display = 'block';
        formTitle.textContent = modoEdicao ? 'Editar Equipe' : 'Adicionar Nova Equipe';
        addButton.style.display = 'none';
        // Rolar suavemente até o formulário
        formCard.scrollIntoView({ behavior: 'smooth' });
    } else {
        formCard.style.display = 'none';
        addButton.style.display = 'inline-block';
        limparFormulario();
    }
}

// Função para carregar as equipes na tabela administrativa
function carregarEquipes() {
    fetch('/equipes')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(equipes => {
            // Ordenar equipes por pontos (maior para menor)
            equipes.sort((a, b) => b.ponto - a.ponto);

            const tableBody = document.getElementById('admin-table-body');
            tableBody.innerHTML = ''; // Limpar tabela
            
            if (equipes.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td colspan="6" class="text-center py-4">
                        <i class="bi bi-info-circle me-2"></i>
                        Nenhuma equipe cadastrada ainda.
                    </td>
                `;
                tableBody.appendChild(row);
                return;
            }
            
            equipes.forEach((equipe, index) => {
                const row = document.createElement('tr');
                const posicao = index + 1;
                
                row.innerHTML = `
                    <td class="text-center">
                        <span class="position-medal ${index < 3 ? `position-${index + 1}` : ''}">
                            ${posicao}º
                        </span>
                    </td>
                    <td>
                        <img src="${equipe.foto_do_lider}" 
                             alt="Foto do líder ${equipe.nome_do_lider}" 
                             class="leader-photo"
                             onerror="this.src='imagem/default-avatar.png'">
                    </td>
                    <td>${equipe.nome_da_equipe}</td>
                    <td>${equipe.nome_do_lider}</td>
                    <td>
                        <span class="badge bg-warning text-dark">
                            <i class="bi bi-star-fill me-1"></i>
                            ${equipe.ponto}
                        </span>
                    </td>
                    <td class="text-center">
                        <img src="${equipe.bloco || 'imagem/default-avatar.png'}"
                             alt="Foto da bloco"
                             class="leader-photo tribe-photo"
                             onerror="this.src='imagem/default-avatar.png'"
                             style="width: 60px; height: 60px; object-fit: cover;">
                    </td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-success btn-sm" onclick="abrirModalPontuacao(${equipe.id}, '${equipe.nome_da_equipe}')">
                                <i class="bi bi-plus-circle-fill me-1"></i>
                                Pontuar
                            </button>
                            <button class="btn btn-warning btn-sm" onclick="iniciarEdicao(${equipe.id})">
                                <i class="bi bi-pencil-fill me-1"></i>
                                Editar
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="excluirEquipe(${equipe.id})">
                                <i class="bi bi-trash-fill me-1"></i>
                                Excluir
                            </button>
                        </div>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar equipes:', error);
            mostrarMensagem('Erro ao carregar equipes. Por favor, recarregue a página.', 'danger');
        });
}

// Função para limpar o formulário
function limparFormulario() {
    document.getElementById('equipeForm').reset();
    document.getElementById('equipeId').value = '';
    modoEdicao = false;
    
    // Atualizar o texto do botão de submit
    const submitButton = document.querySelector('#equipeForm button[type="submit"]');
    if (submitButton) {
        submitButton.innerHTML = '<i class="bi bi-save-fill me-2"></i>Salvar Equipe';
    }
    
    mostrarMensagem('Formulário limpo! 🧹', 'info');
}

// Função para iniciar edição de uma equipe
function iniciarEdicao(id) {
    const equipe = Array.from(document.querySelectorAll('#admin-table-body tr')).find(row => {
        return row.querySelector('button').onclick.toString().includes(id);
    });

    if (equipe) {
        document.getElementById('equipeId').value = id;
        document.getElementById('nomeEquipe').value = equipe.cells[2].textContent; // Nome da equipe
        document.getElementById('nomeLider').value = equipe.cells[3].textContent; // Nome do líder
        document.getElementById('fotoLider').value = equipe.cells[1].querySelector('img').src; // Foto do líder
        document.getElementById('pontos').value = equipe.cells[4].querySelector('.badge').textContent.trim(); // Pontos
        document.getElementById('bloco').value = equipe.cells[5].querySelector('img').src; // Foto da bloco
        modoEdicao = true;
        
        // Mostrar o formulário e atualizar o título
        toggleForm();
        document.getElementById('formTitle').textContent = 'Editar Equipe';
        
        mostrarMensagem('Equipe carregada para edição! ✏️', 'info');
    } else {
        console.error('Equipe não encontrada na tabela');
        mostrarMensagem('Erro ao carregar equipe para edição.', 'danger');
    }
}

// Função para abrir o modal de pontuação
function abrirModalPontuacao(id, nomeEquipe) {
    document.getElementById('equipePontuacaoId').value = id;
    document.getElementById('equipeNome').textContent = nomeEquipe;
    document.getElementById('pontuacaoAdicional').value = '';
    
    // Abre o modal
    const modal = new bootstrap.Modal(document.getElementById('pontuacaoModal'));
    modal.show();
}

// Função para adicionar pontuação
function adicionarPontuacao() {
    const id = document.getElementById('equipePontuacaoId').value;
    const pontuacaoAdicional = parseInt(document.getElementById('pontuacaoAdicional').value);

    if (!pontuacaoAdicional || pontuacaoAdicional < 0) {
        mostrarMensagem('Por favor, insira uma pontuação válida.', 'warning');
        return;
    }

    // Encontrar pontuação atual da equipe
    const equipeRow = Array.from(document.querySelectorAll('#admin-table-body tr')).find(row => {
        return row.querySelector('button').onclick.toString().includes(id);
    });

    if (!equipeRow) {
        mostrarMensagem('Equipe não encontrada.', 'danger');
        return;
    }

    const pontuacaoAtual = parseInt(equipeRow.cells[4].querySelector('.badge').textContent);
    const novaPontuacao = pontuacaoAtual + pontuacaoAdicional;

    // Atualizar pontuação no servidor
    fetch(`/equipes/atualizar/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: parseInt(id),
            ponto: novaPontuacao,
            nome_da_equipe: equipeRow.cells[2].textContent,
            nome_do_lider: equipeRow.cells[3].textContent,
            foto_do_lider: equipeRow.cells[1].querySelector('img').src,
            bloco: equipeRow.cells[5].querySelector('img').src
        })
    })
    .then(response => {
        if (response.ok) {
            mostrarMensagem(`Pontuação adicionada com sucesso! +${pontuacaoAdicional} pontos 🎉`, 'success');
            carregarEquipes();
            // Fecha o modal
            bootstrap.Modal.getInstance(document.getElementById('pontuacaoModal')).hide();
        } else {
            throw new Error('Erro ao atualizar pontuação');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao atualizar pontuação. Por favor, tente novamente.', 'danger');
    });
}

// Inicialização da página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação e obter nome do usuário
    fetch('/auth/me')
        .then(response => {
            if (!response.ok) throw new Error('Não autenticado');
            return response.json();
        })
        .then(data => {
            const nome = data.nome || data.login || 'Usuário';
            const nameEl = document.getElementById('adminName');
            if (nameEl) nameEl.textContent = nome;
            carregarEquipes();

            // Adicionar efeito de hover nos botões
            document.querySelectorAll('.btn').forEach(btn => {
                btn.addEventListener('mouseover', function() {
                    this.style.transform = 'translateY(-2px)';
                });
                btn.addEventListener('mouseout', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
        })
        .catch(err => {
            console.error('Usuário não autenticado, redirecionando para /login.html', err);
            window.location.href = '/login.html';
        });
});


// Função para mostrar mensagem de feedback
function mostrarMensagem(mensagem, tipo = 'success') {
    const div = document.createElement('div');
    div.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-4`;
    div.style.zIndex = '1050';
    div.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(div);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        div.remove();
    }, 5000);
}

// Função para excluir uma equipe
function excluirEquipe(id) {
    if (confirm('Tem certeza que deseja excluir esta equipe?')) {
        fetch(`/equipes/excluir/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                mostrarMensagem('Equipe excluída com sucesso! 🗑️');
                carregarEquipes();
            } else {
                throw new Error('Erro ao excluir equipe');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            mostrarMensagem('Erro ao excluir equipe. Por favor, tente novamente.', 'danger');
        });
    }
}

// Função para atualizar uma equipe existente
async function atualizarEquipe(id, equipeData) {
    console.log('Atualizando equipe:', { id, data: equipeData });

    try {
        // Criando o objeto que será enviado no corpo da requisição
        const requestData = {
            id: parseInt(id),
            nome_da_equipe: equipeData.nome_da_equipe,
            nome_do_lider: equipeData.nome_do_lider,
            foto_do_lider: equipeData.foto_do_lider,
            ponto: parseInt(equipeData.ponto),
            bloco: equipeData.bloco
        };

        console.log('Dados formatados para atualização:', requestData);

        const response = await fetch(`/equipes/atualizar/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Erro ao atualizar equipe: ${response.status}`);
        }

        mostrarMensagem('Equipe atualizada com sucesso! ✅');
        return true;
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        mostrarMensagem('Erro ao atualizar equipe: ' + error.message, 'danger');
        return false;
    }

    try {
        const response = await fetch(`/equipes/atualizar/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        const responseText = await response.text();
        console.log('Resposta da atualização:', responseText);
        
        if (!response.ok) {
            throw new Error(`Erro ao atualizar equipe: ${responseText}`);
        }

        mostrarMensagem('Equipe atualizada com sucesso! ✅');
        return true;
    } catch (error) {
        console.error('Erro na atualização:', error);
        mostrarMensagem(`Erro ao atualizar equipe: ${error.message}`, 'danger');
        return false;
    }
}

// Função para cadastrar uma nova equipe
async function cadastrarEquipe(equipeData) {
    console.log('Cadastrando nova equipe:', equipeData);

    // Garantindo que os dados estejam no formato correto para o backend
    const requestData = {
        nome_da_equipe: equipeData.nome_da_equipe,
        nome_do_lider: equipeData.nome_do_lider,
        foto_do_lider: equipeData.foto_do_lider,
        ponto: parseInt(equipeData.ponto), // Garantindo que seja número
        bloco: equipeData.bloco
    };

    console.log('Dados formatados para cadastro:', requestData);

    try {
        const response = await fetch('/equipes/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        const responseText = await response.text();
        console.log('Resposta do cadastro:', responseText);
        
        if (!response.ok) {
            throw new Error(`Erro ao cadastrar equipe: ${responseText}`);
        }

        mostrarMensagem('Equipe cadastrada com sucesso! 🎉');
        return true;
    } catch (error) {
        console.error('Erro no cadastro:', error);
        mostrarMensagem(`Erro ao cadastrar equipe: ${error.message}`, 'danger');
        return false;
    }
}

// Configurar o envio do formulário
document.getElementById('equipeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validar caminho da foto
    const fotoPath = document.getElementById('fotoLider').value.trim();
    if (!fotoPath) {
        mostrarMensagem('Por favor, forneça o caminho da foto do líder.', 'warning');
        return;
    }

    // Validar pontos
    const pontos = parseInt(document.getElementById('pontos').value);
    if (pontos < 0) {
        mostrarMensagem('A pontuação não pode ser negativa.', 'warning');
        return;
    }
    
    const equipeData = {
        nome_da_equipe: document.getElementById('nomeEquipe').value,
        nome_do_lider: document.getElementById('nomeLider').value,
        foto_do_lider: fotoPath,
        ponto: pontos,
        bloco: document.getElementById('bloco').value
    };

    const id = document.getElementById('equipeId').value;
    let sucesso = false;
    
    if (modoEdicao) {
        sucesso = await atualizarEquipe(id, equipeData);
    } else {
        sucesso = await cadastrarEquipe(equipeData);
    }

    if (sucesso) {
        limparFormulario();
        carregarEquipes();
    }

});

