import { Profile } from "@/types";

export const FRUIT_PROFILES: Profile[] = [
  {
    id: "fruit-s1",
    accountType: "single",
    people: [
      {
        name: "Clementine",
        age: 28,
        gender: "Woman",
        race: "White",
        photo:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80",
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80",
          "https://images.unsplash.com/photo-1557555187-23d685287bc3?w=900&q=80",
        ],
        prompts: [
          { question: "A perfect Sunday looks like...", answer: "Citrus spritz, a pile of books, and a very long walk." },
          { question: "The way to my heart is...", answer: "A handwritten note tucked into a paperback." },
        ],
        interests: ["Natural wine", "Florals", "Pilates", "Film", "Poetry", "Brunch"],
      },
    ],
    location: { city: "West Village, NY", lat: 40.7358, lng: -74.0036 },
    preferences: ["Everyone"],
    lookingFor: "Solo",
    polyType: "Kitchen-table poly",
    bio: "Copywriter with a citrus habit. Soft launching a slower life.",
    socials: { instagram: "clementine.writes" },
    trendingScore: 0.95,
    boostedUntil: Date.now() + 1000 * 60 * 60 * 10,
    createdAt: Date.now() - 1000 * 60 * 15,
  },
  {
    id: "fruit-s2",
    accountType: "single",
    people: [
      {
        name: "Omari",
        age: 31,
        gender: "Man",
        race: "Black",
        photo:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80",
          "https://images.unsplash.com/photo-1507081323647-4d250478b919?w=900&q=80",
        ],
        prompts: [
          { question: "I won't shut up about...", answer: "Stone fruit season and a well-made negroni." },
          { question: "Green flags I love to see...", answer: "Curiosity, follow-through, and a genuine laugh." },
        ],
        voicePrompt: {
          question: "Say hi in your own voice",
          uri: "https://download.samplelib.com/mp3/sample-6s.mp3",
          durationMs: 6000,
          recordedAt: Date.now() - 1000 * 60 * 45,
        },
        interests: ["Cocktails", "Jazz", "Basketball", "Cooking", "Travel"],
      },
    ],
    location: { city: "Harlem, NY", lat: 40.8116, lng: -73.9465 },
    preferences: ["Women", "Non-binary", "Couples"],
    lookingFor: "Solo",
    polyType: "Non-hierarchical poly",
    bio: "Bartender by trade, romantic by default. ENM 4 years.",
    socials: { instagram: "omari.pours" },
    trendingScore: 0.93,
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: "fruit-s3",
    accountType: "single",
    people: [
      {
        name: "Juniper",
        age: 26,
        gender: "Non-binary",
        race: "Mixed",
        photo:
          "https://images.unsplash.com/photo-1521252659862-eec69941b071?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1521252659862-eec69941b071?w=900&q=80",
          "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=900&q=80",
        ],
        prompts: [
          { question: "My simple pleasures...", answer: "Peaches over the sink and an open window." },
        ],
        interests: ["Ceramics", "Gardening", "Tea", "Thrifting", "Knitting"],
      },
    ],
    location: { city: "Bushwick, NY", lat: 40.6958, lng: -73.9171 },
    preferences: ["Everyone"],
    lookingFor: "Solo",
    polyType: "Relationship anarchy",
    bio: "Potter and part-time farm hand. Growing slowly, loving fully.",
    socials: { instagram: "juniper.clay" },
    trendingScore: 0.9,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: "fruit-s4",
    accountType: "single",
    people: [
      {
        name: "Simone",
        age: 30,
        gender: "Woman",
        race: "Black",
        photo:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=80",
          "https://images.unsplash.com/photo-1548142813-c348350df52b?w=900&q=80",
          "https://images.unsplash.com/photo-1502323777036-f29e3972d82f?w=900&q=80",
        ],
        prompts: [
          { question: "The way to my heart is...", answer: "A mixtape, a market bouquet, and zero small talk." },
          { question: "My love language is...", answer: "Showing up, not showing off." },
        ],
        voicePrompt: {
          question: "Tell a 20-second story",
          uri: "https://download.samplelib.com/mp3/sample-9s.mp3",
          durationMs: 9000,
          recordedAt: Date.now() - 1000 * 60 * 30,
        },
        interests: ["R&B", "Dance", "Writing", "Pilates", "Travel"],
      },
    ],
    location: { city: "Bed-Stuy, NY", lat: 40.6872, lng: -73.9418 },
    preferences: ["Men", "Women", "Couples"],
    lookingFor: "Solo",
    polyType: "Solo poly",
    bio: "Writer. Soft with my people, sharp with my pen.",
    socials: { instagram: "simone.reads" },
    trendingScore: 0.91,
    boostedUntil: Date.now() + 1000 * 60 * 60 * 4,
    createdAt: Date.now() - 1000 * 60 * 20,
  },
  {
    id: "fruit-s5",
    accountType: "single",
    people: [
      {
        name: "Hiro",
        age: 33,
        gender: "Man",
        race: "Asian",
        photo:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80",
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=80",
        ],
        prompts: [
          { question: "Two truths and a lie...", answer: "I bake sourdough weekly, I've surfed Hokkaido, I hate mangoes." },
        ],
        interests: ["Baking", "Surfing", "Cycling", "Film photography", "Espresso"],
      },
    ],
    location: { city: "Greenpoint, NY", lat: 40.7306, lng: -73.9542 },
    preferences: ["Women", "Non-binary", "Couples"],
    lookingFor: "Solo",
    polyType: "Hierarchical poly",
    bio: "Pastry chef. Partnered for 5 years, open for 2. I like slow mornings and honest nights.",
    socials: { instagram: "hiro.bakes" },
    trendingScore: 0.88,
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
  },
  {
    id: "fruit-c1",
    accountType: "couple",
    people: [
      {
        name: "Rosa",
        age: 32,
        gender: "Woman",
        race: "Hispanic / Latinx",
        photo:
          "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=900&q=80",
          "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=900&q=80",
        ],
        interests: ["Mezcal", "Dance", "Cooking", "Art shows", "Travel"],
      },
      {
        name: "Eli",
        age: 34,
        gender: "Man",
        race: "Mixed",
        photo:
          "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=900&q=80",
          "https://images.unsplash.com/photo-1502767089025-6572583495b9?w=900&q=80",
        ],
        interests: ["Jazz", "Motorcycles", "Cooking", "Vinyl", "Philosophy"],
      },
    ],
    location: { city: "Lower East Side, NY", lat: 40.715, lng: -73.9843 },
    preferences: ["Women", "Non-binary", "Couples"],
    lookingFor: "Together",
    polyType: "Throuple",
    bio: "Married 5 years, searching for a kind, curious third. We cook, we host, we laugh loud.",
    socials: { instagram: "rosa.and.eli" },
    trendingScore: 0.94,
    boostedUntil: Date.now() + 1000 * 60 * 60 * 8,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "fruit-c2",
    accountType: "couple",
    people: [
      {
        name: "Willa",
        age: 29,
        gender: "Woman",
        race: "White",
        photo:
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900&q=80",
          "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&q=80",
        ],
        interests: ["Hiking", "Foraging", "Baking", "Reading", "Camping"],
      },
      {
        name: "Ash",
        age: 30,
        gender: "Non-binary",
        race: "White",
        photo:
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=80",
        ],
        interests: ["Climbing", "Plants", "Cooking", "DJing", "Festivals"],
      },
    ],
    location: { city: "Park Slope, NY", lat: 40.6721, lng: -73.9857 },
    preferences: ["Everyone"],
    lookingFor: "Together",
    polyType: "Polycule",
    bio: "Queer, earthy, a little feral. Farmhouse weekends and natural wine nights.",
    socials: { instagram: "willa.and.ash" },
    trendingScore: 0.89,
    createdAt: Date.now() - 1000 * 60 * 60 * 9,
  },
  {
    id: "fruit-c3",
    accountType: "couple",
    people: [
      {
        name: "Saoirse",
        age: 34,
        gender: "Woman",
        race: "White",
        photo:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80",
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80",
        ],
        interests: ["Tennis", "Wine", "Interiors", "Sailing", "Pilates"],
      },
      {
        name: "Bastien",
        age: 36,
        gender: "Man",
        race: "White",
        photo:
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&q=80",
        ],
        interests: ["Cycling", "Espresso", "Chess", "Cooking", "Travel"],
      },
    ],
    location: { city: "Tribeca, NY", lat: 40.7163, lng: -74.0086 },
    preferences: ["Women", "Couples"],
    lookingFor: "Together",
    polyType: "Open relationship",
    bio: "Together 8 years, open 3. We adore long dinners, short flights, and honest people.",
    socials: { instagram: "saoirse.bastien" },
    trendingScore: 0.86,
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
  },
  {
    id: "fruit-c4",
    accountType: "couple",
    people: [
      {
        name: "Amani",
        age: 29,
        gender: "Woman",
        race: "Black",
        photo:
          "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=900&q=80",
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&q=80",
        ],
        interests: ["R&B", "Poetry", "Dance", "Pilates", "Slow living"],
      },
      {
        name: "Kenji",
        age: 31,
        gender: "Man",
        race: "Asian",
        photo:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
          "https://images.unsplash.com/photo-1517620430776-0ec904bc1386?w=900&q=80",
        ],
        interests: ["Producing", "Photography", "Surfing", "Ramen", "Jazz"],
      },
    ],
    location: { city: "Crown Heights, NY", lat: 40.6702, lng: -73.9436 },
    preferences: ["Women", "Non-binary"],
    lookingFor: "Together",
    polyType: "Triad",
    bio: "Partnered 6 years. Music, mezcal, and meaningful mornings. Seeking a kind feminine energy.",
    socials: { instagram: "amani.and.kenji" },
    trendingScore: 0.92,
    boostedUntil: Date.now() + 1000 * 60 * 60 * 6,
    createdAt: Date.now() - 1000 * 60 * 40,
  },
  {
    id: "fruit-c5",
    accountType: "couple",
    people: [
      {
        name: "Marlo",
        age: 33,
        gender: "Non-binary",
        race: "Mixed",
        photo:
          "https://images.unsplash.com/photo-1517620430776-0ec904bc1386?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1517620430776-0ec904bc1386?w=900&q=80",
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&q=80",
        ],
        interests: ["Skating", "Tattoos", "Design", "Festivals", "Vinyl"],
      },
      {
        name: "Sable",
        age: 32,
        gender: "Woman",
        race: "Hispanic / Latinx",
        photo:
          "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=900&q=80",
          "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=900&q=80",
        ],
        interests: ["Cooking", "Mezcal", "Tattoos", "Yoga", "Travel"],
      },
    ],
    location: { city: "Williamsburg, NY", lat: 40.7081, lng: -73.9571 },
    preferences: ["Everyone"],
    lookingFor: "Together",
    polyType: "Quad",
    bio: "Queer, tattooed, tender. We host sauna Sundays and karaoke Thursdays.",
    socials: { instagram: "marlo.and.sable" },
    trendingScore: 0.87,
    createdAt: Date.now() - 1000 * 60 * 60 * 11,
  },
];

export const FRUIT_PROFILE_IDS: string[] = FRUIT_PROFILES.map((p) => p.id);
