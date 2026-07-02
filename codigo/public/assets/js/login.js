const DEFAULT_USERS = [
    { id: 1, login: 'admin', senha: '123', nome: 'Administrador do Sistema', email: 'admin@abc.com' },
    { id: 2, login: 'user', senha: '123', nome: 'Usuario Comum', email: 'user@abc.com' }
];

let usuarioCorrente = {};
let RETURN_URL = './index.html';
let LOGIN_URL = './modulos/login/login.html';
let db_usuarios = [];

function getUsuarios() {
    const storedUsers = localStorage.getItem('db_usuarios');
    if (storedUsers) {
        try {
            db_usuarios = JSON.parse(storedUsers);
            return db_usuarios;
        } catch (error) {
            console.warn('Erro ao ler usuários salvos:', error);
        }
    }

    db_usuarios = DEFAULT_USERS.map((usuario) => ({ ...usuario }));
    localStorage.setItem('db_usuarios', JSON.stringify(db_usuarios));
    return db_usuarios;
}

function persistUsuarios() {
    localStorage.setItem('db_usuarios', JSON.stringify(db_usuarios));
}

function getLoginUrl() {
    return window.location.pathname.includes('/modulos/login/')
        ? './login.html'
        : './modulos/login/login.html';
}

function initLoginApp() {
    LOGIN_URL = getLoginUrl();
    const pagina = window.location.pathname.split('/').pop() || 'index.html';

    if (pagina !== 'login.html') {
        const currentPage = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        sessionStorage.setItem('returnURL', currentPage);
        RETURN_URL = currentPage;

        const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
        usuarioCorrente = usuarioCorrenteJSON ? JSON.parse(usuarioCorrenteJSON) : {};
        showUserInfo('userInfo');
    } else {
        const returnURL = sessionStorage.getItem('returnURL');
        RETURN_URL = returnURL || './index.html';
        carregarUsuarios(() => {
            console.log('Usuários carregados...');
        });
    }
}

function showUserInfo(element) {
    const elemUser = document.getElementById(element);
    if (!elemUser) return;

    if (usuarioCorrente && usuarioCorrente.id) {
        elemUser.innerHTML = `Olá, ${usuarioCorrente.nome} | <a href="#" onclick="logoutUser()" style="text-decoration: none; color: red;">Sair</a>`;
    } else {
        elemUser.innerHTML = `<a href="${LOGIN_URL}" style="text-decoration: none; color: #093070; font-weight: bold;">Entrar</a>`;
    }
}

function loginUser(usernameOrForm, password) {
    const usuarios = getUsuarios();
    let login = '';
    let senha = '';

    if (usernameOrForm && typeof usernameOrForm === 'object' && usernameOrForm.elements) {
        login = usernameOrForm.elements.username?.value || usernameOrForm.elements.txt_login?.value || '';
        senha = usernameOrForm.elements.password?.value || '';
    } else {
        login = usernameOrForm || '';
        senha = password || '';
    }

    const usuarioEncontrado = usuarios.find((usuario) => {
        return String(usuario.login).toLowerCase() === String(login).toLowerCase() && String(usuario.senha) === String(senha);
    });

    if (usuarioEncontrado) {
        usuarioCorrente = { ...usuarioEncontrado };
        sessionStorage.setItem('usuarioCorrente', JSON.stringify(usuarioCorrente));
        return true;
    }

    return false;
}

function logoutUser() {
    sessionStorage.removeItem('usuarioCorrente');
    usuarioCorrente = {};
    showUserInfo('userInfo');
    window.location.href = LOGIN_URL;
}

function carregarUsuarios(callback) {
    db_usuarios = getUsuarios();
    if (typeof callback === 'function') {
        callback();
    }
    return db_usuarios;
}

function addUser(nome, login, senha, email) {
    const usuarios = getUsuarios();
    const novoUsuario = {
        id: Date.now(),
        nome,
        login,
        senha,
        email
    };

    usuarios.push(novoUsuario);
    db_usuarios = usuarios;
    persistUsuarios();
    return novoUsuario;
}

document.addEventListener('DOMContentLoaded', initLoginApp);
initLoginApp();