const REGIONS = [
  { id: 1, name: 'Starting Area', locations: ['Elm', 'Pokegear', 'Cherrygrove', 'Mr. Pokemon', 'Map Card', 'Mystic Water', 'Oak'], routes: [29, 30, 31], description: 'New Bark, Cherrygrove + Rts 29-31 (not Dark Cave, though)' },
  { id: 2, name: 'Violet', locations: ['Violet City', 'Violet Mart', 'Sprout Tower', 'Rock Smash Guy', 'Falkner', 'Miracle Seed', 'Old Rod Guru'], routes: [32, 36], description: 'Violet + Rts 32, 36' },
  { id: 3, name: 'Alph Union', locations: ['Ruins of Alph', 'Union Cave'], routes: [], description: 'Ruins of Alph, Union Cave' },
  { id: 4, name: 'Azalea', locations: ['Azalea', 'Ilex', 'Slowpoke Well', 'Kurt', 'Bugsy', 'Charcoal', 'Headbutt', 'King\'s Rock'], routes: [33], description: 'Azalea, Ilex + Rt 33' },
  { id: 5, name: 'Goldenrod', locations: ['Goldenrod', 'National Park', 'Underground', 'Radio', 'Bike Shop', 'Buena', 'Department Store Basement', 'Flower Shop', 'Kenya', 'Bug Catching', 'Soft Sand', 'Sweet Scent', 'Whitney'], routes: [34, 35], description: 'Goldenrod, National Park + Rts 34, 35' },
  { id: 6, name: 'Ecruteak', locations: ['Ecruteak', 'Tin Tower', 'Burned Tower', 'Dance Theatre', 'Itemfinder', 'Morty', 'Rainbow Wing'], routes: [37], description: 'Ecruteak + Rt 37' },
  { id: 7, name: 'Olivine', locations: ['Olivine', 'SS Aqua', 'Good Rod Guru', 'Lighthouse', 'Jasmine'], routes: [38, 39, 40], description: 'Olivine + Rts 39, 40' },
  { id: 8, name: 'Cianwood', locations: ['Cianwood', 'Whirl Islands', 'Chuck', 'Secret Potion'], routes: [41], description: 'Cianwood, Whirl Islands + Rt 41' },
  { id: 9, name: 'Mt. Mortar', locations: ['Mt Mortar'], routes: [42], description: 'Mt. Mortar + Rt 42' },
  { id: 10, name: 'Mahogany', locations: ['Mahogany', 'Lake of Rage', 'Rocket Base', 'Pryce', 'Red Scale'], routes: [43], description: 'Mahogany, Lake of Rage + Rt 43' },
  { id: 11, name: 'Ice Path', locations: ['Ice Path'], routes: [44], description: 'Ice Path + Rt 44' },
  { id: 12, name: 'Blackthorn', locations: ['Blackthorn', 'Dark Cave', 'Clair', 'Dragons Den'], routes: [45, 46], description: 'Blackthorn, Dark Cave (both sides) + Rt 45, 46' },
  { id: 13, name: 'Central Kanto', locations: ['Cerulean', 'Saffron', 'Celadon', 'Vermilion', 'Copycat', 'Dojo', 'Erika', 'Machine Part', 'Bills Grandpa', 'Mr Psychic', 'Silph Co'], routes: [24, 25, 5, 17], description: 'Cerulean, Saffron, Celadon, Vermillion + Rts 24, 25, 5, 17' },
  { id: 14, name: 'Eastern Kanto', locations: ['Lavender', 'Fuchsia', 'Rock Tunnel', 'Power Plant', 'Super Rod Guru', 'Janine', 'Expansion Card'], routes: [8, 9, 10, 11, 12, 13, 14, 15], description: 'Lavender, Fuchsia, Rock Tunnel, Power Plant + Rts 8-15' },
  { id: 15, name: 'Western Kanto', locations: ['Pewter', 'Viridian', 'Pallet', 'Cinnabar', 'Mt Moon', 'Mount Moon', 'Diglett\'s Cave', 'Seafoam Islands', 'Silver Wing'], routes: [4, 2, 1], description: 'Pewter, Viridian, Pallet, Cinnabar, Mt Moon, Diglett\'s Cave, Seafoam + Rts 1-4' },
  { id: 16, name: 'Victory Road', locations: ['Victory Road', 'Indigo Plateau', 'Mt. Silver', 'Tohjo Falls'], routes: [26, 27, 28], description: 'Victory Road, Indigo, Mt. Silver, Tohjo + Rts. 26-28' },
]

export default REGIONS;
