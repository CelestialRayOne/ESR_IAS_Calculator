
const OUTPUT = document.getElementById("output");

const CONTAINER = {
	WEREFORM: document.getElementById("wereformContainer"),
	IS_ONE_HANDED: document.getElementById("isOneHandedContainer"),
	SECONDARY_WEAPON: document.getElementById("secondaryWeaponContainer"),
	BURST_OF_SPEED: document.getElementById("burstOfSpeedContainer"),
	WEREWOLF: document.getElementById("werewolfContainer"),
	MAUL: document.getElementById("maulContainer"),
	FRENZY: document.getElementById("frenzyContainer")
};

const SELECT = {
	CHARACTER: document.getElementById("characterSelect"),
	WEREFORM: document.getElementById("wereformSelect"),
	SKILL: document.getElementById("skillSelect"),
	PRIMARY_WEAPON: document.getElementById("primaryWeaponSelect"),
	SECONDARY_WEAPON: document.getElementById("secondaryWeaponSelect")
};

const NUMBER = {
    PRIMARY_WEAPON_IAS: document.getElementById("primaryWeaponIAS"),
	SECONDARY_WEAPON_IAS: document.getElementById("secondaryWeaponIAS"),
	IAS: document.getElementById("IAS"),
	FANATICISM: document.getElementById("fanaticismLevel"),
	BURST_OF_SPEED: document.getElementById("burstOfSpeedLevel"),
	WEREWOLF: document.getElementById("werewolfLevel"),
	MAUL: document.getElementById("maulLevel"),
	FRENZY: document.getElementById("frenzyLevel"),
	HOLY_FREEZE: document.getElementById("holyFreezeLevel"),
	SLOWED_BY: document.getElementById("slowedByLevel")
};

const CHECKBOX = {
    IS_ONE_HANDED: document.getElementById("isOneHanded"),
	DECREPIFY: document.getElementById("decrepify"),
	CHILLED: document.getElementById("chilled")
};

class Character {

	constructor(name, token, isPlayer, weaponPredicate) {
		this.name = name;
		this.token = token;
		this.isPlayer = isPlayer;
		this.weaponPredicate = weaponPredicate;
	}

	canUseWeapon(weapon, isPrimary) {
		this.weaponPredicate(weapon, isPrimary);
	}

}

const CHAR_MAP = new Map();
const CHAR = {
    AMAZON: addCharacter(new Character("Amazon", "AM", true)),
    ASSASSIN: addCharacter(new Character("Assassin", "AI", true)),
    BARBARIAN: addCharacter(new Character("Barbarian", "BA", true)),
    DRUID: addCharacter(new Character("Druid", "DZ", true)),
    NECROMANCER: addCharacter(new Character("Necromancer", "NE", true)),
    PALADIN: addCharacter(new Character("Paladin", "PA", true)),
    SORCERESS: addCharacter(new Character("Sorceress", "SO", true)),
	// mercs
    ROGUE_SCOUT: addCharacter(new Character("Rogue Scout", "RG", false)),
    TOWN_GUARD: addCharacter(new Character("Town Guard", "GU", false)),
	IRON_WOLF: addCharacter(new Character("Iron Wolf", "IW", false)),
    BARBARIAN_MERCENARY: addCharacter(new Character("Barbarian", "0A", false)),
	// code utility only
	PLAYER: "P",
	ALL: true
};
function addCharacter(char) { CHAR_MAP.set(char.name, char); return char; }
export function getCharacter(token) { return CHAR_MAP.get(token); }

const MORPH = {
    HUMAN: "H",
    WEREBEAR: "TG",
    WEREWOLF: "40",
	// code utility only
	ALL: true
};

const OPTION = {
	WEREFORM_WEREWOLF: getOption(SELECT.WEREFORM, MORPH.WEREWOLF)
};

function getOption(select, value) {
	for (let i = 0; i < select.options.length; i++) {
		let option = select.options[i];
		if (option.value == value) return option;
	}
	return 0;
}

const BUTTON = {
    GENERATE_LINK: document.getElementById("generateLink")
};

const OTHER = {

	MAX_EIAS: 75, // for a brief period of D2R, this limit did not exist. rip bugged ias frames :(
	MIN_EIAS: -85,	
	MAX_EIAS_WEREFORMS: 150,
	MAX_IAS_ACCELERATION_WEAPON: 60,
	MAX_IAS_ACCELERATION_CHARACTER: 88,
	MAX_IAS_ACCELERATION_CHARACTER_TWO_HANDED: 83,
	MAX_IAS_ACCELERATION_MERCENARY: 78,
	MAX_IAS_WEAPON: 120

};

const LINK_SEPARATOR = '-';

export class DataParser {

	constructor(data) {
		this.data = [...data];
		this.index = 0;
	}

	readToken() {
		let string = "";
		while (this.index < this.data.length && this.data[this.index] != LINK_SEPARATOR) {
			string += this.data[this.index++];
		}
		this.index++;
		return string;
	}

	readInt() {
		return parseInt(this.readToken());
	}

	readBoolean() {
		return !!this.readInt();
	}

	readString() {
		return this.readToken();
	}

	isLetter(c) {
		return c.toLowerCase() != c.toUpperCase();
	}

}

class Weapon {

	constructor(name, WSM, weaponClass, itemClass, maxSockets, usedBy) {
		this.name = name;
		this.WSM = WSM;
		this.weaponClass = weaponClass;
		this.itemClass = itemClass;
		this.maxSockets = maxSockets;
		this.usedBy = usedBy;
	}

	canBeThrown() {
		return this.itemClass == "THROWING" || this.itemClass == "JAVELIN";
	}

	canBeUsedBy(char) {
		if (Array.isArray(this.usedBy)) {
			this.usedBy.forEach(element => {
				if ((element == CHAR.PLAYER && char.isPlayer) || element == char) return true;
			});
			return false;
		}
		return (this.usedBy == CHAR.PLAYER && char.isPlayer) || this.usedBy == char;
	}

}

class AttackSpeedSkill {

	constructor(input, min, factor, max, predicate) {
		this.input = input;
		this.min = min;
		this.factor = factor;
		this.max = max;
		this.predicate = predicate;
		this.reverse = new Map();
		for (let level = 60; level >= 0; level--) {
			this.reverse.set(this.getEIASFromLevel(level), level);
		}
	}

	calculate(character, wereform) {
		if (this.predicate != null && !this.predicate(character, wereform)) return 0;
		let level = parseInt(this.input.value);
		if (this.min == -1) return level == 0 ? 0 : this.factor * (parseInt(level / 2) + 3); 
		return level == 0 ? 0 : Math.min(this.min + parseInt(this.factor * parseInt((110 * level) / (level + 6)) / 100), this.max);
	}

	getEIASFromLevel(level) {
		if (this.min == -1) return level == 0 ? 0 : this.factor * (parseInt(level / 2) + 3); // hardcoded specifically for maul
		if (level == 0) return 0;
		return Math.min(this.min + parseInt(this.factor * parseInt((110 * level) / (level + 6)) / 100), this.max);
	}

	getLevelFromEIAS(EIAS) { // this probably doesn't work for holy freeze, but the interface never uses this with holy freeze
		let lastLevel = 61;
		for (const [levelEIAS, level] of this.reverse) {
			if (EIAS > levelEIAS) return lastLevel;
			lastLevel = level;
		}
		return 0;
	}

}

const AS_SKILL = {
    FANATICISM: new AttackSpeedSkill(NUMBER.FANATICISM, 10, 30, 40),
	BURST_OF_SPEED: new AttackSpeedSkill(NUMBER.BURST_OF_SPEED, 15, 45, 60, (character, _wereform) => character == CHAR.ASSASSIN),
	WEREWOLF: new AttackSpeedSkill(NUMBER.WEREWOLF, 10, 70, 80, (_character, wereform) => wereform == WF.WEREWOLF),
	MAUL: new AttackSpeedSkill(NUMBER.MAUL, -1, 3, 99, (_character, wereform) => wereform == WF.WEREBEAR),
	FRENZY: new AttackSpeedSkill(NUMBER.FRENZY, 0, 50, 50, (character, _wereform) => character == CHAR.BARBARIAN || character == CHAR.BARBARIAN_MERCENARY),
	HOLY_FREEZE: new AttackSpeedSkill(NUMBER.HOLY_FREEZE, 25, 35, 50) // -50 cap cuz chill effectiveness
};

const ANIM_DATA = {
	// [model code]{2}[animation mode]{2}[weapon class]{3}: [framesPerDirection, action frame, starting frame, animation speed]
	// 0A - Act 5 Mercenary - originally calculating with only 16 FPD, which one is correct?
	// A1 - normal attack animation 1
	"0AA11HS": [17, 6, 0, 256],
	"0AA12HS": [16, 5, 0, 256],
	// A2 - normal attack animation 2
	"0AA21HS": [17, 9, 0, 256],
	"0AA22HS": [16, 6, 0, 256],
	// 40 - Werewolf
	// A1 - normal attack animation 1
	"40A1HTH": [13, 7, 0, 256],
	// A2 - normal attack animation 2
	"40A2HTH": [13, 7, 0, 288],
	// S3 - bite animation
	"40S3HTH": [10, 6, 0, 240],
	// AI - Assassin
	// A1 - normal attack animation 1
	AIA11HS: [15, 7, 0, 256],		// one handed swinging
	AIA11HT: [15, 7, 0, 256],		// one handed thrusting
	AIA12HS: [23, 11, 0, 368],		// two handed swords
	AIA12HT: [23, 10, 0, 352],		// two handed thrusting
	AIA1BOW: [16, 7, 0, 272],		// bows
	AIA1HT1: [11, 6, 0, 208],		// one claw
	AIA1HT2: [11, 6, 0, 208],		// two claws
	AIA1HTH: [11, 6, 0, 208],		// unarmed
	AIA1STF: [19, 9, 0, 304],		// two handed weapons (but not swords)
	AIA1XBW: [21, 10, 0, 256],		// crossbows
	// A2 - normal attack animation 2 (different for HTH, HT1, and HT2)
	AIA21HS: [15, 7, 0, 288],		// one handed swinging
	AIA21HT: [15, 7, 0, 288],		// one handed thrusting
	AIA22HS: [18, 11, 0, 320],		// two handed swords
	AIA22HT: [18, 10, 0, 320],		// two handed thrusting
	AIA2HT1: [12, 6, 0, 208],		// one claw: 208->227 in 2.5
	AIA2HT2: [12, 6, 0, 208],		// two claws: 208->227 in 2.5
	AIA2HTH: [12, 6, 0, 208],		// unarmed
	AIA2STF: [19, 9, 0, 304],		// two handed weapons (but not swords)
	// KK - kicking animation
	AIKK1HS: [13, 4, 0, 256],		// one handed swinging
	AIKK1HT: [13, 4, 0, 256],		// one handed thrusting
	AIKK2HS: [13, 4, 0, 256],		// two handed swords
	AIKK2HT: [13, 4, 0, 256],		// two handed thrusting
	AIKKBOW: [13, 4, 0, 256],		// bows
	AIKKHT1: [13, 4, 0, 256],		// one claw
	AIKKHT2: [13, 4, 0, 256],		// two claws
	AIKKHTH: [13, 4, 0, 256],		// unarmed
	AIKKSTF: [13, 4, 0, 256],		// two handed weapons (but not swords)
	AIKKXBW: [13, 4, 0, 256],		// crossbows
	// S2 - trap laying animation
	AIS21HS: [8, 4, 0, 128],
	AIS21HT: [8, 4, 0, 128],
	AIS22HS: [8, 4, 0, 128],
	AIS22HT: [8, 4, 0, 128],
	AIS2BOW: [8, 4, 0, 128],
	AIS2HT1: [8, 4, 0, 128],
	AIS2HT2: [8, 4, 0, 128],
	AIS2HTH: [8, 4, 0, 128],
	AIS2STF: [8, 4, 0, 128],
	AIS2XBW: [8, 4, 0, 128],
	// S4 - second weapon melee animation while dual wielding for Assassin
	AIS4HT2: [12, 6, 0, 208],		// two claws: 208->227 in 2.5
	// TH - throwing animation
	AITH1HS: [16, 7, 0, 256],		// one handed swinging
	AITH1HT: [16, 7, 0, 256],		// one handed thrusting
	// AM - Amazon
	// A1 - normal attack animation 1
	AMA11HS: [16, 10, 2, 239],		// one handed swinging
	AMA11HT: [15, 9, 2, 222],		// one handed thrusting
	AMA12HS: [20, 12, 2, 288],		// two handed swords
	AMA12HT: [18, 11, 2, 256],		// two handed thrusting
	AMA1BOW: [14, 6, 0, 256],		// bows
	AMA1HTH: [13, 8, 1, 232],		// unarmed
	AMA1STF: [20, 12, 2, 288],		// two handed weapons (but not swords)
	AMA1XBW: [20, 9, 0, 256],		// crossbows
	// A2 - normal attack animation 2 (identical to A1)
	AMA21HS: [15, 10, 2, 288],		// one handed swinging
	AMA21HT: [15, 9, 2, 288],		// one handed thrusting
	AMA22HS: [18, 12, 2, 320],		// two handed swords
	AMA22HT: [18, 11, 2, 320],		// two handed thrusting
	AMA2STF: [20, 12, 2, 288],		// two handed weapons (but not swords)
	// KK - kicking animation
	AMKK1HS: [12, 5, 0, 256],		// one handed swinging
	AMKK1HT: [12, 5, 0, 256],		// one handed thrusting
	AMKK2HS: [12, 5, 0, 256],		// two handed swords
	AMKK2HT: [12, 5, 0, 256],		// two handed thrusting
	AMKKBOW: [12, 5, 0, 256],		// bows
	AMKKHTH: [12, 5, 0, 256],		// unarmed
	AMKKSTF: [12, 5, 0, 256],		// two handed weapons (but not swords)
	AMKKXBW: [12, 5, 0, 256],		// crossbows
	// S1 - dodge animation (action frame omitted because not relevant and not all animations had an action frame)
	AMS11HS: [9, 0, 0, 4096],		// one handed swinging
	AMS11HT: [9, 0, 0, 4096],		// one handed thrusting
	AMS12HS: [9, 0, 0, 4096],		// two handed swords
	AMS12HT: [9, 0, 0, 4096],		// two handed thrusting
	AMS1BOW: [9, 0, 0, 4096],		// bows
	AMS1HTH: [9, 0, 0, 4096],		// unarmed
	AMS1STF: [9, 0, 0, 4096],		// two handed weapons (but not swords)
	AMS1XBW: [9, 0, 0, 4096],		// crossbows
	// TH - throwing animation
	AMTH1HS: [16, 9, 0, 256],		// one handed swinging
	AMTH1HT: [16, 9, 0, 256],		// one handed thrusting
	//AMTHHTH: [16, 9, 0, 256],		// ?
	// BA - Barbarian
	// A1 - normal attack animation 1
	BAA11HS: [16, 7, 0, 256],		// one handed swinging
	BAA11HT: [16, 7, 0, 256],		// one handed thrusting
	BAA11JS: [16, 7, 0, 256], 		// glove-side hand thrusting, boot-side hand swinging
	BAA11JT: [16, 7, 0, 256],		// two thrusting weapons
	BAA11SS: [16, 7, 0, 256], 		// two swinging weapons
	BAA11ST: [16, 7, 0, 256], 		// glove-side hand swinging, boot-side hand thrusting
	BAA12HS: [18, 8, 0, 288],		// two handed swords
	BAA12HT: [19, 9, 0, 304],		// two handed thrusting
	BAA1BOW: [15, 7, 0, 256],		// bows
	BAA1HTH: [12, 6, 0, 228],		// unarmed
	BAA1STF: [19, 9, 0, 304],		// two handed weapons (but not swords)
	BAA1XBW: [20, 10, 0, 256],		// crossbows
	// A2 - normal attack animation 2 (identical)
	BAA11HS: [16, 7, 0, 256],		// one handed swinging
	BAA11HT: [16, 7, 0, 256],		// one handed thrusting
	BAA11JS: [16, 7, 0, 256], 		// glove-side hand thrusting, boot-side hand swinging
	BAA11JT: [16, 7, 0, 256],		// two thrusting weapons
	BAA11SS: [16, 7, 0, 256], 		// two swinging weapons
	BAA11ST: [16, 7, 0, 256], 		// glove-side hand swinging, boot-side hand thrusting
	BAA12HS: [18, 8, 0, 288],		// two handed swords
	BAA12HT: [19, 9, 0, 304],		// two handed thrusting
	BAA1HTH: [12, 6, 0, 228],		// unarmed
	BAA1STF: [19, 9, 0, 304],		// two handed weapons (but not swords)
	// KK - kicking animation
	BAKK1HS: [12, 4, 0, 256],		// one handed swinging
	BAKK1HT: [12, 4, 0, 256],		// one handed thrusting
	BAKK1JS: [12, 4, 0, 256], 		// glove-side hand thrusting, boot-side hand swinging
	BAKK1JT: [12, 4, 0, 256],		// two thrusting weapons
	BAKK1SS: [12, 4, 0, 256], 		// two swinging weapons
	BAKK1ST: [12, 4, 0, 256], 		// glove-side hand swinging, boot-side hand thrusting
	BAKK2HS: [12, 4, 0, 256],		// two handed swords
	BAKK2HT: [12, 4, 0, 256],		// two handed thrusting
	BAKKBOW: [12, 4, 0, 256],		// bows
	BAKKHTH: [12, 4, 0, 256],		// unarmed
	BAKKSTF: [12, 4, 0, 256],		// two handed weapons (but not swords)
	BAKKXBW: [12, 4, 0, 256],		// crossbows
	// S3 - second weapon melee animation while dual wielding for Barbarian
	BAS31JS: [12, 8, 0, 256],		// glove-side hand thrusting, boot-side hand swinging
	BAS31JT: [12, 8, 0, 256],		// two thrusting weapons
	BAS31SS: [12, 7, 0, 256], 		// two swinging weapons
	BAS31ST: [12, 7, 0, 256], 		// glove-side hand swinging, boot-side hand thrusting
	// S4 - second weapon throw animation while dual wielding for Barbarian
	BAS41JS: [16, 8, 0, 256],		// glove-side hand thrusting, boot-side hand swinging
	BAS41JT: [16, 8, 0, 256],		// two thrusting weapons
	BAS41SS: [16, 9, 0, 256], 		// two swinging weapons
	BAS41ST: [16, 9, 0, 256], 		// glove-side hand swinging, boot-side hand thrusting
	// TH - throwing animation
	BATH1HS: [16, 8, 0, 256],		// one handed swinging
	BATH1HT: [16, 8, 0, 256],		// one handed thrusting
	BATH1JS: [16, 8, 0, 256],		// glove-side hand thrusting, boot-side hand swinging
	BATH1JT: [16, 8, 0, 256],		// two thrusting weapons
	BATH1SS: [16, 8, 0, 256],		// two swinging weapons
	BATH1ST: [16, 8, 0, 256],		// glove-side hand swinging, boot-side hand thrusting
	//BATHHTH: [16, 8, 0, 256],		// ?
	// DZ - Druid
	// A1 - normal attack animation 1
	DZA11HS: [19, 9, 0, 304],		// one handed swinging
	DZA11HT: [19, 8, 0, 304],		// one handed thrusting
	DZA12HS: [21, 10, 0, 336],		// two handed swords
	DZA12HT: [23, 9, 0, 328],		// two handed thrusting
	DZA1BOW: [16, 8, 0, 272],		// bows
	DZA1HTH: [16, 8, 0, 288],		// unarmed
	DZA1STF: [17, 9, 0, 272],		// two handed weapons (but not swords)
	DZA1XBW: [20, 10, 0, 256],		// crossbows
	// A2 - normal attack animation 2 (identical to A1)
	DZA21HS: [15, 9, 0, 288],		// one handed swinging
	DZA21HT: [15, 8, 0, 288],		// one handed thrusting
	DZA22HS: [18, 10, 0, 320],		// two handed swords
	DZA22HT: [18, 9, 0, 320],		// two handed thrusting
	DZA2STF: [17, 9, 0, 272],		// two handed weapons (but not swords)
	// KK - kicking animation
	DZKK1HS: [12, 5, 0, 224],		// one handed swinging
	DZKK1HT: [12, 5, 0, 256],		// one handed thrusting
	DZKK2HS: [12, 5, 0, 224],		// two handed swords
	DZKK2HT: [12, 5, 0, 256],		// two handed thrusting
	DZKKBOW: [12, 5, 0, 256],		// bows
	DZKKHTH: [12, 5, 0, 256],		// unarmed
	DZKKSTF: [12, 5, 0, 256],		// two handed weapons (but not swords)
	DZKKXBW: [12, 5, 0, 256],		// crossbows
	// TH - throwing animation
	DZTH1HS: [18, 8, 0, 288],		// one handed swinging
	DZTH1HT: [18, 8, 0, 288],		// one handed thrusting
	//DZTHHTH: [18, 9, 0, 288],		// ?
	// GU - Act 2 Mercenary
	// A1 - normal attack animation 1
	GUA1HTH: [16, 11, 0, 256],
	// IW - Act 3 Mercenary
	// A1 - normal attack animation 1
	IWA11HS: [15, 6, 0, 256],
	// NE - Necromancer
	// A1 - normal attack animation 1
	NEA11HS: [19, 9, 0, 304],		// one handed swinging
	NEA11HT: [19, 9, 0, 304],		// one handed thrusting
	NEA12HS: [23, 11, 0, 368],		// two handed swords
	NEA12HT: [24, 10, 0, 360],		// two handed thrusting
	NEA1BOW: [18, 9, 0, 304],		// bows
	NEA1HTH: [15, 8, 0, 272],		// unarmed
	NEA1STF: [20, 11, 0, 320],		// two handed weapons (but not swords)
	NEA1XBW: [20, 11, 0, 264],		// crossbows
	// A2 - normal attack animation 2 (identical to A1)
	NEA21HS: [15, 9, 0, 288],		// one handed swinging
	NEA21HT: [15, 9, 0, 288],		// one handed thrusting
	NEA22HS: [18, 11, 0, 320],		// two handed swords
	NEA22HT: [18, 10, 0, 320],		// two handed thrusting
	NEA2HTH: [15, 8, 0, 272],		// unarmed
	NEA2STF: [20, 11, 0, 320],		// two handed weapons (but not swords)
	// KK - kicking animation
	NEKK1HS: [12, 6, 0, 256],		// one handed swinging
	NEKK1HT: [12, 6, 0, 256],		// one handed thrusting
	NEKK2HS: [12, 6, 0, 256],		// two handed swords
	NEKK2HT: [12, 6, 0, 256],		// two handed thrusting
	NEKKBOW: [12, 6, 0, 256],		// bows
	NEKKHTH: [12, 6, 0, 256],		// unarmed
	NEKKSTF: [12, 6, 0, 256],		// two handed weapons (but not swords)
	NEKKXBW: [12, 6, 0, 256],		// crossbows
	// TH - throwing animation
	NETH1HS: [20, 10, 0, 320],		// one handed swinging
	NETH1HT: [20, 10, 0, 320],		// one handed thrusting
	//NETHHTH: [20, 10, 0, 320],		// ?
	// PA - Paladin
	// A1 - normal attack animation 1
	PAA11HS: [15, 7, 0, 256],		// one handed swinging
	PAA11HT: [17, 8, 0, 272],		// one handed thrusting
	PAA12HS: [18, 8, 0, 288],		// two handed swords
	PAA12HT: [20, 8, 0, 294],		// two handed thrusting
	PAA1BOW: [16, 8, 0, 272],		// bows
	PAA1HTH: [14, 7, 0, 264],		// unarmed
	PAA1STF: [18, 9, 0, 288],		// two handed weapons (but not swords)
	PAA1XBW: [20, 10, 0, 256],		// crossbows
	// A2 - normal attack animation 2 (2HS is different)
	PAA21HS: [15, 7, 0, 288],		// one handed swinging
	PAA21HT: [15, 8, 0, 288],		// one handed thrusting
	PAA22HS: [18, 8, 0, 320],		// two handed swords
	PAA22HT: [18, 8, 0, 320],		// two handed thrusting
	PAA2HTH: [14, 7, 0, 264],		// unarmed
	PAA2STF: [18, 9, 0, 288],		// two handed weapons (but not swords)
	// KK - kicking animation
	PAKK1HS: [12, 5, 0, 256],		// one handed swinging
	PAKK1HT: [12, 5, 0, 256],		// one handed thrusting
	PAKK2HS: [12, 5, 0, 256],		// two handed swords
	PAKK2HT: [12, 5, 0, 256],		// two handed thrusting
	PAKKBOW: [12, 5, 0, 256],		// bows
	PAKKHTH: [12, 5, 0, 256],		// unarmed
	PAKKSTF: [12, 5, 0, 256],		// two handed weapons (but not swords)
	PAKKXBW: [12, 5, 0, 256],		// crossbows
	// S1 - smite
	PAS11HS: [12, 7, 0, 256],		// one handed swinging
	PAS11HT: [12, 7, 0, 256],		// one handed thrusting
	PAS1HTH: [12, 7, 0, 256],		// unarmed
	// TH - throwing animation
	PATH1HS: [16, 8, 0, 256],		// one handed swinging
	PATH1HT: [16, 8, 0, 256],		// one handed thrusting
	//PATHHTH: [12, 6, 0, 256],		// ?
	// RG - Act 1 Mercenary
	// A1 - normal attack animation 1
	RGA1HTH: [15, 6, 0, 256],
	// SO - Sorceress
	// A1 - normal attack animation 1
	SOA11HS: [20, 12, 2, 288],		// one handed swinging
	SOA11HT: [19, 11, 2, 272],		// one handed thrusting
	SOA12HS: [24, 14, 2, 352],		// two handed swords
	SOA12HT: [23, 13, 2, 336],		// two handed thrusting
	SOA1BOW: [17, 9, 0, 288],		// bows
	SOA1HTH: [7, 9, 1, 150],		// unarmed
	SOA1STF: [18, 11, 2, 256],		// two handed weapons (but not swords)
	SOA1XBW: [20, 11, 0, 264],		// crossbows
	// A2 - normal attack animation 2 (identical to A1)
	AMA21HS: [15, 10, 2, 288],		// one handed swinging
	AMA21HT: [15, 9, 2, 288],		// one handed thrusting
	AMA22HS: [18, 12, 2, 320],		// two handed swords
	AMA22HT: [18, 11, 2, 320],		// two handed thrusting
	AMA2STF: [20, 12, 2, 288],		// two handed weapons (but not swords)
	// KK - kicking animation
	SOKK1HS: [12, 5, 0, 256],		// one handed swinging
	SOKK1HT: [12, 5, 0, 256],		// one handed thrusting
	SOKK2HS: [12, 5, 0, 256],		// two handed swords
	SOKK2HT: [12, 5, 0, 256],		// two handed thrusting
	SOKKBOW: [12, 5, 0, 256],		// bows
	SOKKHTH: [12, 5, 0, 256],		// unarmed
	SOKKSTF: [12, 5, 0, 256],		// two handed weapons (but not swords)
	SOKKXBW: [12, 5, 0, 256],		// crossbows
	// TH - throwing animation
	SOTH1HS: [20, 9, 0, 302],		// one handed swinging
	SOTH1HT: [20, 9, 0, 302],		// one handed thrusting
	//AMTHHTH: [16, 9, 0, 256],		// ?
	// TG - Werebear
	// A1 - normal attack animation 1
	TGA1HTH: [12, 7, 0, 224],
	// A2 - normal attack animation 2 (identical to A1)
	TGA2HTH: [13, 7, 0, 288],
	// S3 - bite animation
	TGS3HTH: [10, 6, 0, 208]
};

export class Skill {

	constructor(name, usedByChar, usedByMorph, animationMode) {
		this.name = name;
		this.usedByChar = usedByChar;
		this.usedByMorph = usedByMorph;
		this.animationMode = animationMode;
	}

	canBeUsedBy(char, morph) {
		if (Array.isArray(this.usedByChar)) {
			let found = false;
			this.usedByChar.forEach(element => {
				if (element == char) {
					found = true;
					return;
				}
			});
			if (!found) return false;
		} else if (this.usedByChar != CHAR.ALL
			&& ((this.usedByChar == CHAR.PLAYER && char.isPlayer) || this.usedByChar != char)) return false;
		if (Array.isArray(this.usedByMorph)) {
			let found = false;
			this.usedByMorph.forEach(element => {
				if (element == morph) {
					found = true;
					return;
				}
			});
			if (!found) return false;
		} else if (this.usedByMorph != MORPH.ALL && this.usedByMorph != morph) return false;
		return true;
	}

}

export class SequenceSkill extends Skill {

	constructor(name, usedByChar, usedByMorph, frameDatas) {
		super(name, usedByChar, usedByMorph, "SQ");
		this.frameDatas = frameDatas;
	}

}

export class RollbackSkill extends Skill {

	constructor(name, usedByChar, usedByMorph, animationMode, hits) {
		super(name, usedByChar, usedByMorph, animationMode);
		this.hits = hits;
	}

}

const SKILL_MAP = new Map();
const SKILL = {
	ATTACK: addSkill(new Skill("Attack", CHAR.ALL, MORPH.ALL, ["A1", "A2"])),
	THROW: addSkill(new Skill("Throw", CHAR.PLAYER, MORPH.HUMAN, "TH")),
	KICK: addSkill(new Skill("Kick", CHAR.PLAYER, MORPH.HUMAN, "KK")),

	DODGE: addSkill(new Skill("Dodge", CHAR.AMAZON, MORPH.ALL, "S1")),
	IMPALE: addSkill(new SequenceSkill("Impale", CHAR.AMAZON, MORPH.HUMAN,
	{ 
		"1HT": [21, 13, 0, 256],
		"2HT": [24, 15, 0, 256]
	})),
	JAB: addSkill(new SequenceSkill("Jab", [CHAR.AMAZON, CHAR.TOWN_GUARD], MORPH.HUMAN,
	{
		"1HT": [18, [3, 9, 15], 0, 256],
		"2HT": [21, [3, 10, 17], 0, 256]
	})),
	STRAFE: addSkill(new RollbackSkill("Strafe", CHAR.AMAZON, MORPH.HUMAN, "A1", 10)),
	FEND: addSkill(new RollbackSkill("Fend", CHAR.AMAZON, MORPH.HUMAN, "A1", 12)),

	TIGER_STRIKE: addSkill(new Skill("Tiger Strike", CHAR.ASSASSIN, MORPH.HUMAN, "A1")),
	COBRA_STRIKE: addSkill(new Skill("Cobra Strike", CHAR.ASSASSIN, MORPH.HUMAN, "A1")),
	PHOENIX_STRIKE: addSkill(new Skill("Phoenix Strike", CHAR.ASSASSIN, MORPH.HUMAN, "A1")),
	FISTS_OF_FIRE: addSkill(new SequenceSkill("Fists of Fire", CHAR.ASSASSIN, MORPH.HUMAN,
	{
		HT1: [12, 6, 0, 256],
		HT2: [16, [6, 10], 0, 256]
	})),
	CLAWS_OF_THUNDER: addSkill(new SequenceSkill("Claws of Thunder", CHAR.ASSASSIN, MORPH.HUMAN,
	{
		HT1: [12, 6, 0, 256],
		HT2: [16, [6, 10], 0, 256]
	})),
	BLADES_OF_ICE: addSkill(new SequenceSkill("Blades of Ice", CHAR.ASSASSIN, MORPH.HUMAN,
	{
		HT1: [12, 6, 0, 256],
		HT2: [16, [6, 10], 0, 256]
	})),
	DRAGON_CLAW: addSkill(new SequenceSkill("Dragon Claw", CHAR.ASSASSIN, MORPH.HUMAN,
	{
		HT1: [12, 6, 0, 256],
		HT2: [16, [6, 10], 0, 256]
	})),
	DRAGON_TAIL: addSkill(new Skill("Dragon Tail", CHAR.ASSASSIN, MORPH.HUMAN, "KK")),
	DRAGON_TALON: addSkill(new RollbackSkill("Dragon Talon", CHAR.ASSASSIN, MORPH.HUMAN, "KK", 5)),
	LAYING_TRAPS: addSkill(new Skill("Laying Traps", CHAR.ASSASSIN, MORPH.HUMAN, "S2")),

	DOUBLE_SWING: addSkill(new SequenceSkill("Double Swing", CHAR.BARBARIAN, MORPH.HUMAN, [17, [4, 9], 0, 256])),
	FRENZY: addSkill(new SequenceSkill("Frenzy", [CHAR.BARBARIAN, CHAR.BARBARIAN_MERCENARY], MORPH.HUMAN, [17, [4, 9], 0, 256])),
	// TODO taunt for a5 merc
	DOUBLE_THROW: addSkill(new SequenceSkill("Double Throw", CHAR.BARBARIAN, MORPH.HUMAN, [12, [5, 9], 0, 256])),
	WHIRLWIND: addSkill(new Skill("Whirlwind", [CHAR.BARBARIAN, CHAR.ASSASSIN], MORPH.HUMAN, "A1")), // TODO
	CONCENTRATE: addSkill(new Skill("Concentrate", CHAR.BARBARIAN, MORPH.HUMAN, "A1")),
	BERSERK: addSkill(new Skill("Berserk", CHAR.BARBARIAN, MORPH.HUMAN, "A1")),
	BASH: addSkill(new Skill("Bash", [CHAR.BARBARIAN, CHAR.BARBARIAN_MERCENARY], MORPH.HUMAN, "A1")),
	STUN: addSkill(new Skill("Stun", CHAR.BARBARIAN, MORPH.HUMAN, "A1")),

	FERAL_RAGE: addSkill(new Skill("Feral Rage", [CHAR.DRUID, CHAR.BARBARIAN], MORPH.WEREWOLF, "A1")),
	HUNGER: addSkill(new Skill("Hunger", CHAR.DRUID, [MORPH.WEREBEAR, MORPH.WEREWOLF], "S3")),
	RABIES: addSkill(new Skill("Rabies", CHAR.DRUID, MORPH.WEREWOLF, "S3")),
	FURY: addSkill(new RollbackSkill("Fury", CHAR.DRUID, MORPH.WEREWOLF, "A1", 5)),

	ZEAL: addSkill(new RollbackSkill("Zeal", CHAR.ALL, MORPH.HUMAN, "A1", 5)),
	SMITE: addSkill(new Skill("Smite", CHAR.PALADIN, MORPH.HUMAN, "S1")),
	SACRIFICE: addSkill(new Skill("Sacrifice", CHAR.PALADIN, MORPH.HUMAN, "A1")),
	VENGEANCE: addSkill(new Skill("Vengeance", CHAR.PALADIN, MORPH.HUMAN, "A1")),
	CONVERSION: addSkill(new Skill("Conversion", CHAR.PALADIN, MORPH.HUMAN, "A1"))
};
function addSkill(skill) { SKILL_MAP.set(skill.name, skill); return skill; }
export function getSkill(name) { return SKILL_MAP.get(name); }
export function forEachSkill(action) { SKILL_MAP.forEach((value, _key) => action(value)); }

const WEAPONS = new Map([
	["None", new Weapon("None", 0, "HTH", "NONE", 0, CHAR.PLAYER)],
	["Ahab Spear", new Weapon("Ahab Spear", 20, "1HT", "JAVELIN", 0, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Ancient Axe", new Weapon("Ancient Axe", 10, "STF", "AXE", 6, CHAR.PLAYER)],
	["Ancient Bow", new Weapon("Ancient Bow", 10, "BOW", "MISSILE", 6, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Ancient Maul", new Weapon("Ancient Maul", 10, "STF", "MACE", 6, CHAR.PLAYER)],
	["Ancient Shards", new Weapon("Ancient Shards", -10, "1HT", "JAVELIN", 0, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Ancient Spike", new Weapon("Ancient Spike", -10, "1HT", "DAGGER", 2, CHAR.PLAYER)],
	["Ancient Sword", new Weapon("Ancient Sword", 0, "1HS", "SWORD", 3, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Arbalest", new Weapon("Arbalest", -20, "XBW", "MISSILE", 3, CHAR.PLAYER)],
	["Arcane Bow", new Weapon("Arcane Bow", 0, "BOW", "MISSILE", 5, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Arcane Mace", new Weapon("Arcane Mace", 0, "1HS", "MACE", 2, CHAR.PLAYER)],
	["Arcane Staff", new Weapon("Arcane Staff", 0, "STF", "STAFF", 6, CHAR.PLAYER)],
	["Arreat's Hatchet", new Weapon("Arreat's Hatchet", -10, "1HS", "THROWING", 0, CHAR.BARBARIAN)],
	["Ashwood Bow", new Weapon("Ashwood Bow", 0, "BOW", "MISSILE", 5, [CHAR.AMAZON, CHAR.ROGUE_SCOUT])],
	["Assassin Crossbow", new Weapon("Assassin Crossbow", -40, "XBW", "MISSILE", 5, CHAR.PLAYER)],
	["Axe", new Weapon("Axe", 5, "1HS", "AXE", 4, CHAR.PLAYER)],
	["Balanced Axe", new Weapon("Balanced Axe", -15, "1HS", "THROWING", 0, CHAR.PLAYER)],
	["Balanced Dagger", new Weapon("Balanced Dagger", -20, "1HT", "THROWING", 0, CHAR.PLAYER)],
	["Balanced Hatchet", new Weapon("Balanced Hatchet", -15, "1HS", "THROWING", 0, CHAR.PLAYER)],
	["Balanced Knife", new Weapon("Balanced Knife", -20, "1HT", "THROWING", 0, CHAR.PLAYER)],
	["Ballista", new Weapon("Ballista", 0, "XBW", "MISSILE", 6, CHAR.PLAYER)],
	["Barbarian Tomahawk", new Weapon("Barbarian Tomahawk", 0, "1HS", "AXE", 2, CHAR.PLAYER)],
	["Barbed Club", new Weapon("Barbed Club", -5, "1HS", "MACE", 3, CHAR.PLAYER)],
	["Bardiche", new Weapon("Bardiche", 10, "STF", "POLEARM", 3, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Bastard Sword", new Weapon("Bastard Sword", 10, "2HS", "SWORD", 4, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])],
	["Battle Axe", new Weapon("Battle Axe", 10, "STF", "AXE", 5, CHAR.PLAYER)],
	["Battle Cestus", new Weapon("Battle Cestus", -10, "HT1", "CLAW", 2, CHAR.ASSASSIN)],
	["Battle Dart", new Weapon("Battle Dart", 0, "1HT", "THROWING", 0, CHAR.PLAYER)],
	["Battle Hammer", new Weapon("Battle Hammer", 20, "1HS", "MACE", 4, CHAR.PLAYER)],
	["Battle Scythe", new Weapon("Battle Scythe", -10, "STF", "POLEARM", 5, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Battle Staff", new Weapon("Battle Staff", -10, "STF", "STAFF", 4, CHAR.PLAYER)],
	["Battle Sword", new Weapon("Battle Sword", 0, "1HS", "SWORD", 4, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Bearded Axe", new Weapon("Bearded Axe", 0, "STF", "AXE", 5, CHAR.PLAYER)],
	["Bec-de-Corbin", new Weapon("Bec-de-Corbin", 0, "STF", "POLEARM", 6, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Bill", new Weapon("Bill", 0, "STF", "POLEARM", 4, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Blade Talons", new Weapon("Blade Talons", -20, "HT1", "CLAW", 3, CHAR.ASSASSIN)],
	["Blade", new Weapon("Blade", -10, "1HT", "DAGGER", 2, CHAR.PLAYER)],
	["Blessed Edge", new Weapon("Blessed Edge", -10, "1HS", "SWORD", 3, CHAR.PALADIN)],
	["Blessed Scepter", new Weapon("Blessed Scepter", -10, "1HS", "MACE", 5, CHAR.PLAYER)],
	["Bone Wand", new Weapon("Bone Wand", -20, "1HS", "STAFF", 2, CHAR.PLAYER)],
	["Brandistock", new Weapon("Brandistock", -20, "2HT", "SPEAR", 5, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Brawn Axe", new Weapon("Brawn Axe", -15, "STF", "AXE", 4, CHAR.PLAYER)],
	["Broad Axe", new Weapon("Broad Axe", 0, "STF", "AXE", 5, CHAR.PLAYER)],
	["Broad Sword", new Weapon("Broad Sword", 0, "1HS", "SWORD", 4, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Burnt Wand", new Weapon("Burnt Wand", 0, "1HS", "STAFF", 1, CHAR.PLAYER)],
	["Callous Wand", new Weapon("Callous Wand", -20, "1HS", "STAFF", 2, CHAR.PLAYER)],
	["Carved Bone", new Weapon("Carved Bone", -20, "1HT", "DAGGER", 1, CHAR.PLAYER)],
	["Cedar Bow", new Weapon("Cedar Bow", 0, "BOW", "MISSILE", 5, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Cedar Staff", new Weapon("Cedar Staff", 10, "STF", "STAFF", 4, CHAR.PLAYER)],
	["Celestial Blade", new Weapon("Celestial Blade", -10, "1HS", "SWORD", 4, CHAR.PALADIN)],
	["Celestial Scepter", new Weapon("Celestial Scepter", 0, "1HS", "MACE", 2, CHAR.PLAYER)],
	["Ceremonial Bow", new Weapon("Ceremonial Bow", 10, "BOW", "MISSILE", 5, [CHAR.AMAZON, CHAR.ROGUE_SCOUT])],
	["Ceremonial Javelin", new Weapon("Ceremonial Javelin", -10, "1HT", "JAVELIN", 0, CHAR.AMAZON)],
	["Ceremonial Dagger", new Weapon("Ceremonial Dagger", -30, "1HT", "DAGGER", 3, CHAR.NECROMANCER)],
	["Ceremonial Pike", new Weapon("Ceremonial Pike", 20, "2HT", "SPEAR", 6, CHAR.AMAZON)],
	["Ceremonial Spear", new Weapon("Ceremonial Spear", 0, "2HT", "SPEAR", 6, CHAR.AMAZON)],
	["Cestus", new Weapon("Cestus", 0, "HT1", "CLAW", 2, CHAR.ASSASSIN)],
	["Choice Crossbow", new Weapon("Choice Crossbow", -20, "XBW", "MISSILE", 3, CHAR.PLAYER)],
	["Chu-Ko-Nu", new Weapon("Chu-Ko-Nu", -40, "XBW", "MISSILE", 5, CHAR.PLAYER)],
	["Cinquedeas", new Weapon("Cinquedeas", -30, "1HT", "DAGGER", 3, CHAR.PLAYER)],
	["Clasped Orb", new Weapon("Clasped Orb", 0, "1HS", "ORB", 3, CHAR.SORCERESS)],
	["Claws", new Weapon("Claws", -10, "HT1", "CLAW", 3, CHAR.ASSASSIN)],
	["Claymore", new Weapon("Claymore", 10, "2HS", "SWORD", 4, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])],
	["Cleaver", new Weapon("Cleaver", 5, "1HS", "AXE", 4, CHAR.PLAYER)],
	["Cloudy Sphere", new Weapon("Cloudy Sphere", 0, "1HS", "ORB", 3, CHAR.SORCERESS)],
	["Club", new Weapon("Club", -10, "1HS", "MACE", 2, CHAR.PLAYER)],
	["Composite Bow", new Weapon("Composite Bow", -10, "BOW", "MISSILE", 4, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Consecrated Scepter", new Weapon("Consecrated Scepter", -15, "1HS", "MACE", 5, CHAR.PLAYER)],
	["Cranium Basher", new Weapon("Cranium Basher", -10, "1HS", "MACE", 2, CHAR.PLAYER)],
	["Crossbow", new Weapon("Crossbow", -10, "XBW", "MISSILE", 4, CHAR.PLAYER)],
	["Crowbill", new Weapon("Crowbill", -10, "1HS", "AXE", 6, CHAR.PLAYER)],
	["Cryptic Sword", new Weapon("Cryptic Sword", -10, "1HS", "SWORD", 4, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Crystal Sword", new Weapon("Crystal Sword", 0, "1HS", "SWORD", 6, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Crystalline Globe", new Weapon("Crystalline Globe", -10, "1HS", "ORB", 3, CHAR.SORCERESS)],
	["Cudgel", new Weapon("Cudgel", -10, "1HS", "MACE", 2, CHAR.PLAYER)],
	["Cutlass", new Weapon("Cutlass", -30, "1HS", "SWORD", 2, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Dacian Falx", new Weapon("Dacian Falx", 10, "2HS", "SWORD", 4, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])],
	["Dagger", new Weapon("Dagger", -20, "1HT", "DAGGER", 1, CHAR.PLAYER)],
	["Dark Bow", new Weapon("Dark Bow", -10, "BOW", "MISSILE", 4, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Dark Sword", new Weapon("Dark Sword", -10, "2HS", "SWORD", 4, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])],
	["Death Blade", new Weapon("Death Blade", 5, "2HS", "SWORD", 6, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])],
	["Death Reaper", new Weapon("Death Reaper", -10, "STF", "POLEARM", 6, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Demon Heart", new Weapon("Demon Heart", 0, "1HS", "ORB", 3, CHAR.SORCERESS)],
	["Demonic Scythe", new Weapon("Demonic Scythe", -20, "STF", "POLEARM", 6, CHAR.NECROMANCER)],
	["Demonic Wand", new Weapon("Demonic Wand", 0, "1HS", "STAFF", 2, CHAR.PLAYER)],
	["Desert Sword", new Weapon("Desert Sword", -20, "1HS", "SWORD", 2, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Dimensional Blade", new Weapon("Dimensional Blade", 0, "1HS", "SWORD", 6, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Dimensional Shard", new Weapon("Dimensional Shard", 10, "1HS", "ORB", 3, CHAR.SORCERESS)],
	["Dire Flail", new Weapon("Dire Flail", -10, "1HS", "MACE", 5, CHAR.PLAYER)],
	["Dire Pilum", new Weapon("Dire Pilum", 0, "1HT", "JAVELIN", 0, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Dire Scythe", new Weapon("Dire Scythe", -20, "STF", "POLEARM", 6, CHAR.NECROMANCER)],
	["Dirk", new Weapon("Dirk", 0, "1HT", "DAGGER", 1, CHAR.PLAYER)],
	["Divine Blade", new Weapon("Divine Blade", -10, "1HS", "SWORD", 4, CHAR.PALADIN)],
	["Divine Scepter", new Weapon("Divine Scepter", -10, "1HS", "MACE", 5, CHAR.PLAYER)],
	["Double Axe", new Weapon("Double Axe", 10, "1HS", "AXE", 5, CHAR.PLAYER)],
	["Double Bow", new Weapon("Double Bow", -10, "BOW", "MISSILE", 4, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Dragon Spear", new Weapon("Dragon Spear", -20, "2HT", "SPEAR", 5, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Duo-Axe", new Weapon("Duo-Axe", 10, "1HS", "AXE", 5, CHAR.PLAYER)],
	["Eagle Orb", new Weapon("Eagle Orb", -10, "1HS", "ORB", 3, CHAR.SORCERESS)],
	["Edge Bow", new Weapon("Edge Bow", 5, "BOW", "MISSILE", 3, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Elder Cane", new Weapon("Elder Cane", -10, "STF", "STAFF", 2, CHAR.PLAYER)],
	["Eldritch Orb", new Weapon("Eldritch Orb", -10, "1HS", "ORB", 3, CHAR.SORCERESS)],
	["Elven Bow", new Weapon("Elven Bow", 0, "BOW", "MISSILE", 5, [CHAR.AMAZON, CHAR.ROGUE_SCOUT])],
	["Energy Blade", new Weapon("Energy Blade", -10, "1HS", "SWORD", 3, CHAR.SORCERESS)],
	["Espandon", new Weapon("Espandon", 0, "2HS", "SWORD", 3, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])],
	["Executioner Sword", new Weapon("Executioner Sword", 10, "2HS", "SWORD", 6, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])],
	["Falchion", new Weapon("Falchion", 20, "1HS", "SWORD", 2, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Fang Knife", new Weapon("Fang Knife", -30, "1HT", "DAGGER", 3, CHAR.PLAYER)],
	["Fascia", new Weapon("Fascia", 0, "HT1", "CLAW", 2, CHAR.ASSASSIN)],
	["Feral Claws", new Weapon("Feral Claws", -20, "HT1", "CLAW", 3, CHAR.ASSASSIN)],
	["Flail", new Weapon("Flail", -10, "1HS", "MACE", 5, CHAR.PLAYER)],
	["Flamberge", new Weapon("Flamberge", -10, "2HS", "SWORD", 5, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])],
	["Flanged Mace", new Weapon("Flanged Mace", 0, "1HS", "MACE", 2, CHAR.PLAYER)],
	["Francisca", new Weapon("Francisca", 0, "1HS", "THROWING", 0, CHAR.PLAYER)],
	["Fuscina", new Weapon("Fuscina", 0, "2HT", "SPEAR", 4, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Giant Axe", new Weapon("Giant Axe", 10, "STF", "AXE", 6, CHAR.PLAYER)],
	["Giant Sword", new Weapon("Giant Sword", 0, "2HS", "SWORD", 4, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])],
	["Gladiator Blade", new Weapon("Gladiator Blade", 0, "1HS", "SWORD", 2, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Gladius", new Weapon("Gladius", 0, "1HS", "SWORD", 2, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Glaive", new Weapon("Glaive", 20, "1HT", "JAVELIN", 0, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Glowing Orb", new Weapon("Glowing Orb", -10, "1HS", "ORB", 3, CHAR.SORCERESS)],
	["Gnarled Staff", new Weapon("Gnarled Staff", 10, "STF", "STAFF", 4, CHAR.PLAYER)],
	["Gothic Axe", new Weapon("Gothic Axe", -10, "STF", "AXE", 6, CHAR.PLAYER)],
	["Gothic Bow", new Weapon("Gothic Bow", 10, "BOW", "MISSILE", 6, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Gothic Staff", new Weapon("Gothic Staff", -10, "STF", "STAFF", 4, CHAR.PLAYER)],
	["Gothic Sword", new Weapon("Gothic Sword", 10, "2HS", "SWORD", 4, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])],
	["Grand Matron Bow", new Weapon("Grand Matron Bow", 10, "BOW", "MISSILE", 5, [CHAR.AMAZON, CHAR.ROGUE_SCOUT])],
	["Grand Scepter", new Weapon("Grand Scepter", 10, "1HS", "MACE", 3, CHAR.PLAYER)],
	["Grapnel", new Weapon("Grapnel", 0, "2HT", "SPEAR", 4, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Grave Wand", new Weapon("Grave Wand", 0, "1HS", "STAFF", 2, CHAR.PLAYER)],
	["Great Axe", new Weapon("Great Axe", -10, "STF", "AXE", 6, CHAR.PLAYER)],
	["Great Maul", new Weapon("Great Maul", 20, "STF", "MACE", 6, CHAR.PLAYER)],
	["Great Pilum", new Weapon("Great Pilum", 0, "1HT", "JAVELIN", 0, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Great Scepter", new Weapon("Great Scepter", -15, "1HS", "MACE", 5, CHAR.PLAYER)],
	["Great Sword", new Weapon("Great Sword", 10, "2HS", "SWORD", 6, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])],
	["Greater Claws", new Weapon("Greater Claws", -20, "HT1", "CLAW", 3, CHAR.ASSASSIN)],
	["Greater Talons", new Weapon("Greater Talons", -30, "HT1", "CLAW", 3, CHAR.ASSASSIN)],
	["Grim Scythe", new Weapon("Grim Scythe", -10, "STF", "POLEARM", 6, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Grim Wand", new Weapon("Grim Wand", 0, "1HS", "STAFF", 2, CHAR.PLAYER)],
	["Guardian", new Weapon("Guardian", 0, "STF", "POLEARM", 6, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Guisarme", new Weapon("Guisarme", -10, "2HT", "SPEAR", 3, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Guillotine Axe", new Weapon("Guillotine Axe", -10, "STF", "AXE", 6, CHAR.PLAYER)],
	["Halberd", new Weapon("Halberd", 0, "STF", "POLEARM", 6, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Hand Axe", new Weapon("Hand Axe", 0, "1HS", "AXE", 2, CHAR.PLAYER)],
	["Hand Scythe", new Weapon("Hand Scythe", -10, "HT1", "CLAW", 2, CHAR.ASSASSIN)],
	["Harpoon", new Weapon("Harpoon", -10, "1HT", "JAVELIN", 0, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Hatchet Hands", new Weapon("Hatchet Hands", 0, "HT1", "CLAW", 2, CHAR.ASSASSIN)],
	["Hatchet", new Weapon("Hatchet", 0, "1HS", "AXE", 2, CHAR.PLAYER)],
	["Heavenly Stone", new Weapon("Heavenly Stone", -10, "1HS", "ORB", 3, CHAR.SORCERESS)],
	["Heavy Axe", new Weapon("Heavy Axe", 0, "STF", "AXE", 5, CHAR.PLAYER)],
	["Heavy Crossbow", new Weapon("Heavy Crossbow", 0, "XBW", "MISSILE", 6, CHAR.PLAYER)],
	["Hellfire Sword", new Weapon("Hellfire Sword", 10, "2HS", "SWORD", 5, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])],
	["Highland Hatchet", new Weapon("Highland Hatchet", -10, "1HS", "THROWING", 0, CHAR.BARBARIAN)],
	["Holy Scepter", new Weapon("Holy Scepter", 10, "1HS", "MACE", 3, CHAR.PLAYER)],
	["Holy Water Sprinkler", new Weapon("Holy Water Sprinkler", 10, "1HS", "MACE", 3, CHAR.PLAYER)],
	["Hunter's Bow", new Weapon("Hunter's Bow", -10, "BOW", "MISSILE", 4, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Hurlbat", new Weapon("Hurlbat", -15, "1HS", "THROWING", 0, CHAR.PLAYER)],
	["Impaler", new Weapon("Impaler", 20, "2HT", "SPEAR", 6, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Jagged Star", new Weapon("Jagged Star", 10, "1HS", "MACE", 3, CHAR.PLAYER)],
	["Jared's Stone", new Weapon("Jared's Stone", 10, "1HS", "ORB", 3, CHAR.SORCERESS)],
	["Javelin", new Weapon("Javelin", -10, "1HT", "JAVELIN", 0, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Jeweled Edge", new Weapon("Jeweled Edge", -30, "1HS", "SWORD", 6, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Jo Staff", new Weapon("Jo Staff", -10, "STF", "STAFF", 2, CHAR.PLAYER)],
	["Judgement Blade", new Weapon("Judgement Blade", -15, "2HS", "SWORD", 3, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])],
	["Katana", new Weapon("Katana", -30, "1HS", "SWORD", 2, CHAR.ASSASSIN)],
	["Katar", new Weapon("Katar", -10, "HT1", "CLAW", 2, CHAR.ASSASSIN)],
	["Knout", new Weapon("Knout", -10, "1HS", "MACE", 5, CHAR.PLAYER)],
	["Kris", new Weapon("Kris", -30, "1HT", "DAGGER", 3, CHAR.PLAYER)],
	["Lance", new Weapon("Lance", 20, "2HT", "SPEAR", 6, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Large Axe", new Weapon("Large Axe", -10, "STF", "AXE", 4, CHAR.PLAYER)],
	["Large Siege Bow", new Weapon("Large Siege Bow", 10, "BOW", "MISSILE", 6, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Light Crossbow", new Weapon("Light Crossbow", -20, "XBW", "MISSILE", 3, CHAR.PLAYER)],
	["Lissom Spear", new Weapon("Lissom Spear", 10, "1HT", "JAVELIN", 0, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Lochaber Axe", new Weapon("Lochaber Axe", 10, "STF", "POLEARM", 3, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Long Battle Bow", new Weapon("Long Battle Bow", 10, "BOW", "MISSILE", 6, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Long Bow", new Weapon("Long Bow", 0, "BOW", "MISSILE", 5, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Long Staff", new Weapon("Long Staff", 0, "STF", "STAFF", 3, CHAR.PLAYER)],
	["Long Sword", new Weapon("Long Sword", -10, "1HS", "SWORD", 4, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Long War Bow", new Weapon("Long War Bow", 10, "BOW", "MISSILE", 6, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Mace", new Weapon("Mace", 0, "1HS", "MACE", 2, CHAR.PLAYER)],
	["Mage Staff", new Weapon("Mage Staff", -10, "STF", "STAFF", 4, CHAR.PLAYER)],
	["Maiden Javelin", new Weapon("Maiden Javelin", -10, "1HT", "JAVELIN", 0, CHAR.AMAZON)],
	["Maiden Pike", new Weapon("Maiden Pike", 10, "2HT", "SPEAR", 6, CHAR.AMAZON)],
	["Maiden Spear", new Weapon("Maiden Spear", 0, "2HT", "SPEAR", 6, CHAR.AMAZON)],
	["Mana Blade", new Weapon("Mana Blade", -10, "1HS", "SWORD", 2, CHAR.SORCERESS)],
	["Marksman Bow", new Weapon("Marksman Bow", 10, "BOW", "MISSILE", 6, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Marskman Crossbow", new Weapon("Marskman Crossbow", -10, "XBW", "MISSILE", 4, CHAR.PLAYER)],
	["Martel de Fer", new Weapon("Martel de Fer", 20, "STF", "MACE", 6, CHAR.PLAYER)],
	["Matriarchal Bow", new Weapon("Matriarchal Bow", -10, "BOW", "MISSILE", 5, [CHAR.AMAZON, CHAR.ROGUE_SCOUT])],
	["Matriarchal Javelin", new Weapon("Matriarchal Javelin", -10, "1HT", "JAVELIN", 0, CHAR.AMAZON)],
	["Matriarchal Pike", new Weapon("Matriarchal Pike", 20, "2HT", "SPEAR", 6, CHAR.AMAZON)],
	["Matriarchal Spear", new Weapon("Matriarchal Spear", 0, "2HT", "SPEAR", 6, CHAR.AMAZON)],
	["Maul", new Weapon("Maul", 10, "STF", "MACE", 6, CHAR.PLAYER)],
	["Military Axe", new Weapon("Military Axe", -10, "STF", "AXE", 4, CHAR.PLAYER)],
	["Military Hammer", new Weapon("Military Hammer", 20, "1HS", "MACE", 4, CHAR.PLAYER)],
	["Military Pick", new Weapon("Military Pick", -10, "1HS", "AXE", 6, CHAR.PLAYER)],
	["Mithril Knife", new Weapon("Mithril Knife", 0, "1HT", "DAGGER", 1, CHAR.PLAYER)],
	["Morning Star", new Weapon("Morning Star", 10, "1HS", "MACE", 3, CHAR.PLAYER)],
	["Mystic Staff", new Weapon("Mystic Staff", 0, "STF", "STAFF", 3, CHAR.PLAYER)],
	["Naga", new Weapon("Naga", 0, "1HS", "AXE", 6, CHAR.PLAYER)],
	["Ninja To", new Weapon("Ninja To", -30, "1HS", "SWORD", 2, CHAR.ASSASSIN)],
	["Oak Branch", new Weapon("Oak Branch", 0, "1HS", "MACE", 2, CHAR.DRUID)],
	["Odysseus Crossbow", new Weapon("Odysseus Crossbow", 0, "XBW", "MISSILE", 6, CHAR.PLAYER)],
	["Okrist", new Weapon("Okrist", 10, "1HS", "SWORD", 2, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Partizan", new Weapon("Partizan", 10, "STF", "POLEARM", 5, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Petrified Staff", new Weapon("Petrified Staff", 10, "STF", "STAFF", 4, CHAR.PLAYER)],
	["Petrified Wand", new Weapon("Petrified Wand", 10, "1HS", "STAFF", 2, CHAR.PLAYER)],
	["Pike", new Weapon("Pike", 20, "2HT", "SPEAR", 6, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Pilum", new Weapon("Pilum", 0, "1HT", "JAVELIN", 0, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Poignard", new Weapon("Poignard", -20, "1HT", "DAGGER", 1, CHAR.PLAYER)],
	["Pole Gauche", new Weapon("Pole Gauche", 10, "STF", "POLEARM", 4, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Poleaxe", new Weapon("Poleaxe", 10, "STF", "POLEARM", 5, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Precision Bow", new Weapon("Precision Bow", 0, "BOW", "MISSILE", 5, [CHAR.AMAZON, CHAR.ROGUE_SCOUT])],
	["Precision Cleaver", new Weapon("Precision Cleaver", 5, "1HS", "AXE", 4, CHAR.PLAYER)],
	["Quarterstaff", new Weapon("Quarterstaff", 0, "STF", "STAFF", 3, CHAR.PLAYER)],
	["Quhab", new Weapon("Quhab", 0, "HT1", "CLAW", 3, CHAR.ASSASSIN)],
	["Ranseur", new Weapon("Ranseur", 0, "2HT", "SPEAR", 6, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Rapier", new Weapon("Rapier", -10, "1HS", "SWORD", 2, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Razor Axe", new Weapon("Razor Axe", -10, "1HS", "AXE", 6, CHAR.PLAYER)],
	["Razor Bow", new Weapon("Razor Bow", -10, "BOW", "MISSILE", 4, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Reflex Bow", new Weapon("Reflex Bow", 10, "BOW", "MISSILE", 5, [CHAR.AMAZON, CHAR.ROGUE_SCOUT])],
	["Repeating Crossbow", new Weapon("Repeating Crossbow", -40, "XBW", "MISSILE", 5, CHAR.PLAYER)],
	["Ritualistic Dagger", new Weapon("Ritualistic Dagger", -30, "1HT", "DAGGER", 3, CHAR.NECROMANCER)],
	["Rogue Bow", new Weapon("Rogue Bow", 0, "BOW", "MISSILE", 5, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Rondel", new Weapon("Rondel", 0, "1HT", "DAGGER", 1, CHAR.PLAYER)],
	["Royal Partizan", new Weapon("Royal Partizan", 10, "STF", "POLEARM", 5, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Rune Bow", new Weapon("Rune Bow", 0, "BOW", "MISSILE", 5, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Rune Scepter", new Weapon("Rune Scepter", 0, "1HS", "MACE", 2, CHAR.PLAYER)],
	["Rune Staff", new Weapon("Rune Staff", 0, "STF", "STAFF", 6, CHAR.PLAYER)],
	["Rune Sword", new Weapon("Rune Sword", -10, "1HS", "SWORD", 4, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Runic Talons", new Weapon("Runic Talons", -30, "HT1", "CLAW", 3, CHAR.ASSASSIN)],
	["Sabre", new Weapon("Sabre", -10, "1HS", "SWORD", 2, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Sacred Globe", new Weapon("Sacred Globe", -10, "1HS", "ORB", 3, CHAR.SORCERESS)],
	["Sacred Wand", new Weapon("Sacred Wand", 0, "1HS", "STAFF", 2, CHAR.PLAYER)],
	["Sacrificial Dagger", new Weapon("Sacrificial Dagger", -30, "1HT", "DAGGER", 3, CHAR.NECROMANCER)],
	["Scepter", new Weapon("Scepter", 0, "1HS", "MACE", 2, CHAR.PLAYER)],
	["Scimitar", new Weapon("Scimitar", -20, "1HS", "SWORD", 2, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Scissors Katar", new Weapon("Scissors Katar", -10, "HT1", "CLAW", 3, CHAR.ASSASSIN)],
	["Scissors Quhab", new Weapon("Scissors Quhab", -10, "HT1", "CLAW", 3, CHAR.ASSASSIN)],
	["Scissors Suwayyah", new Weapon("Scissors Suwayyah", -10, "HT1", "CLAW", 3, CHAR.ASSASSIN)],
	["Scythe", new Weapon("Scythe", -10, "STF", "POLEARM", 5, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Sepulcher Wand", new Weapon("Sepulcher Wand", 10, "1HS", "STAFF", 2, CHAR.PLAYER)],
	["Seraphic Scepter", new Weapon("Seraphic Scepter", -15, "1HS", "MACE", 5, CHAR.PLAYER)],
	["Serrated Star", new Weapon("Serrated Star", 10, "1HS", "MACE", 3, CHAR.PLAYER)],
	["Shade Bow", new Weapon("Shade Bow", 0, "BOW", "MISSILE", 5, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Shadow Scythe", new Weapon("Shadow Scythe", -10, "STF", "POLEARM", 5, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Shaman Wand", new Weapon("Shaman Wand", 0, "1HS", "MACE", 2, CHAR.DRUID)],
	["Shamshir", new Weapon("Shamshir", -10, "1HS", "SWORD", 2, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Sharp Bow", new Weapon("Sharp Bow", -10, "BOW", "MISSILE", 4, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Shilleagh", new Weapon("Shilleagh", 0, "1HS", "MACE", 2, CHAR.DRUID)],
	["Short Battle Bow", new Weapon("Short Battle Bow", 0, "BOW", "MISSILE", 5, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Short Bow", new Weapon("Short Bow", 5, "BOW", "MISSILE", 3, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Short Siege Bow", new Weapon("Short Siege Bow", 0, "BOW", "MISSILE", 5, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Short Spear", new Weapon("Short Spear", 10, "1HT", "JAVELIN", 0, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Short Staff", new Weapon("Short Staff", -10, "STF", "STAFF", 2, CHAR.PLAYER)],
	["Short Sword", new Weapon("Short Sword", 0, "1HS", "SWORD", 2, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Short War Bow", new Weapon("Short War Bow", 0, "BOW", "MISSILE", 5, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Siege Crossbow", new Weapon("Siege Crossbow", -10, "XBW", "MISSILE", 4, CHAR.PLAYER)],
	["Simbilan", new Weapon("Simbilan", 10, "1HT", "JAVELIN", 0, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Slayer Axe", new Weapon("Slayer Axe", 10, "STF", "AXE", 6, CHAR.PLAYER)],
	["Smoked Sphere", new Weapon("Smoked Sphere", 0, "1HS", "ORB", 3, CHAR.SORCERESS)],
	["Soul Burner", new Weapon("Soul Burner", -10, "STF", "POLEARM", 6, CHAR.NECROMANCER)],
	["Soul Destroyer", new Weapon("Soul Destroyer", -10, "STF", "POLEARM", 6, CHAR.NECROMANCER)],
	["Soul Hunter", new Weapon("Soul Hunter", -10, "STF", "POLEARM", 6, CHAR.NECROMANCER)],
	["Sparkling Ball", new Weapon("Sparkling Ball", 0, "1HS", "ORB", 3, CHAR.SORCERESS)],
	["Spear", new Weapon("Spear", -10, "2HT", "SPEAR", 3, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Spetum", new Weapon("Spetum", 0, "2HT", "SPEAR", 6, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Spiculum", new Weapon("Spiculum", 20, "1HT", "JAVELIN", 0, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Spiderwoven Bow", new Weapon("Spiderwoven Bow", 5, "BOW", "MISSILE", 3, [CHAR.PLAYER, CHAR.ROGUE_SCOUT])],
	["Spiked Club", new Weapon("Spiked Club", -5, "1HS", "MACE", 2, CHAR.PLAYER)],
	["Split Axe", new Weapon("Split Axe", 10, "STF", "AXE", 5, CHAR.PLAYER)],
	["Stag Bow", new Weapon("Stag Bow", 0, "BOW", "MISSILE", 5, [CHAR.AMAZON, CHAR.ROGUE_SCOUT])],
	["Stiletto", new Weapon("Stiletto", -10, "1HT", "DAGGER", 2, CHAR.PLAYER)],
	["Suwayyah", new Weapon("Suwayyah", 0, "HT1", "CLAW", 3, CHAR.ASSASSIN)],
	["Swirling Crystal", new Weapon("Swirling Crystal", 10, "1HS", "ORB", 3, CHAR.SORCERESS)],
	["Tabar", new Weapon("Tabar", 10, "STF", "AXE", 5, CHAR.PLAYER)],
	["Thorned Club", new Weapon("Thorned Club", -5, "1HS", "MACE", 3, CHAR.PLAYER)],
	["Throwing Axe", new Weapon("Throwing Axe", 0, "1HS", "THROWING", 0, CHAR.PLAYER)],
	["Throwing Dagger", new Weapon("Throwing Dagger", 0, "1HT", "THROWING", 0, CHAR.PLAYER)],
	["Throwing Hatchet", new Weapon("Throwing Hatchet", 0, "1HS", "THROWING", 0, CHAR.PLAYER)],
	["Throwing Knife", new Weapon("Throwing Knife", 0, "1HT", "THROWING", 0, CHAR.PLAYER)],
	["Throwing Spear", new Weapon("Throwing Spear", -10, "1HT", "JAVELIN", 0, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Titan's Dagger", new Weapon("Titan's Dagger", -5, "2HS", "SWORD", 4, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])],
	["Titan's Maul", new Weapon("Titan's Maul", 20, "STF", "MACE", 6, CHAR.PLAYER)],
	["Tomb Wand", new Weapon("Tomb Wand", -20, "1HS", "STAFF", 2, CHAR.PLAYER)],
	["Tribal Hatchet", new Weapon("Tribal Hatchet", -10, "1HS", "THROWING", 0, CHAR.BARBARIAN)],
	["Trident", new Weapon("Trident", 0, "2HT", "SPEAR", 4, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Trojan Sword", new Weapon("Trojan Sword", 0, "1HS", "SWORD", 3, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Tuigan Bow", new Weapon("Tuigan Bow", 0, "BOW", "MISSILE", 5, [CHAR.AMAZON, CHAR.ROGUE_SCOUT])],
	["Tulwar", new Weapon("Tulwar", 20, "1HS", "SWORD", 2, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Tusk Sword", new Weapon("Tusk Sword", 0, "2HS", "SWORD", 4, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])],
	["Twin Axe", new Weapon("Twin Axe", 10, "1HS", "AXE", 5, CHAR.PLAYER)],
	["Two-Handed Sword", new Weapon("Two-Handed Sword", 0, "2HS", "SWORD", 3, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])],
	["Urgrosh", new Weapon("Urgrosh", 0, "STF", "POLEARM", 3, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Viking Axe", new Weapon("Viking Axe", 0, "1HS", "AXE", 6, CHAR.PLAYER)],
	["Viking Sword", new Weapon("Viking Sword", 0, "1HS", "SWORD", 4, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Vortex Orb", new Weapon("Vortex Orb", 0, "1HS", "ORB", 3, CHAR.SORCERESS)],
	["Voulge", new Weapon("Voulge", 0, "STF", "POLEARM", 4, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Wand", new Weapon("Wand", 0, "1HS", "STAFF", 1, CHAR.PLAYER)],
	["War Axe", new Weapon("War Axe", 0, "1HS", "AXE", 6, CHAR.PLAYER)],
	["War Club", new Weapon("War Club", 10, "STF", "MACE", 6, CHAR.PLAYER)],
	["War Dart", new Weapon("War Dart", -20, "1HT", "THROWING", 0, CHAR.PLAYER)],
	["War Fist", new Weapon("War Fist", 0, "HT1", "CLAW", 2, CHAR.ASSASSIN)],
	["War Fork", new Weapon("War Fork", -20, "2HT", "SPEAR", 5, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["War Hammer", new Weapon("War Hammer", 20, "1HS", "MACE", 4, CHAR.PLAYER)],
	["War Javelin", new Weapon("War Javelin", -10, "1HT", "JAVELIN", 0, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["War Scepter", new Weapon("War Scepter", -10, "1HS", "MACE", 5, CHAR.PLAYER)],
	["War Scythe", new Weapon("War Scythe", -10, "STF", "POLEARM", 6, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["War Spear", new Weapon("War Spear", -10, "2HT", "SPEAR", 3, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["War Staff", new Weapon("War Staff", 0, "STF", "STAFF", 6, CHAR.PLAYER)],
	["War Sword", new Weapon("War Sword", 0, "1HS", "SWORD", 3, [CHAR.PLAYER, CHAR.IRON_WOLF, CHAR.BARBARIAN_MERCENARY])],
	["Wakizashi", new Weapon("Wakizashi", -30, "1HS", "SWORD", 2, CHAR.ASSASSIN)],
	["Whale Hunter", new Weapon("Whale Hunter", -10, "1HT", "JAVELIN", 0, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Wizard Blade", new Weapon("Wizard Blade", -10, "1HS", "SWORD", 4, CHAR.SORCERESS)],
	["Wretched Scythe", new Weapon("Wretched Scythe", -20, "STF", "POLEARM", 6, CHAR.NECROMANCER)],
	["Wrist Blade", new Weapon("Wrist Blade", 0, "HT1", "CLAW", 2, CHAR.ASSASSIN)],
	["Wrist Spike", new Weapon("Wrist Spike", -10, "HT1", "CLAW", 2, CHAR.ASSASSIN)],
	["Wrist Sword", new Weapon("Wrist Sword", -10, "HT1", "CLAW", 3, CHAR.ASSASSIN)],
	["Yari", new Weapon("Yari", 0, "2HT", "SPEAR", 6, [CHAR.PLAYER, CHAR.TOWN_GUARD])],
	["Yew Wand", new Weapon("Yew Wand", 10, "1HS", "STAFF", 1, CHAR.PLAYER)],
	["Zweihander", new Weapon("Zweihander", -10, "2HS", "SWORD", 5, [CHAR.PLAYER, CHAR.BARBARIAN_MERCENARY])]
]);
export function getWeapon(name) { return WEAPONS.get(name); }
export function forEachWeapon(action) { WEAPONS.forEach((value, _key) => action(value)); }

export { OUTPUT, CONTAINER, SELECT, NUMBER, CHECKBOX, CHAR, MORPH, OPTION, BUTTON, OTHER, AS_SKILL, ANIM_DATA, SKILL };

//export { container, select, number, checkbox, option, button, skill, other, debug, tv, char, wf, skills, wt, ic, weaponsMap, LINK_SEPARATOR };

/*function setupInputElement(element, eventListener) {
    if (element.type == "button") {
        element.addEventListener("click", eventListener, false);
    } else {
        element.addEventListener("change", eventListener, false);
        if (element.type == "number") {
            element.onkeydown = function (e) { // only allows the input of numbers, no negative signs
                if (!((e.keyCode > 95 && e.keyCode < 106) || (e.keyCode > 47 && e.keyCode < 58) || e.keyCode == 8)) {
                    return false;
                }
            }
        }
    }
	return element;
}*/

/*function setupUpdateTableInputElements(eventListener) {
    setupInputElement(number.PRIMARY_WEAPON_IAS, eventListener);
    setupInputElement(number.PRIMARY_WEAPON_IAS, eventListener);
	setupInputElement(number.SECONDARY_WEAPON_IAS, eventListener);
	setupInputElement(number.IAS, eventListener);
	setupInputElement(number.FANATICISM, eventListener);
	setupInputElement(number.BURST_OF_SPEED, eventListener);
	setupInputElement(number.WEREWOLF, eventListener);
	setupInputElement(number.MAUL, eventListener);
	setupInputElement(number.FRENZY, eventListener);
	setupInputElement(number.HOLY_FREEZE, eventListener);
	setupInputElement(number.SLOWED_BY, eventListener);
    
	setupInputElement(checkbox.IS_ONE_HANDED, eventListener);
	setupInputElement(checkbox.DECREPIFY, eventListener);
	setupInputElement(checkbox.CHILLED, eventListener);
}*/

//function convertIAStoEIAS(IAS) { return Math.floor(120 * IAS / (120 + IAS)); }

//function convertEIAStoIAS(EIAS) { return Math.ceil(120 * EIAS / (120 - EIAS)); }
