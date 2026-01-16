const DEFAULT_THEME = "transplante";

const root = document.getElementById("quiz-root");
const totalEl = document.getElementById("question-total");
const titleEl = document.getElementById("quiz-title");
const descriptionEl = document.getElementById("quiz-description");
const logoEl = document.getElementById("quiz-logo");
const backLinkEl = document.getElementById("back-link");

const params = new URLSearchParams(window.location.search);
const theme = params.get("tema") || DEFAULT_THEME;
const origin = params.get("origem");
const dataUrl = `../data/questoes/${theme}.json`;

let quizData = [];
let currentQuestion = 0;
let userAnswers = [];
let showingAnswer = [];

function updateMeta(data) {
  const title = data && data.titulo ? data.titulo : "Banco de Questoes";
  const description = data && data.descricao
    ? data.descricao
    : "Atualize o arquivo JSON do tema para adicionar novas questoes.";

  if (titleEl) {
    titleEl.textContent = title;
  }
  if (descriptionEl) {
    descriptionEl.textContent = description;
  }
  if (logoEl) {
    logoEl.textContent = title;
  }

  document.title = `${title} - Biblioteca de Anestesiologia`;
}

function updateBackLink() {
  if (!backLinkEl) {
    return;
  }
  const backHref = origin ? `../${origin}` : "../index.html";
  backLinkEl.href = backHref;
}

function showError(message) {
  if (!root) {
    return;
  }

  root.innerHTML = `
    <div class="quiz-container empty-state">
      ${message}
    </div>
  `;
}

function buildAlternatives(question, answered, showing) {
  return question.alternativas
    .map((alt, index) => {
      let className = "alternative-item";
      if (answered && showing) {
        className += " disabled";
        if (alt.correta) {
          className += " correct";
        } else if (userAnswers[currentQuestion] === index) {
          className += " incorrect";
        }
      } else if (userAnswers[currentQuestion] === index) {
        className += " selected";
      }

      return `
        <li class="${className}" data-index="${index}">
          <span class="alternative-letter">${alt.letra}.</span>
          <span class="alternative-text">${alt.texto}</span>
        </li>
      `;
    })
    .join("");
}

function renderQuestion() {
  if (!root) {
    return;
  }

  if (!quizData.length) {
    root.innerHTML = `
      <div class="quiz-container empty-state">
        Nenhuma questao cadastrada para este tema.
      </div>
    `;
    return;
  }

  const question = quizData[currentQuestion];
  const answered = userAnswers[currentQuestion] !== null;
  const showing = showingAnswer[currentQuestion];
  const progress = Math.round(((currentQuestion + 1) / quizData.length) * 100);
  const selectedIndex = userAnswers[currentQuestion];
  const selectedAlt = answered ? question.alternativas[selectedIndex] : null;
  const isCorrect = selectedAlt ? selectedAlt.correta : false;
  const answerTitle = isCorrect ? "Resposta correta" : "Resposta incorreta";
  const answerIcon = isCorrect ? "OK" : "X";
  const answerClass = isCorrect ? "" : " incorrect";

  root.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-header">
        <span class="question-counter">Questao ${currentQuestion + 1} de ${quizData.length}</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <span class="question-counter">${progress}%</span>
      </div>

      <div class="question-card">
        <div class="question-text">${question.enunciado}</div>
        <ul class="alternatives-list">
          ${buildAlternatives(question, answered, showing)}
        </ul>

        ${showing ? `
          <div class="answer-section${answerClass}">
            <div class="answer-header">
              <span class="answer-icon">${answerIcon}</span>
              <span class="answer-title">${answerTitle}</span>
            </div>
            <div class="answer-explanation">${question.explicacao}</div>
          </div>
        ` : ""}
      </div>

      <div class="button-group">
        <div class="nav-buttons">
          <button class="btn btn-secondary" data-action="prev" ${currentQuestion === 0 ? "disabled" : ""}>
            Anterior
          </button>
          <button class="btn btn-secondary" data-action="next" ${currentQuestion === quizData.length - 1 ? "disabled" : ""}>
            Proxima
          </button>
        </div>
        <button class="btn btn-primary" data-action="toggle" ${!answered ? "disabled" : ""}>
          ${showing ? "Ocultar gabarito" : "Revelar gabarito"}
        </button>
      </div>
    </div>
  `;

  root.querySelectorAll(".alternative-item").forEach((item) => {
    const index = Number(item.dataset.index);
    item.addEventListener("click", () => {
      if (showing) {
        return;
      }
      selectAnswer(index);
    });
  });

  const prevButton = root.querySelector('[data-action="prev"]');
  const nextButton = root.querySelector('[data-action="next"]');
  const toggleButton = root.querySelector('[data-action="toggle"]');

  if (prevButton) {
    prevButton.addEventListener("click", previousQuestion);
  }
  if (nextButton) {
    nextButton.addEventListener("click", nextQuestion);
  }
  if (toggleButton) {
    toggleButton.addEventListener("click", toggleAnswer);
  }
}

function selectAnswer(index) {
  userAnswers[currentQuestion] = index;
  renderQuestion();
}

function toggleAnswer() {
  if (userAnswers[currentQuestion] === null) {
    return;
  }
  showingAnswer[currentQuestion] = !showingAnswer[currentQuestion];
  renderQuestion();
}

function nextQuestion() {
  if (currentQuestion < quizData.length - 1) {
    currentQuestion += 1;
    renderQuestion();
  }
}

function previousQuestion() {
  if (currentQuestion > 0) {
    currentQuestion -= 1;
    renderQuestion();
  }
}

function loadQuiz() {
  updateBackLink();
  if (root) {
    root.textContent = "Carregando...";
  }

  fetch(dataUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Arquivo JSON nao encontrado");
      }
      return response.json();
    })
    .then((data) => {
      updateMeta(data || {});
      quizData = Array.isArray(data.questoes) ? data.questoes : [];
      currentQuestion = 0;
      userAnswers = Array(quizData.length).fill(null);
      showingAnswer = Array(quizData.length).fill(false);

      if (totalEl) {
        totalEl.textContent = String(quizData.length);
      }

      renderQuestion();
    })
    .catch(() => {
      updateMeta({});
      if (totalEl) {
        totalEl.textContent = "0";
      }
      showError("Nao foi possivel carregar o tema. Verifique o nome do arquivo JSON e se esta rodando em um servidor local.");
    });
}

loadQuiz();
