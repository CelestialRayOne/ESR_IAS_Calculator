
const debug = true;

const container = {
    TABLE_VARIABLE: document.getElementById("tableVariableContainer"),
	WEREFORM: document.getElementById("wereformContainer"),
	PRIMARY_WEAPON: document.getElementById("primaryWeaponContainer"),
	IS_ONE_HANDED: document.getElementById("isOneHandedContainer"),
	PRIMARY_WEAPON_IAS: document.getElementById("primaryWeaponIASContainer"),
	SECONDARY_WEAPON: document.getElementById("secondaryWeaponContainer"),
	SECONDARY_WEAPON_IAS: document.getElementById("secondaryWeaponIASContainer"),
	IAS: document.getElementById("IASContainer"),
	FANATICISM: document.getElementById("fanaticismContainer"),
	BURST_OF_SPEED: document.getElementById("burstOfSpeedContainer"),
	WEREWOLF: document.getElementById("werewolfContainer"),
	MAUL: document.getElementById("maulContainer"),
	FRENZY: document.getElementById("frenzyContainer"),
	MARK_OF_BEAR: document.getElementById("markOfBearContainer"),
	HOLY_FREEZE: document.getElementById("holyFreezeContainer"),
	SLOWED_BY: document.getElementById("slowedByContainer"),
	DECREPIFY: document.getElementById("decrepifyContainer"),
	CHILLED: document.getElementById("chilledContainer"),
	TABLE: document.getElementById("tableContainer")
};

const select = {
    TABLE_VARIABLE: document.getElementById("tableVariableSelect"),
	CHARACTER: document.getElementById("characterSelect"),
	WEREFORM: document.getElementById("wereformSelect"),
	SKILL: document.getElementById("skillSelect"),
	PRIMARY_WEAPON: document.getElementById("primaryWeaponSelect"),
	SECONDARY_WEAPON: document.getElementById("secondaryWeaponSelect")
};

const number = {
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

const checkbox = {
    IS_ONE_HANDED: document.getElementById("isOneHanded"),
	MARK_OF_BEAR: document.getElementById("markOfBear"),
	DECREPIFY: document.getElementById("decrepify"),
	CHILLED: document.getElementById("chilled")
};

const char = {
    AMAZON: 0,
    ASSASSIN: 1,
    BARBARIAN: 2,
    DRUID: 3,
    NECROMANCER: 4,
    PALADIN: 5,
    SORCERESS: 6,
	// mercs
    ROGUE_SCOUT: 7,
    DESERT_MERCENARY: 8,
    BASH_BARBARIAN: 9,
    FRENZY_BARBARIAN: 10
};

const wf = {
    HUMAN: 0,
    WEREBEAR: 1,
    WEREWOLF: 2
};

const tv = {
	EIAS: 0,
    IAS: 1,
    FANATICISM: 2,
    PRIMARY_WEAPON_IAS: 3,
    SECONDARY_WEAPON_IAS: 4,
    BURST_OF_SPEED: 5,
    WEREWOLF: 6,
    FRENZY: 7,
    MAUL: 8
};

export function isTableVariableSkill(variable) {
	return variable == tv.FANATICISM || variable == tv.BURST_OF_SPEED || variable == tv.WEREWOLF
		|| variable == tv.MAUL || variable == tv.FRENZY;
}

export function getTableVariableSkill(variable) {
	switch(variable) {
		case tv.FANATICISM:
			return skill.FANATICISM;
		case tv.BURST_OF_SPEED:
			return skill.BURST_OF_SPEED;
		case tv.WEREWOLF:
			return skill.WEREWOLF;
		case tv.MAUL:
			return skill.MAUL;
		case tv.FRENZY:
			return skill.FRENZY;
		default:
			return null;
	}
}

const option = {
	TABLE_VARIABLE_IAS: select.TABLE_VARIABLE.options[tv.IAS],
    TABLE_VARIABLE_PRIMARY_WEAPON_IAS: select.TABLE_VARIABLE.options[tv.PRIMARY_WEAPON_IAS],
	TABLE_VARIABLE_SECONDARY_WEAPON_IAS: select.TABLE_VARIABLE.options[tv.SECONDARY_WEAPON_IAS],
	TABLE_VARIABLE_BURST_OF_SPEED: select.TABLE_VARIABLE.options[tv.BURST_OF_SPEED],
	TABLE_VARIABLE_WEREWOLF: select.TABLE_VARIABLE.options[tv.WEREWOLF],
	TABLE_VARIABLE_FRENZY: select.TABLE_VARIABLE.options[tv.FRENZY],
	TABLE_VARIABLE_MAUL: select.TABLE_VARIABLE.options[tv.MAUL],

	WEREFORM_WEREWOLF: select.WEREFORM.options[wf.WEREWOLF]
};

const button = {
    GENERATE_LINK: document.getElementById("generateLink")
};

const other = {

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

class WeaponType {

	constructor(isMelee, isOneHand, frameData) {
		this.isMelee = isMelee;
		this.isOneHand = isOneHand;
		this.frameData = new Map(frameData);
	}

	getFramesPerDirection(character) {
		let value = this.frameData.get(character);
		return Array.isArray(value) ? value[0] : value;
	}

	hasAlternateAnimation(character) {
		let characterFrameData = this.frameData.get(character);
		return Array.isArray(characterFrameData) && characterFrameData.length == 3;
	}

	getAlternateFramesPerDirection(character) {
		return this.frameData.get(character)[1];
	}

	getActionFrame(character) {
		let characterFrameData = this.frameData.get(character);
		return characterFrameData[characterFrameData.length - 1];
	}

}

class Weapon {

	constructor(name, WSM, type, itemClass, maxSockets) {
		this.name = name;
		this.WSM = WSM;
		this.type = type;
		this.itemClass = itemClass;
		this.maxSockets = maxSockets;
	}

	canBeThrown() {
		return this.itemClass == ic.THROWING || this.itemClass == ic.JAVELIN;
	}

}

class Skill {

	constructor(name, canDualWield, isDualWieldOnly, isSequence, isRollback) {
		this.name = name;
		this.canDualWield = canDualWield;
		this.isDualWieldOnly = isDualWieldOnly;
		this.isSequence = isSequence;
		this.isRollback = isRollback;
	}

	isDualWieldedSequenceSkill() {
		return this.isDualWieldOnly && this.isSequence;
	}

}

class AttackSpeedSkill {

	constructor(input, min, factor, max, tableVariable, predicate) {
		this.input = input;
		this.min = min;
		this.factor = factor;
		this.max = max;
		this.tableVariable = tableVariable;
		this.predicate = predicate;
		this.reverse = new Map();
		for (let level = 60; level >= 0; level--) {
			this.reverse.set(this.getEIASFromLevel(level), level);
		}
	}

	calculate(tableVariable, character, wereform) {
		if (this.tableVariable == tableVariable || (this.predicate != null && !this.predicate(character, wereform))) return 0;
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
		let lastLevel = 60;
		for (const [levelEIAS, level] of this.reverse) {
			if (EIAS > levelEIAS) return lastLevel;
			lastLevel = level;
		}
		return 0;
	}

}

const skill = {
    FANATICISM: new AttackSpeedSkill(number.FANATICISM, 10, 30, 40, tv.FANATICISM),
	BURST_OF_SPEED: new AttackSpeedSkill(number.BURST_OF_SPEED, 15, 45, 60, tv.BURST_OF_SPEED/*, (character, _wereform) => character == char.ASSASSIN*/),
	WEREWOLF: new AttackSpeedSkill(number.WEREWOLF, 10, 70, 80, tv.WEREWOLF, (_character, wereform) => wereform == wf.WEREWOLF),
	MAUL: new AttackSpeedSkill(number.MAUL, -1, 3, 99, tv.MAUL, (_character, wereform) => wereform == wf.WEREBEAR),
	FRENZY: new AttackSpeedSkill(number.FRENZY, 0, 50, 50, tv.FRENZY, (character, _wereform) => character == char.BARBARIAN || character == char.BASH_BARBARIAN),
	HOLY_FREEZE: new AttackSpeedSkill(number.HOLY_FREEZE, 25, 35, 50) // -50 cap cuz chill effectiveness
};

const skillsMap = new Map();
const skills = {
    // common
    STANDARD: addSkill(new Skill("Standard", true, false, false, false)), // offhand hits have different speed in normal attack
    THROW: addSkill(new Skill("Throw", false, false, false, false)),
    KICK: addSkill(new Skill("Kick", false, false, false, false)), // kicking barrels open
    // amazon
    DODGE: addSkill(new Skill("Dodge", false, false, false, false)),
    IMPALE: addSkill(new Skill("Impale", false, false, true, false)),
    JAB: addSkill(new Skill("Jab", false, false, true, false)),
    STRAFE: addSkill(new Skill("Strafe", false, false, false, true)),
    FEND: addSkill(new Skill("Fend", false, false, false, true)),
    // assassin
    TIGER_STRIKE: addSkill(new Skill("Tiger Strike", false, false, false, false)),
    COBRA_STRIKE: addSkill(new Skill("Cobra Strike", false, false, false, false)),
    PHOENIX_STRIKE: addSkill(new Skill("Phoenix Strike", false, false, false, false)),
    FISTS_OF_FIRE: addSkill(new Skill("Fists of Fire", true, false, true, false)),
    CLAWS_OF_THUNDER: addSkill(new Skill("Claws of Thunder", true, false, true, false)),
    BLADES_OF_ICE: addSkill(new Skill("Blades of Ice", true, false, true, false)),
    DRAGON_CLAW: addSkill(new Skill("Dragon Claw", true, true, false)),
    DRAGON_TAIL: addSkill(new Skill("Dragon Tail", false, false, false)),
    DRAGON_TALON: addSkill(new Skill("Dragon Talon", false, false, true)),
    LAYING_TRAPS: addSkill(new Skill("Laying Traps", false, false, false)),
    // barbarian
    DOUBLE_SWING: addSkill(new Skill("Double Swing", true, true, true, false)),
    FRENZY: addSkill(new Skill("Frenzy", true, true, true, false)),
    TAUNT: addSkill(new Skill("Taunt", true, false, false)), // frenzy merc
    DOUBLE_THROW: addSkill(new Skill("Double Throw", true, true, true, false)),
    WHIRLWIND: addSkill(new Skill("Whirlwind", true, false, false, false)), // whirlwind is technically a sequence skill, but its very hardcoded, so it doesnt follow the same logic for calculation
    CONCENTRATE: addSkill(new Skill("Concentrate", false, false, false, false)),
    BERSERK: addSkill(new Skill("Berserk", false, false, false, false)),
    BASH: addSkill(new Skill("Bash", false, false, false, false)),
    STUN: addSkill(new Skill("Stun", false, false, false, false)),
    // druid
    FERAL_RAGE: addSkill(new Skill("Feral Rage", false, false, false, false)), // barb can dual wield but it doesn't impact the skill since its primary-only
    HUNGER: addSkill(new Skill("Hunger", false, false, false, false)),
    RABIES: addSkill(new Skill("Rabies", false, false, false, false)),
    FURY: addSkill(new Skill("Fury", false, false, false, false)),
    // paladin
    ZEAL: addSkill(new Skill("Zeal", false, false, false, true)),
    SMITE: addSkill(new Skill("Smite", false, false, false, false)),
    SACRIFICE: addSkill(new Skill("Sacrifice", false, false, false, false)),
    VENGEANCE: addSkill(new Skill("Vengeance", false, false, false, false)),
    CONVERSION: addSkill(new Skill("Conversion", false, false, false, false))
};

function addSkill(skill) { skillsMap.set(skill.name, skill); return skill; }

export function getSkill(name) {
    return skillsMap.get(name);
}

const wt = { // weapon types
    UNARMED: new WeaponType(true, true, [
        [char.AMAZON, [13, 8]],
        [char.ASSASSIN, [11, 12, 6]],
        [char.BARBARIAN, [12, 6]],
        [char.DRUID, [16, 8]],
        [char.NECROMANCER, [15, 8]],
        [char.PALADIN, [14, 7]],
        [char.SORCERESS, [16, 9]],
        [char.ROGUE_SCOUT, 15], // assumed
        [char.DESERT_MERCENARY, 16], // assumed
        [char.BASH_BARBARIAN, 16],  // assumed
        [char.FRENZY_BARBARIAN, 16]  // assumed
    ]),
    CLAW: new WeaponType(true, true, [[char.ASSASSIN, [11, 12, 6]]]),
    ONE_HANDED_SWINGING: new WeaponType(true, true, [
        [char.AMAZON, [16, 10]],
        [char.ASSASSIN, [15, 7]],
        [char.BARBARIAN, [16, 7]],
        [char.DRUID, [19, 9]],
        [char.NECROMANCER, [19, 9]],
        [char.PALADIN, [15, 7]],
        [char.SORCERESS, [20, 12]],
        [char.BASH_BARBARIAN, 16],
        [char.FRENZY_BARBARIAN, 16]
    ]),
    ONE_HANDED_THRUSTING: new WeaponType(true, true, [
        [char.AMAZON, [15, 9]],
        [char.ASSASSIN, [15, 7]],
        [char.BARBARIAN, [16, 7]],
        [char.DRUID, [19, 8]],
        [char.NECROMANCER, [19, 9]],
        [char.PALADIN, [17, 8]],
        [char.SORCERESS, [19, 11]],
        [char.DESERT_MERCENARY, 16]
    ]),
    TWO_HANDED_SWORD: new WeaponType(true, false, [
        [char.AMAZON, [20, 12]],
        [char.ASSASSIN, [23, 11]],
        [char.BARBARIAN, [18, 8]],
        [char.DRUID, [21, 10]],
        [char.NECROMANCER, [23, 11]],
        [char.PALADIN, [18, 19, 8]],
        [char.SORCERESS, [24, 14]],
        [char.BASH_BARBARIAN, 16],
        [char.FRENZY_BARBARIAN, 16]
    ]),
    TWO_HANDED_THRUSTING: new WeaponType(true, false, [
        [char.AMAZON, [18, 11]],
        [char.ASSASSIN, [23, 10]],
        [char.BARBARIAN, [19, 9]],
        [char.DRUID, [23, 9]],
        [char.NECROMANCER, [24, 10]],
        [char.PALADIN, [20, 8]],
        [char.SORCERESS, [23, 13]],
        [char.DESERT_MERCENARY, 16]
    ]),
    // all other two handed weapons
    TWO_HANDED: new WeaponType(true, false, [ // original calc suggests this is STF while two handed sword is 2HS
        [char.AMAZON, [20, 12]],
        [char.ASSASSIN, [19, 9]],
        [char.BARBARIAN, [19, 9]],
        [char.DRUID, [17, 9]],
        [char.NECROMANCER, [20, 11]],
        [char.PALADIN, [18, 9]],
        [char.SORCERESS, [18, 11]],
        [char.DESERT_MERCENARY, 16]
    ]),
    BOW: new WeaponType(false, false, [
        [char.AMAZON, [14, 6]],
        [char.ASSASSIN, [16, 7]],
        [char.BARBARIAN, [15, 7]],
        [char.DRUID, [16, 8]],
        [char.NECROMANCER, [18, 9]],
        [char.PALADIN, [16, 8]],
        [char.SORCERESS, [17, 9]],
        [char.ROGUE_SCOUT, 15]
    ]),
    CROSSBOW: new WeaponType(false, false, [
        [char.AMAZON, [20, 9]],
        [char.ASSASSIN, [21, 10]],
        [char.BARBARIAN, [20, 10]],
        [char.DRUID, [20, 10]],
        [char.NECROMANCER, [20, 11]],
        [char.PALADIN, [20, 10]],
        [char.SORCERESS, [20, 11]]
    ]),
    THROWING: new WeaponType(true, true, [
        [char.AMAZON, 16],
        [char.ASSASSIN, 16],
        [char.BARBARIAN, 16],
        [char.DRUID, 18],
        [char.NECROMANCER, 20],
        [char.PALADIN, 16],
        [char.SORCERESS, 20]
    ])
};

const ic = {
	NONE: "None",
	AXE: "Axe",
	DAGGER: "Dagger",
	POLEARM: "Polearm",
	JAVELIN: "Javelin",
	SPEAR: "Spear",
	SWORD: "Sword",
	MACE: "Mace",
	MISSILE: "Missile",
	STAFF: "Staff",
	ORB: "Orb",
	CLAW: "Claw",
	THROWING: "Throwing"
};

const weaponsMap = new Map([
	["None", new Weapon("None", 0, wt.UNARMED, ic.NONE, 0)],
	["Ahab Spear", new Weapon("Ahab Spear", 20, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Ancient Axe", new Weapon("Ancient Axe", 10, wt.TWO_HANDED, ic.AXE, 6)],
	["Ancient Bow", new Weapon("Ancient Bow", 10, wt.BOW, ic.MISSILE, 6)],
	["Ancient Maul", new Weapon("Ancient Maul", 10, wt.TWO_HANDED, ic.MACE, 6)],
	["Ancient Shards", new Weapon("Ancient Shards", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Ancient Spike", new Weapon("Ancient Spike", -10, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 2)],
	["Ancient Sword", new Weapon("Ancient Sword", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 3)],
	["Arbalest", new Weapon("Arbalest", -20, wt.CROSSBOW, ic.MISSILE, 3)],
	["Arcane Bow", new Weapon("Arcane Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Arcane Mace", new Weapon("Arcane Mace", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Arcane Staff", new Weapon("Arcane Staff", 0, wt.TWO_HANDED, ic.STAFF, 6)],
	["Arreat's Hatchet", new Weapon("Arreat's Hatchet", -10, wt.ONE_HANDED_SWINGING, ic.THROWING, 0)],
	["Ashwood Bow", new Weapon("Ashwood Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Assassin Crossbow", new Weapon("Assassin Crossbow", -40, wt.CROSSBOW, ic.MISSILE, 5)],
	["Axe", new Weapon("Axe", 5, wt.ONE_HANDED_SWINGING, ic.AXE, 4)],
	["Balanced Axe", new Weapon("Balanced Axe", -15, wt.ONE_HANDED_SWINGING, ic.THROWING, 0)],
	["Balanced Dagger", new Weapon("Balanced Dagger", -20, wt.ONE_HANDED_THRUSTING, ic.THROWING, 0)],
	["Balanced Hatchet", new Weapon("Balanced Hatchet", -15, wt.ONE_HANDED_SWINGING, ic.THROWING, 0)],
	["Balanced Knife", new Weapon("Balanced Knife", -20, wt.ONE_HANDED_THRUSTING, ic.THROWING, 0)],
	["Ballista", new Weapon("Ballista", 0, wt.CROSSBOW, ic.MISSILE, 6)],
	["Barbarian Tomahawk", new Weapon("Barbarian Tomahawk", 0, wt.ONE_HANDED_SWINGING, ic.AXE, 2)],
	["Barbed Club", new Weapon("Barbed Club", -5, wt.ONE_HANDED_SWINGING, ic.MACE, 3)],
	["Bardiche", new Weapon("Bardiche", 10, wt.TWO_HANDED, ic.POLEARM, 3)],
	["Bastard Sword", new Weapon("Bastard Sword", 10, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	["Battering Arm", new Weapon("Battering Arm", 0, wt.UNARMED, ic.CLAW, 4)],
	["Battle Axe", new Weapon("Battle Axe", 10, wt.TWO_HANDED, ic.AXE, 5)],
	["Battle Cestus", new Weapon("Battle Cestus", -10, wt.CLAW, ic.CLAW, 2)],
	["Battle Dart", new Weapon("Battle Dart", 0, wt.ONE_HANDED_THRUSTING, ic.THROWING, 0)],
	["Battle Hammer", new Weapon("Battle Hammer", 20, wt.ONE_HANDED_SWINGING, ic.MACE, 4)],
	["Battle Scythe", new Weapon("Battle Scythe", -10, wt.TWO_HANDED, ic.POLEARM, 5)],
	["Battle Staff", new Weapon("Battle Staff", -10, wt.TWO_HANDED, ic.STAFF, 4)],
	["Battle Sword", new Weapon("Battle Sword", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 4)],
	["Bearded Axe", new Weapon("Bearded Axe", 0, wt.TWO_HANDED, ic.AXE, 5)],
	["Bec-de-Corbin", new Weapon("Bec-de-Corbin", 0, wt.TWO_HANDED, ic.POLEARM, 6)],
	["Bill", new Weapon("Bill", 0, wt.TWO_HANDED, ic.POLEARM, 4)],
	["Blade Talons", new Weapon("Blade Talons", -20, wt.CLAW, ic.CLAW, 3)],
	["Blade", new Weapon("Blade", -10, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 2)],
	["Blessed Edge", new Weapon("Blessed Edge", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 3)],
	["Blessed Scepter", new Weapon("Blessed Scepter", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 5)],
	["Bone Wand", new Weapon("Bone Wand", -20, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Brandistock", new Weapon("Brandistock", -20, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 5)],
	["Brass Knuckle", new Weapon("Brass Knuckle", -10, wt.UNARMED, ic.CLAW, 3)],
	["Brawn Axe", new Weapon("Brawn Axe", -15, wt.TWO_HANDED, ic.AXE, 4)],
	["Broad Axe", new Weapon("Broad Axe", 0, wt.TWO_HANDED, ic.AXE, 5)],
	["Broad Sword", new Weapon("Broad Sword", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 4)],
	["Burnt Wand", new Weapon("Burnt Wand", 0, wt.ONE_HANDED_SWINGING, ic.STAFF, 1)],
	["Callous Wand", new Weapon("Callous Wand", -20, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Carved Bone", new Weapon("Carved Bone", -20, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 1)],
	["Cedar Bow", new Weapon("Cedar Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Cedar Staff", new Weapon("Cedar Staff", 10, wt.TWO_HANDED, ic.STAFF, 4)],
	["Celestial Blade", new Weapon("Celestial Blade", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 4)],
	["Celestial Scepter", new Weapon("Celestial Scepter", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Ceremonial Bow", new Weapon("Ceremonial Bow", 10, wt.BOW, ic.MISSILE, 5)],
	["Ceremonial Javelin", new Weapon("Ceremonial Javelin", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Ceremonial Dagger", new Weapon("Ceremonial Dagger", -30, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 3)],
	["Ceremonial Pike", new Weapon("Ceremonial Pike", 20, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Ceremonial Spear", new Weapon("Ceremonial Spear", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Cestus", new Weapon("Cestus", 0, wt.CLAW, ic.CLAW, 2)],
	["Choice Crossbow", new Weapon("Choice Crossbow", -20, wt.CROSSBOW, ic.MISSILE, 3)],
	["Chu-Ko-Nu", new Weapon("Chu-Ko-Nu", -40, wt.CROSSBOW, ic.MISSILE, 5)],
	["Cinquedeas", new Weapon("Cinquedeas", -30, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 3)],
	["Clasped Orb", new Weapon("Clasped Orb", 0, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Claws", new Weapon("Claws", -10, wt.CLAW, ic.CLAW, 3)],
	["Claymore", new Weapon("Claymore", 10, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	["Cleaver", new Weapon("Cleaver", 5, wt.ONE_HANDED_SWINGING, ic.AXE, 4)],
	["Cloudy Sphere", new Weapon("Cloudy Sphere", 0, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Club", new Weapon("Club", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Composite Bow", new Weapon("Composite Bow", -10, wt.BOW, ic.MISSILE, 4)],
	["Consecrated Scepter", new Weapon("Consecrated Scepter", -15, wt.ONE_HANDED_SWINGING, ic.MACE, 5)],
	["Cranium Basher", new Weapon("Cranium Basher", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Crossbow", new Weapon("Crossbow", -10, wt.CROSSBOW, ic.MISSILE, 4)],
	["Crowbill", new Weapon("Crowbill", -10, wt.ONE_HANDED_SWINGING, ic.AXE, 6)],
	["Cryptic Sword", new Weapon("Cryptic Sword", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 4)],
	["Crystal Sword", new Weapon("Crystal Sword", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 6)],
	["Crystalline Globe", new Weapon("Crystalline Globe", -10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Cudgel", new Weapon("Cudgel", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Cutlass", new Weapon("Cutlass", -30, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Dacian Falx", new Weapon("Dacian Falx", 10, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	[ic.DAGGER, new Weapon(ic.DAGGER, -20, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 1)],
	["Dark Bow", new Weapon("Dark Bow", -10, wt.BOW, ic.MISSILE, 4)],
	["Dark Sword", new Weapon("Dark Sword", -10, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	["Death Blade", new Weapon("Death Blade", 5, wt.TWO_HANDED_SWORD, ic.SWORD, 6)],
	["Death Reaper", new Weapon("Death Reaper", -10, wt.TWO_HANDED, ic.POLEARM, 6)],
	["Demon Heart", new Weapon("Demon Heart", 0, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Demonic Scythe", new Weapon("Demonic Scythe", -20, wt.TWO_HANDED, ic.POLEARM, 6)],
	["Demonic Wand", new Weapon("Demonic Wand", 0, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Desert Sword", new Weapon("Desert Sword", -20, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Dimensional Blade", new Weapon("Dimensional Blade", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 6)],
	["Dimensional Shard", new Weapon("Dimensional Shard", 10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Dire Flail", new Weapon("Dire Flail", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 5)],
	["Dire Pilum", new Weapon("Dire Pilum", 0, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Dire Scythe", new Weapon("Dire Scythe", -20, wt.TWO_HANDED, ic.POLEARM, 6)],
	["Dirk", new Weapon("Dirk", 0, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 1)],
	["Divine Blade", new Weapon("Divine Blade", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 4)],
	["Divine Scepter", new Weapon("Divine Scepter", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 5)],
	["Double Axe", new Weapon("Double Axe", 10, wt.ONE_HANDED_SWINGING, ic.AXE, 5)],
	["Double Bow", new Weapon("Double Bow", -10, wt.BOW, ic.MISSILE, 4)],
	["Dragon Spear", new Weapon("Dragon Spear", -20, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 5)],
	["Duo-Axe", new Weapon("Duo-Axe", 10, wt.ONE_HANDED_SWINGING, ic.AXE, 5)],
	["Eagle Orb", new Weapon("Eagle Orb", -10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Edge Bow", new Weapon("Edge Bow", 5, wt.BOW, ic.MISSILE, 3)],
	["Elder Cane", new Weapon("Elder Cane", -10, wt.TWO_HANDED, ic.STAFF, 2)],
	["Eldritch Orb", new Weapon("Eldritch Orb", -10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Elven Bow", new Weapon("Elven Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Energy Blade", new Weapon("Energy Blade", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 3)],
	["Espandon", new Weapon("Espandon", 0, wt.TWO_HANDED_SWORD, ic.SWORD, 3)],
	["Executioner Sword", new Weapon("Executioner Sword", 10, wt.TWO_HANDED_SWORD, ic.SWORD, 6)],
	["Falchion", new Weapon("Falchion", 20, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Fang Knife", new Weapon("Fang Knife", -30, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 3)],
	["Fascia", new Weapon("Fascia", 0, wt.CLAW, ic.CLAW, 2)],
	["Feral Claws", new Weapon("Feral Claws", -20, wt.CLAW, ic.CLAW, 3)],
	["Flail", new Weapon("Flail", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 5)],
	["Flamberge", new Weapon("Flamberge", -10, wt.TWO_HANDED_SWORD, ic.SWORD, 5)],
	["Flanged Mace", new Weapon("Flanged Mace", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Francisca", new Weapon("Francisca", 0, wt.ONE_HANDED_SWINGING, ic.THROWING, 0)],
	["Fuscina", new Weapon("Fuscina", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 4)],
	["Giant Axe", new Weapon("Giant Axe", 10, wt.TWO_HANDED, ic.AXE, 6)],
	["Giant Sword", new Weapon("Giant Sword", 0, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	["Gladiator Blade", new Weapon("Gladiator Blade", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Gladius", new Weapon("Gladius", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Glaive", new Weapon("Glaive", 20, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Glowing Orb", new Weapon("Glowing Orb", -10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Gnarled Staff", new Weapon("Gnarled Staff", 10, wt.TWO_HANDED, ic.STAFF, 4)],
	["Gothic Axe", new Weapon("Gothic Axe", -10, wt.TWO_HANDED, ic.AXE, 6)],
	["Gothic Bow", new Weapon("Gothic Bow", 10, wt.BOW, ic.MISSILE, 6)],
	["Gothic Staff", new Weapon("Gothic Staff", -10, wt.TWO_HANDED, ic.STAFF, 4)],
	["Gothic Sword", new Weapon("Gothic Sword", 10, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	["Grand Matron Bow", new Weapon("Grand Matron Bow", 10, wt.BOW, ic.MISSILE, 5)],
	["Grand Scepter", new Weapon("Grand Scepter", 10, wt.ONE_HANDED_SWINGING, ic.MACE, 3)],
	["Grapnel", new Weapon("Grapnel", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 4)],
	["Grave Wand", new Weapon("Grave Wand", 0, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Great Axe", new Weapon("Great Axe", -10, wt.TWO_HANDED, ic.AXE, 6)],
	["Great Maul", new Weapon("Great Maul", 20, wt.TWO_HANDED, ic.MACE, 6)],
	["Great Pilum", new Weapon("Great Pilum", 0, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Great Scepter", new Weapon("Great Scepter", -15, wt.ONE_HANDED_SWINGING, ic.MACE, 5)],
	["Great Sword", new Weapon("Great Sword", 10, wt.TWO_HANDED_SWORD, ic.SWORD, 6)],
	["Greater Claws", new Weapon("Greater Claws", -20, wt.CLAW, ic.CLAW, 3)],
	["Greater Talons", new Weapon("Greater Talons", -30, wt.CLAW, ic.CLAW, 3)],
	["Grim Scythe", new Weapon("Grim Scythe", -10, wt.TWO_HANDED, ic.POLEARM, 6)],
	["Grim Wand", new Weapon("Grim Wand", 0, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Guardian", new Weapon("Guardian", 0, wt.TWO_HANDED, ic.POLEARM, 6)],
	["Guisarme", new Weapon("Guisarme", -10, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 3)],
	["Guillotine Axe", new Weapon("Guillotine Axe", -10, wt.TWO_HANDED, ic.AXE, 6)],
	["Halberd", new Weapon("Halberd", 0, wt.TWO_HANDED, ic.POLEARM, 6)],
	["Hand Axe", new Weapon("Hand Axe", 0, wt.ONE_HANDED_SWINGING, ic.AXE, 2)],
	["Hand Scythe", new Weapon("Hand Scythe", -10, wt.CLAW, ic.CLAW, 2)],
	["Harpoon", new Weapon("Harpoon", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Hatchet Hands", new Weapon("Hatchet Hands", 0, wt.CLAW, ic.CLAW, 2)],
	["Hatchet", new Weapon("Hatchet", 0, wt.ONE_HANDED_SWINGING, ic.AXE, 2)],
	["Heavenly Stone", new Weapon("Heavenly Stone", -10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Heavy Axe", new Weapon("Heavy Axe", 0, wt.TWO_HANDED, ic.AXE, 5)],
	["Heavy Crossbow", new Weapon("Heavy Crossbow", 0, wt.CROSSBOW, ic.MISSILE, 6)],
	["Hellfire Sword", new Weapon("Hellfire Sword", 10, wt.TWO_HANDED_SWORD, ic.SWORD, 5)],
	["Highland Hatchet", new Weapon("Highland Hatchet", -10, wt.ONE_HANDED_SWINGING, ic.THROWING, 0)],
	["Holy Scepter", new Weapon("Holy Scepter", 10, wt.ONE_HANDED_SWINGING, ic.MACE, 3)],
	["Holy Water Sprinkler", new Weapon("Holy Water Sprinkler", 10, wt.ONE_HANDED_SWINGING, ic.MACE, 3)],
	["Hunter's Bow", new Weapon("Hunter's Bow", -10, wt.BOW, ic.MISSILE, 4)],
	["Hurlbat", new Weapon("Hurlbat", -15, wt.ONE_HANDED_SWINGING, ic.THROWING, 0)],
	["Impaler", new Weapon("Impaler", 20, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Jagged Star", new Weapon("Jagged Star", 10, wt.ONE_HANDED_SWINGING, ic.MACE, 3)],
	["Jared's Stone", new Weapon("Jared's Stone", 10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	[ic.JAVELIN, new Weapon(ic.JAVELIN, -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Jeweled Edge", new Weapon("Jeweled Edge", -30, wt.ONE_HANDED_SWINGING, ic.SWORD, 6)],
	["Jo Staff", new Weapon("Jo Staff", -10, wt.TWO_HANDED, ic.STAFF, 2)],
	["Judgement Blade", new Weapon("Judgement Blade", -15, wt.TWO_HANDED_SWORD, ic.SWORD, 3)],
	["Katana", new Weapon("Katana", -30, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Katar", new Weapon("Katar", -10, wt.CLAW, ic.CLAW, 2)],
	["Knout", new Weapon("Knout", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 5)],
	["Kris", new Weapon("Kris", -30, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 3)],
	["Lance", new Weapon("Lance", 20, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Large Axe", new Weapon("Large Axe", -10, wt.TWO_HANDED, ic.AXE, 4)],
	["Large Siege Bow", new Weapon("Large Siege Bow", 10, wt.BOW, ic.MISSILE, 6)],
	["Light Crossbow", new Weapon("Light Crossbow", -20, wt.CROSSBOW, ic.MISSILE, 3)],
	["Lissom Spear", new Weapon("Lissom Spear", 10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Lochaber Axe", new Weapon("Lochaber Axe", 10, wt.TWO_HANDED, ic.POLEARM, 3)],
	["Long Battle Bow", new Weapon("Long Battle Bow", 10, wt.BOW, ic.MISSILE, 6)],
	["Long Bow", new Weapon("Long Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Long Staff", new Weapon("Long Staff", 0, wt.TWO_HANDED, ic.STAFF, 3)],
	["Long Sword", new Weapon("Long Sword", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 4)],
	["Long War Bow", new Weapon("Long War Bow", 10, wt.BOW, ic.MISSILE, 6)],
	[ic.MACE, new Weapon(ic.MACE, 0, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Mage Staff", new Weapon("Mage Staff", -10, wt.TWO_HANDED, ic.STAFF, 4)],
	["Maiden Javelin", new Weapon("Maiden Javelin", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Maiden Pike", new Weapon("Maiden Pike", 10, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Maiden Spear", new Weapon("Maiden Spear", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Mana Blade", new Weapon("Mana Blade", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Marksman Bow", new Weapon("Marksman Bow", 10, wt.BOW, ic.MISSILE, 6)],
	["Marskman Crossbow", new Weapon("Marskman Crossbow", -10, wt.CROSSBOW, ic.MISSILE, 4)],
	["Martel de Fer", new Weapon("Martel de Fer", 20, wt.TWO_HANDED, ic.MACE, 6)],
	["Matriarchal Bow", new Weapon("Matriarchal Bow", -10, wt.BOW, ic.MISSILE, 5)],
	["Matriarchal Javelin", new Weapon("Matriarchal Javelin", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Matriarchal Pike", new Weapon("Matriarchal Pike", 20, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Matriarchal Spear", new Weapon("Matriarchal Spear", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Maul", new Weapon("Maul", 10, wt.TWO_HANDED, ic.MACE, 6)],
	["Military Axe", new Weapon("Military Axe", -10, wt.TWO_HANDED, ic.AXE, 4)],
	["Military Hammer", new Weapon("Military Hammer", 20, wt.ONE_HANDED_SWINGING, ic.MACE, 4)],
	["Military Pick", new Weapon("Military Pick", -10, wt.ONE_HANDED_SWINGING, ic.AXE, 6)],
	["Mithril Knife", new Weapon("Mithril Knife", 0, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 1)],
	["Morning Star", new Weapon("Morning Star", 10, wt.ONE_HANDED_SWINGING, ic.MACE, 3)],
	["Mystic Staff", new Weapon("Mystic Staff", 0, wt.TWO_HANDED, ic.STAFF, 3)],
	["Naga", new Weapon("Naga", 0, wt.ONE_HANDED_SWINGING, ic.AXE, 6)],
	["Ninja To", new Weapon("Ninja To", -30, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Oak Branch", new Weapon("Oak Branch", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Odysseus Crossbow", new Weapon("Odysseus Crossbow", 0, wt.CROSSBOW, ic.MISSILE, 6)],
	["Okrist", new Weapon("Okrist", 10, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Partizan", new Weapon("Partizan", 10, wt.TWO_HANDED, ic.POLEARM, 5)],
	["Petrified Staff", new Weapon("Petrified Staff", 10, wt.TWO_HANDED, ic.STAFF, 4)],
	["Petrified Wand", new Weapon("Petrified Wand", 10, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Pike", new Weapon("Pike", 20, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Pilum", new Weapon("Pilum", 0, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Poignard", new Weapon("Poignard", -20, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 1)],
	["Pole Gauche", new Weapon("Pole Gauche", 10, wt.TWO_HANDED, ic.POLEARM, 4)],
	["Poleaxe", new Weapon("Poleaxe", 10, wt.TWO_HANDED, ic.POLEARM, 5)],
	["Precision Bow", new Weapon("Precision Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Precision Cleaver", new Weapon("Precision Cleaver", 5, wt.ONE_HANDED_SWINGING, ic.AXE, 4)],
	["Quarterstaff", new Weapon("Quarterstaff", 0, wt.TWO_HANDED, ic.STAFF, 3)],
	["Quhab", new Weapon("Quhab", 0, wt.CLAW, ic.CLAW, 3)],
	["Raging Knuckle", new Weapon("Raging Knuckle", -10, wt.UNARMED, ic.CLAW, 3)],
	["Ranseur", new Weapon("Ranseur", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Rapier", new Weapon("Rapier", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Razor Axe", new Weapon("Razor Axe", -10, wt.ONE_HANDED_SWINGING, ic.AXE, 6)],
	["Razor Bow", new Weapon("Razor Bow", -10, wt.BOW, ic.MISSILE, 4)],
	["Reflex Bow", new Weapon("Reflex Bow", 10, wt.BOW, ic.MISSILE, 5)],
	["Repeating Crossbow", new Weapon("Repeating Crossbow", -40, wt.CROSSBOW, ic.MISSILE, 5)],
	["Ritualistic Dagger", new Weapon("Ritualistic Dagger", -30, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 3)],
	["Rock Buster", new Weapon("Rock Buster", 0, wt.UNARMED, ic.CLAW, 5)],
	["Rogue Bow", new Weapon("Rogue Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Rondel", new Weapon("Rondel", 0, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 1)],
	["Royal Partizan", new Weapon("Royal Partizan", 10, wt.TWO_HANDED, ic.POLEARM, 5)],
	["Rune Bow", new Weapon("Rune Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Rune Scepter", new Weapon("Rune Scepter", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Rune Staff", new Weapon("Rune Staff", 0, wt.TWO_HANDED, ic.STAFF, 6)],
	["Rune Sword", new Weapon("Rune Sword", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 4)],
	["Runic Talons", new Weapon("Runic Talons", -30, wt.CLAW, ic.CLAW, 3)],
	["Sabre", new Weapon("Sabre", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Sacred Globe", new Weapon("Sacred Globe", -10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Sacred Wand", new Weapon("Sacred Wand", 0, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Sacrificial Dagger", new Weapon("Sacrificial Dagger", -30, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 3)],
	["Scepter", new Weapon("Scepter", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Scimitar", new Weapon("Scimitar", -20, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Scissors Katar", new Weapon("Scissors Katar", -10, wt.CLAW, ic.CLAW, 3)],
	["Scissors Quhab", new Weapon("Scissors Quhab", -10, wt.CLAW, ic.CLAW, 3)],
	["Scissors Suwayyah", new Weapon("Scissors Suwayyah", -10, wt.CLAW, ic.CLAW, 3)],
	["Scythe", new Weapon("Scythe", -10, wt.TWO_HANDED, ic.POLEARM, 5)],
	["Sepulcher Wand", new Weapon("Sepulcher Wand", 10, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Seraphic Scepter", new Weapon("Seraphic Scepter", -15, wt.ONE_HANDED_SWINGING, ic.MACE, 5)],
	["Serrated Star", new Weapon("Serrated Star", 10, wt.ONE_HANDED_SWINGING, ic.MACE, 3)],
	["Shade Bow", new Weapon("Shade Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Shadow Scythe", new Weapon("Shadow Scythe", -10, wt.TWO_HANDED, ic.POLEARM, 5)],
	["Shaman Wand", new Weapon("Shaman Wand", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Shamshir", new Weapon("Shamshir", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Sharp Bow", new Weapon("Sharp Bow", -10, wt.BOW, ic.MISSILE, 4)],
	["Shilleagh", new Weapon("Shilleagh", 0, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Short Battle Bow", new Weapon("Short Battle Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Short Bow", new Weapon("Short Bow", 5, wt.BOW, ic.MISSILE, 3)],
	["Short Siege Bow", new Weapon("Short Siege Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Short Spear", new Weapon("Short Spear", 10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Short Staff", new Weapon("Short Staff", -10, wt.TWO_HANDED, ic.STAFF, 2)],
	["Short Sword", new Weapon("Short Sword", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Short War Bow", new Weapon("Short War Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Siege Crossbow", new Weapon("Siege Crossbow", -10, wt.CROSSBOW, ic.MISSILE, 4)],
	["Simbilan", new Weapon("Simbilan", 10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Slayer Axe", new Weapon("Slayer Axe", 10, wt.TWO_HANDED, ic.AXE, 6)],
	["Smoked Sphere", new Weapon("Smoked Sphere", 0, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Soul Burner", new Weapon("Soul Burner", -10, wt.TWO_HANDED, ic.POLEARM, 6)],
	["Soul Destroyer", new Weapon("Soul Destroyer", -10, wt.TWO_HANDED, ic.POLEARM, 6)],
	["Soul Hunter", new Weapon("Soul Hunter", -10, wt.TWO_HANDED, ic.POLEARM, 6)],
	["Sparkling Ball", new Weapon("Sparkling Ball", 0, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	[ic.SPEAR, new Weapon(ic.SPEAR, -10, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 3)],
	["Spetum", new Weapon("Spetum", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Spiculum", new Weapon("Spiculum", 20, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Spiderwoven Bow", new Weapon("Spiderwoven Bow", 5, wt.BOW, ic.MISSILE, 3)],
	["Spiked Club", new Weapon("Spiked Club", -5, wt.ONE_HANDED_SWINGING, ic.MACE, 2)],
	["Split Axe", new Weapon("Split Axe", 10, wt.TWO_HANDED, ic.AXE, 5)],
	["Stag Bow", new Weapon("Stag Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Stiletto", new Weapon("Stiletto", -10, wt.ONE_HANDED_THRUSTING, ic.DAGGER, 2)],
	["Suwayyah", new Weapon("Suwayyah", 0, wt.CLAW, ic.CLAW, 3)],
	["Swirling Crystal", new Weapon("Swirling Crystal", 10, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Tabar", new Weapon("Tabar", 10, wt.TWO_HANDED, ic.AXE, 5)],
	["Tekko", new Weapon("Tekko", -10, wt.UNARMED, ic.CLAW, 3)],
	["Thorned Club", new Weapon("Thorned Club", -5, wt.ONE_HANDED_SWINGING, ic.MACE, 3)],
	["Throwing Axe", new Weapon("Throwing Axe", 0, wt.ONE_HANDED_SWINGING, ic.THROWING, 0)],
	["Throwing Dagger", new Weapon("Throwing Dagger", 0, wt.ONE_HANDED_THRUSTING, ic.THROWING, 0)],
	["Throwing Hatchet", new Weapon("Throwing Hatchet", 0, wt.ONE_HANDED_SWINGING, ic.THROWING, 0)],
	["Throwing Knife", new Weapon("Throwing Knife", 0, wt.ONE_HANDED_THRUSTING, ic.THROWING, 0)],
	["Throwing Spear", new Weapon("Throwing Spear", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Titan's Dagger", new Weapon("Titan's Dagger", -5, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	["Titan's Maul", new Weapon("Titan's Maul", 20, wt.TWO_HANDED, ic.MACE, 6)],
	["Tomb Wand", new Weapon("Tomb Wand", -20, wt.ONE_HANDED_SWINGING, ic.STAFF, 2)],
	["Tribal Hatchet", new Weapon("Tribal Hatchet", -10, wt.ONE_HANDED_SWINGING, ic.THROWING, 0)],
	["Trident", new Weapon("Trident", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 4)],
	["Trojan Sword", new Weapon("Trojan Sword", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 3)],
	["Tuigan Bow", new Weapon("Tuigan Bow", 0, wt.BOW, ic.MISSILE, 5)],
	["Tulwar", new Weapon("Tulwar", 20, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Tusk Sword", new Weapon("Tusk Sword", 0, wt.TWO_HANDED_SWORD, ic.SWORD, 4)],
	["Twin Axe", new Weapon("Twin Axe", 10, wt.ONE_HANDED_SWINGING, ic.AXE, 5)],
	["Two-Handed Sword", new Weapon("Two-Handed Sword", 0, wt.TWO_HANDED_SWORD, ic.SWORD, 3)],
	["Urgrosh", new Weapon("Urgrosh", 0, wt.TWO_HANDED, ic.POLEARM, 3)],
	["Viking Axe", new Weapon("Viking Axe", 0, wt.ONE_HANDED_SWINGING, ic.AXE, 6)],
	["Viking Sword", new Weapon("Viking Sword", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 4)],
	["Vortex Orb", new Weapon("Vortex Orb", 0, wt.ONE_HANDED_SWINGING, ic.ORB, 3)],
	["Voulge", new Weapon("Voulge", 0, wt.TWO_HANDED, ic.POLEARM, 4)],
	["Wand", new Weapon("Wand", 0, wt.ONE_HANDED_SWINGING, ic.STAFF, 1)],
	["War Axe", new Weapon("War Axe", 0, wt.ONE_HANDED_SWINGING, ic.AXE, 6)],
	["War Club", new Weapon("War Club", 10, wt.TWO_HANDED, ic.MACE, 6)],
	["War Dart", new Weapon("War Dart", -20, wt.ONE_HANDED_THRUSTING, ic.THROWING, 0)],
	["War Fist", new Weapon("War Fist", 0, wt.CLAW, ic.CLAW, 2)],
	["War Fork", new Weapon("War Fork", -20, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 5)],
	["War Hammer", new Weapon("War Hammer", 20, wt.ONE_HANDED_SWINGING, ic.MACE, 4)],
	["War Javelin", new Weapon("War Javelin", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["War Scepter", new Weapon("War Scepter", -10, wt.ONE_HANDED_SWINGING, ic.MACE, 5)],
	["War Scythe", new Weapon("War Scythe", -10, wt.TWO_HANDED, ic.POLEARM, 6)],
	["War Spear", new Weapon("War Spear", -10, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 3)],
	["War Staff", new Weapon("War Staff", 0, wt.TWO_HANDED, ic.STAFF, 6)],
	["War Sword", new Weapon("War Sword", 0, wt.ONE_HANDED_SWINGING, ic.SWORD, 3)],
	["Wakizashi", new Weapon("Wakizashi", -30, wt.ONE_HANDED_SWINGING, ic.SWORD, 2)],
	["Whale Hunter", new Weapon("Whale Hunter", -10, wt.ONE_HANDED_THRUSTING, ic.JAVELIN, 0)],
	["Wizard Blade", new Weapon("Wizard Blade", -10, wt.ONE_HANDED_SWINGING, ic.SWORD, 4)],
	["Wrecking Arm", new Weapon("Wrecking Arm", 0, wt.UNARMED, ic.CLAW, 6)],
	["Wretched Scythe", new Weapon("Wretched Scythe", -20, wt.TWO_HANDED, ic.POLEARM, 6)],
	["Wrist Blade", new Weapon("Wrist Blade", 0, wt.CLAW, ic.CLAW, 2)],
	["Wrist Spike", new Weapon("Wrist Spike", -10, wt.CLAW, ic.CLAW, 2)],
	["Wrist Sword", new Weapon("Wrist Sword", -10, wt.CLAW, ic.CLAW, 3)],
	["Yari", new Weapon("Yari", 0, wt.TWO_HANDED_THRUSTING, ic.SPEAR, 6)],
	["Yew Wand", new Weapon("Yew Wand", 10, wt.ONE_HANDED_SWINGING, ic.STAFF, 1)],
	["Zweihander", new Weapon("Zweihander", -10, wt.TWO_HANDED_SWORD, ic.SWORD, 5)]
]);

export function getWeapon(name) {
	return weaponsMap.get(name);
}

export { container, select, number, checkbox, option, button, skill, other, debug, tv, char, wf, skills, wt, ic, weaponsMap, LINK_SEPARATOR };

export function setupInputElement(element, eventListener) {
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
}

export function setupUpdateTableInputElements(eventListener) {
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
	setupInputElement(checkbox.MARK_OF_BEAR, eventListener);
	setupInputElement(checkbox.DECREPIFY, eventListener);
	setupInputElement(checkbox.CHILLED, eventListener);
}

export function convertIAStoEIAS(IAS) {
	let a = parseInt(120 * IAS / (120 + IAS));
	//console.log("convertIAStoEIAS: ", IAS, "->", a);
	return a;
}

export function convertEIAStoIAS(EIAS) {
	let a = Math.ceil(120 * EIAS / (120 - EIAS));
	//console.log("convertEIAStoIAS: ", EIAS, "->", a);
	return a;
}
