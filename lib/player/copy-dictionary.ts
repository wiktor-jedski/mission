/**
 * Central dictionary for Polish copy to keep presentation text separated from business logic.
 */
export const PL_DICTIONARY = {
  // Navigation & Shell
  nav: {
    start: "Start",
    submissions: "Zgłoszenia",
    map: "Blant",
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
    title: "Władca Blantów: Drużyna Ciśnienia",
    message: "W Krainie Gastro, gdzie czerwone ślepia,\nJeden, by wszystkich skręcić, Jeden, by wszystkich sklepać,\nJeden, by wszystkich zgromadzić i w dymie powiązać\nW Krainie Gastro, gdzie kiełby się smażą.",
    continueButton: "Rozpocznij misję",
  },

  // Player Home
  home: {
    subtitle: "Władca Blantów: Drużyna Ciśnienia",
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
    title: "Fragmenty Blanta",
    progressLabel: "Zdobyte fragmenty Blanta",
    finalPrizeHeading: "Blant odbudowany",
    finalPrizeMessage: "Gratulacje! Zdobyliście wszystkie fragmenty i odbudowaliście Blanta.",
    openPrizeButton: "Otwórz zdjęcie finalnej nagrody",
    lockedMessage: "Zdobądź 16 zatwierdzonych misji, aby odbudować Blanta",
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
