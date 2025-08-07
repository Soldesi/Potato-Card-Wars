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
  { nome: "Robo", imagem: "imagens/12.png", elemento: "fogo", valor: 8 },
  { nome: "Surfista", imagem: "imagens/13.png", elemento: "agua", valor: 9 },
  { nome: "Mago", imagem: "imagens/14.png", elemento: "terra", valor: 11 },
  { nome: "Petrificado", imagem: "imagens/15.png", elemento: "terra", valor: 12 },
  { nome: "Pescador", imagem: "imagens/16.png", elemento: "agua", valor: 8 },
  { nome: "Lenhador", imagem: "imagens/17.png", elemento: "terra", valor: 5 },
  { nome: "Vampiro", imagem: "imagens/18.png", elemento: "fogo", valor: 10 },
  { nome: "Soldador", imagem: "imagens/27.png", elemento: "fogo", valor: 7 },
  { nome: "Aventureiro", imagem: "imagens/28.png", elemento: "terra", valor: 8 },
  { nome: "Tubarao", imagem: "imagens/29.png", elemento: "agua", valor: 9 },
];

let cartaSelecionada = null;
let pontosJogador = 0;
let pontosRobo = 0;
let placarCriado = false;
let historicoElementosRobo = [];

const deckEl = document.getElementById("deck");
const fightBtn = document.getElementById("fightBtn");
const resultadoEl = document.getElementById("resultado");
const placarContainer = document.createElement("div");
placarContainer.id = "placarContainer";

const eventos = [
  {
    nome: "🌧️ Chuva Forte",
    descricao: "Cartas de fogo perdem 2 de valor!",
    efeito: (jogador, robo) => {
      if (jogador.elemento === "fogo") jogador.valor -= 2;
      if (robo.elemento === "fogo") robo.valor -= 2;
    }
  },
  {
    nome: "🌋 Erupção Vulcânica",
    descricao: "Cartas de terra não vencem nesta rodada!",
    efeito: (jogador, robo, resultado) => {
      if (jogador.elemento === "terra" && resultado.vencedor === "jogador") {
        resultado.vencedor = "empate";
        resultado.mensagem += " (bloqueado pela erupção)";
      }
      if (robo.elemento === "terra" && resultado.vencedor === "robo") {
        resultado.vencedor = "empate";
        resultado.mensagem += " (bloqueado pela erupção)";
      }
    }
  },
  {
    nome: "🌊 Maré Alta",
    descricao: "Cartas de água ganham 1 de valor!",
    efeito: (jogador, robo) => {
      if (jogador.elemento === "agua") jogador.valor += 1;
      if (robo.elemento === "agua") robo.valor += 1;
    }
  },
  {
    nome: "🌪️ Tempestade Caótica",
    descricao: "Elementos ignorados, vence só quem tiver maior valor!",
    efeito: (jogador, robo, resultado, ignorar) => {
      ignorar.valorFinal = true;
    }
  },
  {
    nome: "🧊 Gelo Total",
    descricao: "Robô não pode jogar cartas de fogo!",
    efeito: (_, __, ___, ____, restricoes) => {
      restricoes.proibirFogoRobo = true;
    }
  }
];

let eventoAtual = null;
let eventoProximaRodada = null; // Evento que será aplicado na próxima batalha

function gerarCartasIniciais() {
  cartasEmJogo = [];
  deckEl.innerHTML = "";
  while (cartasEmJogo.length < 5) {
    const random = cartas[Math.floor(Math.random() * cartas.length)];
    if (!cartasEmJogo.includes(random)) {
      cartasEmJogo.push(random);
    }
  }

  cartasEmJogo.forEach((carta, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.innerHTML = `<img src="${carta.imagem}" alt="${carta.nome}" />`;
    cardDiv.addEventListener("click", () => selecionarCarta(index));
    deckEl.appendChild(cardDiv);
  });
}

let cartasEmJogo = [];
gerarCartasIniciais();

function selecionarCarta(index) {
  cartaSelecionada = cartasEmJogo[index];
  document.querySelectorAll('.card').forEach(card => card.classList.remove('selected'));
  document.querySelectorAll('.card')[index].classList.add('selected');
  fightBtn.disabled = false;
}

fightBtn.addEventListener("click", () => {
  if (!cartaSelecionada) {
    resultadoEl.innerHTML = `<p style="color: red; font-weight: bold; font-size: 16px; margin: 10px 0;">⚠️ Por favor, selecione uma carta antes de batalhar!</p>`;
    return;
  }
  batalhar();
});

function batalhar() {
  document.getElementById("mensagemDica").style.display = "none";
  const ignorarElemento = { valorFinal: false };
  const restricoes = { proibirFogoRobo: false };

  // Aplica evento da rodada passada (se houver)
  if (eventoProximaRodada) {
    eventoAtual = eventoProximaRodada;
    eventoProximaRodada = null;
    mostrarEventoNaTela(eventoAtual, true); // mostrar como "ativo"
  } else {
    eventoAtual = null;
  }

  let cartaRobo = escolherCartaRoboAdaptativa(cartaSelecionada);

  if (eventoAtual?.nome === "🧊 Gelo Total") {
    while (cartaRobo.elemento === "fogo") {
      cartaRobo = escolherCartaRoboAdaptativa(cartaSelecionada);
    }
  }

  const jogador = { ...cartaSelecionada };
  const robo = { ...cartaRobo };

  if (eventoAtual) {
    eventoAtual.efeito(jogador, robo, {}, ignorarElemento, restricoes);
  }

  let resultado = ignorarElemento.valorFinal
    ? calcularPorValorApenas(jogador, robo)
    : calcularResultado(jogador, robo);

  if (eventoAtual && eventoAtual.efeito.length >= 3) {
    eventoAtual.efeito(jogador, robo, resultado, ignorarElemento, restricoes);
  }

  if (resultado.vencedor === "jogador") pontosJogador++;
  else if (resultado.vencedor === "robo") pontosRobo++;

  if (!placarCriado) {
    criarPlacar();
    placarCriado = true;
  }
  atualizarPlacar();

  resultadoEl.innerHTML = `
    <div class="result-card surgir">
      <p><strong>Sua carta:</strong></p> 
      <img src="${jogador.imagem}" alt="${jogador.nome}" />
    </div>
    <div class="result-card surgir-delay">
      <p><strong>Carta do robô:</strong></p>
      <img src="${robo.imagem}" alt="${robo.nome}" />
    </div>
  `;

  setTimeout(() => {
    const mensagemDiv = document.createElement("div");
    mensagemDiv.style.width = "100%";
    mensagemDiv.classList.add("fade-in");
    mensagemDiv.innerHTML = `<strong>${resultado.mensagem}</strong>`;
    resultadoEl.appendChild(mensagemDiv);

    if (pontosJogador >= 3 || pontosRobo >= 3) {
      fightBtn.style.display = "none";
      document.querySelectorAll(".result-card").forEach(el => el.style.display = "none");

      const resultadoFinal = document.createElement("div");
      resultadoFinal.classList.add("resultado-final-box", pontosJogador >= 3 ? "resultado-vitoria" : "resultado-derrota");

      const emojiImg = pontosJogador >= 3 
        ? '<img src="./imagens/batata-feliz.png" alt="Batata feliz" class="emoji-final" />' 
        : '<img src="./imagens/batata-triste.png" alt="Batata triste" class="emoji-final" />';

      const mensagem = pontosJogador >= 3 
        ? "Parabéns! Você venceu o jogo!" 
        : "Que pena! O robô venceu o jogo.";

      resultadoFinal.innerHTML = `${emojiImg}${mensagem}`;

      const botaoReiniciar = document.createElement("button");
      botaoReiniciar.textContent = "🔁 Jogar Novamente";
      botaoReiniciar.classList.add("botao-reiniciar-estilizado");
      botaoReiniciar.addEventListener("click", resetarJogo);

      resultadoFinal.appendChild(botaoReiniciar);
      resultadoEl.appendChild(resultadoFinal);
    } else {
      substituirCartaJogador();
    }

    // Sorteia evento para próxima rodada
    if (Math.random() < 0.3) {
      eventoProximaRodada = eventos[Math.floor(Math.random() * eventos.length)];
      mostrarEventoNaTela(eventoProximaRodada, false); // mostrar como "próximo"
    } else {
      eventoProximaRodada = null;
    }

  }, 900);
}


function mostrarEventoNaTela(evento, ativo = false) {
  const container = document.getElementById("eventosContainer");

  const eventoDiv = document.createElement("div");
  eventoDiv.classList.add("evento-aleatorio");
  eventoDiv.style.backgroundColor = ativo ? "#ffefc5" : "#d3eaff";
  eventoDiv.innerHTML = `
    <strong>${evento.nome}</strong><br/>
    <span>${evento.descricao}</span><br/>
    <small>${ativo ? "🌟 Aplicado nesta rodada!" : "🔮 Próxima rodada!"}</small>
  `;

  container.appendChild(eventoDiv);

  setTimeout(() => {
    eventoDiv.classList.add("fade-out");
    setTimeout(() => eventoDiv.remove(), 500);
  }, 6000);
}



function substituirCartaJogador() {
  const novaCarta = cartas[Math.floor(Math.random() * cartas.length)];

  const deckCards = document.querySelectorAll('.card');
  let cartaIndex = -1;

  deckCards.forEach((card, index) => {
    if (card.classList.contains('selected')) {
      cartaIndex = index;
    }
  });

  if (cartaIndex === -1) return;

  cartasEmJogo[cartaIndex] = novaCarta;

  const novaImg = document.createElement("img");
  novaImg.src = novaCarta.imagem;
  novaImg.alt = novaCarta.nome;

  const novaDiv = document.createElement("div");
  novaDiv.classList.add("card", "nova-carta");
  novaDiv.appendChild(novaImg);
  novaDiv.addEventListener("click", () => selecionarCarta(cartaIndex));
  novaDiv.addEventListener("animationend", () => {
    novaDiv.classList.remove("nova-carta");
  });

  deckEl.replaceChild(novaDiv, deckCards[cartaIndex]);

  cartaSelecionada = null;
  fightBtn.disabled = true;
}

function calcularResultado(cartaJogador, cartaRobo) {
  const venceDe = { terra: "agua", agua: "fogo", fogo: "terra" };

  if (cartaJogador.elemento === cartaRobo.elemento) {
    if (cartaJogador.valor > cartaRobo.valor) return { vencedor: "jogador", mensagem: "Você venceu!" };
    if (cartaJogador.valor < cartaRobo.valor) return { vencedor: "robo", mensagem: "O robô venceu!" };
    return { vencedor: "empate", mensagem: "Empate!" };
  }

  if (venceDe[cartaJogador.elemento] === cartaRobo.elemento)
    return { vencedor: "jogador", mensagem: "Você venceu!" };
  return { vencedor: "robo", mensagem: "O robô venceu!" };
}

function calcularPorValorApenas(cartaJogador, cartaRobo) {
  if (cartaJogador.valor > cartaRobo.valor) return { vencedor: "jogador", mensagem: "Você venceu (sem elementos)!" };
  if (cartaJogador.valor < cartaRobo.valor) return { vencedor: "robo", mensagem: "O robô venceu (sem elementos)!" };
  return { vencedor: "empate", mensagem: "Empate!" };
}

function criarPlacar() {
  placarContainer.classList.add("placar");
  placarContainer.innerHTML = `
    <div class="player-info">
      <span>👤 Você: <span id="pontosJogador">0</span></span>
      <img src="./imagens/Personagem.png" alt="Jogador" class="personagem-img" />
    </div>
    <div class="player-info">
      <span>🤖 Robô: <span id="pontosRobo">0</span></span>
      <img src="./imagens/Personagem2.png" alt="Robô" class="personagem-img" />
    </div>
  `;
  document.body.insertBefore(placarContainer, deckEl);
}

function atualizarPlacar() {
  document.getElementById("pontosJogador").textContent = pontosJogador;
  document.getElementById("pontosRobo").textContent = pontosRobo;
}

function resetarJogo() {
  cartaSelecionada = null;
  fightBtn.disabled = true;
  fightBtn.style.display = "inline-block";
  pontosJogador = 0;
  pontosRobo = 0;
  placarCriado = false;
  placarContainer.remove();
  resultadoEl.innerHTML = "";
  gerarCartasIniciais();
  document.getElementById("mensagemDica").style.display = "block";
}

function voltarParaCapa() {
  window.location.href = "index.html"; // ou o nome real da sua página principal
}

function escolherCartaRoboAdaptativa(cartaJogador) {
  const ultimos = historicoElementosRobo.slice(-2);
  let elementoProibido = null;

  if (ultimos.length === 2 && ultimos[0] === ultimos[1]) {
    elementoProibido = ultimos[0];
  }

  let cartasPossiveis = cartas.filter(c => c.elemento !== elementoProibido);

  if (cartasPossiveis.length === 0) {
    cartasPossiveis = [...cartas];
  }

  const cartaEscolhida = cartasPossiveis[Math.floor(Math.random() * cartasPossiveis.length)];

  historicoElementosRobo.push(cartaEscolhida.elemento);
  if (historicoElementosRobo.length > 2) {
    historicoElementosRobo.shift();
  }

  return cartaEscolhida;
}
