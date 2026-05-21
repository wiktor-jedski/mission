insert into public.teams (id, name, pin_hash)
values
  ('team-ember', 'Druzyna Zarzewia', 'phase1-placeholder-pin-hash-ember'),
  ('team-iron', 'Druzyna Zelaza', 'phase1-placeholder-pin-hash-iron');

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
  ('quest-01', 'amber-vault-k9q4m2x7', 'Pieczec Bursztynu', 'Krotki opis misji 1.', 'Wykonaj misje 1 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'photo_link', 'Podpowiedz do misji 1.', true),
  ('quest-02', 'silent-forge-p6t8n3v1', 'Cicha Kuznia', 'Krotki opis misji 2.', 'Wykonaj misje 2 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'video_link', 'Podpowiedz do misji 2.', true),
  ('quest-03', 'moonlit-riddle-x2c7b9h5', 'Ksiezycowa Zagadka', 'Krotki opis misji 3.', 'Wykonaj misje 3 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'text_response', 'Podpowiedz do misji 3.', true),
  ('quest-04', 'broken-compass-r8w1s6d4', 'Zlamany Kompas', 'Krotki opis misji 4.', 'Wykonaj misje 4 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'photo_link', 'Podpowiedz do misji 4.', true),
  ('quest-05', 'river-oath-m5z9q2a8', 'Przysiega Rzeki', 'Krotki opis misji 5.', 'Wykonaj misje 5 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'audio_link', 'Podpowiedz do misji 5.', true),
  ('quest-06', 'storm-banner-v7d3k1p9', 'Sztandar Burzy', 'Krotki opis misji 6.', 'Wykonaj misje 6 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'photo_link', 'Podpowiedz do misji 6.', true),
  ('quest-07', 'hidden-crown-b4n8y6t2', 'Ukryta Korona', 'Krotki opis misji 7.', 'Wykonaj misje 7 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'video_link', 'Podpowiedz do misji 7.', true),
  ('quest-08', 'silver-goblet-f1h6r3w9', 'Srebrny Kielich', 'Krotki opis misji 8.', 'Wykonaj misje 8 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'photo_link', 'Podpowiedz do misji 8.', true),
  ('quest-09', 'ashen-library-z8p2m5c7', 'Popielna Biblioteka', 'Krotki opis misji 9.', 'Wykonaj misje 9 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'text_response', 'Podpowiedz do misji 9.', true),
  ('quest-10', 'candle-bridge-t3q7x1n6', 'Most Swiec', 'Krotki opis misji 10.', 'Wykonaj misje 10 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'photo_link', 'Podpowiedz do misji 10.', true),
  ('quest-11', 'wolfsbane-letter-h9v4d8s2', 'List Wilczego Ziela', 'Krotki opis misji 11.', 'Wykonaj misje 11 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'text_response', 'Podpowiedz do misji 11.', true),
  ('quest-12', 'obsidian-key-c6m1r9k4', 'Obsydianowy Klucz', 'Krotki opis misji 12.', 'Wykonaj misje 12 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'video_link', 'Podpowiedz do misji 12.', true),
  ('quest-13', 'mist-harbor-y2s8w5p1', 'Mglisty Port', 'Krotki opis misji 13.', 'Wykonaj misje 13 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'audio_link', 'Podpowiedz do misji 13.', true),
  ('quest-14', 'golden-antler-n7b3x6q8', 'Zloty Rog', 'Krotki opis misji 14.', 'Wykonaj misje 14 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'photo_link', 'Podpowiedz do misji 14.', true),
  ('quest-15', 'ember-choir-d5k9t2v7', 'Chor Zarzewia', 'Krotki opis misji 15.', 'Wykonaj misje 15 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'audio_link', 'Podpowiedz do misji 15.', true),
  ('quest-16', 'frost-tower-q1r6c8m3', 'Wieza Mrozu', 'Krotki opis misji 16.', 'Wykonaj misje 16 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'photo_link', 'Podpowiedz do misji 16.', true),
  ('quest-17', 'runic-kitchen-w4p7z2h8', 'Runiczna Kuchnia', 'Krotki opis misji 17.', 'Wykonaj misje 17 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'video_link', 'Podpowiedz do misji 17.', true),
  ('quest-18', 'crimson-lantern-m8x3n6b1', 'Karmazynowa Latarnia', 'Krotki opis misji 18.', 'Wykonaj misje 18 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'photo_link', 'Podpowiedz do misji 18.', true),
  ('quest-19', 'starlit-ledger-k2d9v5s7', 'Gwiazdowy Rejestr', 'Krotki opis misji 19.', 'Wykonaj misje 19 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'text_response', 'Podpowiedz do misji 19.', true),
  ('quest-20', 'ivory-drum-p5h1q8r4', 'Kosciowy Beben', 'Krotki opis misji 20.', 'Wykonaj misje 20 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'audio_link', 'Podpowiedz do misji 20.', true),
  ('quest-21', 'last-obelisk-s9c4m7x2', 'Ostatni Obelisk', 'Krotki opis misji 21.', 'Wykonaj misje 21 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'photo_link', 'Podpowiedz do misji 21.', true),
  ('quest-22', 'shadow-market-b6v2t9d5', 'Targ Cieni', 'Krotki opis misji 22.', 'Wykonaj misje 22 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'video_link', 'Podpowiedz do misji 22.', true),
  ('quest-23', 'copper-mirror-r3y8k1p6', 'Miedziane Lustro', 'Krotki opis misji 23.', 'Wykonaj misje 23 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'photo_link', 'Podpowiedz do misji 23.', true),
  ('quest-24', 'ancient-echo-x7n5h2w9', 'Pradawne Echo', 'Krotki opis misji 24.', 'Wykonaj misje 24 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'audio_link', 'Podpowiedz do misji 24.', true),
  ('quest-25', 'final-sigil-l4q9c6z3', 'Ostatni Znak', 'Krotki opis misji 25.', 'Wykonaj misje 25 i przygotuj dowod.', 'Dowod musi pokazac ukonczone zadanie.', 'Bez szkody, bez presji i bez przeszkadzania sasiadom.', 'text_response', 'Podpowiedz do misji 25.', true);

insert into public.team_quest_progress (id, team_id, quest_id, status)
select teams.id || '-' || quests.id, teams.id, quests.id, 'not_started'
from public.teams
cross join public.quests;
