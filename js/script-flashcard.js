// js/script-flashcard.js

// --- 1. VARIÁVEIS DE ESTADO (A memória do jogo) ---
let flashcardsData = [];
let currentCardIndex = 0;
let isFlipped = false;

// Objeto para guardar as estatísticas da sessão
let sessionStats = {
    again: 0,
    hard: 0,
    good: 0,
    easy: 0
};

// --- 2. ELEMENTOS DO DOM (Referências para o HTML) ---
const elements = {
    // Cabeçalho e Progresso
    deckTitle: document.getElementById('deck-title'),
    counter: document.getElementById('counter'),
    progressFill: document.getElementById('progress-fill'),
    
    // Área do Card
    gameArea: document.getElementById('game-area'),
    flashcard: document.getElementById('flashcard'),
    cardFront: document.getElementById('card-front-content'),
    cardBack: document.getElementById('card-back-content'),
    
    // Botões
    buttonsContainer: document.getElementById('buttons-container'),
    
    // Estatísticas (Placar)
    statAgain: document.getElementById('stat-again'),
    statHard: document.getElementById('stat-hard'),
    statGood: document.getElementById('stat-good'),
    statEasy: document.getElementById('stat-easy'),
    
    // Tela Final
    completionScreen: document.getElementById('completion-screen')
};

// --- 3. INICIALIZAÇÃO (Roda assim que a página abre) ---
window.onload = async function() {
    try {
        // Pega o tema da URL (ex: ?tema=toracica)
        const params = new URLSearchParams(window.location.search);
        const tema = params.get('tema');
        
        let arquivoJson = '';
        let nomeDisplay = '';

        // Define qual arquivo carregar
        if (tema === 'toracica') {
            arquivoJson = 'data/toracica.json';
            nomeDisplay = 'Cirurgia Torácica';
        } else if (tema === 'hepatico') {
            arquivoJson = 'data/hepatico.json';
            nomeDisplay = 'Transplante Hepático';
        } else {
            // Se abrir sem tema, mostra aviso
            elements.deckTitle.innerText = "Nenhum baralho selecionado.";
            elements.cardFront.innerText = "Erro: Tema não definido na URL.";
            return;
        }

        // Atualiza o título da página
        elements.deckTitle.innerText = "Baralho: " + nomeDisplay;

        // Busca os dados (JSON)
        const response = await fetch(arquivoJson);
        if (!response.ok) throw new Error('Arquivo JSON não encontrado');
        
        flashcardsData = await response.json();
        
        // Inicia o jogo se houver cartas
        if (flashcardsData.length > 0) {
            shuffleCards();     // Embaralha
            loadCard();         // Carrega a primeira
            updateProgress();   // Atualiza barra
            updateStatsUI();    // Zera o placar visual
        } else {
            elements.cardFront.innerText = "Este baralho está vazio.";
        }

    } catch (erro) {
        console.error(erro);
        elements.deckTitle.innerText = "Erro ao carregar";
        elements.cardFront.innerText = "Verifique o console (F12) e se os arquivos JSON estão na pasta data/.";
    }
};

// --- 4. FUNÇÕES DE LÓGICA DO JOGO ---

// Algoritmo Fisher-Yates para embaralhar
function shuffleCards() {
    for (let i = flashcardsData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flashcardsData[i], flashcardsData[j]] = [flashcardsData[j], flashcardsData[i]];
    }
}

// Re-embaralhar manual (botão 🔀)
function shuffleCardsManual() {
    if(confirm("Deseja re-embaralhar e reiniciar a sequência?")) {
        shuffleCards();
        currentCardIndex = 0; // Volta para a primeira carta
        loadCard();
        updateProgress();
    }
}

// Carregar a carta atual na tela
function loadCard() {
    // Verifica se acabaram as cartas
    if (currentCardIndex >= flashcardsData.length) {
        finishSession();
        return;
    }

    const card = flashcardsData[currentCardIndex];
    
    // Preenche texto da frente e verso
    elements.cardFront.innerText = card.front;
    elements.cardBack.innerText = card.back;
    
    // Reseta o estado visual (desvirado)
    isFlipped = false;
    elements.flashcard.classList.remove('flipped');
    
    // Desabilita os botões de resposta (para obrigar a pensar)
    elements.buttonsContainer.classList.add('disabled');
}

// Virar a carta (Flip)
function flipCard() {
    isFlipped = !isFlipped;
    elements.flashcard.classList.toggle('flipped');
    
    // Se virou para ver a resposta, libera os botões
    if (isFlipped) {
        elements.buttonsContainer.classList.remove('disabled');
    }
}

// Responder a carta (Botões de dificuldade)
function answerCard(difficulty) {
    // Se não estiver virada, impede resposta (exceto se for "pular/next")
    if (difficulty !== 'skip' && !isFlipped) return;

    // Se for uma resposta válida (again, hard, good, easy), atualiza estatística
    if (difficulty !== 'skip' && sessionStats.hasOwnProperty(difficulty)) {
        sessionStats[difficulty]++;
        updateStatsUI(); // Atualiza o placar na tela
    }
    
    // Avança para a próxima carta
    currentCardIndex++;
    updateProgress();
    
    // Pequeno delay para a transição ficar suave
    setTimeout(() => {
        loadCard();
    }, 200);
}

// Função específica para o botão "Próximo Card"
function nextCard() {
    answerCard('skip'); // Reutiliza a lógica, mas sem somar pontos
}

// --- 5. ATUALIZAÇÃO DA INTERFACE (UI) ---

// Barra de Progresso e Contador (Ex: 5 / 30)
function updateProgress() {
    const total = flashcardsData.length;
    const current = currentCardIndex;
    // Evita divisão por zero
    const percentage = total > 0 ? (current / total) * 100 : 0;

    elements.counter.innerText = `${current} / ${total}`;
    elements.progressFill.style.width = `${percentage}%`;
}

// Atualiza os números do placar (Stats)
function updateStatsUI() {
    elements.statAgain.innerText = sessionStats.again;
    elements.statHard.innerText = sessionStats.hard;
    elements.statGood.innerText = sessionStats.good;
    elements.statEasy.innerText = sessionStats.easy;
}

// --- 6. FINALIZAÇÃO ---

function finishSession() {
    // Esconde a área do jogo
    elements.gameArea.style.display = 'none';
    
    // Mostra a tela de parabéns
    elements.completionScreen.classList.add('active');
}

// --- 7. EXPORTAR PARA O HTML ---
// Isso permite que o HTML chame onclick="flipCard()"
window.flipCard = flipCard;
window.answerCard = answerCard;
window.nextCard = nextCard;
window.shuffleCardsManual = shuffleCardsManual;