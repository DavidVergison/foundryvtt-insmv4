export const INS_MV = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
INS_MV.abilities = {
  str: 'INS_MV.Ability.Str.long',
  dex: 'INS_MV.Ability.Dex.long',
  con: 'INS_MV.Ability.Con.long',
  int: 'INS_MV.Ability.Int.long',
  wis: 'INS_MV.Ability.Wis.long',
  cha: 'INS_MV.Ability.Cha.long',
};

INS_MV.abilityAbbreviations = {
  str: 'INS_MV.Ability.Str.abbr',
  dex: 'INS_MV.Ability.Dex.abbr',
  con: 'INS_MV.Ability.Con.abbr',
  int: 'INS_MV.Ability.Int.abbr',
  wis: 'INS_MV.Ability.Wis.abbr',
  cha: 'INS_MV.Ability.Cha.abbr',
};

INS_MV.innate = [
  "SmoothTalk",
  "Combat",
  "Melee",
  "Defense",
  "Stealth",
  "Discussion",
  "Investigation",
  "Search",
  "Seduction",
  "Shooting",
]

INS_MV.speciality = [
  "Combat",
  "Shooting",
]

INS_MV.sheetDictionary = {
  "Caracteristiques": {
    "For": {"long": "Force"},
    "Agi": {"long": "Agilité"},
    "Per": {"long": "Perception"},
    "Vol": {"long": "Volonté"},
    "Pre": {"long": "Presence"},
    "Foi": {"long": "Foi"}
  },
  "Talents": {
    "Baratin": ["principale", "innée", "c:Pre"],
    "Combat": ["principale", "innée", "c:Agi", "spe"],
    "Corps à corps": ["principale", "innée", "c:Agi"],
    "Défense": ["principale", "innée", "c:Agi"],
    "Discrétion": ["principale", "innée", "c:Agi"],
    "Discussion": ["principale", "innée", "c:Vol"],
    "Enquête": ["principale", "innée", "c:Foi"],
    "Fouille": ["principale", "innée", "c:Per"],
    "Intrusion": ["principale"],
    "Médecine": ["principale"],
    "Séduction": ["principale", "innée", "c:Pre"],
    "Tir": ["principale", "innée", "c:Per", "spe"],    
    "Acrobatie": ["secondaire", "innée", "c:Agi"],
    "Aisance sociale": ["secondaire", "innée", "c:Pre"],
    "Art": ["secondaire", "c:Pre", "spe"],
    "Athlétisme": ["secondaire", "innée", "c:For"],
    "Conduite": ["secondaire", "c:Agi"],
    "Culture générale": ["secondaire", "spe"],
    "Hobby": ["secondaire", "spe"],
    "Informatique": ["secondaire"],
    "Intimidation": ["secondaire", "innée", "c:For"],
    "Langues": ["secondaire", "liste"],
    "Métier": ["secondaire", "spe"],
    "Navigation": ["secondaire"],
    "Pilotage": ["secondaire"],
    "Savoir Criminel": ["secondaire", "spe"],
    "Savoir d'Espion": ["secondaire", "spe"],
    "Savoir Militaire": ["secondaire", "spe"],
    "Savoir Occulte": ["secondaire", "spe"],
    "Science": ["secondaire", "spe"],
    "Survie": ["secondaire", "spe", "c:Per"],
    "Technique": ["secondaire", "spe"],
    "libre01": ["exotique", "spe"],
    "libre02": ["exotique", "spe"],
    "libre03": ["exotique", "spe"],
    "libre04": ["exotique", "spe"],
    "libre05": ["exotique", "spe"],
    "libre06": ["exotique", "spe"],
    "libre07": ["exotique", "spe"],
    "libre08": ["exotique", "spe"],
    "libre09": ["exotique", "liste"],
    "libre10": ["exotique", "liste"],
  },
}

INS_MV.NPCsheetDictionary = {
  "Talents": {
    "libre01": ["exotique"],
    "libre02": ["exotique"],
    "libre03": ["exotique"],
    "libre04": ["exotique"],
    "libre05": ["exotique"],
    "libre06": ["exotique", "spe"],
    "libre07": ["exotique", "spe"],
    "libre08": ["exotique", "spe"],
    "libre09": ["exotique", "spe"],
    "libre10": ["exotique", "spe"],
  }
}


INS_MV.DIFFICULTIES =  [
  { label: "Facile", bonus: 4 },
  { label: "Difficile", bonus: 0 },
  { label: "Très Difficile", bonus: -4 },
  { label: "Incroyable", bonus: -8 },
  { label: "Légendaire", bonus: -12 }
]

INS_MV.TUM = [
  { score: -2.5, chance: 0,    threshold: 0 , vs: -4.5 },
  { score: -2,   chance: 2.7,  threshold: 11, vs: -4 },
  { score: -1.5, chance: 5.5,  threshold: 12, vs: -3.5 },
  { score: -1,   chance: 8.3,  threshold: 13, vs: -3 },
  { score: -0.5, chance: 13.8, threshold: 25, vs: -2.5 },
  { score: 0,    chance: 19.4, threshold: 21, vs: -2 },
  { score: 0.5,  chance: 25,   threshold: 23, vs: -1.5 },
  { score: 1,    chance: 33.3, threshold: 26, vs: -1 },
  { score: 1.5,  chance: 41.6, threshold: 33, vs: -0.5 },
  { score: 2,    chance: 50,   threshold: 36, vs: 0 },
  { score: 2.5,  chance: 58.3, threshold: 43, vs: 0.5 },
  { score: 3,    chance: 66.6, threshold: 46, vs: 1 },
  { score: 3.5,  chance: 75,   threshold: 53, vs: 1.5 },
  { score: 4,    chance: 80.5, threshold: 55, vs: 2 },
  { score: 4.5,  chance: 86.1, threshold: 61, vs: 2.5 },
  { score: 5,    chance: 91.6, threshold: 63, vs: 3 },
  { score: 5.5,  chance: 94.4, threshold: 64, vs: 3.5 },
  { score: 6,    chance: 97.2, threshold: 65, vs: 4 },
  { score: 6.5,  chance: 100,  threshold: 66, vs: 4.5 }
]


INS_MV.talents = {
  main: getTalentsByType("principale"),
  secondary : getTalentsByType("secondaire"),
  exotic : getTalentsByType("exotique"),
  npc : getNPCTalents(),
}



function getTalentsByType(type) {
  if (!["principale", "secondaire", "exotique"].includes(type)) {
    throw new Error("Type invalide. Utilisez 'principale' ou 'secondaire'.");
  }
  return Object.fromEntries(
    Object.entries(INS_MV.sheetDictionary.Talents)
      .filter(([_, details]) => details.includes(type))
  );
};

function getNPCTalents() {
  return Object.fromEntries(
    Object.entries(INS_MV.NPCsheetDictionary.Talents)
  );
};