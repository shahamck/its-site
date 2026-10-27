// Representative catalogue. The four categories mirror the current
// innovativeksa.com product groups; the items are placeholders until ITS
// supplies its real list. `kind` picks the blueprint drawing in art.js.

export const CATEGORIES = [
  { id: 'lab', name: 'Laboratory Chemicals & Reagents', short: 'Lab Chemicals',
    blurb: 'Analytical and reagent-grade acids, solvents, salts and indicators, shipped with COA and SDS.' },
  { id: 'industrial', name: 'Industrial & Commercial Chemicals', short: 'Industrial',
    blurb: 'Bulk process, cleaning and water-treatment chemicals in drums, IBCs and sacks.' },
  { id: 'equipment', name: 'Laboratory Equipment & Instruments', short: 'Equipment',
    blurb: 'Balances, meters, heating, mixing and analysis instruments for QC and research labs.' },
  { id: 'education', name: 'Educational Lab Supplies', short: 'Education',
    blurb: 'Glassware, kits and consumables sized for school and university teaching labs.' },
];

export const PRODUCTS = [
  // Laboratory chemicals & reagents
  { id: 'hcl-37', cat: 'lab', kind: 'bottle', name: 'Hydrochloric Acid 37%', grade: 'AR grade', cas: '7647-01-0', packs: ['500 mL', '2.5 L', '25 L'] },
  { id: 'h2so4-98', cat: 'lab', kind: 'bottle', name: 'Sulfuric Acid 98%', grade: 'AR grade', cas: '7664-93-9', packs: ['500 mL', '2.5 L', '25 L'] },
  { id: 'hno3-69', cat: 'lab', kind: 'bottle', name: 'Nitric Acid 69%', grade: 'AR grade', cas: '7697-37-2', packs: ['500 mL', '2.5 L'] },
  { id: 'acetic-glacial', cat: 'lab', kind: 'bottle', name: 'Acetic Acid Glacial', grade: 'AR grade', cas: '64-19-7', packs: ['500 mL', '2.5 L'] },
  { id: 'meoh-hplc', cat: 'lab', kind: 'bottle', name: 'Methanol', grade: 'HPLC grade', cas: '67-56-1', packs: ['1 L', '2.5 L', '4 L'] },
  { id: 'acn-hplc', cat: 'lab', kind: 'bottle', name: 'Acetonitrile', grade: 'HPLC grade', cas: '75-05-8', packs: ['1 L', '2.5 L', '4 L'] },
  { id: 'etoh-abs', cat: 'lab', kind: 'bottle', name: 'Ethanol Absolute', grade: 'AR grade', cas: '64-17-5', packs: ['1 L', '2.5 L'] },
  { id: 'hexane', cat: 'lab', kind: 'bottle', name: 'n-Hexane', grade: 'HPLC grade', cas: '110-54-3', packs: ['1 L', '2.5 L'] },
  { id: 'naoh-pellets', cat: 'lab', kind: 'jar', name: 'Sodium Hydroxide Pellets', grade: 'AR grade', cas: '1310-73-2', packs: ['500 g', '1 kg', '5 kg'] },
  { id: 'agno3', cat: 'lab', kind: 'jar', name: 'Silver Nitrate', grade: 'AR grade', cas: '7761-88-8', packs: ['25 g', '100 g'] },
  { id: 'edta-na2', cat: 'lab', kind: 'jar', name: 'EDTA Disodium Salt', grade: 'AR grade', cas: '6381-92-6', packs: ['250 g', '500 g'] },
  { id: 'buffer-set', cat: 'lab', kind: 'kit', name: 'pH Buffer Set 4.01 / 7.00 / 10.01', grade: 'Traceable standard', packs: ['3 × 500 mL', '3 × 1 L'] },

  // Industrial & commercial
  { id: 'caustic-flakes', cat: 'industrial', kind: 'sack', name: 'Caustic Soda Flakes 99%', grade: 'Technical grade', cas: '1310-73-2', packs: ['25 kg sack', '1 MT pallet'] },
  { id: 'citric-anhyd', cat: 'industrial', kind: 'sack', name: 'Citric Acid Anhydrous', grade: 'Food / technical', cas: '77-92-9', packs: ['25 kg sack', '1 MT pallet'] },
  { id: 'soda-ash', cat: 'industrial', kind: 'sack', name: 'Sodium Carbonate (Soda Ash)', grade: 'Technical grade', cas: '497-19-8', packs: ['25 kg sack', '1 MT pallet'] },
  { id: 'ipa-bulk', cat: 'industrial', kind: 'drum', name: 'Isopropyl Alcohol 99.9%', grade: 'Industrial grade', cas: '67-63-0', packs: ['20 L', '200 L drum', '1000 L IBC'] },
  { id: 'h2o2-50', cat: 'industrial', kind: 'jerrycan', name: 'Hydrogen Peroxide 50%', grade: 'Technical grade', cas: '7722-84-1', packs: ['30 kg can', '1100 kg IBC'] },
  { id: 'naocl-12', cat: 'industrial', kind: 'jerrycan', name: 'Sodium Hypochlorite 12%', grade: 'Water treatment', cas: '7681-52-9', packs: ['25 L can', '1000 L IBC'] },
  { id: 'meg', cat: 'industrial', kind: 'drum', name: 'Mono Ethylene Glycol', grade: 'Fibre grade', cas: '107-21-1', packs: ['230 kg drum', '1000 L IBC'] },
  { id: 'xylene', cat: 'industrial', kind: 'drum', name: 'Xylene Mixed Isomers', grade: 'Industrial grade', cas: '1330-20-7', packs: ['20 L', '180 kg drum'] },

  // Equipment & instruments
  { id: 'bal-analytical', cat: 'equipment', kind: 'balance', name: 'Analytical Balance 220 g / 0.1 mg', grade: 'Internal calibration', packs: ['Unit', 'Unit + IQ/OQ'] },
  { id: 'ph-bench', cat: 'equipment', kind: 'meter', name: 'Benchtop pH / mV Meter', grade: 'With ATC electrode', packs: ['Unit', 'Unit + buffer kit'] },
  { id: 'stirrer-hot', cat: 'equipment', kind: 'stirrer', name: 'Magnetic Stirrer Hotplate', grade: '0–1500 rpm · 340 °C', packs: ['Unit'] },
  { id: 'centrifuge', cat: 'equipment', kind: 'centrifuge', name: 'Benchtop Centrifuge 6,000 rpm', grade: '12 × 15 mL rotor', packs: ['Unit', 'Unit + spare rotor'] },
  { id: 'uvvis', cat: 'equipment', kind: 'spectro', name: 'UV-Vis Spectrophotometer', grade: '190–1100 nm, double beam', packs: ['Unit', 'Unit + install'] },
  { id: 'oven-dry', cat: 'equipment', kind: 'oven', name: 'Drying Oven 55 L', grade: 'Forced air · 300 °C', packs: ['Unit'] },
  { id: 'water-bath', cat: 'equipment', kind: 'bath', name: 'Digital Water Bath 12 L', grade: 'Ambient +5 to 100 °C', packs: ['Unit'] },
  { id: 'microscope', cat: 'equipment', kind: 'microscope', name: 'Binocular Compound Microscope', grade: '40×–1000×, LED', packs: ['Unit'] },

  // Educational supplies
  { id: 'beaker-set', cat: 'education', kind: 'beaker', name: 'Borosilicate Beaker Set', grade: '50 – 1000 mL, 6 pcs', packs: ['Set', 'Case of 10 sets'] },
  { id: 'flask-erl', cat: 'education', kind: 'flask', name: 'Erlenmeyer Flasks 250 mL', grade: 'Borosilicate 3.3', packs: ['Pack of 10', 'Case of 50'] },
  { id: 'tube-rack', cat: 'education', kind: 'tubes', name: 'Test Tubes with Rack', grade: '16 × 150 mm, 24 tubes', packs: ['Set', 'Case of 10 sets'] },
  { id: 'chem-kit', cat: 'education', kind: 'kit', name: 'Student Chemistry Kit', grade: 'Grades 9–12, 40 experiments', packs: ['Kit', 'Class pack (15)'] },
  { id: 'indicator-set', cat: 'education', kind: 'jar', name: 'Indicator Solutions Set', grade: 'Phenolphthalein, methyl orange, litmus', packs: ['Set of 6 × 100 mL'] },
  { id: 'cuso4-edu', cat: 'education', kind: 'jar', name: 'Copper(II) Sulfate Pentahydrate', grade: 'Lab grade', cas: '7758-99-8', packs: ['500 g', '1 kg'] },
  { id: 'student-scope', cat: 'education', kind: 'microscope', name: 'Student Microscope', grade: '40×–400×, cordless LED', packs: ['Unit', 'Class pack (10)'] },
  { id: 'burner', cat: 'education', kind: 'burner', name: 'Bunsen Burner & Tripod Set', grade: 'LPG, with gauze', packs: ['Set', 'Class pack (10)'] },
];

const byId = new Map(PRODUCTS.map((p) => [p.id, p]));
export const productById = (id) => byId.get(id);
export const categoryById = (id) => CATEGORIES.find((c) => c.id === id);
