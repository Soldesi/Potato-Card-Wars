const cartas = [
    { nome: "Sniper", imagem: "imagens/1.png", elemento: "terra", valor: 10 },
    { nome: "Agricultor", imagem: "imagens/2.png", elemento: "terra", valor: 9 },
    { nome: "Bombeiro", imagem: "imagens/3.png", elemento: "agua", valor: 11 },
    { nome: "Pirata", imagem: "imagens/4.png", elemento: "agua", valor: 12 },
    { nome: "Ninja", imagem: "imagens/5.png", elemento: "fogo", valor: 8 },
    { nome: "Dragao", imagem: "imagens/6.png", elemento: "fogo", valor: 12 },
    { nome: "Arqueiro", imagem: "imagens/7.png", elemento: "terra", valor: 6 },
    { nome: "Zumbi", imagem: "imagens/8.png", elemento: "terra", valor: 7 },
    { nome: "Mergulhador", imagem: "imagens/9.png", elemento: "agua", valor: 10 },
    { nome: "Chef", imagem: "imagens/10.png", elemento: "fogo", valor: 5 },
    { nome: "Vulcao", imagem: "imagens/11.png", elemento: "fogo", valor: 11 },
    { nome: "Robo", imagem: "imagens/12.png", elemento: "fogo", valor: 9 },
    { nome: "Surfista", imagem: "imagens/13.png", elemento: "agua", valor: 9 },
    { nome: "Mago", imagem: "imagens/14.png", elemento: "terra", valor: 11 },
    { nome: "Petrificado", imagem: "imagens/15.png", elemento: "terra", valor: 12 },
    { nome: "Pescador", imagem: "imagens/16.png", elemento: "agua", valor: 8 },
    { nome: "Lenhador", imagem: "imagens/17.png", elemento: "terra", valor: 5 },
    { nome: "Vampiro", imagem: "imagens/18.png", elemento: "fogo", valor: 10 },
    { nome: "Tempestade", imagem: "imagens/19.png", elemento: "raio", valor: 10 },
    { nome: "Eletricista", imagem: "imagens/20.png", elemento: "raio", valor: 6 },
    { nome: "Hacker", imagem: "imagens/21.png", elemento: "raio", valor: 7 },
    { nome: "Bateria", imagem: "imagens/22.png", elemento: "raio", valor: 9 },
    { nome: "Dj", imagem: "imagens/23.png", elemento: "raio", valor: 5 },
    { nome: "Mecanico", imagem: "imagens/24.png", elemento: "raio", valor: 4 },
    { nome: "Troca", imagem: "imagens/troca.png", elemento: "especial", valor: 99 }
];

let baralho = [];
let maoJogador = [];
let maoRobo = [];
let cartaAtual = null;
let turno = "jogador";

const maoEl = document.getElementById("maoJogador");
const descarteEl = document.getElementById("pilhaDescarte");
const comprarBtn = document.getElementById("comprarBtn");
const mensagemUNO = document.getElementById("mensagemUNO");
const turnoInfo = document.getElementById("turnoInfo");
const cartasRoboEl = document.getElementById("cartasRobo");

function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function iniciarJogoUNO() {
    baralho = embaralhar([...cartas]);
    maoJogador = [];
    maoRobo = [];
    for (let i = 0; i < 5; i++) {
        maoJogador.push(baralho.pop());
        maoRobo.push(baralho.pop());
    }
    cartaAtual = baralho.pop();
    atualizarTelaUNO();
    atualizarCartasRobo();
}

function atualizarCartasRobo() {
    cartasRoboEl.textContent = `Cartas do Robô: ${maoRobo.length}`;
}

function atualizarTelaUNO() {
    descarteEl.innerHTML = `<img src="${cartaAtual.imagem}" alt="${cartaAtual.nome}" class="card" />`;

    maoEl.innerHTML = "";
    maoJogador.forEach((carta) => {
        const cartaDiv = document.createElement("div");
        cartaDiv.classList.add("card");
        cartaDiv.innerHTML = `<img src="${carta.imagem}" alt="${carta.nome}" />`;
        cartaDiv.addEventListener("click", () => {
            if (turno === "jogador") jogarCarta(maoJogador.indexOf(carta));
        });
        maoEl.appendChild(cartaDiv);
    });

    turnoInfo.textContent = turno === "jogador" ? "Sua vez!" : "Vez do robô...";
}

function adicionarCartaAnimadaNaMao(carta) {
    const cartaDiv = document.createElement("div");
    cartaDiv.classList.add("card", "surgir");
    cartaDiv.innerHTML = `<img src="${carta.imagem}" alt="${carta.nome}" />`;

    cartaDiv.addEventListener("click", () => {
        if (turno === "jogador") jogarCarta(maoJogador.indexOf(carta));
    });

    cartaDiv.addEventListener("animationend", () => {
        cartaDiv.classList.remove("surgir");
    });

    maoEl.appendChild(cartaDiv);
}

function jogarCarta(index) {
    if (turno !== "jogador") return;

    const carta = maoJogador[index];
    const isTroca = carta.elemento === "especial" && carta.valor === 99;
    const podeJogar = isTroca || carta.elemento === cartaAtual.elemento || carta.valor === cartaAtual.valor;

    if (podeJogar) {
if (!isTroca) {
    cartaAtual = carta;
}
        maoJogador.splice(index, 1);

        if (isTroca) {
            const temp = [...maoJogador];
            maoJogador = [...maoRobo];
            maoRobo = [...temp];
            mensagemUNO.textContent = "Você usou a carta TROCA! As mãos foram trocadas!";
        } else {
            mensagemUNO.textContent = `Você jogou: ${carta.nome}`;
        }

        if (verificarFimDeJogo("jogador")) return;
        turno = "robo";
        atualizarTelaUNO();
        atualizarCartasRobo();
        setTimeout(turnoRobo, 1000);
    } else {
        mensagemUNO.textContent = "Carta inválida! Jogue uma com o mesmo elemento ou mesmo valor.";
    }
}

comprarBtn.addEventListener("click", () => {
    if (turno !== "jogador") return;
    if (baralho.length === 0) {
        mensagemUNO.textContent = "Baralho esgotado!";
        return;
    }

    const novaCarta = baralho.pop();
    maoJogador.push(novaCarta);
    adicionarCartaAnimadaNaMao(novaCarta);
    mensagemUNO.textContent = `Você comprou uma carta.`;

    turno = "robo";
    atualizarCartasRobo();
    setTimeout(turnoRobo, 1000);
});

function turnoRobo() {
    if (turno !== "robo") return;

    atualizarTelaUNO();

    let cartaIndex = maoRobo.findIndex(
        c => c.elemento === cartaAtual.elemento || c.valor === cartaAtual.valor || (c.elemento === "especial" && c.valor === 99)
    );

    if (cartaIndex !== -1) {
        const carta = maoRobo[cartaIndex];
        maoRobo.splice(cartaIndex, 1);

        if (carta.elemento === "especial" && carta.valor === 99) {
            const temp = [...maoRobo];
            maoRobo = [...maoJogador];
            maoJogador = [...temp];
            mensagemUNO.textContent = "Robô usou a carta TROCA! As mãos foram trocadas!";
        } else {
            mensagemUNO.textContent = `Robô jogou: ${carta.nome}`;
        }

if (!(carta.elemento === "especial" && carta.valor === 99)) {
    cartaAtual = carta;
}
        if (verificarFimDeJogo("robo")) return;
    } else {
        if (baralho.length > 0) {
            const novaCarta = baralho.pop();
            maoRobo.push(novaCarta);
            mensagemUNO.textContent = `Robô comprou uma carta.`;

            if (
                novaCarta.elemento === cartaAtual.elemento ||
                novaCarta.valor === cartaAtual.valor ||
                (novaCarta.elemento === "especial" && novaCarta.valor === 99)
            ) {
if (!(novaCarta.elemento === "especial" && novaCarta.valor === 99)) {
    cartaAtual = novaCarta;
}
                maoRobo.pop();

                if (novaCarta.elemento === "especial" && novaCarta.valor === 99) {
                    const temp = [...maoRobo];
                    maoRobo = [...maoJogador];
                    maoJogador = [...temp];
                    mensagemUNO.textContent = "Robô comprou e usou TROCA! As mãos foram trocadas!";
                } else {
                    mensagemUNO.textContent = `Robô comprou e jogou: ${novaCarta.nome}`;
                }

                if (verificarFimDeJogo("robo")) return;
            }
        } else {
            mensagemUNO.textContent = `Robô passou a vez.`;
        }
    }

    turno = "jogador";
    atualizarTelaUNO();
    atualizarCartasRobo();
}

function verificarFimDeJogo(jogador) {
    const mao = jogador === "jogador" ? maoJogador : maoRobo;
    if (mao.length === 0) {
        const msg = jogador === "jogador" ? "Você venceu o robô!" : "O robô venceu você!";
        document.getElementById("mensagemFinal").textContent = msg;
        document.getElementById("fimDeJogo").classList.remove("hidden");
        maoEl.innerHTML = "";
        descarteEl.innerHTML = "";
        turno = "fim";
        return true;
    }
    return false;
}

document.getElementById("jogarNovamente").addEventListener("click", () => {
    location.reload();
});

function voltarParaCapa() {
    window.location.href = "index.html";
}

function toggleAjuda() {
    const modal = document.getElementById("ajudaModal");
    modal.classList.toggle("hidden");
}

iniciarJogoUNO();
