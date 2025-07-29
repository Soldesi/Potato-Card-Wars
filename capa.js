// Botões
const comoJogarBtn = document.getElementById("comoJogarBtn");
const fecharComoJogarBtn = document.getElementById("fecharComoJogar");
const jogarAgoraBtn = document.getElementById("jogarAgoraBtn");

// Painéis
const comoJogarPainel = document.getElementById("comoJogarPainel");
const painelTransicao = document.getElementById("painelTransicao");

// Mostrar painel "Como Jogar"
comoJogarBtn.addEventListener("click", () => {
  comoJogarPainel.classList.remove("hidden");
});

// Fechar painel "Como Jogar"
fecharComoJogarBtn.addEventListener("click", () => {
  comoJogarPainel.classList.add("hidden");
});

// Mostrar painel de transição e redirecionar
jogarAgoraBtn.addEventListener("click", () => {
  painelTransicao.classList.remove("hidden");

  setTimeout(() => {
    window.location.href = "jogo.html";
  }, 900); // tempo da animação antes de ir para a próxima página
});
const modoUnoBtn = document.getElementById("modoUnoBtn");

modoUnoBtn.addEventListener("click", () => {
  painelTransicao.classList.remove("hidden");
  setTimeout(() => {
    window.location.href = "uno.html";
  }, 900);
});
