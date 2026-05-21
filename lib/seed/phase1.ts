import {
  isProofKind,
  QUEST_COUNT,
  TEAM_COUNT
} from "../domain/constants";
import type { Quest, Team, TeamQuestProgress } from "../domain/types";

export const phase1Teams: readonly Team[] = [
  {
    id: "team-ember",
    name: "Druzyna Zarzewia",
    pinHash: "phase1-placeholder-pin-hash-ember",
    mapProgressCount: 0,
    completedQuestCount: 0,
    createdAt: "2026-05-21T00:00:00.000Z"
  },
  {
    id: "team-iron",
    name: "Druzyna Zelaza",
    pinHash: "phase1-placeholder-pin-hash-iron",
    mapProgressCount: 0,
    completedQuestCount: 0,
    createdAt: "2026-05-21T00:00:00.000Z"
  }
];

export const phase1Quests: readonly Quest[] = [
  quest(1, "amber-vault-k9q4m2x7", "Witamy w kolonii!", "Intro do wykonywania misji", "Zrób selfie swojego zespołu i udostępnij link do zdjęcia.", "Zdjęcie jest dostępne oraz zawiera wszystkich członków zespołu.", null, "photo_link", null),
  quest(2, "silent-forge-p6t8n3v1", "Któryś za nas, cierpiał rany...", "Cross joint", "Skręć cross jointa, zrób mu zdjęcie i udostępnij link do zdjęcia. How to: https://www.youtube.com/watch?v=vayXUHhcUWM", "Zdjęcie jest dostępne oraz zawiera cross jointa.", null, "photo_link", null),
  quest(3, "moonlit-riddle-x2c7b9h5", "THIS. IS. SPARTA!!!", "Historyczna rekonstrukcja", "Nagraj krótki film, na którym zespół wykonuje scenę z filmu \"300\" - https://www.youtube.com/watch?v=4Prc1UfuokY Film nie musi być długi, ważne, aby odwzorował film w przedziale 1:50 - 2:10 ze zbliżeniami na aktorów.", "Film jest dostępny oraz zawiera kluczowy moment z filmu \"300\".", "Uwaga na tył głowy przy upadaniu!", "video_link", null),
  quest(4, "broken-compass-r8w1s6d4", "Diss na mleko", "Skomponujcie diss na mleko", "Nagrajcie diss na mleko. Każdy uczestnik drużyny nawija 4 linijki. Bit: https://www.youtube.com/watch?v=3MufzuaKfZg", "Nagranie (dźwięk albo film) jest dostępne, każdy z członków zespołu dissuje mleko pod bit z załączonego linka. Linijki muszą się rymować.", null, "audio_link", null),
  quest(5, "river-oath-m5z9q2a8", "Jesse We Need To Cook", "Przepis", "Umieść przepis na drinka, którego celem jest maksymalizacja kaca. Drink ma mieć do 5 składników.", "Przepis zawiera do 5 składników, opis wykonania oraz niewątpliwie spowoduje mocnego kaca.", null, "text_response", null),
  quest(6, "storm-banner-v7d3k1p9", "Litwo, ojczyzno moja...", "Analiza tekstu źródłowego", "Podaj 5. słowo 851. wersu Księgi I Pana Tadeusza. Źródło: https://pl.wikisource.org/wiki/Pan_Tadeusz_(wyd._1921)", "Podane słowo musi się zgadzać z tekstem źródłowym.", null, "text_response", null),
  quest(7, "hidden-crown-b4n8y6t2", "Stworzenie Adama", "Rekonstrukcja fresku", "Zrób zdjęcie członków zespołu przedstawiające rekonstrukcję fresku \"Stworzenie Adama\" autorstwa Michała Anioła.", "Zdjęcie przestawia co najmniej 2 osoby, które znajdują się w pozycji podobnej do fresku. Można przytrzymać osobę po prawej stronie.", null, "photo_link", null),
  quest(8, "silver-goblet-f1h6r3w9", "Z kamerą wśród zwierząt", "Film dokumentalny", "Nagrajcie kilkusekundową scenę z przyrodniczego filmu dokumentalnego: narrator w profesjonalnym tonie opisuje muchę, która wykonuje \"mydli mydli\"", "Nagranie zawiera komentarz jednego członka zespołu i przedstawia zachowanie \"mydli mydli\" wykonane przez innego członka zespołu", null, "video_link", null),
  quest(9, "ashen-library-z8p2m5c7", "Telezakupy Mango", "Reklama", "Nagraj reklamę telezakupów, w której próbujecie sprzedać kompletnie bezużyteczny przedmiot (np. kamień, liść, pustą butelkę). Minimum jeden prowadzący i jeden zadowolony klient.", "Film zawiera prezentację produktu, pokaz działania i świadectwo klienta.", null, "video_link", null),
  quest(10, "candle-bridge-t3q7x1n6", "Ginyu Force", "Zdjęcie", "Zróbcie zdjęcie członków zespołu, którzy odwzorowują pozy Ginyu Force - https://static.wikia.nocookie.net/dragonball/images/e/ea/GinyuTokusentai.png", "Zdjęcie zawiera członków zespołu i poprawne pozy", null, "photo_link", null),
  quest(11, "wolfsbane-letter-h9v4d8s2", "Ostatnie Pożegnanie", "Film", "Nagrajcie improwizowany pogrzeb drobnego obiektu (kamień, kiep itp.) - kapłan wygłasza krótką mowę pożegnalną, żałobnicy płaczą, obiekt zostaje pochowany, skremowany lub utopiony.", "Film zawiera mowę, płacz żałobników i pochówek.", null, "video_link", null),
  quest(12, "obsidian-key-c6m1r9k4", "ASMR dla koneserów", "Nagranie dźwiękowe", "Jeden z was musi zjeść coś głośnego maksymalnie blisko mikrofonu, inny opisuje zasadę działania silnika Diesla szeptem.", "Nagranie zawiera odgłosy jedzenia oraz szept na temat.", null, "audio_link", null),
  quest(13, "mist-harbor-y2s8w5p1", "Ofiara ceremonialna", "Zdjęcie", "Członek zespołu leży na ziemi z zamkniętymi oczami. Na jego ciele znajduje się wieża z 6 przedmiotów.", "Zdjęcie jest zgodne z opisem powyżej.", "Nie kłaść rzeczy na twarzy lub jajach", "photo_link", null),
  quest(14, "golden-antler-n7b3x6q8", "Haiku", "Wiersz", "Napiszcie haiku - krótki wiersz o układzie 5, 7, 5 sylab - o problemie swędzących jaj. Wiersz nie musi się rymować.", "Wiersz ma poprawną ilość sylab i jest na temat.", null, "text_response", null),
  quest(15, "ember-choir-d5k9t2v7", "Makłowicz w podróży", "Film", "Wybierzcie najtańszy, najgorzej brzmiący lub najzwyklejszy produkt z kuchni (np. suchy chleb, woda z kranu, plasterek najtańszej szynki) i nagrajcie jego recenzję w stylu Roberta Makłowicza. Wymagane użycie słów: \"wyborne\", \"paleta smaków\", \"rustykalne\".", "Recenzenci naśladują dykcję i entuzjazm Makłowicza, padają wymagane słowa, na koniec następuja konsumpcja.", "Tylko jadalne rzeczy", "video_link", null),
  quest(16, "frost-tower-q1r6c8m3", "Wiadro", "Konstrukcja", "Zbudujcie wiadro i zróbcie jego zdjęcie.", "Zdjęcie z poprawnie zbudowanym wiadrem. Lufka nie jest wymagana, ale powinno się móc z niego palić w jakis sposób.", null, "photo_link", null),
  quest(17, "runic-kitchen-w4p7z2h8", "Dekret", "Prawo", "Jesteście pracownikami Ministerstwa Głupich Kroków. Wymyślcie 4 najgłupsze prawa, które mają obowiązywać w kraju od następnego roku. Nie może to być prawo, które już kiedyś funkcjonowało lub funkcjonuje (zamykanie lasów, godziny dla seniorów itp.)", "Odpowiedź zawiera 4 głupie, nieistniejące obecnie prawa.", null, "text_response", null),
  quest(18, "crimson-lantern-m8x3n6b1", "Szympansy", "Nagranie dźwiękowe", "Nagrajcie imitację głosów szympansów, które wydają w ekscytacji. Przykład: https://www.youtube.com/watch?v=OrW4KC38f48", "Nagranie zawiera poprawny rodzaj dźwięków i słychać co najmniej 2 szympansy.", null, "audio_link", null),
  quest(19, "starlit-ledger-k2d9v5s7", "Na Łazarskim Rejonie", "Zdjęcie", "Zróbcie zdjęcie w słowiańskim przykucu i prawilnych pozach. Następnie wykorzystajcie AI, aby ubrać was w dresy z lat 90 i przenieść was w szare, polskie osiedle. Darmowa edycja zdjęć AI: https://aistudio.google.com/prompts/new_chat?model=gemini-2.5-flash-image https://chatgpt.com/", "Zdjęcie zawiera członków zespołu w dresach, na polskim osiedlu.", null, "photo_link", null),
  quest(20, "ivory-drum-p5h1q8r4", "Jan Paweł DriII", "Nagranie dźwiękowe", "Nagrajcie drillowy remix „Barki”. Jeden członek robi beat ustami, drugi nawija, trzeci wykonuje adliby („JP2GMD”, „alleluja”, itp.) Tekst: https://teksciory.interia.pl/barka-barka-tekst-piosenki,t,542809.html", "Nagranie zawiera fragment „Barki”, beat i minimum 8 wersów.", null, "audio_link", null),
  quest(21, "last-obelisk-s9c4m7x2", "The Imperial March", "Nagranie dźwiękowe", "Nagrajcie motyw z Gwiezdnych Wojen, używając tylko swoich głosów (a cappella). Utwór: https://www.youtube.com/watch?v=-bzWSJG93P8", "Nagranie zawiera kilkanaście - kilkadziesiąt sekund motywu, wyłącznie ludzkim głosem", null, "audio_link", null)
];

export const phase1TeamQuestProgress: readonly TeamQuestProgress[] =
  phase1Teams.flatMap((team) =>
    phase1Quests.map((questItem) => ({
      id: `${team.id}-${questItem.id}`,
      teamId: team.id,
      questId: questItem.id,
      status: "not_started",
      hintUsedAt: null,
      approvedAt: null,
      skippedAt: null
    }))
  );

export type SeedValidationResult = {
  teamCount: number;
  questCount: number;
  progressCount: number;
};

export const validatePhase1SeedData = (
  teams: readonly Team[] = phase1Teams,
  quests: readonly Quest[] = phase1Quests,
  progressRows: readonly TeamQuestProgress[] = phase1TeamQuestProgress
): SeedValidationResult => {
  if (teams.length !== TEAM_COUNT) {
    throw new Error(`Expected ${TEAM_COUNT} teams.`);
  }

  if (quests.length !== QUEST_COUNT) {
    throw new Error(`Expected ${QUEST_COUNT} quests.`);
  }

  const slugs = new Set(quests.map((questItem) => questItem.slug));
  if (slugs.size !== quests.length) {
    throw new Error("Quest slugs must be unique.");
  }

  const invalidSlug = quests.find((questItem) => !isUnguessableSlug(questItem.slug));
  if (invalidSlug) {
    throw new Error(`Quest slug is not unguessable: ${invalidSlug.slug}`);
  }

  const invalidProofKind = quests.find(
    (questItem) => !isProofKind(questItem.proofKind)
  );
  if (invalidProofKind) {
    throw new Error(`Quest proof kind is invalid: ${invalidProofKind.id}`);
  }

  const inactiveQuest = quests.find((questItem) => !questItem.isActive);
  if (inactiveQuest) {
    throw new Error(`Quest must be active by default: ${inactiveQuest.id}`);
  }

  const expectedProgressCount = teams.length * quests.length;
  if (progressRows.length !== expectedProgressCount) {
    throw new Error(`Expected ${expectedProgressCount} progress rows.`);
  }

  const progressKeys = new Set(
    progressRows.map((row) => `${row.teamId}:${row.questId}`)
  );
  for (const team of teams) {
    for (const questItem of quests) {
      if (!progressKeys.has(`${team.id}:${questItem.id}`)) {
        throw new Error(`Missing progress row for ${team.id}/${questItem.id}.`);
      }
    }
  }

  const nonInitialProgress = progressRows.find(
    (row) => row.status !== "not_started"
  );
  if (nonInitialProgress) {
    throw new Error(`Initial progress must be not_started: ${nonInitialProgress.id}`);
  }

  return {
    teamCount: teams.length,
    questCount: quests.length,
    progressCount: progressRows.length
  };
};

export const isUnguessableSlug = (slug: string): boolean =>
  /^[a-z]+(?:-[a-z]+)+-[a-z0-9]{8}$/.test(slug) && !/\b(?:quest|task)-?\d+\b/.test(slug);

function quest(
  number: number,
  slug: string,
  title: string,
  flavorText: string,
  instructions: string,
  successCriteria: string,
  safetyWarning: string | null,
  proofKind: Quest["proofKind"],
  hintText: string | null
): Quest {
  return {
    id: `quest-${number.toString().padStart(2, "0")}`,
    slug,
    title,
    flavorText,
    instructions,
    successCriteria,
    safetyWarning: safetyWarning ?? "",
    proofKind,
    hintText,
    isActive: true
  };
}
