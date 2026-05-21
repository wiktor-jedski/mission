/**
 * Central dictionary for Polish copy to keep presentation text separated from business logic.
 */
export const PL_DICTIONARY = {
  // Navigation & Shell
  nav: {
    start: "Start",
    submissions: "Zgłoszenia",
    map: "Mapa",
    logout: "Wyloguj się",
    login: "Zaloguj drużynę",
    adminList: "Lista zgłoszeń",
    adminAudit: "Dziennik audytu",
    adminLogout: "Wyloguj admina",
  },

  // Settings & Effects
  settings: {
    animationToggle: "Animacje",
    soundToggle: "Dźwięk",
  },

  // Intro
  intro: {
    title: "Rozdział 1",
    message: "Wkraczasz do świata pełnego tajemnic. Rozwiąż zagadki, otwórz pradawne zamki i znajdź drogę do legendarnego skarbu.",
    skipButton: "Pomiń wstęp",
    continueButton: "Rozpocznij misję",
  },

  // Player Home
  home: {
    title: "Mission Treasure Hunt",
    subtitle: "Misja: Poszukiwanie Skarbu",
    loggedInAs: "Jesteś zalogowany jako",
    enterMission: "Wejdź do gry",
  },

  // Player Login
  login: {
    title: "Wejście do misji",
    pinLabel: "PIN drużyny",
    submitButton: "Wejdź",
    errorInvalidPin: "Nieprawidłowy PIN.",
  },

  // Quest Page
  quest: {
    eyebrow: "Aktywna misja",
    instructionsHeading: "Instrukcja",
    successCriteriaHeading: "Warunek sukcesu",
    safetyHeading: "Bezpieczeństwo",
    hintHeading: "Podpowiedź",
    showHintButton: "Pokaż podpowiedź",
    contributorLabel: "Kto dodaje dowód",
    noteLabel: "Notatka dla mistrza gry",
    submitButton: "Wyślij dowód",
    unknownTitle: "Misja niedostępna",
    unknownMessage: "Ten kod nie prowadzi do żadnej aktywnej misji.",
    backToStart: "Wróć do startu",
  },

  // Submissions & Status
  submissions: {
    title: "Zgłoszenia drużyny",
    emptyState: "Brak zgłoszeń drużyny.",
  },

  // Map Page
  map: {
    title: "Mapa Skarbów",
    progressLabel: "Odkryte fragmenty mapy",
    finalPrizeHeading: "Legendarny Skarb",
    openPrizeButton: "Otwórz zdjęcie finalnej nagrody",
    lockedMessage: "Finalny skarb pozostaje zablokowany. Zdobądź 21 zatwierdzonych misji, aby go odkryć!",
  },

  // Admin UI
  admin: {
    title: "Panel Mistrza Gry",
    loginTitle: "Logowanie Administratora",
    passwordLabel: "Hasło admina",
    loginButton: "Zaloguj",
    pendingTitle: "Zgłoszenia do sprawdzenia",
    noPending: "Brak oczekujących zgłoszeń.",
    refreshing: "Odświeżam zgłoszenia...",
    staleAlert: "Nie udało się odświeżyć listy. Pokazuje ostatnie dane.",
    overridesTitle: "Narzędzia developerskie",
    revealButton: "Odkryj fragment mapy",
    hideButton: "Ukryj fragment mapy",
    skipButton: "Pomiń misję",
    overrideButton: "Zalicz awarię misji",
    replacementButton: "Dodaj dowód zastępczy",
    contributorLabel: "Autor dowodu",
    proofKindLabel: "Typ dowodu",
    proofLabel: "Dowód",
    noteLabel: "Notatka",
    statusLabel: "Status",
    teamLabel: "Drużyna",
    questLabel: "Misja",
    reasonLabel: "Powód",
    rejectionReasonLabel: "Powód odrzucenia",
    rejectionMessageLabel: "Wiadomość dla drużyny",
    approveBtn: "Zatwierdź",
    rejectBtn: "Odrzuć",
    detailsBtn: "Szczegóły",
    submissionDetailsTitle: "Szczegóły zgłoszenia",
    auditTitle: "Dziennik audytu",
    noAudit: "Brak zdarzeń audytu.",
    actorLabel: "Aktor",
    metadataLabel: "Metadane",
  }
};
