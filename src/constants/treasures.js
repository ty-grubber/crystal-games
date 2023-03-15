// TODO? Should we get screenshots of each location and use pictures instead of text

const TREASURES = [
  {
    id: 1,
    description: 'Talk to the NPC who lives in the house by Tohjo Falls.',
    hintOpts: [
      'You\'ll find you\'ll treasure a nice chat with a friend.',
      'Not all treasure is found outside.',
    ]
  },
  {
    id: 2,
    description: 'Collect the hidden item in the water on Cycling Road.',
    hintOpts: [
      'You\'ll need to go for a ride to find this treasure.',
      'Some treasures aren\'t immediately obvious.',
    ]
  },
  {
    id: 3,
    description: 'Collect the items from the trees in Pewter City.',
    hintOpts: [
      'You can find treasure by reaping some fruity rewards.',
      'Some treasures come in pairs, or was it pears?',
    ]
  },
  {
    id: 4,
    description: 'Receive the item from the trainer on Route 25.',
    hintOpts: [
      'Treasure is the reward for success on the battlefield.',
      'Sometimes treasure is just given to us willingly.',
    ]
  },
  {
    id: 5,
    description: 'Rescue DJ Mary.',
    hintOpts: [
      'The reward of helping someone is all the treasure you need.',
      'Treasure is the reward for success on the battlefield.',
    ]
  },
  {
    id: 6,
    description: 'Collect the Cerulean City hidden item.',
    hintOpts: [
      'You\'ll need to calm the seas to find some treasures.',
      'Some treasures aren\'t immediately obvious.',
    ]
  },
  {
    id: 7,
    description: 'Collect both berries on Route 46.',
    hintOpts: [
      'You can find treasure by reaping some fruity rewards.',
      'Some treasures come in pairs, or was it pears?',
    ]
  },
  {
    id: 8,
    description: 'Buy a vitamin from the Department Store in Celadon City.',
    hintOpts: [
      'Some treasures can only be bought.',
      'Not all treasure is found outside.',
    ]
  },
  {
    id: 9,
    description: 'Dispel a Whirlpool in the Dragon\'s Den.',
    hintOpts: [
      'You\'ll need to hang ten to find some treasures.',
      'You\'ll need to calm the seas to find some treasures.',
    ]
  },
  {
    id: 10,
    description: 'Inspect two adjacent trash cans in Lt. Surge\'s Gym.',
    hintOpts: [
      'You will find treasure hidden in a Gym.',
      'One person\'s trash is another person\'s treasure.',
    ]
  },
  {
    id: 11,
    description: 'Talk to the optional trainer in Morty\'s Gym twice.',
    hintOpts: [
      'Treasure is the reward for success on the battlefield.',
      'You will find treasure hidden in a Gym.',
    ]
  },
  {
    id: 12,
    description: 'Talk to the captain of the S.S. Anne.',
    hintOpts: [
      'A boat has already salvaged a sunken treasure.',
      'You\'ll find you\'ll treasure a nice chat with a friend.',
    ]
  },
  {
    id: 13,
    description: 'Collect the item behind the Cut Tree connected to the dock on Route 12.',
    hintOpts: [
      'Sometimes the best treasures are just found lying on the ground.',
      'You will need to cut some obstacles to find the treasure you seek.',
    ]
  },
  {
    id: 14,
    description: 'Smash all 3 rocks in the Dark Cave.',
    hintOpts: [
      'Sometimes you need a bright light to find treasure.',
      'Some treasures are found amongst the rubble.',
    ]
  },
  {
    id: 15,
    description: 'Catch a Pokémon in the Grass on Route 10.',
    hintOpts: [
      'New friends are always something to treasure.',
      'Search the tall grass to find some treasure.',
    ]
  },
  {
    id: 16,
    description: 'Read the sign beside Snorlax in Vermillion City.',
    hintOpts: [
      'Treasures can be found with the right equipment.',
      'You\'ll need your reading glasses to find this treasure.',
    ]
  },
  {
    id: 17,
    description: 'Pickup the hidden item on Route 45.',
    hintOpts: [
      'Some treasures aren\'t immediately obvious.',
      'Search the tall grass to find some treasure.',
    ]
  },
  {
    id: 18,
    description: 'Receive the gift from the Roar Guy on Route 32.',
    hintOpts: [
      'You will need to cut some obstacles to find the treasure you seek.',
      'Sometimes treasure is just given to us willingly.',
    ]
  },
  {
    id: 19,
    description: 'Collect the item beyond the north-western pond in Violet City.',
    hintOpts: [
      'Sometimes the best treasures are just found lying on the ground.',
      'You\'ll need to hang ten to find some treasures.',
    ]
  },
  {
    id: 20,
    description: 'Receive a Pokémon from Bill.',
    hintOpts: [
      'New friends are always something to treasure.',
      'Sometimes treasure is just given to us willingly.',
    ]
  },
  {
    id: 21,
    description: 'Collect all 3 Apricorns on Route 42.',
    hintOpts: [
      'You can find treasure by reaping some fruity rewards.',
      'You will need to cut some obstacles to find the treasure you seek.',
    ]
  },
  {
    id: 22,
    description: 'Talk to the NPC who lives north of the Cycling Road.',
    hintOpts: [
      'You\'ll find you\'ll treasure a nice chat with a friend.',
      'Not all treasure is found outside.',
    ]
  },
  {
    id: 23,
    description: 'Read the book in the house on Route 26.',
    hintOpts: [
      'You\'ll need your reading glasses to find this treasure.',
      'Not all treasure is found outside.',
    ]
  },
  {
    id: 24,
    description: 'Receive the item from healing Moomoo.',
    hintOpts: [
      'The reward of helping someone is all the treasure you need.',
      'You can find treasure by reaping some fruity rewards.',
    ]
  },
  {
    id: 25,
    description: 'Inspect the trash can on the S.S. Anne in the sailor\'s quarters.',
    hintOpts: [
      'A boat has already salvaged a sunken treasure.',
      'One person\'s trash is another person\'s treasure.',
    ]
  },
  {
    id: 26,
    description: 'Destroy the rocks in Ice Path.',
    hintOpts: [
      'With great strength comes great treasure.',
      'Some treasures are found amongst the rubble.',
    ]
  },
  {
    id: 27,
    description: 'Buy something from the pharmacy in Cianwood City.',
    hintOpts: [
      'Some treasures can only be bought.',
      'Not all treasure is found outside.',
    ]
  },
  {
    id: 28,
    description: 'Heal Amphy.',
    hintOpts: [
      'The reward of helping someone is all the treasure you need.',
      'Not all treasure is found outside.',
    ]
  },
  {
    id: 29,
    description: 'Push a Strength Boulder down the useless hole in Claire\'s Gym.',
    hintOpts: [
      'With great strength comes great treasure.',
      'You will find treasure hidden in a Gym.',
    ]
  },
  {
    id: 30,
    description: 'Collect the item behind the Strength boulder in the Burned Tower.',
    hintOpts: [
      'With great strength comes great treasure.',
      'A treasure is reborn from the ashes.',
    ]
  },
  {
    id: 31,
    description: 'Buy an item from the PokeMart in Fuschia City.',
    hintOpts: [
      'Some treasures can only be bought.',
      'Not all treasure is found outside.',
    ]
  },
  {
    id: 32,
    description: 'Battle the trainer in the grass on Route 18.',
    hintOpts: [
      'Treasure is the reward for success on the battlefield.',
      'Search the tall grass to find some treasure.',
    ]
  },
  {
    id: 33,
    description: 'Dispel a Whirlpool on Route 41.',
    hintOpts: [
      'You\'ll need to hang ten to find some treasures.',
      'You\'ll need to calm the seas to find some treasures.',
    ]
  },
  {
    id: 34,
    description: 'Flash the ruins to read the Unown message.',
    hintOpts: [
      'Sometimes you need a bright light to find treasure.',
      'You\'ll need your reading glasses to find this treasure.',
    ]
  },
  {
    id: 35,
    description: 'Catch a Pokémon in the grass south of Pallet Town.',
    hintOpts: [
      'New friends are always something to treasure.',
      'Search the tall grass to find some treasure.',
    ]
  },
  {
    id: 36,
    description: 'Ride the waterfall up in Whirl Islands.',
    hintOpts: [
      'Sometimes you need a bright light to find treasure.',
      'You\'ll need to hang ten to find some treasures.',
    ]
  },
  {
    id: 37,
    description: 'Buy an item from the Goldenrod Game Corner.',
    hintOpts: [
      'Treasures can be found with the right equipment.',
      'Some treasures can only be bought.'
    ]
  },
  {
    id: 38,
    description: 'Ride the train from Goldenrod to Saffron.',
    hintOpts: [
      'You\'ll need to go for a ride to find this treasure.',
      'Treasures can be found with the right equipment.',
    ]
  },
  {
    id: 39,
    description: 'Fish up a Pokémon on the 2nd floor of Mt. Mortar.',
    hintOpts: [
      'Treasures can be found with the right equipment.',
      'New friends are always something to treasure.',
    ]
  }
];

export default TREASURES;
