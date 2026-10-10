/* =========================================================
   JEU MÉMOIRE
   SCRIPT COMPLET
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


/* =========================================================
   ÉCRANS
========================================================= */

const screens = document.querySelectorAll(".screen");

const screenHome =
  document.getElementById("screenHome");

const screenPairsLevels =
  document.getElementById("screenPairsLevels");

const screenPairsGame =
  document.getElementById("screenPairsGame");

const screenSequenceIntro =
  document.getElementById("screenSequenceIntro");

const screenSequenceGame =
  document.getElementById("screenSequenceGame");

const screenPairsResult =
  document.getElementById("screenPairsResult");

const screenSequenceResult =
  document.getElementById("screenSequenceResult");


function showScreen(screen) {

  screens.forEach(item => {
    item.classList.remove("active");
  });

  screen.classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  updateHomeButton(screen);

}


/* =========================================================
   BOUTONS PRINCIPAUX
========================================================= */

const choosePairsBtn =
  document.getElementById("choosePairsBtn");

const chooseSequenceBtn =
  document.getElementById("chooseSequenceBtn");

const homeBtn =
  document.getElementById("homeBtn");

const soundBtn =
  document.getElementById("soundBtn");

const backHomeButtons =
  document.querySelectorAll("[data-back-home]");


choosePairsBtn.addEventListener("click", () => {
  showScreen(screenPairsLevels);
});


chooseSequenceBtn.addEventListener("click", () => {
  showScreen(screenSequenceIntro);
});


backHomeButtons.forEach(btn => {

  btn.addEventListener("click", () => {
    stopAllGames();
    showScreen(screenHome);
  });

});


homeBtn.addEventListener("click", () => {
  stopAllGames();
  showScreen(screenHome);
});


function updateHomeButton(screen) {

  if (screen === screenHome) {
    homeBtn.classList.add("hidden");
  } else {
    homeBtn.classList.remove("hidden");
  }

}


/* =========================================================
   SON
========================================================= */

let soundEnabled = true;

soundBtn.addEventListener("click", () => {

  soundEnabled = !soundEnabled;

  soundBtn.textContent =
    soundEnabled ? "🔊" : "🔇";

});


function beep(
  frequency = 440,
  duration = 0.08,
  volume = 0.05
) {

  if (!soundEnabled) return;

  try {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    const audioContext =
      new AudioContext();

    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.value =
      frequency;

    gain.gain.value =
      volume;

    oscillator.connect(gain);

    gain.connect(
      audioContext.destination
    );

    oscillator.start();

    oscillator.stop(
      audioContext.currentTime +
      duration
    );

  } catch (error) {
    // Si le navigateur bloque le son,
    // le jeu continue normalement.
  }

}


/* =========================================================
   TOAST
========================================================= */

const toast =
  document.getElementById("toast");

let toastTimer = null;


function showToast(message) {

  clearTimeout(toastTimer);

  toast.textContent =
    message;

  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);

}


/* =========================================================
   LOCAL STORAGE / RECORDS
========================================================= */

const STORAGE_PAIRS_RECORD =
  "jeuMemoire_pairsRecord";

const STORAGE_SEQUENCE_RECORD =
  "jeuMemoire_sequenceRecord";


const homePairsRecord =
  document.getElementById("homePairsRecord");

const homeSequenceRecord =
  document.getElementById("homeSequenceRecord");


function getPairsRecord() {

  const value =
    localStorage.getItem(
      STORAGE_PAIRS_RECORD
    );

  if (!value) return null;

  return Number(value);

}


function getSequenceRecord() {

  const value =
    localStorage.getItem(
      STORAGE_SEQUENCE_RECORD
    );

  return value
    ? Number(value)
    : 0;

}


function updateHomeRecords() {

  const pairsRecord =
    getPairsRecord();

  const sequenceRecord =
    getSequenceRecord();

  homePairsRecord.textContent =
    pairsRecord !== null
      ? formatTime(pairsRecord)
      : "--";

  homeSequenceRecord.textContent =
    sequenceRecord;

}


/* =========================================================
   OUTILS
========================================================= */

function shuffle(array) {

  const copy = [...array];

  for (
    let i = copy.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );

    [
      copy[i],
      copy[j]
    ] = [
      copy[j],
      copy[i]
    ];

  }

  return copy;

}


function formatTime(seconds) {

  const min =
    Math.floor(seconds / 60);

  const sec =
    seconds % 60;

  return (
    String(min).padStart(2, "0") +
    ":" +
    String(sec).padStart(2, "0")
  );

}


function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}


/* =========================================================
   MODE PAIRES
========================================================= */

const levelButtons =
  document.querySelectorAll(
    ".level-card"
  );

const pairsBoard =
  document.getElementById("pairsBoard");

const pairsTimer =
  document.getElementById("pairsTimer");

const pairsFound =
  document.getElementById("pairsFound");

const pairsLevelName =
  document.getElementById("pairsLevelName");

const pairsMessage =
  document.getElementById("pairsMessage");

const memoryCountdown =
  document.getElementById("memoryCountdown");

const restartPairsBtn =
  document.getElementById("restartPairsBtn");

const playPairsAgainBtn =
  document.getElementById("playPairsAgainBtn");

const changePairsLevelBtn =
  document.getElementById("changePairsLevelBtn");

const pairsResultTitle =
  document.getElementById("pairsResultTitle");

const pairsResultText =
  document.getElementById("pairsResultText");

const pairsResultIcon =
  document.getElementById("pairsResultIcon");

const pairsResultTime =
  document.getElementById("pairsResultTime");

const pairsResultPairs =
  document.getElementById("pairsResultPairs");


const pairsLevels = {

  easy: {
    name: "Tranquille",
    memoryTime: 15,
    playTime: 90
  },

  medium: {
    name: "Rapide",
    memoryTime: 10,
    playTime: 60
  },

  hard: {
    name: "Flash",
    memoryTime: 5,
    playTime: 40
  }

};


const symbols = [
  "🌙",
  "🔥",
  "🌿",
  "⭐",
  "💎",
  "🦋"
];


let currentPairsLevel = null;

let pairsDeck = [];

let firstCard = null;

let secondCard = null;

let lockPairsBoard = false;

let matchedPairs = 0;

let pairsTimeLeft = 0;

let pairsTimeUsed = 0;

let pairsTimerInterval = null;

let memoryTimerInterval = null;

let pairsGameActive = false;


/* =========================================================
   CHOIX DU NIVEAU
========================================================= */

levelButtons.forEach(button => {

  button.addEventListener("click", () => {

    const level =
      button.dataset.level;

    startPairsGame(level);

  });

});


/* =========================================================
   CRÉER LE PAQUET
========================================================= */

function createPairsDeck() {

  const doubled = [
    ...symbols,
    ...symbols
  ];

  pairsDeck =
    shuffle(doubled);

}


/* =========================================================
   CRÉER LES CARTES
========================================================= */

function renderPairsBoard() {

  pairsBoard.innerHTML = "";

  pairsDeck.forEach(
    (symbol, index) => {

      const card =
        document.createElement("button");

      card.type =
        "button";

      card.className =
        "memory-card flipped";

      card.dataset.symbol =
        symbol;

      card.dataset.index =
        index;

      card.innerHTML = `

        <span class="memory-card-inner">

          <span class="memory-card-front">
          </span>

          <span class="memory-card-back">
            ${symbol}
          </span>

        </span>

      `;

      card.addEventListener(
        "click",
        () => {
          handlePairsCardClick(card);
        }
      );

      pairsBoard.appendChild(card);

    }
  );

}


/* =========================================================
   DÉMARRER MODE PAIRES
========================================================= */

async function startPairsGame(levelKey) {

  stopPairsGame();

  currentPairsLevel =
    levelKey;

  const level =
    pairsLevels[levelKey];

  matchedPairs = 0;

  firstCard = null;

  secondCard = null;

  lockPairsBoard = true;

  pairsGameActive = true;

  pairsTimeLeft =
    level.playTime;

  pairsTimeUsed = 0;

  pairsFound.textContent =
    "0 / 6";

  pairsLevelName.textContent =
    level.name;

  pairsTimer.textContent =
    formatTime(
      level.playTime
    );

  pairsTimer.classList.remove(
    "timer-warning",
    "timer-danger"
  );

  pairsMessage.textContent =
    "Mémorise les cartes";

  memoryCountdown.textContent =
    level.memoryTime;

  createPairsDeck();

  renderPairsBoard();

  showScreen(screenPairsGame);

  await startMemoryPhase(level);

}


/* =========================================================
   PHASE MÉMORISATION
========================================================= */

function startMemoryPhase(level) {

  return new Promise(resolve => {

    let remaining =
      level.memoryTime;

    memoryCountdown.textContent =
      remaining;

    memoryTimerInterval =
      setInterval(() => {

        remaining--;

        memoryCountdown.textContent =
          remaining;

        if (remaining <= 0) {

          clearInterval(
            memoryTimerInterval
          );

          memoryTimerInterval =
            null;

          const cards =
            pairsBoard.querySelectorAll(
              ".memory-card"
            );

          cards.forEach(card => {
            card.classList.remove(
              "flipped"
            );
          });

          memoryCountdown.textContent =
            "";

          pairsMessage.textContent =
            "Trouve les 6 paires";

          lockPairsBoard =
            false;

          startPairsCountdown();

          resolve();

        }

      }, 1000);

  });

}


/* =========================================================
   CLIC SUR UNE CARTE
========================================================= */

function handlePairsCardClick(card) {

  if (!pairsGameActive) return;

  if (lockPairsBoard) return;

  if (
    card.classList.contains(
      "flipped"
    )
  ) return;

  if (
    card.classList.contains(
      "matched"
    )
  ) return;

  card.classList.add(
    "flipped"
  );

  beep(520, 0.05);

  if (!firstCard) {

    firstCard = card;

    return;

  }

  secondCard = card;

  lockPairsBoard = true;

  checkPair();

}


/* =========================================================
   VÉRIFICATION PAIRE
========================================================= */

function checkPair() {

  const same =
    firstCard.dataset.symbol ===
    secondCard.dataset.symbol;

  if (same) {

    firstCard.classList.add(
      "matched"
    );

    secondCard.classList.add(
      "matched"
    );

    matchedPairs++;

    pairsFound.textContent =
      `${matchedPairs} / 6`;

    beep(760, 0.12);

    showToast("Paire trouvée !");

    resetPairSelection();

    if (matchedPairs === 6) {

      setTimeout(() => {
        winPairsGame();
      }, 500);

    } else {

      lockPairsBoard = false;

    }

  } else {

    beep(220, 0.12);

    setTimeout(() => {

      firstCard.classList.remove(
        "flipped"
      );

      secondCard.classList.remove(
        "flipped"
      );

      resetPairSelection();

      lockPairsBoard =
        false;

    }, 900);

  }

}


/* =========================================================
   RESET DE SÉLECTION
========================================================= */

function resetPairSelection() {

  firstCard = null;
  secondCard = null;

}


/* =========================================================
   TIMER PARTIE PAIRES
========================================================= */

function startPairsCountdown() {

  pairsTimerInterval =
    setInterval(() => {

      pairsTimeLeft--;

      pairsTimeUsed++;

      pairsTimer.textContent =
        formatTime(
          pairsTimeLeft
        );

      if (
        pairsTimeLeft <= 15
      ) {

        pairsTimer.classList.add(
          "timer-warning"
        );

      }

      if (
        pairsTimeLeft <= 7
      ) {

        pairsTimer.classList.remove(
          "timer-warning"
        );

        pairsTimer.classList.add(
          "timer-danger"
        );

      }

      if (
        pairsTimeLeft <= 0
      ) {

        losePairsGame();

      }

    }, 1000);

}


/* =========================================================
   VICTOIRE PAIRES
========================================================= */

function winPairsGame() {

  if (!pairsGameActive) return;

  pairsGameActive =
    false;

  clearInterval(
    pairsTimerInterval
  );

  pairsTimerInterval =
    null;

  const level =
    pairsLevels[
      currentPairsLevel
    ];

  const timeUsed =
    level.playTime -
    pairsTimeLeft;

  const oldRecord =
    getPairsRecord();

  if (
    oldRecord === null ||
    timeUsed < oldRecord
  ) {

    localStorage.setItem(
      STORAGE_PAIRS_RECORD,
      timeUsed
    );

  }

  pairsResultIcon.textContent =
    "🏆";

  pairsResultTitle.textContent =
    "Bravo !";

  pairsResultText.textContent =
    "Tu as retrouvé les 6 paires avant la fin du temps.";

  pairsResultTime.textContent =
    formatTime(timeUsed);

  pairsResultPairs.textContent =
    "6 / 6";

  updateHomeRecords();

  beep(880, 0.2);

  showScreen(
    screenPairsResult
  );

}


/* =========================================================
   DÉFAITE PAIRES
========================================================= */

function losePairsGame() {

  if (!pairsGameActive) return;

  pairsGameActive =
    false;

  clearInterval(
    pairsTimerInterval
  );

  pairsTimerInterval =
    null;

  lockPairsBoard =
    true;

  pairsResultIcon.textContent =
    "⏱️";

  pairsResultTitle.textContent =
    "Temps écoulé";

  pairsResultText.textContent =
    "Tu n'as pas retrouvé toutes les paires à temps.";

  pairsResultTime.textContent =
    "00:00";

  pairsResultPairs.textContent =
    `${matchedPairs} / 6`;

  beep(180, 0.25);

  showScreen(
    screenPairsResult
  );

}


/* =========================================================
   REJOUER PAIRES
========================================================= */

restartPairsBtn.addEventListener(
  "click",
  () => {

    if (
      currentPairsLevel
    ) {

      startPairsGame(
        currentPairsLevel
      );

    }

  }
);


playPairsAgainBtn.addEventListener(
  "click",
  () => {

    if (
      currentPairsLevel
    ) {

      startPairsGame(
        currentPairsLevel
      );

    }

  }
);


changePairsLevelBtn.addEventListener(
  "click",
  () => {

    stopPairsGame();

    showScreen(
      screenPairsLevels
    );

  }
);


/* =========================================================
   ARRÊTER MODE PAIRES
========================================================= */

function stopPairsGame() {

  pairsGameActive =
    false;

  clearInterval(
    pairsTimerInterval
  );

  clearInterval(
    memoryTimerInterval
  );

  pairsTimerInterval =
    null;

  memoryTimerInterval =
    null;

}


/* =========================================================
   MODE SUITE
========================================================= */

const startSequenceBtn =
  document.getElementById(
    "startSequenceBtn"
  );

const restartSequenceBtn =
  document.getElementById(
    "restartSequenceBtn"
  );

const playSequenceAgainBtn =
  document.getElementById(
    "playSequenceAgainBtn"
  );

const sequenceBoard =
  document.getElementById(
    "sequenceBoard"
  );

const sequenceLength =
  document.getElementById(
    "sequenceLength"
  );

const sequenceBest =
  document.getElementById(
    "sequenceBest"
  );

const sequenceRound =
  document.getElementById(
    "sequenceRound"
  );

const sequenceMessage =
  document.getElementById(
    "sequenceMessage"
  );

const sequenceProgress =
  document.getElementById(
    "sequenceProgress"
  );

const sequenceResultScore =
  document.getElementById(
    "sequenceResultScore"
  );

const sequenceResultBest =
  document.getElementById(
    "sequenceResultBest"
  );


const sequenceSymbols = [
  "🌙",
  "🔥",
  "🌿",
  "⭐",
  "💎",
  "🦋",
  "⚡",
  "🌊",
  "☀️",
  "🍀",
  "🧿",
  "🌸"
];


let sequence = [];

let sequencePlayerIndex = 0;

let sequenceRoundNumber = 1;

let sequenceGameActive = false;

let sequenceShowing = false;

let sequenceRunId = 0;


/* =========================================================
   CRÉER LE PLATEAU SUITE
========================================================= */

function renderSequenceBoard() {

  sequenceBoard.innerHTML = "";

  sequenceSymbols.forEach(
    (symbol, index) => {

      const card =
        document.createElement("button");

      card.type =
        "button";

      card.className =
        "sequence-card";

      card.dataset.index =
        index;

      card.textContent =
        symbol;

      card.addEventListener(
        "click",
        () => {

          handleSequenceClick(
            index,
            card
          );

        }
      );

      sequenceBoard.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   DÉMARRER MODE SUITE
========================================================= */

startSequenceBtn.addEventListener(
  "click",
  () => {
    startSequenceGame();
  }
);


restartSequenceBtn.addEventListener(
  "click",
  () => {
    startSequenceGame();
  }
);


playSequenceAgainBtn.addEventListener(
  "click",
  () => {
    startSequenceGame();
  }
);


async function startSequenceGame() {

  stopSequenceGame();

  sequenceRunId++;

  const runId =
    sequenceRunId;

  sequence = [];

  sequencePlayerIndex = 0;

  sequenceRoundNumber = 1;

  sequenceGameActive =
    true;

  sequenceShowing =
    false;

  renderSequenceBoard();

  const best =
    getSequenceRecord();

  sequenceBest.textContent =
    best;

  showScreen(
    screenSequenceGame
  );

  addRandomSequenceItem();
  addRandomSequenceItem();
  addRandomSequenceItem();

  updateSequenceStats();

  await delay(500);

  if (
    runId !== sequenceRunId
  ) return;

  showSequence(runId);

}


/* =========================================================
   AJOUTER UNE CARTE
========================================================= */

function addRandomSequenceItem() {

  const index =
    Math.floor(
      Math.random() *
      sequenceSymbols.length
    );

  sequence.push(index);

}


/* =========================================================
   AFFICHER LA SUITE
========================================================= */

async function showSequence(runId) {

  if (
    !sequenceGameActive
  ) return;

  sequenceShowing =
    true;

  sequencePlayerIndex =
    0;

  sequenceMessage.textContent =
    "Observe la suite";

  sequenceProgress.textContent =
    `0 / ${sequence.length}`;

  disableSequenceBoard(true);

  await delay(600);

  for (
    let i = 0;
    i < sequence.length;
    i++
  ) {

    if (
      !sequenceGameActive ||
      runId !== sequenceRunId
    ) return;

    const index =
      sequence[i];

    const cards =
      sequenceBoard.querySelectorAll(
        ".sequence-card"
      );

    const card =
      cards[index];

    card.classList.add(
      "active"
    );

    beep(
      420 + index * 22,
      0.09
    );

    await delay(500);

    card.classList.remove(
      "active"
    );

    await delay(220);

  }

  if (
    runId !== sequenceRunId
  ) return;

  sequenceShowing =
    false;

  sequenceMessage.textContent =
    "À toi ! Reproduis la suite";

  disableSequenceBoard(false);

}


/* =========================================================
   CLIC DU JOUEUR
========================================================= */

function handleSequenceClick(
  index,
  card
) {

  if (
    !sequenceGameActive
  ) return;

  if (
    sequenceShowing
  ) return;

  const expected =
    sequence[
      sequencePlayerIndex
    ];

  if (index === expected) {

    card.classList.add(
      "correct"
    );

    beep(700, 0.06);

    setTimeout(() => {
      card.classList.remove(
        "correct"
      );
    }, 250);

    sequencePlayerIndex++;

    sequenceProgress.textContent =
      `${sequencePlayerIndex} / ${sequence.length}`;

    if (
      sequencePlayerIndex ===
      sequence.length
    ) {

      disableSequenceBoard(true);

      sequenceRoundNumber++;

      sequenceMessage.textContent =
        "Bravo ! Une carte de plus...";

      beep(880, 0.12);

      setTimeout(() => {

        if (
          !sequenceGameActive
        ) return;

        addRandomSequenceItem();

        updateSequenceStats();

        showSequence(
          sequenceRunId
        );

      }, 900);

    }

  } else {

    card.classList.add(
      "error"
    );

    beep(170, 0.2);

    disableSequenceBoard(true);

    setTimeout(() => {

      card.classList.remove(
        "error"
      );

      endSequenceGame();

    }, 500);

  }

}


/* =========================================================
   STATS SUITE
========================================================= */

function updateSequenceStats() {

  sequenceLength.textContent =
    sequence.length;

  sequenceRound.textContent =
    sequenceRoundNumber;

  sequenceBest.textContent =
    getSequenceRecord();

  sequenceProgress.textContent =
    `0 / ${sequence.length}`;

}


/* =========================================================
   ACTIVER / DÉSACTIVER PLATEAU
========================================================= */

function disableSequenceBoard(
  disabled
) {

  const cards =
    sequenceBoard.querySelectorAll(
      ".sequence-card"
    );

  cards.forEach(card => {

    card.disabled =
      disabled;

  });

}


/* =========================================================
   FIN MODE SUITE
========================================================= */

function endSequenceGame() {

  if (
    !sequenceGameActive
  ) return;

  sequenceGameActive =
    false;

  sequenceShowing =
    false;

  /*
    On retire 1 car la dernière
    séquence n'a pas été réussie.
  */

  const score =
    Math.max(
      0,
      sequence.length - 1
    );

  const oldBest =
    getSequenceRecord();

  let best =
    oldBest;

  if (score > oldBest) {

    localStorage.setItem(
      STORAGE_SEQUENCE_RECORD,
      score
    );

    best = score;

  }

  sequenceResultScore.textContent =
    score;

  sequenceResultBest.textContent =
    best;

  updateHomeRecords();

  showScreen(
    screenSequenceResult
  );

}


/* =========================================================
   ARRÊTER MODE SUITE
========================================================= */

function stopSequenceGame() {

  sequenceGameActive =
    false;

  sequenceShowing =
    false;

  sequenceRunId++;

}


/* =========================================================
   ARRÊTER TOUS LES JEUX
========================================================= */

function stopAllGames() {

  stopPairsGame();

  stopSequenceGame();

}


/* =========================================================
   INITIALISATION
========================================================= */

updateHomeRecords();

updateHomeButton(
  screenHome
);

showScreen(
  screenHome
);


});
