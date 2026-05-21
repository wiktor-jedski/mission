insert into public.teams (id, name, pin_hash)
values
  ('team-ember', 'Druzyna Zarzewia', 'phase1-placeholder-pin-hash-ember'),
  ('team-iron', 'Druzyna Zelaza', 'phase1-placeholder-pin-hash-iron');

insert into public.app_settings (id, required_approval_count, is_paused)
values ('global', 16, false)
on conflict (id) do update
set
  required_approval_count = excluded.required_approval_count,
  is_paused = excluded.is_paused,
  updated_at = now();

insert into public.quests (
  id,
  slug,
  title,
  flavor_text,
  instructions,
  success_criteria,
  safety_warning,
  proof_kind,
  hint_text,
  is_active
)
values
  ('quest-01', 'amber-vault-k9q4m2x7', 'Witamy w kolonii!', 'Intro do wykonywania misji', 'Zrób selfie swojego zespołu i udostępnij link do zdjęcia.', 'Zdjęcie jest dostępne oraz zawiera wszystkich członków zespołu.', '', 'photo_link', null, true),
  ('quest-02', 'silent-forge-p6t8n3v1', 'Któryś za nas, cierpiał rany...', 'Cross joint', 'Skręć cross jointa, zrób mu zdjęcie i udostępnij link do zdjęcia. How to: https://www.youtube.com/watch?v=vayXUHhcUWM', 'Zdjęcie jest dostępne oraz zawiera cross jointa.', '', 'photo_link', null, true),
  ('quest-03', 'moonlit-riddle-x2c7b9h5', 'THIS. IS. SPARTA!!!', 'Historyczna rekonstrukcja', 'Nagraj krótki film, na którym zespół wykonuje scenę z filmu "300" - https://www.youtube.com/watch?v=4Prc1UfuokY Film nie musi być długi, ważne, aby odwzorował film w przedziale 1:50 - 2:10 ze zbliżeniami na aktorów.', 'Film jest dostępny oraz zawiera kluczowy moment z filmu "300".', 'Uwaga na tył głowy przy upadaniu!', 'video_link', null, true),
  ('quest-04', 'broken-compass-r8w1s6d4', 'Diss na mleko', 'Skomponujcie diss na mleko', 'Nagrajcie diss na mleko. Każdy uczestnik drużyny nawija 4 linijki. Bit: https://www.youtube.com/watch?v=3MufzuaKfZg', 'Nagranie (dźwięk albo film) jest dostępne, każdy z członków zespołu dissuje mleko pod bit z załączonego linka. Linijki muszą się rymować.', '', 'audio_link', null, true),
  ('quest-05', 'river-oath-m5z9q2a8', 'Jesse We Need To Cook', 'Przepis', 'Umieść przepis na drinka, którego celem jest maksymalizacja kaca. Drink ma mieć do 5 składników.', 'Przepis zawiera do 5 składników, opis wykonania oraz niewątpliwie spowoduje mocnego kaca.', '', 'text_response', null, true),
  ('quest-06', 'storm-banner-v7d3k1p9', 'Litwo, ojczyzno moja...', 'Analiza tekstu źródłowego', 'Podaj 5. słowo 851. wersu Księgi I Pana Tadeusza. Źródło: https://pl.wikisource.org/wiki/Pan_Tadeusz_(wyd._1921)', 'Podane słowo musi się zgadzać z tekstem źródłowym.', '', 'text_response', null, true),
  ('quest-07', 'hidden-crown-b4n8y6t2', 'Stworzenie Adama', 'Rekonstrukcja fresku', 'Zrób zdjęcie członków zespołu przedstawiające rekonstrukcję fresku "Stworzenie Adama" autorstwa Michała Anioła.', 'Zdjęcie przestawia co najmniej 2 osoby, które znajdują się w pozycji podobnej do fresku. Można przytrzymać osobę po prawej stronie.', '', 'photo_link', null, true),
  ('quest-08', 'silver-goblet-f1h6r3w9', 'Z kamerą wśród zwierząt', 'Film dokumentalny', 'Nagrajcie kilkusekundową scenę z przyrodniczego filmu dokumentalnego: narrator w profesjonalnym tonie opisuje muchę, która wykonuje "mydli mydli"', 'Nagranie zawiera komentarz jednego członka zespołu i przedstawia zachowanie "mydli mydli" wykonane przez innego członka zespołu', '', 'video_link', null, true),
  ('quest-09', 'ashen-library-z8p2m5c7', 'Telezakupy Mango', 'Reklama', 'Nagraj reklamę telezakupów, w której próbujecie sprzedać kompletnie bezużyteczny przedmiot (np. kamień, liść, pustą butelkę). Minimum jeden prowadzący i jeden zadowolony klient.', 'Film zawiera prezentację produktu, pokaz działania i świadectwo klienta.', '', 'video_link', null, true),
  ('quest-10', 'candle-bridge-t3q7x1n6', 'Ginyu Force', 'Zdjęcie', 'Zróbcie zdjęcie członków zespołu, którzy odwzorowują pozy Ginyu Force - https://static.wikia.nocookie.net/dragonball/images/e/ea/GinyuTokusentai.png', 'Zdjęcie zawiera członków zespołu i poprawne pozy', '', 'photo_link', null, true),
  ('quest-11', 'wolfsbane-letter-h9v4d8s2', 'Ostatnie Pożegnanie', 'Film', 'Nagrajcie improwizowany pogrzeb drobnego obiektu (kamień, kiep itp.) - kapłan wygłasza krótką mowę pożegnalną, żałobnicy płaczą, obiekt zostaje pochowany, skremowany lub utopiony.', 'Film zawiera mowę, płacz żałobników i pochówek.', '', 'video_link', null, true),
  ('quest-12', 'obsidian-key-c6m1r9k4', 'ASMR dla koneserów', 'Nagranie dźwiękowe', 'Jeden z was musi zjeść coś głośnego maksymalnie blisko mikrofonu, inny opisuje zasadę działania silnika Diesla szeptem.', 'Nagranie zawiera odgłosy jedzenia oraz szept na temat.', '', 'audio_link', null, true),
  ('quest-13', 'mist-harbor-y2s8w5p1', 'Ofiara ceremonialna', 'Zdjęcie', 'Członek zespołu leży na ziemi z zamkniętymi oczami. Na jego ciele znajduje się wieża z 6 przedmiotów.', 'Zdjęcie jest zgodne z opisem powyżej.', 'Nie kłaść rzeczy na twarzy lub jajach', 'photo_link', null, true),
  ('quest-14', 'golden-antler-n7b3x6q8', 'Haiku', 'Wiersz', 'Napiszcie haiku - krótki wiersz o układzie 5, 7, 5 sylab - o problemie swędzących jaj. Wiersz nie musi się rymować.', 'Wiersz ma poprawną ilość sylab i jest na temat.', '', 'text_response', null, true),
  ('quest-15', 'ember-choir-d5k9t2v7', 'Makłowicz w podróży', 'Film', 'Wybierzcie najtańszy, najgorzej brzmiący lub najzwyklejszy produkt z kuchni (np. suchy chleb, woda z kranu, plasterek najtańszej szynki) i nagrajcie jego recenzję w stylu Roberta Makłowicza. Wymagane użycie słów: "wyborne", "paleta smaków", "rustykalne".', 'Recenzenci naśladują dykcję i entuzjazm Makłowicza, padają wymagane słowa, na koniec następuja konsumpcja.', 'Tylko jadalne rzeczy', 'video_link', null, true),
  ('quest-16', 'frost-tower-q1r6c8m3', 'Wiadro', 'Konstrukcja', 'Zbudujcie wiadro i zróbcie jego zdjęcie.', 'Zdjęcie z poprawnie zbudowanym wiadrem. Lufka nie jest wymagana, ale powinno się móc z niego palić w jakis sposób.', '', 'photo_link', null, true),
  ('quest-17', 'runic-kitchen-w4p7z2h8', 'Dekret', 'Prawo', 'Jesteście pracownikami Ministerstwa Głupich Kroków. Wymyślcie 4 najgłupsze prawa, które mają obowiązywać w kraju od następnego roku. Nie może to być prawo, które już kiedyś funkcjonowało lub funkcjonuje (zamykanie lasów, godziny dla seniorów itp.)', 'Odpowiedź zawiera 4 głupie, nieistniejące obecnie prawa.', '', 'text_response', null, true),
  ('quest-18', 'crimson-lantern-m8x3n6b1', 'Szympansy', 'Nagranie dźwiękowe', 'Nagrajcie imitację głosów szympansów, które wydają w ekscytacji. Przykład: https://www.youtube.com/watch?v=OrW4KC38f48', 'Nagranie zawiera poprawny rodzaj dźwięków i słychać co najmniej 2 szympansy.', '', 'audio_link', null, true),
  ('quest-19', 'starlit-ledger-k2d9v5s7', 'Na Łazarskim Rejonie', 'Zdjęcie', 'Zróbcie zdjęcie w słowiańskim przykucu i prawilnych pozach. Następnie wykorzystajcie AI, aby ubrać was w dresy z lat 90 i przenieść was w szare, polskie osiedle. Darmowa edycja zdjęć AI: https://aistudio.google.com/prompts/new_chat?model=gemini-2.5-flash-image https://chatgpt.com/', 'Zdjęcie zawiera członków zespołu w dresach, na polskim osiedlu.', '', 'photo_link', null, true),
  ('quest-20', 'ivory-drum-p5h1q8r4', 'Jan Paweł DriII', 'Nagranie dźwiękowe', 'Nagrajcie drillowy remix „Barki”. Jeden członek robi beat ustami, drugi nawija, trzeci wykonuje adliby („JP2GMD”, „alleluja”, itp.) Tekst: https://teksciory.interia.pl/barka-barka-tekst-piosenki,t,542809.html', 'Nagranie zawiera fragment „Barki”, beat i minimum 8 wersów.', '', 'audio_link', null, true),
  ('quest-21', 'last-obelisk-s9c4m7x2', 'The Imperial March', 'Nagranie dźwiękowe', 'Nagrajcie motyw z Gwiezdnych Wojen, używając tylko swoich głosów (a cappella). Utwór: https://www.youtube.com/watch?v=-bzWSJG93P8', 'Nagranie zawiera kilkanaście - kilkadziesiąt sekund motywu, wyłącznie ludzkim głosem', '', 'audio_link', null, true);

insert into public.team_quest_progress (id, team_id, quest_id, status)
select teams.id || '-' || quests.id, teams.id, quests.id, 'not_started'
from public.teams
cross join public.quests;
