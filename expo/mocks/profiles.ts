import { Profile } from "@/types";
import { FRUIT_PROFILES } from "@/mocks/fruit-profiles";

const BASE_PROFILES: Profile[] = [
  {
    id: "p1",
    accountType: "couple",
    people: [
      {
        name: "Noa",
        age: 29,
        gender: "Woman",
        race: "Mixed",
        photo:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80",
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80",
          "https://images.unsplash.com/photo-1557555187-23d685287bc3?w=900&q=80",
        ],
        prompts: [
          { question: "A perfect Sunday looks like...", answer: "Coffee, croissants, and the Sunday Times spread across the bed until noon." },
          { question: "I'm looking for someone who...", answer: "Asks big questions and still laughs at small jokes." },
          { question: "My love language is...", answer: "Remembering the tiny things you mentioned once." },
        ],
        voicePrompt: {
          question: "Say hi in your own voice",
          uri: "https://download.samplelib.com/mp3/sample-6s.mp3",
          durationMs: 6000,
          recordedAt: Date.now() - 1000 * 60 * 60 * 24,
        },
        interests: ["Natural wine", "Museums", "Film", "Brunch", "Reading", "Yoga", "Pottery"],
      },
      {
        name: "Sam",
        age: 31,
        gender: "Non-binary",
        race: "White",
        photo:
          "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900&q=80",
          "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=900&q=80",
        ],
        prompts: [
          { question: "I won't shut up about...", answer: "Natural wine, brutalist architecture, and our rescue dog Miso." },
          { question: "Green flags I love to see...", answer: "Texts back in full sentences. Tips generously. Can sit in silence." },
        ],
        interests: ["Architecture", "Dogs", "Vinyl", "Cycling", "Coffee", "Design", "Photography"],
      },
    ],
    location: { city: "Brooklyn, NY", lat: 40.6782, lng: -73.9442 },
    preferences: ["Women", "Non-binary", "Couples"],
    lookingFor: "Together",
    polyType: "Kitchen-table poly",
    bio: "Gallery openings, slow dinners, rooftop thunderstorms. We love meeting curious, kind people.",
    socials: { instagram: "noaandsam", twitter: "noaandsam" },
    trendingScore: 0.92,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: "p2",
    accountType: "single",
    people: [
      {
        name: "Amara",
        age: 27,
        gender: "Woman",
        race: "Black",
        photo:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=80",
          "https://images.unsplash.com/photo-1548142813-c348350df52b?w=900&q=80",
          "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=900&q=80",
          "https://images.unsplash.com/photo-1485518882345-15568b007407?w=900&q=80",
        ],
        prompts: [
          { question: "Two truths and a lie...", answer: "I can taste wine blindfolded, I've lived on three continents, I love running." },
          { question: "The way to my heart is...", answer: "An oyster bar, an unsolicited poem, and walking home slowly." },
          { question: "My simple pleasures...", answer: "Rain on the windows, clean sheets, and a notebook that isn't precious." },
        ],
        voicePrompt: {
          question: "Tell a 20-second story",
          uri: "https://download.samplelib.com/mp3/sample-9s.mp3",
          durationMs: 9000,
          recordedAt: Date.now() - 1000 * 60 * 60 * 3,
        },
        interests: ["Wine", "Poetry", "Running", "Jazz", "Cooking", "Therapy", "Journaling", "Slow living"],
      },
    ],
    location: { city: "Jersey City, NJ", lat: 40.7178, lng: -74.0431 },
    preferences: ["Everyone"],
    lookingFor: "Solo",
    polyType: "Solo poly",
    bio: "Sommelier by day, poet by night. ENM for 4 years. Looking for conversation that lingers.",
    socials: { instagram: "amara.notes", tiktok: "amarapours" },
    trendingScore: 0.88,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
  {
    id: "p3",
    accountType: "single",
    people: [
      {
        name: "Julien",
        age: 34,
        gender: "Man",
        race: "Hispanic / Latinx",
        photo:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80",
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=80",
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&q=80",
        ],
        prompts: [
          { question: "My most controversial take...", answer: "The best part of a meal is the bread before it." },
          { question: "What I'm learning right now...", answer: "How to sit with silence instead of filling it." },
        ],
        interests: ["Architecture", "Fine dining", "Tennis", "Philosophy", "Road trips", "Whiskey", "History"],
      },
    ],
    location: { city: "Manhattan, NY", lat: 40.7831, lng: -73.9712 },
    preferences: ["Women", "Couples"],
    lookingFor: "Solo",
    polyType: "Hierarchical poly",
    bio: "Architect. Polyamorous. Loves long dinners and longer conversations.",
    socials: { instagram: "julien.builds" },
    trendingScore: 0.71,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: "p4",
    accountType: "couple",
    people: [
      {
        name: "Iris",
        age: 33,
        gender: "Woman",
        race: "White",
        photo:
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900&q=80",
          "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&q=80",
        ],
        interests: ["Hiking", "Gardening", "Baking", "Board games", "Camping", "Reading"],
      },
      {
        name: "Devon",
        age: 35,
        gender: "Man",
        race: "Black",
        photo:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80",
          "https://images.unsplash.com/photo-1507081323647-4d250478b919?w=900&q=80",
        ],
        interests: ["BBQ", "Basketball", "Craft beer", "Vinyl", "Podcasts", "Road trips"],
      },
    ],
    location: { city: "Queens, NY", lat: 40.7282, lng: -73.7949 },
    preferences: ["Women", "Men", "Couples"],
    lookingFor: "Together",
    polyType: "Open relationship",
    bio: "Married 6 years, open 3. We cook, we hike, we host. Honesty is our love language.",
    socials: { instagram: "iris.and.devon" },
    trendingScore: 0.83,
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "p5",
    accountType: "single",
    people: [
      {
        name: "Rin",
        age: 26,
        gender: "Non-binary",
        race: "Asian",
        photo:
          "https://images.unsplash.com/photo-1521252659862-eec69941b071?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1521252659862-eec69941b071?w=900&q=80",
          "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=900&q=80",
        ],
        prompts: [
          { question: "I won't shut up about...", answer: "Hand-thrown ceramics, the perfect matcha ratio, and a good line weight." },
        ],
        voicePrompt: {
          question: "What made you laugh this week?",
          uri: "https://download.samplelib.com/mp3/sample-12s.mp3",
          durationMs: 12000,
          recordedAt: Date.now() - 1000 * 60 * 30,
        },
        interests: ["Ceramics", "Tea", "Drawing", "Indie", "Meditation", "Plants", "Thrifting"],
      },
    ],
    location: { city: "Hoboken, NJ", lat: 40.744, lng: -74.0324 },
    preferences: ["Everyone"],
    lookingFor: "Solo",
    polyType: "Questioning",
    bio: "Ceramicist. Soft launch energy. Curious and kind.",
    socials: { instagram: "rin.made" },
    trendingScore: 0.54,
    createdAt: Date.now() - 1000 * 60 * 60 * 9,
  },
  {
    id: "p6",
    accountType: "couple",
    people: [
      {
        name: "Mira",
        age: 30,
        gender: "Woman",
        race: "Middle Eastern",
        photo:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80",
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80",
        ],
        interests: ["Cooking", "Farmers markets", "Film", "Travel", "Pilates", "Natural wine"],
      },
      {
        name: "Theo",
        age: 32,
        gender: "Man",
        race: "White",
        photo:
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&q=80",
        ],
        interests: ["Photography", "Film", "Cycling", "Vinyl", "Espresso", "Architecture"],
      },
    ],
    location: { city: "Newark, NJ", lat: 40.7357, lng: -74.1724 },
    preferences: ["Women", "Couples"],
    lookingFor: "Together",
    polyType: "Triad",
    bio: "Chef + photographer duo. We live for farmers markets and late-night film photos.",
    socials: { instagram: "mira.theo", tiktok: "miratheo" },
    trendingScore: 0.66,
    createdAt: Date.now() - 1000 * 60 * 60 * 20,
  },
  {
    id: "p7",
    accountType: "single",
    people: [
      {
        name: "Kai",
        age: 28,
        gender: "Genderfluid",
        race: "Pacific Islander",
        photo:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
          "https://images.unsplash.com/photo-1517620430776-0ec904bc1386?w=900&q=80",
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&q=80",
        ],
        prompts: [
          { question: "A perfect Sunday looks like...", answer: "Dawn patrol, a long lunch, edit footage until the light goes golden." },
          { question: "Green flags I love to see...", answer: "Reads instructions. Admits when they don't know. Knows how to rest." },
        ],
        voicePrompt: {
          question: "Describe your dream weekend",
          uri: "https://download.samplelib.com/mp3/sample-15s.mp3",
          durationMs: 15000,
          recordedAt: Date.now() - 1000 * 60 * 60 * 2,
        },
        interests: ["Surfing", "Film", "Beach days", "Photography", "Festivals", "Stargazing", "Skateboarding"],
      },
    ],
    location: { city: "Williamsburg, NY", lat: 40.7081, lng: -73.9571 },
    preferences: ["Everyone"],
    lookingFor: "Solo",
    polyType: "Relationship anarchy",
    bio: "Surfer, filmmaker, relationship anarchist.",
    socials: { instagram: "kai.tides", twitter: "kaitides" },
    trendingScore: 0.79,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "p8",
    accountType: "single",
    people: [
      {
        name: "Zadie",
        age: 29,
        gender: "Woman",
        race: "Black",
        photo:
          "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=900&q=80",
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&q=80",
          "https://images.unsplash.com/photo-1502323777036-f29e3972d82f?w=900&q=80",
        ],
        prompts: [
          { question: "My simple pleasures...", answer: "A cold plum, a warm book, and a breeze through open windows." },
          { question: "The way to my heart is...", answer: "Leaving a voice note just to say you saw something I'd love." },
        ],
        interests: ["Natural wine", "Poetry", "Pilates", "Film", "Farmers markets", "Slow living"],
      },
    ],
    location: { city: "Brooklyn, NY", lat: 40.6782, lng: -73.9442 },
    preferences: ["Everyone"],
    lookingFor: "Solo",
    polyType: "Relationship anarchy",
    bio: "Editor at a lit mag. ENM forever. I believe in long walks and longer letters.",
    socials: { instagram: "zadie.reads" },
    trendingScore: 0.96,
    boostedUntil: Date.now() + 1000 * 60 * 60 * 8,
    createdAt: Date.now() - 1000 * 60 * 45,
  },
  {
    id: "p9",
    accountType: "couple",
    people: [
      {
        name: "Ines",
        age: 31,
        gender: "Woman",
        race: "Hispanic / Latinx",
        photo:
          "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=900&q=80",
          "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=900&q=80",
        ],
        interests: ["Dance", "Cocktails", "Tattoos", "Film", "Travel"],
      },
      {
        name: "Miles",
        age: 33,
        gender: "Man",
        race: "Mixed",
        photo:
          "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=900&q=80",
          "https://images.unsplash.com/photo-1502767089025-6572583495b9?w=900&q=80",
        ],
        interests: ["Jazz", "Cooking", "Vinyl", "Motorcycles", "History"],
      },
    ],
    location: { city: "Harlem, NY", lat: 40.8116, lng: -73.9465 },
    preferences: ["Women", "Non-binary", "Couples"],
    lookingFor: "Together",
    polyType: "Throuple",
    bio: "Married 4 years, looking for a shared connection built on late dinners and Sunday records.",
    socials: { instagram: "ines.and.miles" },
    trendingScore: 0.91,
    boostedUntil: Date.now() + 1000 * 60 * 60 * 3,
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
  },
  {
    id: "p10",
    accountType: "single",
    people: [
      {
        name: "Asher",
        age: 30,
        gender: "Trans man",
        race: "White",
        photo:
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&q=80",
          "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=900&q=80",
          "https://images.unsplash.com/photo-1463453091185-61582044d556?w=900&q=80",
        ],
        prompts: [
          { question: "I won't shut up about...", answer: "Sourdough starter lore, and the exact right olive oil." },
          { question: "Green flags I love to see...", answer: "Emotionally literate, and actually reads the menu beforehand." },
        ],
        voicePrompt: {
          question: "Read a line from your favorite book",
          uri: "https://download.samplelib.com/mp3/sample-9s.mp3",
          durationMs: 9000,
          recordedAt: Date.now() - 1000 * 60 * 50,
        },
        interests: ["Baking", "Cycling", "Therapy", "Writing", "Hiking", "Dogs"],
      },
    ],
    location: { city: "Park Slope, NY", lat: 40.6721, lng: -73.9857 },
    preferences: ["Women", "Non-binary", "Couples"],
    lookingFor: "Solo",
    polyType: "Non-hierarchical poly",
    bio: "Baker, runner, incurable romantic. 5 years ENM. Looking for a slow burn.",
    socials: { instagram: "asher.bakes" },
    trendingScore: 0.87,
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
  },
  {
    id: "p11",
    accountType: "single",
    people: [
      {
        name: "Priya",
        age: 28,
        gender: "Woman",
        race: "Asian",
        photo:
          "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&q=80",
          "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=900&q=80",
          "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&q=80",
        ],
        prompts: [
          { question: "A perfect Sunday looks like...", answer: "Yoga at sunrise, chaat at noon, a jazz bar at midnight." },
          { question: "My love language is...", answer: "Cooking for you without asking what you want." },
        ],
        interests: ["Yoga", "Cooking", "Jazz", "Travel", "Tea", "Languages", "Philosophy"],
      },
    ],
    location: { city: "Jersey City, NJ", lat: 40.7178, lng: -74.0431 },
    preferences: ["Men", "Women", "Couples"],
    lookingFor: "Solo",
    polyType: "Kitchen-table poly",
    bio: "UX designer. Cooking obsessive. I love meeting my metamours over long dinners.",
    socials: { instagram: "priya.maps", tiktok: "priyacooks" },
    trendingScore: 0.89,
    createdAt: Date.now() - 1000 * 60 * 90,
  },
  {
    id: "p12",
    accountType: "couple",
    people: [
      {
        name: "Sage",
        age: 27,
        gender: "Non-binary",
        race: "White",
        photo:
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=80",
        ],
        interests: ["Climbing", "Camping", "Foraging", "Plants", "Cooking"],
      },
      {
        name: "River",
        age: 29,
        gender: "Genderqueer",
        race: "Mixed",
        photo:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80",
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&q=80",
        ],
        interests: ["Festivals", "DJing", "Yoga", "Tattoos", "Thrifting"],
      },
    ],
    location: { city: "Bushwick, NY", lat: 40.6958, lng: -73.9171 },
    preferences: ["Everyone"],
    lookingFor: "Together",
    polyType: "Polycule",
    bio: "Queer, creative, kind. We host monthly dinners and host even better conversations.",
    socials: { instagram: "sage.and.river" },
    trendingScore: 0.82,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: "p13",
    accountType: "single",
    people: [
      {
        name: "Malik",
        age: 32,
        gender: "Man",
        race: "Black",
        photo:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=80",
        ],
        prompts: [
          { question: "Two truths and a lie...", answer: "I've scored a short film, I can freestyle in three keys, I hate karaoke." },
        ],
        interests: ["Producing", "Piano", "Basketball", "Film", "Coffee", "Writing"],
      },
    ],
    location: { city: "Crown Heights, NY", lat: 40.6702, lng: -73.9436 },
    preferences: ["Women", "Non-binary"],
    lookingFor: "Solo",
    polyType: "Hierarchical poly",
    bio: "Composer. Partnered for 6 years, open for 3. I love a good b-side and a better debate.",
    socials: { instagram: "malik.scores" },
    trendingScore: 0.84,
    createdAt: Date.now() - 1000 * 60 * 60 * 16,
  },
  {
    id: "p14",
    accountType: "single",
    people: [
      {
        name: "Nadia",
        age: 35,
        gender: "Woman",
        race: "Middle Eastern",
        photo:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80",
          "https://images.unsplash.com/photo-1557555187-23d685287bc3?w=900&q=80",
        ],
        prompts: [
          { question: "I'm looking for someone who...", answer: "Can disagree without disappearing." },
          { question: "My most controversial take...", answer: "Couples who don't argue scare me a little." },
        ],
        voicePrompt: {
          question: "Say hi in your own voice",
          uri: "https://download.samplelib.com/mp3/sample-6s.mp3",
          durationMs: 6000,
          recordedAt: Date.now() - 1000 * 60 * 20,
        },
        interests: ["Theater", "Natural wine", "Tennis", "Travel", "Design", "Therapy"],
      },
    ],
    location: { city: "Long Island City, NY", lat: 40.7447, lng: -73.9485 },
    preferences: ["Everyone"],
    lookingFor: "Solo",
    polyType: "Solo poly",
    bio: "Theater director. Solo poly for a decade. I like directness and unhurried chemistry.",
    socials: { instagram: "nadia.directs" },
    trendingScore: 0.93,
    boostedUntil: Date.now() + 1000 * 60 * 60 * 12,
    createdAt: Date.now() - 1000 * 60 * 15,
  },
  {
    id: "p15",
    accountType: "single",
    people: [
      {
        name: "Eloise",
        age: 26,
        gender: "Woman",
        race: "White",
        photo:
          "https://images.unsplash.com/photo-1542596594-649edbc13630?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1542596594-649edbc13630?w=900&q=80",
          "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900&q=80",
        ],
        prompts: [
          { question: "A perfect Sunday looks like...", answer: "Flower market at dawn, pasta at noon, dancing until my feet hurt." },
          { question: "My love language is...", answer: "Showing up early and staying late." },
        ],
        interests: ["Florals", "Dancing", "Pasta", "Painting", "Cycling", "Opera"],
      },
    ],
    location: { city: "West Village, NY", lat: 40.7358, lng: -74.0036 },
    preferences: ["Women", "Couples"],
    lookingFor: "Solo",
    polyType: "Kitchen-table poly",
    bio: "Florist with a wine habit. New to ENM but not to love. Let\u2019s be real and a little reckless.",
    socials: { instagram: "eloise.blooms" },
    trendingScore: 0.9,
    boostedUntil: Date.now() + 1000 * 60 * 60 * 5,
    createdAt: Date.now() - 1000 * 60 * 25,
  },
  {
    id: "p16",
    accountType: "couple",
    people: [
      {
        name: "Tomo",
        age: 34,
        gender: "Man",
        race: "Asian",
        photo:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80",
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80",
        ],
        interests: ["Ramen", "Street photography", "Jazz", "Cycling", "Whiskey"],
      },
      {
        name: "Lena",
        age: 31,
        gender: "Woman",
        race: "White",
        photo:
          "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=900&q=80",
          "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&q=80",
        ],
        interests: ["Pottery", "Film", "Saunas", "Skiing", "Cooking"],
      },
    ],
    location: { city: "Greenpoint, NY", lat: 40.7306, lng: -73.9542 },
    preferences: ["Women", "Non-binary", "Couples"],
    lookingFor: "Together",
    polyType: "Quad",
    bio: "Together 7 years, open 2. We host sauna Sundays and ramen Mondays.",
    socials: { instagram: "tomo.and.lena" },
    trendingScore: 0.86,
    createdAt: Date.now() - 1000 * 60 * 60 * 7,
  },
  {
    id: "p17",
    accountType: "single",
    people: [
      {
        name: "Soren",
        age: 33,
        gender: "Man",
        race: "White",
        photo:
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=80",
          "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=900&q=80",
          "https://images.unsplash.com/photo-1463453091185-61582044d556?w=900&q=80",
        ],
        prompts: [
          { question: "I won\u2019t shut up about...", answer: "Cold plunges, good pens, and the case for long letters." },
          { question: "Green flags I love to see...", answer: "Keeps plants alive. Remembers birthdays. Sends maps, not just pins." },
        ],
        interests: ["Sailing", "Woodworking", "Chess", "Espresso", "Cold plunges"],
      },
    ],
    location: { city: "Red Hook, NY", lat: 40.6743, lng: -74.0112 },
    preferences: ["Women", "Couples"],
    lookingFor: "Solo",
    polyType: "Non-hierarchical poly",
    bio: "Furniture maker. Quiet guy with a loud heart. Looking for a slow build.",
    socials: { instagram: "soren.builds" },
    trendingScore: 0.81,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "p18",
    accountType: "single",
    people: [
      {
        name: "Yara",
        age: 29,
        gender: "Woman",
        race: "Black",
        photo:
          "https://images.unsplash.com/photo-1548142813-c348350df52b?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1548142813-c348350df52b?w=900&q=80",
          "https://images.unsplash.com/photo-1502323777036-f29e3972d82f?w=900&q=80",
        ],
        prompts: [
          { question: "The way to my heart is...", answer: "A playlist made for me, not about you." },
        ],
        voicePrompt: {
          question: "Say hi in your own voice",
          uri: "https://download.samplelib.com/mp3/sample-6s.mp3",
          durationMs: 6000,
          recordedAt: Date.now() - 1000 * 60 * 10,
        },
        interests: ["R&B", "Dance", "Skincare", "Travel", "Sneakers", "Writing"],
      },
    ],
    location: { city: "Bed-Stuy, NY", lat: 40.6872, lng: -73.9418 },
    preferences: ["Everyone"],
    lookingFor: "Solo",
    polyType: "Relationship anarchy",
    bio: "Music journalist. ENM 6 years. I fall fast but listen slowly.",
    socials: { instagram: "yara.writes", tiktok: "yaralistens" },
    trendingScore: 0.94,
    boostedUntil: Date.now() + 1000 * 60 * 60 * 6,
    createdAt: Date.now() - 1000 * 60 * 20,
  },
  {
    id: "p19",
    accountType: "couple",
    people: [
      {
        name: "Emiliana",
        age: 30,
        gender: "Woman",
        race: "Hispanic / Latinx",
        photo:
          "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=900&q=80",
          "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=900&q=80",
        ],
        interests: ["Mezcal", "Salsa", "Art shows", "Cooking", "Travel"],
      },
      {
        name: "Jun",
        age: 32,
        gender: "Non-binary",
        race: "Asian",
        photo:
          "https://images.unsplash.com/photo-1517620430776-0ec904bc1386?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1517620430776-0ec904bc1386?w=900&q=80",
        ],
        interests: ["Design", "Skating", "Film photography", "Tattoos"],
      },
    ],
    location: { city: "Lower East Side, NY", lat: 40.715, lng: -73.9843 },
    preferences: ["Women", "Non-binary"],
    lookingFor: "Together",
    polyType: "Vee",
    bio: "Queer creative duo. Mezcal, mixtapes, and a weakness for karaoke nights.",
    socials: { instagram: "emi.and.jun" },
    trendingScore: 0.88,
    createdAt: Date.now() - 1000 * 60 * 60 * 11,
  },
  {
    id: "p20",
    accountType: "single",
    people: [
      {
        name: "Wren",
        age: 27,
        gender: "Non-binary",
        race: "Mixed",
        photo:
          "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=900&q=80",
          "https://images.unsplash.com/photo-1521252659862-eec69941b071?w=900&q=80",
        ],
        prompts: [
          { question: "My simple pleasures...", answer: "The first sip of coffee and the last page of a good book." },
          { question: "What I\u2019m learning right now...", answer: "How to say no without apology." },
        ],
        interests: ["Birdwatching", "Knitting", "Tea", "Poetry", "Hiking"],
      },
    ],
    location: { city: "Fort Greene, NY", lat: 40.6892, lng: -73.9741 },
    preferences: ["Everyone"],
    lookingFor: "Solo",
    polyType: "Solo poly",
    bio: "Librarian, birder, soft spoken. Looking for gentle chaos.",
    socials: { instagram: "wren.reads" },
    trendingScore: 0.85,
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
  },
  {
    id: "p21",
    accountType: "couple",
    people: [
      {
        name: "Margot",
        age: 36,
        gender: "Woman",
        race: "White",
        photo:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80",
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80",
        ],
        interests: ["Tennis", "Wine", "Sailing", "Interiors", "Travel"],
      },
      {
        name: "Felix",
        age: 38,
        gender: "Man",
        race: "White",
        photo:
          "https://images.unsplash.com/photo-1502767089025-6572583495b9?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1502767089025-6572583495b9?w=900&q=80",
        ],
        interests: ["Chess", "Cars", "Cooking", "Travel", "Jazz"],
      },
    ],
    location: { city: "Tribeca, NY", lat: 40.7163, lng: -74.0086 },
    preferences: ["Women", "Couples"],
    lookingFor: "Together",
    polyType: "Swinger",
    bio: "Married 10 years, open 4. Weekend house in the Catskills. Come for the wine, stay for the conversation.",
    socials: { instagram: "margot.and.felix" },
    trendingScore: 0.78,
    createdAt: Date.now() - 1000 * 60 * 60 * 22,
  },
  {
    id: "p22",
    accountType: "single",
    people: [
      {
        name: "Dax",
        age: 31,
        gender: "Man",
        race: "Mixed",
        photo:
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&q=80",
          "https://images.unsplash.com/photo-1507081323647-4d250478b919?w=900&q=80",
        ],
        prompts: [
          { question: "Two truths and a lie...", answer: "I\u2019ve run a marathon, I can\u2019t whistle, I\u2019ve eaten at 14 taquerias in one weekend." },
        ],
        interests: ["Running", "Tacos", "Producing", "Hiking", "Coffee"],
      },
    ],
    location: { city: "Astoria, NY", lat: 40.7643, lng: -73.9235 },
    preferences: ["Women", "Non-binary", "Couples"],
    lookingFor: "Solo",
    polyType: "Monogamish",
    bio: "Podcast producer. Mostly committed, occasionally curious. Always honest.",
    socials: { instagram: "dax.records" },
    trendingScore: 0.75,
    createdAt: Date.now() - 1000 * 60 * 60 * 14,
  },
];

export const MOCK_PROFILES: Profile[] = [...BASE_PROFILES, ...FRUIT_PROFILES];
