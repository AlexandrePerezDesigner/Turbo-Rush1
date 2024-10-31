// Define o background da página para a cor #082b3e
document.body.style.backgroundImage = "./imgs/pista2.jpg')";
document.body.style.backgroundSize = "cover";
document.body.style.backgroundRepeat = "no-repeat";
document.body.style.backgroundPosition = "center";


const canvas = document.getElementById("jogoCanvas");
const ctx = canvas.getContext("2d");
const reiniciarBtn = document.getElementById("reiniciarBtn");
const inicioTela = document.getElementById("inicioTela");
const acelerarBtn = document.getElementById("acelerarBtn");
const imgPista = new Image();
imgPista.src = "./imgs/pista.jpg"; // Caminho relativo da imagem da pista
const imgTopoTimer = new Image();
imgTopoTimer.src = "imgs/topo-timer.png"; // Caminho relativo para a imagem
const heart1 = new Image();
heart1.src = "./imgs/heart1.png"; // Caminho para o coração intacto
const heart2 = new Image();
heart2.src = "./imgs/heart2.png"; // Caminho para o coração "quebrado"
const imgRastro = new Image();
imgRastro.src = './imgs/rastro1.gif';
const imgRastroElem = document.getElementById("rastro");
const imgHole = new Image();
imgHole.src = "./imgs/hole.png"; // Caminho para a imagem do buraco
// Carrega a imagem do obstáculo danificado
const imgRock2 = new Image();
imgRock2.src = "./imgs/rock2.png";
const somVida = new Audio("./imgs/vida.mp3");
somVida.preload = 'auto';
const somGameOver = new Audio("./imgs/over.mp3");

somGameOver.addEventListener('canplaythrough', () => {
    console.log("Som de Game Over carregado com sucesso.");
}, false);

somGameOver.addEventListener('error', () => {
    console.error("Erro ao carregar o som de Game Over. Verifique o caminho do arquivo.");
}, false);



let fimTela;
let intervaloTempo;
let anguloRock = 0;
let carroLargura = 80;
let carroAltura = 150;
let carroX = canvas.width / 2 - carroLargura / 2;
let carroY = canvas.height - carroAltura - 10;
let obstaculos = [];
let tiros = [];
let intervalo = 0;
let velocidadeObstaculos = 3;  // Definir a velocidade inicial fixa
let pontuacao = 0;
let gameOver = false;
let jogoIniciado = false;
let piscarPontuacao = false;
let ultimoAumentoPontuacao = 0;
let tempo = 0;
let corBoxPontuacao = "rgba(189, 70, 76, 0.8)";
let boxPiscarAtivo = false;  // Controle para verificar se o box está piscando
let timerPiscar = null;  // Controle do timer para piscar
let telaPausa;
let animationFrameId = null;  // ID para controle de `requestAnimationFrame`
let paused = false; // Variável para controlar o estado de pausa
// Objeto para armazenar as teclas pressionadas
let teclasPressionadas = {};
let vidas = 5;
let anguloHole = 0; // Ângulo inicial para o buraco

// Carrega as imagens do carro vermelho para cada vida
const imgCarroVermelho1 = new Image();
imgCarroVermelho1.src = "./imgs/redcar.png";

const imgCarroVermelho2 = new Image();
imgCarroVermelho2.src = "./imgs/redcar2.png";

const imgCarroVermelho3 = new Image();
imgCarroVermelho3.src = "./imgs/redcar3.png";

const imgCarroVermelho4 = new Image();
imgCarroVermelho4.src = "./imgs/redcar4.png";

const imgCarroVermelho5 = new Image();
imgCarroVermelho5.src = "./imgs/redcar5.png";

// Define a imagem atual do carro (começa com a primeira vida)
let imgCarroVermelho = imgCarroVermelho1;

const imgCarroAzul = new Image();
imgCarroAzul.src = "./imgs/bluecar.png";

const imgCarroAmarelo = new Image();
imgCarroAmarelo.src = "./imgs/yellowcar.png";

const imgFire = new Image();
imgFire.src = "./imgs/fire.png";

// Carrega a imagem de explosão
const imgExplosao = new Image();
imgExplosao.src = "./imgs/boom.png";

// Carrega o som do tiro com preload
const somTiro = new Audio("./imgs/laser.mp3");
somTiro.preload = 'auto';

// Carrega o som de explosão
const somExplosao = new Audio("./imgs/explosion.mp3");
somExplosao.preload = 'auto';

// Carrega a trilha sonora do jogo e ajusta o volume
const trilhaSonora = new Audio("./imgs/turbo.mp3");
trilhaSonora.loop = true;
trilhaSonora.volume = 0.2;

// Carrega o som do motor
const somMotor = new Audio("./imgs/motor.mp3");
somMotor.loop = true;

// Carrega a imagem do novo obstáculo (rock)
const imgRock = new Image();
imgRock.src = "./imgs/rock.png";

// Função para desenhar a rotação do obstáculo rock
function desenharRockRotacionando(x, y, largura, altura) {
  ctx.save();
  ctx.translate(x + largura / 2, y + altura / 2);
  ctx.rotate(anguloRock * Math.PI / 180);
  ctx.drawImage(imgRock, -largura / 2, -altura / 2, largura, altura);
  ctx.restore();
  anguloRock += 5;
}



// Função para iniciar o jogo
function iniciarJogo() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    jogoIniciado = true;
    inicioTela.style.display = 'none';
    if (fimTela) fimTela.remove();
    gameOver = false;
    obstaculos = [];
    tiros = [];
    pontuacao = 0;
    vidas = 5;
    velocidadeObstaculos = 3;
    ultimoAumentoPontuacao = 0;
    tempo = 0;
    imgCarroVermelho = imgCarroVermelho1;

    if (intervaloTempo) clearInterval(intervaloTempo);
    trilhaSonora.play().catch(console.error);
    somMotor.play().catch(console.error);

    intervaloTempo = setInterval(atualizarTempo, 1000);
    atualizarJogo();
}

// Função para reiniciar o jogo
function reiniciarJogo() {
    if (fimTela) fimTela.remove();

    // Reinicia o vídeo de fundo ao reiniciar o jogo
    const bgVideo = document.getElementById("bgVideo");
    if (bgVideo) {
        bgVideo.currentTime = 0; // Volta ao início do vídeo
        bgVideo.play(); // Começa a tocar novamente
    }

    iniciarJogo(); // Reinicia o jogo normalmente
    iniciarControleGamepad(); // Reinicia a detecção do gamepad
    reiniciarGamepadStart(); // Permite pressionar START novamente após reiniciar
}

// Função para criar a tela de fim
function criarFimTela() {
    if (fimTela) fimTela.remove();

    // Pausa o vídeo de fundo ao final do jogo
    const bgVideo = document.getElementById("bgVideo");
    if (bgVideo) {
        bgVideo.pause();
    }

    somMotor.pause();
    somMotor.currentTime = 0;

    fimTela = document.createElement('div');
    fimTela.style.position = 'absolute';
    fimTela.style.top = 0;
    fimTela.style.left = 0;
    fimTela.style.width = '100%';
    fimTela.style.height = '100%';
    fimTela.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    fimTela.style.display = 'flex';
    fimTela.style.flexDirection = 'column';
    fimTela.style.justifyContent = 'center';
    fimTela.style.alignItems = 'center';
    fimTela.style.color = 'white';
    fimTela.style.fontFamily = 'Arial';
    fimTela.style.fontSize = '30px';
    fimTela.style.zIndex = 10;

    const pontuacaoFinal = document.createElement('div');
    pontuacaoFinal.textContent = `Sua pontuação: ${pontuacao}`;
    pontuacaoFinal.style.marginBottom = '20px'; // Espaçamento entre pontuação e o botão
    fimTela.appendChild(pontuacaoFinal);

    // Cria o botão de reinício como uma imagem
    const reiniciarButtonImg = document.createElement('img');
    reiniciarButtonImg.src = "./imgs/reiniciar.png"; // Caminho para a imagem padrão
    reiniciarButtonImg.alt = "Reiniciar";
    reiniciarButtonImg.style.width = "242px";  // Ajuste a largura
    reiniciarButtonImg.style.height = "58px"; // Ajuste a altura proporcional
    reiniciarButtonImg.style.cursor = "pointer";
    reiniciarButtonImg.style.marginTop = '20px';

    // Adiciona eventos de hover para trocar a imagem ao passar o mouse
    reiniciarButtonImg.addEventListener('mouseover', () => {
        reiniciarButtonImg.src = "./imgs/reiniciar2.png"; // Caminho para a imagem de hover
    });
    reiniciarButtonImg.addEventListener('mouseout', () => {
        reiniciarButtonImg.src = "./imgs/reiniciar.png"; // Caminho para a imagem padrão
    });

    // Adiciona evento de clique à imagem para reiniciar o jogo
    reiniciarButtonImg.addEventListener('click', reiniciarJogo);

    // Adiciona evento para a tecla ENTER para reiniciar o jogo
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            reiniciarJogo();
        }
    });

    fimTela.appendChild(reiniciarButtonImg);

    document.body.appendChild(fimTela);
}




// Função para atualizar o tempo
function atualizarTempo() {
    if (!gameOver) {
        tempo++; // Apenas incrementa o tempo, sem alterar a pontuação
    }
}

// Detecta o clique no botão "ACELERAR" e inicia o jogo
acelerarBtn.addEventListener("click", iniciarJogo);

// Detecta a tecla ENTER para iniciar o jogo
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !jogoIniciado) {
    iniciarJogo();
  }
});

// Função para detectar teclas pressionadas
document.addEventListener("keydown", function(event) {
  teclasPressionadas[event.key] = true;
  if (event.key === " ") {  // Espaço para atirar
    atirar();
  }
});

// Função para detectar quando as teclas são liberadas
document.addEventListener("keyup", function(event) {
  teclasPressionadas[event.key] = false;
});

// Função para mover o carro
function moverCarro() {
  // Se seta para a esquerda for pressionada
  if (teclasPressionadas["ArrowLeft"] && carroX > 0) {
    carroX -= 5;
  }
  // Se seta para a direita for pressionada
  if (teclasPressionadas["ArrowRight"] && carroX < canvas.width - carroLargura) {
    carroX += 5;
  }
  // Se seta para cima for pressionada
  if (teclasPressionadas["ArrowUp"] && carroY > 0) {
    carroY -= 5;
  }
  // Se seta para baixo for pressionada
  if (teclasPressionadas["ArrowDown"] && carroY < canvas.height - carroAltura) {
    carroY += 5;
  }
}

// Função para criar e disparar o poder
function atirar() {
    tiros.push({
        x: carroX + carroLargura / 2 - 5, // Ajuste para centralizar o tiro mais fino
        y: carroY - 20,
        largura: 5, // Reduz a largura do tiro para metade
        altura: 40 // Mantém a altura original
    });

    somTiro.currentTime = 0;
    somTiro.play().catch(error => {
        console.log("Erro ao tocar o som:", error);
    });
}


// Função para mover os tiros
function moverTiros() {
  for (let i = 0; i < tiros.length; i++) {
    tiros[i].y -= 10;
    ctx.drawImage(imgFire, tiros[i].x, tiros[i].y, tiros[i].largura, tiros[i].altura);

    if (tiros[i].y < 0) {
      tiros.splice(i, 1);
      i--;
    }
  }
}

function verificarColisaoTiro() {
    for (let i = 0; i < tiros.length; i++) {
        for (let j = 0; j < obstaculos.length; j++) {
            if (obstaculos[j].tipo === 'hole') continue; // Ignora buracos para tiros

            if (
                tiros[i].x < obstaculos[j].x + obstaculos[j].largura &&
                tiros[i].x + tiros[i].largura > obstaculos[j].x &&
                tiros[i].y < obstaculos[j].y + obstaculos[j].altura &&
                tiros[i].altura + tiros[i].y > obstaculos[j].y
            ) {
                console.log("Tiro atingiu um obstáculo:", obstaculos[j].tipo);

                if (obstaculos[j].tipo === 'rock') {
                    obstaculos[j].hits = (obstaculos[j].hits || 0) + 1;
                    console.log("Obstáculo rock atingido, hits:", obstaculos[j].hits);

                    if (obstaculos[j].hits === 2) {
                        obstaculos.splice(j, 1);
                        incrementarPontuacao();
                    }
                } else {
                    obstaculos.splice(j, 1);
                    incrementarPontuacao();
                }
                tiros.splice(i, 1); // Remove o tiro
                i--;
                break;
            }
        }
    }
}


function incrementarPontuacao() {
    pontuacao += 1;
    console.log(`Pontuação incrementada para ${pontuacao}`);
}





// Função para iniciar o efeito de piscar no box de pontuação
function iniciarPiscarBoxPontuacao() {
  boxPiscarAtivo = true;
  corBoxPontuacao = "#19f4f3";
  if (timerPiscar) clearTimeout(timerPiscar);
  timerPiscar = setTimeout(() => {
    boxPiscarAtivo = false;
    corBoxPontuacao = "rgba(189, 70, 76, 0.8)";
  }, 2000);
}

function criarObstaculo() {
    let larguraObstaculo;
    let alturaObstaculo;
    let tipoObstaculo;
    let posicaoX = Math.floor(Math.random() * (canvas.width - 160));

    const randomTipo = Math.random();
    if (randomTipo > 0.75) {
        larguraObstaculo = carroLargura;
        alturaObstaculo = carroAltura;
        tipoObstaculo = 'azul';
    } else if (randomTipo > 0.5) {
        larguraObstaculo = carroLargura;
        alturaObstaculo = carroAltura;
        tipoObstaculo = 'amarelo';
    } else if (randomTipo > 0.25) {
        larguraObstaculo = 160;
        alturaObstaculo = 150;
        tipoObstaculo = 'rock';
    } else {
        larguraObstaculo = 200;
        alturaObstaculo = 200;
        tipoObstaculo = 'hole';
    }

    obstaculos.push({
        x: posicaoX,
        y: -alturaObstaculo,
        largura: larguraObstaculo,
        altura: alturaObstaculo,
        tipo: tipoObstaculo,
        hits: 0  // Adiciona contador de tiros para obstáculo do tipo `rock`
    });
}


function criarObstaculo() {
    let larguraObstaculo;
    let alturaObstaculo;
    let tipoObstaculo;
    let posicaoX = Math.floor(Math.random() * (canvas.width - 160));

    const randomTipo = Math.random();
    if (randomTipo > 0.75) { // Probabilidade de aparecer o carro azul
        larguraObstaculo = carroLargura;
        alturaObstaculo = carroAltura;
        tipoObstaculo = 'azul';
    } else if (randomTipo > 0.5) { // Probabilidade do carro amarelo
        larguraObstaculo = carroLargura;
        alturaObstaculo = carroAltura;
        tipoObstaculo = 'amarelo';
    } else if (randomTipo > 0.25) { // Probabilidade do rock
        larguraObstaculo = 160;
        alturaObstaculo = 150;
        tipoObstaculo = 'rock';
    } else { // Probabilidade do hole
        larguraObstaculo = 200; // Defina o tamanho do buraco
        alturaObstaculo = 200;
        tipoObstaculo = 'hole';
    }

    obstaculos.push({
        x: posicaoX,
        y: -alturaObstaculo,
        largura: larguraObstaculo,
        altura: alturaObstaculo,
        tipo: tipoObstaculo
    });
}


// Função para tratar colisão e mudar imagem do carro
function tratarColisaoCarro() {
    vidas--; // Reduz uma vida a cada colisão

    // Atualiza a imagem do carro de acordo com as vidas restantes
    if (vidas === 4) {
        imgCarroVermelho = imgCarroVermelho2;
    } else if (vidas === 3) {
        imgCarroVermelho = imgCarroVermelho3;
    } else if (vidas === 2) {
        imgCarroVermelho = imgCarroVermelho4;
    } else if (vidas === 1) {
        imgCarroVermelho = imgCarroVermelho5;
    }

    // Configura o volume para 60% nas primeiras quatro explosões
    somExplosao.volume = 0.6; // Define o volume em 60%
    somExplosao.currentTime = 0;
    somExplosao.play().catch(error => {
        console.log("Erro ao tocar o som da explosão:", error);
    });

    // Se as vidas acabarem, o jogo acaba e ocorre uma explosão em volume normal
    if (vidas <= 0) {
        gameOver = true;
        somExplosao.volume = 1.0; // Define o volume para 100% na quinta explosão
        somExplosao.currentTime = 0;
        somExplosao.play().catch(error => {
            console.log("Erro ao tocar o som da explosão:", error);
        });

        // Toca o som de Game Over
        somGameOver.currentTime = 0;
        somGameOver.play().then(() => {
            console.log("Som de Game Over reproduzido.");
        }).catch(error => {
            console.error("Erro ao tocar o som de Game Over:", error);
        });

        // Desenha a explosão sobre o carro vermelho
        ctx.drawImage(imgExplosao, carroX, carroY - 50, 150, 150);

        criarFimTela(); // Chama a tela de game over
        clearInterval(intervaloTempo); // Pausa o tempo
    }
}



// Função para mover obstáculos e tratar colisões
function moverObstaculos() {
    for (let i = 0; i < obstaculos.length; i++) {
        const obstaculo = obstaculos[i];
        obstaculo.y += velocidadeObstaculos;

        // Condicional para o tipo de obstáculo
        if (obstaculo.tipo === 'azul') {
            ctx.drawImage(imgCarroAzul, obstaculo.x, obstaculo.y, obstaculo.largura, obstaculo.altura);
        } else if (obstaculo.tipo === 'amarelo') {
            ctx.drawImage(imgCarroAmarelo, obstaculo.x, obstaculo.y, obstaculo.largura, obstaculo.altura);
        } else if (obstaculo.tipo === 'rock') {
            const rockImage = obstaculo.hits >= 1 ? imgRock2 : imgRock;
            ctx.drawImage(rockImage, obstaculo.x, obstaculo.y, obstaculo.largura, obstaculo.altura);
        } else if (obstaculo.tipo === 'hole') {
            ctx.save();
            ctx.translate(obstaculo.x + obstaculo.largura / 2, obstaculo.y + obstaculo.altura / 2);
            ctx.rotate(anguloHole * Math.PI / 180);
            ctx.drawImage(imgHole, -obstaculo.largura / 2, -obstaculo.altura / 2, obstaculo.largura, obstaculo.altura);
            ctx.restore();
        }

        // Colisão com o carro
        if (
            carroY < obstaculo.y + obstaculo.altura &&
            carroY + carroAltura > obstaculo.y &&
            carroX < obstaculo.x + obstaculo.largura &&
            carroX + carroLargura > obstaculo.x
        ) {
            if (obstaculo.tipo === 'hole') {
                // Trate a colisão com o buraco, mas não remova o obstáculo
                tratarColisaoBuraco();
            } else {
                tratarColisaoCarro();
                obstaculos.splice(i, 1); // Remove apenas outros tipos de obstáculos
                i--;
                continue;
            }
        }

        // Remove obstáculos que saíram da tela, exceto `hole`
        if (obstaculo.y > canvas.height && obstaculo.tipo !== 'hole') {
            obstaculos.splice(i, 1);
            i--;
        }
    }
    anguloHole += 1;
}






// Carrega os sons de colisão e Game Over
const somFalling = new Audio("./imgs/falling.mp3");

function tratarColisaoBuraco() {
    vidas -= 2; // Perde 2 vidas ao colidir com o buraco

    // Atualiza a imagem do carro de acordo com as vidas restantes
    if (vidas === 4) {
        imgCarroVermelho = imgCarroVermelho2;
    } else if (vidas === 3) {
        imgCarroVermelho = imgCarroVermelho3;
    } else if (vidas === 2) {
        imgCarroVermelho = imgCarroVermelho4;
    } else if (vidas === 1) {
        imgCarroVermelho = imgCarroVermelho5;
    }

    if (vidas <= 0) {
        gameOver = true;

        // Toca o som de Game Over ao atingir o "Game Over"
        somGameOver.currentTime = 0;
        somGameOver.play().then(() => {
            console.log("Som de Game Over reproduzido.");
        }).catch(error => {
            console.error("Erro ao tocar o som de Game Over:", error);
        });

        criarFimTela(); // Exibe a tela de fim de jogo
    } else {
        // Toca o som de colisão com o buraco
        somFalling.currentTime = 0;
        somFalling.play().then(() => {
            console.log("Som de colisão com o buraco reproduzido.");
        }).catch(error => {
            console.error("Erro ao tocar o som de colisão com o buraco:", error);
        });

        // Reposiciona o carro no início se o jogo não terminou
        carroX = canvas.width / 2 - carroLargura / 2;
        carroY = canvas.height - carroAltura - 10;
    }
}




// Função para desenhar as faixas fixas
/*function desenharFaixasFixas() {
  ctx.strokeStyle = "#09f0eb";  // Cor das listras
  ctx.lineWidth = 5;
  ctx.setLineDash([20, 20]);

  // Primeira faixa
  ctx.beginPath();
  ctx.moveTo(canvas.width / 4, 0);
  ctx.lineTo(canvas.width / 4, canvas.height);
  ctx.stroke();

  // Segunda faixa
  ctx.beginPath();
  ctx.moveTo((canvas.width / 4) * 3, 0);
  ctx.lineTo((canvas.width / 4) * 3, canvas.height);
  ctx.stroke();
}*/

// Carrega as imagens do botão de pausa e mute
const imgPause = new Image();
imgPause.src = "./imgs/pause.png";
const imgPauseHover = new Image();
imgPauseHover.src = "./imgs/pause2.png";

const imgMute = new Image();
imgMute.src = "./imgs/mute.png";
const imgMuteHover = new Image();
imgMuteHover.src = "./imgs/mute2.png";

// Variáveis para controlar o estado do hover e mute
let isHoveringPause = false;
let isHoveringMute = false;
let isMuted = false;

// Função para desenhar a pontuação, o tempo, o botão de pausa e o botão de mute
function desenharPontuacaoETempo() {
    const larguraRetangulo = 845;
    const alturaRetangulo = 140;
    const xRetangulo = (canvas.width - larguraRetangulo) / 2;
    const yRetangulo = 80;

    ctx.globalAlpha = 0.9;
    ctx.drawImage(imgTopoTimer, xRetangulo, yRetangulo, larguraRetangulo, alturaRetangulo);

    ctx.font = "bold 25px 'Arial', sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    const xPontuacao = canvas.width / 3 - 100;
    ctx.fillText("PONTUAÇÃO: " + pontuacao, xPontuacao, yRetangulo + 50);

    const xTempo = canvas.width / 2 + 100;
    ctx.fillText("TEMPO: " + tempo + "s", xTempo, yRetangulo + 50);

    const espacoCoração = 30;
    const tamanhoCoração = 25;
    let posXCoração = xTempo + 100;
    for (let i = 0; i < 5; i++) {
        ctx.drawImage(i < vidas ? heart1 : heart2, posXCoração, yRetangulo + 25, tamanhoCoração, tamanhoCoração);
        posXCoração += espacoCoração;
    }

    // Desenhar o botão de pausa
    const larguraPause = 26;
    const alturaPause = 31;
    const xPause = xTempo - larguraPause / 2 - 50;
    const yPause = yRetangulo + 70;
    ctx.drawImage(isHoveringPause ? imgPauseHover : imgPause, xPause, yPause, larguraPause, alturaPause);
    pauseButton = { x: xPause, y: yPause, width: larguraPause, height: alturaPause };

    // Desenhar o botão de mute ao lado direito do botão de pausa
    const larguraMute = 26;
    const alturaMute = 31;
    const xMute = xPause + larguraPause + 10; // Espaço de 10px à direita do botão de pausa
    const yMute = yPause;
    ctx.drawImage(isMuted || isHoveringMute ? imgMuteHover : imgMute, xMute, yMute, larguraMute, alturaMute);
    muteButton = { x: xMute, y: yMute, width: larguraMute, height: alturaMute };
}

// Alterna o estado de "mute" para a música
function toggleMute() {
    isMuted = !isMuted;
    trilhaSonora.muted = isMuted;
    desenharPontuacaoETempo(); // Redesenha para atualizar o estado visual do botão
}

// Adiciona evento de clique para os botões de pausa e mute
canvas.addEventListener("click", function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Verifica se o clique ocorreu na área do botão de pausa
    if (x >= pauseButton.x && x <= pauseButton.x + pauseButton.width &&
        y >= pauseButton.y && y <= pauseButton.y + pauseButton.height) {
        togglePause();
    }

    // Verifica se o clique ocorreu na área do botão de mute
    if (x >= muteButton.x && x <= muteButton.x + muteButton.width &&
        y >= muteButton.y && y <= muteButton.y + muteButton.height) {
        toggleMute();
    }
});

// Adiciona evento para o efeito de hover e cursor
canvas.addEventListener("mousemove", function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Verifica se o mouse está sobre o botão de pausa
    isHoveringPause = x >= pauseButton.x && x <= pauseButton.x + pauseButton.width &&
                      y >= pauseButton.y && y <= pauseButton.y + pauseButton.height;

    // Verifica se o mouse está sobre o botão de mute
    isHoveringMute = x >= muteButton.x && x <= muteButton.x + muteButton.width &&
                     y >= muteButton.y && y <= muteButton.y + muteButton.height;

    // Muda o cursor e redesenha o canvas para refletir o estado de hover
    canvas.style.cursor = (isHoveringPause || isHoveringMute) ? "pointer" : "default";
    desenharPontuacaoETempo();
});

// Adiciona evento para alternar o mute ao pressionar a tecla "M"
document.addEventListener("keydown", function(event) {
    if (event.key.toLowerCase() === 'm') {
        toggleMute();
    }
});






//CONTROLE XBOX

// Variável para armazenar o estado do gamepad
let gamepadIndex = null;
let gamepadStartPressed = false; // Variável para detectar o botão START

// Função para detectar o gamepad conectado
window.addEventListener("gamepadconnected", function(event) {
    console.log("Gamepad conectado:", event.gamepad);
    gamepadIndex = event.gamepad.index;
});

// Função para detectar o gamepad desconectado
window.addEventListener("gamepaddisconnected", function(event) {
    console.log("Gamepad desconectado:", event.gamepad);
    gamepadIndex = null;
});

// Função para verificar o estado do gamepad e executar ações
function updateGamepad() {
    if (gamepadIndex !== null) {
        const gamepad = navigator.getGamepads()[gamepadIndex];
        
        if (gamepad) {
            // Movimenta o carro com o direcional digital D-pad
            if (gamepad.buttons[14].pressed && carroX > 0) { // D-pad Esquerda
                carroX -= 5;
            }
            if (gamepad.buttons[15].pressed && carroX < canvas.width - carroLargura) { // D-pad Direita
                carroX += 5;
            }
            if (gamepad.buttons[12].pressed && carroY > 0) { // D-pad Cima
                carroY -= 5;
            }
            if (gamepad.buttons[13].pressed && carroY < canvas.height - carroAltura) { // D-pad Baixo
                carroY += 5;
            }

            // Botão A do controle de Xbox (índice 0) para atirar
            if (gamepad.buttons[0].pressed) {
                atirar();
            }

            // Detecta o botão START (índice 9) para iniciar o jogo
            if (gamepad.buttons[9].pressed && !gamepadStartPressed) {
                gamepadStartPressed = true; // Marca o botão como pressionado para evitar múltiplos cliques
                iniciarJogo(); // Inicia o jogo quando o botão START for pressionado
                iniciarControleGamepad(); // Começa a detecção de controles após iniciar o jogo
            }
        }
    }

    if (!gameOver) {
        requestAnimationFrame(updateGamepad); // Continua verificando o gamepad
    }
}

// Função para iniciar o controle do gamepad
function iniciarControleGamepad() {
    requestAnimationFrame(updateGamepad); // Começa a atualizar o estado do gamepad
}

// Função para reiniciar o botão START após o jogo ser iniciado
function reiniciarGamepadStart() {
    gamepadStartPressed = false; // Reseta o estado do botão START
}

// Detecta o clique no botão "ACELERAR" e inicia o jogo
acelerarBtn.addEventListener("click", function() {
    iniciarJogo(); // Só inicia o jogo quando o botão for clicado
    iniciarControleGamepad(); // Inicia a detecção do gamepad após o início do jogo
    reiniciarGamepadStart(); // Permite pressionar START novamente após reiniciar
});

// Detecta a tecla ENTER para iniciar o jogo
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && !jogoIniciado) {
        iniciarJogo();
        iniciarControleGamepad(); // Inicia o controle do gamepad quando o jogo for iniciado
        reiniciarGamepadStart(); // Permite pressionar START novamente após reiniciar
    }
});


// Variável para controlar o intervalo de tiro
let podeAtirar = true;
const intervaloTiro = 300; // Intervalo de 300ms entre os disparos

// Função para criar e disparar o poder
function atirar() {
    if (!podeAtirar) return;

    tiros.push({
        x: carroX + carroLargura / 2 - 5, // Ajuste para centralizar o tiro mais fino
        y: carroY - 20,
        largura: 5, // Reduz a largura do tiro para metade
        altura: 40 // Mantém a altura original
    });

    somTiro.currentTime = 0;
    somTiro.play().catch(error => {
        console.log("Erro ao tocar o som:", error);
    });

    podeAtirar = false;
    setTimeout(() => (podeAtirar = true), intervaloTiro);
}

function verificarAumentoVelocidade() {
    if (pontuacao > 0 && pontuacao % 5 === 0 && pontuacao !== ultimoAumentoPontuacao) {
        velocidadeObstaculos *= 1.3;
        ultimoAumentoPontuacao = pontuacao;
        console.log("Nova velocidade dos obstáculos:", velocidadeObstaculos);
    }
}


// Função para mostrar a tela de pausa
function mostrarTelaPausa() {
    telaPausa = document.createElement('div');
    telaPausa.style.position = 'absolute';
    telaPausa.style.top = 0;
    telaPausa.style.left = 0;
    telaPausa.style.width = '100%';
    telaPausa.style.height = '100%';
    telaPausa.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Fundo preto com 80% de opacidade
    telaPausa.style.display = 'flex';
    telaPausa.style.justifyContent = 'center';
    telaPausa.style.alignItems = 'center';
    telaPausa.style.zIndex = 20;

    // Cria o botão "CONTINUE" como uma imagem
    const continueButtonImg = document.createElement('img');
    continueButtonImg.src = "./imgs/continue.png"; // Caminho para sua imagem
    continueButtonImg.alt = "Continue";
    continueButtonImg.style.width = "182px";  // Ajuste a largura da imagem
    continueButtonImg.style.cursor = "pointer";

    // Adiciona eventos de hover para trocar a imagem ao passar o mouse
    continueButtonImg.addEventListener('mouseover', () => {
        continueButtonImg.src = "./imgs/continue2.png"; // Caminho para a imagem de hover
    });
    continueButtonImg.addEventListener('mouseout', () => {
        continueButtonImg.src = "./imgs/continue.png"; // Caminho para a imagem padrão
    });

    // Adiciona evento de clique à imagem para despausar o jogo
    continueButtonImg.addEventListener('click', togglePause);

    // Adiciona a imagem do botão à tela de pausa
    telaPausa.appendChild(continueButtonImg);

    // Adiciona a tela de pausa ao corpo do documento
    document.body.appendChild(telaPausa);
}


// Função para ocultar a tela de pausa
function ocultarTelaPausa() {
    if (telaPausa) {
        telaPausa.remove();
        telaPausa = null;
    }
}


// Função para alternar entre pausa e despausa
function togglePause() {
    paused = !paused; // Alterna entre pausado e não pausado

    const bgVideo = document.getElementById("bgVideo"); // Identifica o elemento de vídeo

    if (paused) {
        mostrarTelaPausa(); // Mostra a tela de pausa

        // Pausa o jogo, o vídeo, o tempo e desativa o tiro
        if (bgVideo) bgVideo.pause(); // Pausa o vídeo
        cancelAnimationFrame(animationFrameId); // Para a atualização do jogo
        clearInterval(intervaloTempo); // Pausa o incremento do tempo
    } else {
        ocultarTelaPausa(); // Oculta a tela de pausa
        if (bgVideo) bgVideo.play(); // Retoma o vídeo
        intervaloTempo = setInterval(atualizarTempo, 1000); // Reinicia o incremento do tempo
        atualizarJogo(); // Reinicia o loop de atualização do jogo
    }
}

// Modifique a função de atualização do jogo para respeitar o estado de pausa
function atualizarJogo() {
    if (gameOver) return;

    // Log para depuração
    console.log("Atualizando Jogo - Estado: ", { 
        pontuacao, 
        obstaculos: obstaculos.map(o => ({ y: o.y, tipo: o.tipo })),
        tempo, 
        vidas, 
        paused, 
        jogoIniciado 
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moverCarro();

    ctx.drawImage(imgRastro, carroX + carroLargura / 2 - 40, carroY + carroAltura - 10, 80, 72);
    ctx.drawImage(imgCarroVermelho, carroX, carroY, carroLargura, carroAltura);

    moverObstaculos();
    moverTiros();
    verificarColisaoTiro();

    criarPowerUp(); // Gera o power-up
    renderizarPowerUp(); // Move e desenha o power-up no canvas
    verificarColisaoPowerUp(); // Verifica colisão do carro com o power-up

    desenharPontuacaoETempo();
    verificarAumentoVelocidade();

    intervalo++;
    if (intervalo % 90 === 0) {
        criarObstaculo();
    }

    animationFrameId = requestAnimationFrame(atualizarJogo);
}



// Função de disparo com verificação de início de jogo e pausa
function atirar() {
    if (paused || !podeAtirar || !jogoIniciado) return; // Evita disparo se o jogo estiver pausado ou não iniciado

    tiros.push({
        x: carroX + carroLargura / 2 - 5, // Ajuste para centralizar o tiro mais fino
        y: carroY - 20,
        largura: 5, // Reduz a largura do tiro para metade
        altura: 40 // Mantém a altura original
    });

    somTiro.currentTime = 0;
    somTiro.play().catch(error => {
        console.log("Erro ao tocar o som:", error);
    });

    podeAtirar = false;
    setTimeout(() => (podeAtirar = true), intervaloTiro);
}

// Adiciona um event listener para a tecla "P" e o espaço
document.addEventListener("keydown", function (event) {
    if (event.key.toUpperCase() === "P") {
        togglePause(); // Alterna o estado de pausa ao pressionar "P"
    } else if (event.key === " " && !paused && jogoIniciado) { // Dispara apenas se não estiver pausado e o jogo estiver iniciado
        atirar();
    }
});

const introVideo = document.getElementById("introVideo");

// Pausa o vídeo e exibe o primeiro frame como fundo
introVideo.pause();
introVideo.currentTime = 0;  // Define o vídeo para o início

// Função para iniciar o jogo após reproduzir o vídeo de introdução
function iniciarIntroVideo() {
    introVideo.style.display = "block"; // Mostra o vídeo
    introVideo.play();  // Reproduz o vídeo
    setTimeout(() => {
        introVideo.style.display = "none"; // Oculta o vídeo após 1 segundo
        iniciarJogo();  // Inicia o jogo
    }, 1000); // Define o tempo de reprodução em 1 segundo
}

// Altera o evento de clique e o keydown para iniciar o vídeo antes do jogo
acelerarBtn.addEventListener("click", iniciarIntroVideo);
document.addEventListener("keydown", function(event) {
    if (event.key === "1" && !jogoIniciado) {
        iniciarIntroVideo();
    }
});



function aplicarSaturacaoNoCanvas() {
    ctx.fillStyle = '#6ebbc7';
    ctx.globalAlpha = 4; // Define a intensidade da cor
    ctx.globalCompositeOperation = 'saturation'; // Define o modo de mesclagem para saturação
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Desenha a camada sobre o canvas
    ctx.globalAlpha = 1.0; // Restaura a opacidade
    ctx.globalCompositeOperation = 'source-over'; // Restaura o modo de mesclagem padrão
}

// Chame essa função após desenhar no canvas, dentro do loop principal do jogo:
aplicarSaturacaoNoCanvas();

// Define o objeto `powerUp` com posição inicial, status inativo e velocidade
let powerUp = { x: 0, y: 0, active: false, speed: 3 };

// Função para criar um power-up aleatoriamente
function criarPowerUp() {
    if (!powerUp.active && Math.random() < 0.01) { // 1% de chance de aparecer
        powerUp.x = Math.floor(Math.random() * (canvas.width - 30)); // Posição horizontal aleatória
        powerUp.y = -30; // Começa fora da tela, acima do topo
        powerUp.active = true;
    }
}

// Função para renderizar e mover o power-up
function renderizarPowerUp() {
    if (powerUp.active) {
        powerUp.y += powerUp.speed; // Atualiza a posição para fazer o power-up descer
        ctx.drawImage(heart1, powerUp.x, powerUp.y, 30, 30); // Desenha o coração

        // Se o power-up sair da tela, desativa-o para permitir novos
        if (powerUp.y > canvas.height) {
            powerUp.active = false;
        }
    }
}

// Função para verificar colisão do carro com o power-up
function verificarColisaoPowerUp() {
    if (powerUp.active &&
        carroX < powerUp.x + 30 &&
        carroX + carroLargura > powerUp.x &&
        carroY < powerUp.y + 30 &&
        carroY + carroAltura > powerUp.y) {
        
        console.log("Power-up coletado! Vida restaurada.");

        // Aumenta uma vida (até o máximo de 5)
        if (vidas < 5) {
            vidas++;
            atualizarImagemCarro(); // Atualiza a imagem do carro
            
            // Toca o som de ganho de vida
            somVida.currentTime = 0;
            somVida.play().catch(error => {
                console.log("Erro ao tocar o som de vida:", error);
            });
        }

        // Desativa o power-up após a coleta
        powerUp.active = false;
    }
}


// Função para atualizar a imagem do carro com base nas vidas restantes
function atualizarImagemCarro() {
    if (vidas === 5) {
        imgCarroVermelho = imgCarroVermelho1;
    } else if (vidas === 4) {
        imgCarroVermelho = imgCarroVermelho2;
    } else if (vidas === 3) {
        imgCarroVermelho = imgCarroVermelho3;
    } else if (vidas === 2) {
        imgCarroVermelho = imgCarroVermelho4;
    } else if (vidas === 1) {
        imgCarroVermelho = imgCarroVermelho5;
    }
}

// Inclua `criarPowerUp`, `renderizarPowerUp`, e `verificarColisaoPowerUp` no loop principal `atualizarJogo`
function atualizarJogo() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moverCarro();

    ctx.drawImage(imgRastro, carroX + carroLargura / 2 - 40, carroY + carroAltura - 10, 80, 72);
    ctx.drawImage(imgCarroVermelho, carroX, carroY, carroLargura, carroAltura);

    moverObstaculos();
    moverTiros();
    verificarColisaoTiro();

    criarPowerUp(); // Gera o power-up
    renderizarPowerUp(); // Move e desenha o power-up no canvas
    verificarColisaoPowerUp(); // Verifica colisão do carro com o power-up

    desenharPontuacaoETempo();
    verificarAumentoVelocidade();

    intervalo++;
    if (intervalo % 90 === 0) {
        criarObstaculo();
    }

    animationFrameId = requestAnimationFrame(atualizarJogo);
}

function incrementarPontuacao() {
    pontuacao += 1;
    console.log(`Pontuação incrementada para ${pontuacao} na função:`, incrementarPontuacao.caller.name);
}

