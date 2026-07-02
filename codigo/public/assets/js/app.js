const API_PRODUTOS = '/api/produtos';
const API_FAVORITOS = '/api/favoritos';

// Retorna o array de IDs favoritados do usuário logado
async function getFavoritosIds() {
    if (!usuarioCorrente || !usuarioCorrente.id) return [];

    const response = await fetch(`${API_FAVORITOS}?usuarioId=${usuarioCorrente.id}`);
    if (!response.ok) {
        console.error('Erro ao buscar favoritos:', response.statusText);
        return [];
    }

    const favoritos = await response.json();
    return favoritos.map(item => item.produtoId);
}

async function findFavoriteRecord(produtoId) {
    if (!usuarioCorrente || !usuarioCorrente.id) return null;

    const response = await fetch(`${API_FAVORITOS}?usuarioId=${usuarioCorrente.id}&produtoId=${produtoId}`);
    if (!response.ok) {
        console.error('Erro ao buscar registro de favorito:', response.statusText);
        return null;
    }

    const registros = await response.json();
    return registros.length ? registros[0] : null;
}

async function favoritar(id) {
    if (!usuarioCorrente || !usuarioCorrente.id) {
        alert("Você precisa estar logado para favoritar um item!");
        window.location.href = LOGIN_URL;
        return;
    }

    try {
        const registro = await findFavoriteRecord(id);

        if (registro) {
            await fetch(`${API_FAVORITOS}/${registro.id}`, { method: 'DELETE' });
        } else {
            await fetch(API_FAVORITOS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId: usuarioCorrente.id, produtoId: id })
            });
        }
    } catch (error) {
        console.error('Erro ao atualizar favorito:', error);
    }

    if (window.location.pathname.includes('favoritos.html')) {
        carregarFavoritos();
    } else {
        carregarItens();
    }
}

// Busca os itens na API (usado na tela de Produtos)
async function carregarItens() {
    try {
        const response = await fetch(API_PRODUTOS);
        const dados = await response.json();
        const favs = await getFavoritosIds();
        renderizarItens(dados, favs);
    } catch (error) {
        console.error("Erro ao carregar itens:", error);
    }
}

// Monta o HTML dos cards na tela de Produtos
function renderizarItens(itens, favs = []) {
    let container = document.getElementById('lista-itens');
    if (!container) return;
    
    container.innerHTML = '';

    itens.forEach(item => {
        let isFav = favs.includes(item.id);
        let icone = isFav ? 'bi-heart-fill text-danger' : 'bi-heart';
        let textoBotao = isFav ? 'Desfavoritar' : 'Favoritar';
        
        container.innerHTML += `
            <div class="col-md-4 mb-3">
                <div class="card p-3 border">
                    <h5>${item.titulo}</h5>
                    <p>${item.descricao}</p>
                    <button class="btn btn-outline-primary" onclick="favoritar(${item.id})">
                        <i class="bi ${icone}"></i> ${textoBotao}
                    </button>
                </div>
            </div>
        `;
    });
}

async function carregarFavoritos() {
    let container = document.getElementById('lista-favoritos');
    if (!container) return;

    if (!usuarioCorrente || !usuarioCorrente.id) {
        container.innerHTML = "<p>Faça login para ver seus favoritos.</p>";
        return;
    }

    try {
        const favIds = await getFavoritosIds();
        if (favIds.length === 0) {
            container.innerHTML = "<p>Você ainda não favoritou nenhum item.</p>";
            return;
        }

        const response = await fetch(API_PRODUTOS);
        const itens = await response.json();
        const itensFavoritados = itens.filter(item => favIds.includes(item.id));

        container.innerHTML = '';
        itensFavoritados.forEach(item => {
            container.innerHTML += `
                <div class="col-md-4 mb-3">
                    <div class="card p-3 border border-primary">
                        <h5>${item.titulo}</h5>
                        <p>${item.descricao}</p>
                        <button class="btn btn-outline-danger" onclick="favoritar(${item.id})">
                            <i class="bi bi-heart-fill"></i> Remover Favorito
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        container.innerHTML = "<p>Falha ao carregar favoritos. Tente novamente.</p>";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('lista-itens')) {
        carregarItens();
    }
    if (document.getElementById('lista-favoritos')) {
        carregarFavoritos();
    }
});