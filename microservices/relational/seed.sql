INSERT INTO characters (name, age, height_cm, weight_kg, nen_type, origin, image_url, notes) VALUES
('Gon Freecss', 12, 154, 49, 'Enhancer', 'Whale Island', 'https://static.wikia.nocookie.net/hunterxhunter/images/4/47/Gon_Design.png', 'Protagonista principal.'),
('Killua Zoldyck', 12, 158, 45, 'Transmuter', 'Familia Zoldyck', 'https://static.wikia.nocookie.net/hunterxhunter/images/2/29/Killua_Design.png', 'Heredero de una familia de asesinos.'),
('Kurapika', 17, 171, 59, 'Conjurer', 'Clan Kurta', 'https://static.wikia.nocookie.net/hunterxhunter/images/3/37/Kurapika_Design.png', 'Busca venganza por su clan.'),
('Leorio Paradinight', 19, 193, 85, 'Emitter', 'Desconocido', 'https://static.wikia.nocookie.net/hunterxhunter/images/f/fc/Leorio_Design.png', 'Aspirante a doctor.'),
('Biscuit Krueger', 57, 170, 55, 'Transmuter', 'Desconocido', 'https://static.wikia.nocookie.net/hunterxhunter/images/9/99/Biscuit_Krueger_Design.png', 'Maestra de Gon y Killua.'),
('Knuckle Bine', 22, 175, 75, 'Emitter', 'Asociación de Hunters', 'https://static.wikia.nocookie.net/hunterxhunter/images/a/a8/Knuckle_Bine_Design.png', 'Discípulo de Morel.')
ON CONFLICT DO NOTHING;
