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

// Gerar 5 cartas aleatórias no início
let cartasEmJogo = [];
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

gerarCartasIniciais();

function selecionarCarta(index) {
  cartaSelecionada = cartasEmJogo[index];
  document.querySelectorAll('.card').forEach(card => card.classList.remove('selected'));
  document.querySelectorAll('.card')[index].classList.add('selected');
  fightBtn.disabled = false;
}

fightBtn.addEventListener("click", () => {
  if (!cartaSelecionada) {
    resultadoEl.innerHTML = `
      <p style="color: red; font-weight: bold; font-size: 16px; margin: 10px 0;">
        ⚠️ Por favor, selecione uma carta antes de batalhar!
      </p>
    `;
    return;
  }

  batalhar();
});

function voltarParaCapa() {
  window.location.href = "index.html";
}

function batalhar() {
  document.getElementById("mensagemDica").style.display = "none";

  if (!cartaSelecionada) {
    alert("Escolha uma carta primeiro!");
    return;
  }

  const cartaRobo = escolherCartaRoboAdaptativa(cartaSelecionada);
  const resultado = calcularResultado(cartaSelecionada, cartaRobo);

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
      <img src="${cartaSelecionada.imagem}" alt="${cartaSelecionada.nome}" />
    </div>
    <div class="result-card surgir-delay">
      <p><strong>Carta do robô:</strong></p>
      <img src="${cartaRobo.imagem}" alt="${cartaRobo.nome}" />
    </div>
  `;

  setTimeout(() => {
    const mensagemDiv = document.createElement("div");
    mensagemDiv.style.width = "100%";
    mensagemDiv.style.marginTop = "0px";
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
        : '<img src="./imagens/emoji-batata-triste.png" alt="Batata triste" class="emoji-final" />';

      const mensagem = pontosJogador >= 3 
        ? "Parabéns! Você venceu o jogo!" 
        : "Que pena! O robô venceu o jogo.";

      resultadoFinal.innerHTML = `
        ${emojiImg}
        ${mensagem}
      `;

      const botaoReiniciar = document.createElement("button");
      botaoReiniciar.textContent = "🔁 Jogar Novamente";
      botaoReiniciar.classList.add("botao-reiniciar-estilizado");
      botaoReiniciar.addEventListener("click", resetarJogo);

      resultadoFinal.appendChild(botaoReiniciar);
      resultadoEl.appendChild(resultadoFinal);

    } else {
      substituirCartaJogador();
    }
  }, 900);
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
  const venceDe = {
    terra: "agua",
    agua: "fogo",
    fogo: "terra"
  };

  if (cartaJogador.elemento === cartaRobo.elemento) {
    if (cartaJogador.valor > cartaRobo.valor) {
      return { vencedor: "jogador", mensagem: "Você venceu!" };
    } else if (cartaJogador.valor < cartaRobo.valor) {
      return { vencedor: "robo", mensagem: "O robô venceu!" };
    } else {
      return { vencedor: "empate", mensagem: "Empate!" };
    }
  }

  if (venceDe[cartaJogador.elemento] === cartaRobo.elemento) {
    return { vencedor: "jogador", mensagem: "Você venceu!" };
  } else {
    return { vencedor: "robo", mensagem: "O robô venceu!" };
  }
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

// 🔥 Lógica de escolha adaptativa do robô
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
