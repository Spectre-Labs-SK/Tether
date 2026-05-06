import type { ThemeId } from './themes';

export type GearSlot = 'HELM' | 'TORSO' | 'LEGS' | 'ACCESSORY';
export type GearRarity = 'COMMON' | 'ELITE' | 'PRIME' | 'LEGENDARY';

export type GearItem = {
  id: string;
  name: string;
  slot: GearSlot;
  rarity: GearRarity;
  themeId: ThemeId;
  flavour: string;
};

// ─── STARTER ──────────────────────────────────────────────────────────────────

const STARTER_GEAR: GearItem[] = [
  // HELM
  { id: 's-h-01', slot: 'HELM', rarity: 'COMMON', themeId: 'STARTER', name: 'Field Plate', flavour: 'Issued at intake. No markings.' },
  { id: 's-h-02', slot: 'HELM', rarity: 'COMMON', themeId: 'STARTER', name: 'Operator Hood', flavour: 'Soft. Silent. Effective.' },
  { id: 's-h-03', slot: 'HELM', rarity: 'ELITE',  themeId: 'STARTER', name: 'Sentinel Crown', flavour: 'Three interlocking panels. Earned, not issued.' },
  // TORSO
  { id: 's-t-01', slot: 'TORSO', rarity: 'COMMON', themeId: 'STARTER', name: 'Basic Plate',   flavour: 'Dented. Still standing.' },
  { id: 's-t-02', slot: 'TORSO', rarity: 'COMMON', themeId: 'STARTER', name: 'Shadow Wrap',   flavour: 'Layered dark cloth. No profile.' },
  { id: 's-t-03', slot: 'TORSO', rarity: 'ELITE',  themeId: 'STARTER', name: 'Vanguard Rig',  flavour: 'Modular plate carrier. Everything has a place.' },
  // LEGS
  { id: 's-l-01', slot: 'LEGS', rarity: 'COMMON', themeId: 'STARTER', name: 'Combat Greaves', flavour: 'Articulated. Heavy. Reliable.' },
  { id: 's-l-02', slot: 'LEGS', rarity: 'COMMON', themeId: 'STARTER', name: 'Recon Wraps',    flavour: 'Bound tight. Nothing catches.' },
  { id: 's-l-03', slot: 'LEGS', rarity: 'ELITE',  themeId: 'STARTER', name: 'Siege Plates',   flavour: 'You are not moving until you decide to.' },
  // ACCESSORY
  { id: 's-a-01', slot: 'ACCESSORY', rarity: 'COMMON', themeId: 'STARTER', name: 'Signal Torch',      flavour: 'Acetylene flame. Doesn\'t go out.' },
  { id: 's-a-02', slot: 'ACCESSORY', rarity: 'COMMON', themeId: 'STARTER', name: 'Compass Shard',     flavour: 'Cracked case. Still points north.' },
  { id: 's-a-03', slot: 'ACCESSORY', rarity: 'ELITE',  themeId: 'STARTER', name: 'Voidwalker Cape',   flavour: 'Falls like smoke. Absorbs light.' },
];

// ─── SCIFI (Signal Lost) ──────────────────────────────────────────────────────

const SCIFI_GEAR: GearItem[] = [
  { id: 'sf-h-01', slot: 'HELM', rarity: 'ELITE',     themeId: 'SCIFI', name: 'Bio-Visor',         flavour: 'Reads biosignals. Yours and everything else\'s.' },
  { id: 'sf-h-02', slot: 'HELM', rarity: 'PRIME',     themeId: 'SCIFI', name: 'Cortex Crown',       flavour: 'The shimmer started here.' },
  { id: 'sf-h-03', slot: 'HELM', rarity: 'LEGENDARY', themeId: 'SCIFI', name: 'Hive Carapace',      flavour: 'Grown, not manufactured. Still growing.' },

  { id: 'sf-t-01', slot: 'TORSO', rarity: 'ELITE',  themeId: 'SCIFI', name: 'Exo-Shell',          flavour: 'Titanium weave over a soft chassis. The machine holds the shape.' },
  { id: 'sf-t-02', slot: 'TORSO', rarity: 'PRIME',  themeId: 'SCIFI', name: 'Synapse Lattice',    flavour: 'Fiber-optic nervous system. It responds before you decide.' },

  { id: 'sf-l-01', slot: 'LEGS', rarity: 'ELITE',  themeId: 'SCIFI', name: 'Mag-Lock Striders',  flavour: 'Locks to any surface. Ceiling included.' },
  { id: 'sf-l-02', slot: 'LEGS', rarity: 'PRIME',  themeId: 'SCIFI', name: 'Phase-Shift Greaves', flavour: 'Briefly between states. Neither stopped nor moving.' },

  { id: 'sf-a-01', slot: 'ACCESSORY', rarity: 'ELITE',     themeId: 'SCIFI', name: 'Neural Tendril',    flavour: 'An extension. Unclear of what.' },
  { id: 'sf-a-02', slot: 'ACCESSORY', rarity: 'PRIME',     themeId: 'SCIFI', name: 'Antimatter Core',   flavour: 'Contained. For now.' },
  { id: 'sf-a-03', slot: 'ACCESSORY', rarity: 'LEGENDARY', themeId: 'SCIFI', name: 'The Shimmer Trail', flavour: 'You leave a line. It persists.' },
];

// ─── FANTASY (The Old World) ──────────────────────────────────────────────────

const FANTASY_GEAR: GearItem[] = [
  { id: 'fa-h-01', slot: 'HELM', rarity: 'ELITE',     themeId: 'FANTASY', name: 'Antler Crown',       flavour: 'The forest titled you. You didn\'t ask.' },
  { id: 'fa-h-02', slot: 'HELM', rarity: 'PRIME',     themeId: 'FANTASY', name: 'Dragon Faceplate',   flavour: 'Scale from a grey. Nothing eats you now.' },
  { id: 'fa-h-03', slot: 'HELM', rarity: 'LEGENDARY', themeId: 'FANTASY', name: 'Elven Dusk Circlet', flavour: 'Forged over three hundred years. They don\'t make them anymore.' },

  { id: 'fa-t-01', slot: 'TORSO', rarity: 'ELITE',  themeId: 'FANTASY', name: 'Scale Mantle',       flavour: 'Overlapping. Flexible. Nothing passes through.' },
  { id: 'fa-t-02', slot: 'TORSO', rarity: 'PRIME',  themeId: 'FANTASY', name: 'Dragonhide Chest',   flavour: 'Still warm.' },

  { id: 'fa-l-01', slot: 'LEGS', rarity: 'ELITE',  themeId: 'FANTASY', name: 'Rune-Bound Greaves',  flavour: 'The runes were carved by someone who believed in something.' },
  { id: 'fa-l-02', slot: 'LEGS', rarity: 'PRIME',  themeId: 'FANTASY', name: 'Spectral Robes',      flavour: 'Floor-length. Doesn\'t collect dust.' },

  { id: 'fa-a-01', slot: 'ACCESSORY', rarity: 'ELITE',     themeId: 'FANTASY', name: 'Familiar Perch',    flavour: 'Something lives on your shoulder. It\'s been there a while.' },
  { id: 'fa-a-02', slot: 'ACCESSORY', rarity: 'PRIME',     themeId: 'FANTASY', name: 'Spellweave Cloak',  flavour: 'Shifts color with intent.' },
  { id: 'fa-a-03', slot: 'ACCESSORY', rarity: 'LEGENDARY', themeId: 'FANTASY', name: 'Court Blade',       flavour: 'Carried openly. A declaration.' },
];

// ─── HISTORICAL (Iron & Doctrine) ─────────────────────────────────────────────

const HISTORICAL_GEAR: GearItem[] = [
  { id: 'hi-h-01', slot: 'HELM', rarity: 'ELITE',     themeId: 'HISTORICAL', name: 'Corinthian Helm',    flavour: 'Face fully enclosed. The polis sees only the soldier.' },
  { id: 'hi-h-02', slot: 'HELM', rarity: 'ELITE',     themeId: 'HISTORICAL', name: 'Horned Nasal',        flavour: 'Norse command officer. Fear is a tactic.' },
  { id: 'hi-h-03', slot: 'HELM', rarity: 'LEGENDARY', themeId: 'HISTORICAL', name: 'Samurai Mempo',       flavour: 'Demon-faced iron mask. The face beneath is irrelevant.' },

  { id: 'hi-t-01', slot: 'TORSO', rarity: 'ELITE',  themeId: 'HISTORICAL', name: 'Legionary Lorica',   flavour: 'Segmented plate. Eight hundred years of iteration.' },
  { id: 'hi-t-02', slot: 'TORSO', rarity: 'PRIME',  themeId: 'HISTORICAL', name: 'Lamellar Chest',     flavour: 'A thousand small plates laced together. Nothing breaks it all at once.' },

  { id: 'hi-l-01', slot: 'LEGS', rarity: 'ELITE',  themeId: 'HISTORICAL', name: 'Phalanx Greaves',    flavour: 'Bronze. Shin-to-knee. The formation depends on this.' },
  { id: 'hi-l-02', slot: 'LEGS', rarity: 'ELITE',  themeId: 'HISTORICAL', name: 'Quilted Armor',      flavour: 'Gambeson beneath everything. The most important layer.' },

  { id: 'hi-a-01', slot: 'ACCESSORY', rarity: 'ELITE',     themeId: 'HISTORICAL', name: 'Legion Eagle',     flavour: 'You carry the standard. The century follows.' },
  { id: 'hi-a-02', slot: 'ACCESSORY', rarity: 'PRIME',     themeId: 'HISTORICAL', name: 'War Banner',        flavour: 'Rally point. Also a target. You accepted that.' },
  { id: 'hi-a-03', slot: 'ACCESSORY', rarity: 'LEGENDARY', themeId: 'HISTORICAL', name: 'Katana of No Name', flavour: 'The maker removed the signature. That\'s a statement.' },
];

// ─── CRYPTID (Unseen Record) ───────────────────────────────────────────────────

const CRYPTID_GEAR: GearItem[] = [
  { id: 'cr-h-01', slot: 'HELM', rarity: 'ELITE',     themeId: 'CRYPTID', name: 'Void Antlers',       flavour: 'Too large. Wrong proportion. Catalogued once.' },
  { id: 'cr-h-02', slot: 'HELM', rarity: 'ELITE',     themeId: 'CRYPTID', name: 'Feathered Mask',     flavour: 'Owlfeather and bone. Turns all the way.' },
  { id: 'cr-h-03', slot: 'HELM', rarity: 'LEGENDARY', themeId: 'CRYPTID', name: 'Moth-Eye Visor',     flavour: 'Compound lens. Sees things before they arrive.' },

  { id: 'cr-t-01', slot: 'TORSO', rarity: 'ELITE',  themeId: 'CRYPTID', name: 'Bark Plate',          flavour: 'Grown into the wearer. Seasonal rings visible.' },
  { id: 'cr-t-02', slot: 'TORSO', rarity: 'PRIME',  themeId: 'CRYPTID', name: 'Quill Mantle',        flavour: 'Defensive. Passive. Don\'t move fast near it.' },

  { id: 'cr-l-01', slot: 'LEGS', rarity: 'COMMON', themeId: 'CRYPTID', name: 'Root Wraps',           flavour: 'Something from underground. Still feeding.' },
  { id: 'cr-l-02', slot: 'LEGS', rarity: 'ELITE',  themeId: 'CRYPTID', name: 'Carapace Greaves',     flavour: 'Exoskeletal. Shed once. Now armor.' },

  { id: 'cr-a-01', slot: 'ACCESSORY', rarity: 'PRIME',     themeId: 'CRYPTID', name: 'Trailing Mist',    flavour: 'Follows without being called. Disappears when observed.' },
  { id: 'cr-a-02', slot: 'ACCESSORY', rarity: 'ELITE',     themeId: 'CRYPTID', name: 'Familiar Crow',    flavour: 'One eye. Knows things.' },
  { id: 'cr-a-03', slot: 'ACCESSORY', rarity: 'LEGENDARY', themeId: 'CRYPTID', name: 'Wendigo Shadow',   flavour: 'A second silhouette that moves independently. Documented. Unexplained.' },
];

// ─── Combined catalog ──────────────────────────────────────────────────────────

export const ALL_GEAR: GearItem[] = [
  ...STARTER_GEAR,
  ...SCIFI_GEAR,
  ...FANTASY_GEAR,
  ...HISTORICAL_GEAR,
  ...CRYPTID_GEAR,
];

export const GEAR_BY_ID: Record<string, GearItem> = Object.fromEntries(
  ALL_GEAR.map(item => [item.id, item])
);

export const GEAR_BY_SLOT: Record<GearSlot, GearItem[]> = {
  HELM:      ALL_GEAR.filter(g => g.slot === 'HELM'),
  TORSO:     ALL_GEAR.filter(g => g.slot === 'TORSO'),
  LEGS:      ALL_GEAR.filter(g => g.slot === 'LEGS'),
  ACCESSORY: ALL_GEAR.filter(g => g.slot === 'ACCESSORY'),
};

export const STARTER_GEAR_IDS: string[] = STARTER_GEAR.map(g => g.id);
