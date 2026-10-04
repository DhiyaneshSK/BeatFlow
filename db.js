/**
 * BeatFlow Database Manager (IndexedDB Engine)
 * Manages database initialization, track seeding, and sales/tracks CRUD operations.
 */

const DB_NAME = 'BeatFlowDB_V1';
const DB_VERSION = 1;

const SEED_TRACKS = [
  {
    "id": "track-1",
    "title": "Death Bed",
    "artist": "Powfu",
    "genre": "Lo-Fi Hip Hop",
    "BPM": 85,
    "keySignature": "C Major",
    "coverArt": "https://samplesongs.netlify.app/album-arts/death-bed.jpg",
    "audioSrc": "audio/track-1.mp3",
    "prices": {
      "standard": 29.99,
      "premium": 59.99,
      "exclusive": 299.99
    },
    "streams": 1452030,
    "isSeed": true
  },
  {
    "id": "track-2",
    "title": "Bad Liar",
    "artist": "Imagine Dragons",
    "genre": "Alternative Rock",
    "BPM": 120,
    "keySignature": "A Minor",
    "coverArt": "https://samplesongs.netlify.app/album-arts/bad-liar.jpg",
    "audioSrc": "audio/track-2.mp3",
    "prices": {
      "standard": 34.99,
      "premium": 69.99,
      "exclusive": 349.99
    },
    "streams": 894030,
    "isSeed": true
  },
  {
    "id": "track-3",
    "title": "Faded",
    "artist": "Alan Walker",
    "genre": "EDM",
    "BPM": 90,
    "keySignature": "E Minor",
    "coverArt": "https://samplesongs.netlify.app/album-arts/faded.jpg",
    "audioSrc": "audio/track-3.mp3",
    "prices": {
      "standard": 39.99,
      "premium": 79.99,
      "exclusive": 399.99
    },
    "streams": 2304910,
    "isSeed": true
  },
  {
    "id": "track-4",
    "title": "Hate Me",
    "artist": "Ellie Goulding",
    "genre": "Pop",
    "BPM": 115,
    "keySignature": "F# Minor",
    "coverArt": "https://samplesongs.netlify.app/album-arts/hate-me.jpg",
    "audioSrc": "audio/track-4.mp3",
    "prices": {
      "standard": 29.99,
      "premium": 59.99,
      "exclusive": 299.99
    },
    "streams": 672010,
    "isSeed": true
  },
  {
    "id": "track-5",
    "title": "Solo",
    "artist": "Clean Bandit",
    "genre": "Dance-Pop",
    "BPM": 125,
    "keySignature": "D Major",
    "coverArt": "https://samplesongs.netlify.app/album-arts/solo.jpg",
    "audioSrc": "audio/track-5.mp3",
    "prices": {
      "standard": 34.99,
      "premium": 69.99,
      "exclusive": 349.99
    },
    "streams": 1120045,
    "isSeed": true
  },
  {
    "id": "track-6",
    "title": "Without Me",
    "artist": "Halsey",
    "genre": "Synth-Pop",
    "BPM": 138,
    "keySignature": "C# Minor",
    "coverArt": "https://samplesongs.netlify.app/album-arts/without-me.jpg",
    "audioSrc": "audio/track-6.mp3",
    "prices": {
      "standard": 39.99,
      "premium": 79.99,
      "exclusive": 399.99
    },
    "streams": 1894032,
    "isSeed": true
  },
  {
    "id": "track-7",
    "title": "Midnight Memories",
    "artist": "Pulse Pilot",
    "genre": "Pop",
    "BPM": 78,
    "keySignature": "F Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-7/300/300",
    "audioSrc": "audio/track-7.mp3",
    "prices": {
      "standard": 20.99,
      "premium": 68.99,
      "exclusive": 276.99
    },
    "streams": 179307,
    "isSeed": true
  },
  {
    "id": "track-8",
    "title": "Vintage Anthem",
    "artist": "Sonic Architect",
    "genre": "Lo-Fi Hip Hop",
    "BPM": 97,
    "keySignature": "C Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-8/300/300",
    "audioSrc": "audio/track-8.mp3",
    "prices": {
      "standard": 23.99,
      "premium": 75.99,
      "exclusive": 287.99
    },
    "streams": 203208,
    "isSeed": true
  },
  {
    "id": "track-9",
    "title": "Electric Vibes",
    "artist": "Goldfire Studios",
    "genre": "Synth-Pop",
    "BPM": 116,
    "keySignature": "A Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-9/300/300",
    "audioSrc": "audio/track-9.mp3",
    "prices": {
      "standard": 26.99,
      "premium": 52.99,
      "exclusive": 298.99
    },
    "streams": 227109,
    "isSeed": true
  },
  {
    "id": "track-10",
    "title": "Chilled Ocean",
    "artist": "Midnight Echo",
    "genre": "EDM",
    "BPM": 135,
    "keySignature": "D Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-10/300/300",
    "audioSrc": "audio/track-10.mp3",
    "prices": {
      "standard": 29.99,
      "premium": 59.99,
      "exclusive": 309.99
    },
    "streams": 251010,
    "isSeed": true
  },
  {
    "id": "track-11",
    "title": "Secret Odyssey",
    "artist": "Sound Catalyst",
    "genre": "Sound Effects",
    "BPM": 89,
    "keySignature": "E Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-11/300/300",
    "audioSrc": "audio/track-11.mp3",
    "prices": {
      "standard": 32.99,
      "premium": 66.99,
      "exclusive": 320.99
    },
    "streams": 274911,
    "isSeed": true
  },
  {
    "id": "track-12",
    "title": "Acoustic Pulse",
    "artist": "Howler Audio",
    "genre": "Dance-Pop",
    "BPM": 108,
    "keySignature": "F# Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-12/300/300",
    "audioSrc": "audio/track-12.wav",
    "prices": {
      "standard": 35.99,
      "premium": 73.99,
      "exclusive": 331.99
    },
    "streams": 298812,
    "isSeed": true
  },
  {
    "id": "track-13",
    "title": "Summer Skyline",
    "artist": "Cyber Punk",
    "genre": "Alternative Rock",
    "BPM": 127,
    "keySignature": "C# Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-13/300/300",
    "audioSrc": "audio/track-13.ogg",
    "prices": {
      "standard": 38.99,
      "premium": 50.99,
      "exclusive": 342.99
    },
    "streams": 322713,
    "isSeed": true
  },
  {
    "id": "track-14",
    "title": "Neon Journey",
    "artist": "Wave Master",
    "genre": "Ambient",
    "BPM": 81,
    "keySignature": "G Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-14/300/300",
    "audioSrc": "audio/track-14.m4a",
    "prices": {
      "standard": 21.99,
      "premium": 57.99,
      "exclusive": 353.99
    },
    "streams": 346614,
    "isSeed": true
  },
  {
    "id": "track-15",
    "title": "Cyber Horizon",
    "artist": "PixiJS Game Audio",
    "genre": "Pop",
    "BPM": 100,
    "keySignature": "F Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-15/300/300",
    "audioSrc": "audio/track-15.mp3",
    "prices": {
      "standard": 24.99,
      "premium": 64.99,
      "exclusive": 364.99
    },
    "streams": 370515,
    "isSeed": true
  },
  {
    "id": "track-16",
    "title": "Cozy Frequency",
    "artist": "Synth Shaman",
    "genre": "Lo-Fi Hip Hop",
    "BPM": 119,
    "keySignature": "C Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-16/300/300",
    "audioSrc": "audio/track-16.mp3",
    "prices": {
      "standard": 27.99,
      "premium": 71.99,
      "exclusive": 375.99
    },
    "streams": 394416,
    "isSeed": true
  },
  {
    "id": "track-17",
    "title": "Deep Sunset",
    "artist": "Beat Bandit",
    "genre": "Synth-Pop",
    "BPM": 138,
    "keySignature": "A Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-17/300/300",
    "audioSrc": "audio/track-17.mp3",
    "prices": {
      "standard": 30.99,
      "premium": 78.99,
      "exclusive": 386.99
    },
    "streams": 418317,
    "isSeed": true
  },
  {
    "id": "track-18",
    "title": "Luminous Rain",
    "artist": "Rafael Reis",
    "genre": "EDM",
    "BPM": 92,
    "keySignature": "D Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-18/300/300",
    "audioSrc": "audio/track-18.mp3",
    "prices": {
      "standard": 33.99,
      "premium": 55.99,
      "exclusive": 397.99
    },
    "streams": 442218,
    "isSeed": true
  },
  {
    "id": "track-19",
    "title": "Retro Whisper",
    "artist": "Lofi Dreamer",
    "genre": "Sound Effects",
    "BPM": 111,
    "keySignature": "E Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-19/300/300",
    "audioSrc": "audio/track-19.mp3",
    "prices": {
      "standard": 36.99,
      "premium": 62.99,
      "exclusive": 208.99
    },
    "streams": 466119,
    "isSeed": true
  },
  {
    "id": "track-20",
    "title": "Sunset Drive",
    "artist": "SoundManager Audio",
    "genre": "Dance-Pop",
    "BPM": 130,
    "keySignature": "F# Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-20/300/300",
    "audioSrc": "audio/track-20.mp3",
    "prices": {
      "standard": 19.99,
      "premium": 69.99,
      "exclusive": 219.99
    },
    "streams": 490020,
    "isSeed": true
  },
  {
    "id": "track-21",
    "title": "Cosmic Storm",
    "artist": "MDN Audio",
    "genre": "Alternative Rock",
    "BPM": 84,
    "keySignature": "C# Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-21/300/300",
    "audioSrc": "audio/track-21.mp3",
    "prices": {
      "standard": 22.99,
      "premium": 76.99,
      "exclusive": 230.99
    },
    "streams": 513921,
    "isSeed": true
  },
  {
    "id": "track-22",
    "title": "Urban Solitude",
    "artist": "Aero Groove",
    "genre": "Ambient",
    "BPM": 103,
    "keySignature": "G Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-22/300/300",
    "audioSrc": "audio/track-22.mp3",
    "prices": {
      "standard": 25.99,
      "premium": 53.99,
      "exclusive": 241.99
    },
    "streams": 537822,
    "isSeed": true
  },
  {
    "id": "track-23",
    "title": "Echoing Boulevard",
    "artist": "SoundHelix Band",
    "genre": "Pop",
    "BPM": 122,
    "keySignature": "F Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-23/300/300",
    "audioSrc": "audio/track-23.mp3",
    "prices": {
      "standard": 28.99,
      "premium": 60.99,
      "exclusive": 252.99
    },
    "streams": 561723,
    "isSeed": true
  },
  {
    "id": "track-24",
    "title": "Starlight Echo",
    "artist": "Pulse Pilot",
    "genre": "Lo-Fi Hip Hop",
    "BPM": 76,
    "keySignature": "C Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-24/300/300",
    "audioSrc": "audio/track-24.mp3",
    "prices": {
      "standard": 31.99,
      "premium": 67.99,
      "exclusive": 263.99
    },
    "streams": 585624,
    "isSeed": true
  },
  {
    "id": "track-25",
    "title": "Glitch Groove",
    "artist": "Sonic Architect",
    "genre": "Synth-Pop",
    "BPM": 95,
    "keySignature": "A Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-25/300/300",
    "audioSrc": "audio/track-25.mp3",
    "prices": {
      "standard": 34.99,
      "premium": 74.99,
      "exclusive": 274.99
    },
    "streams": 609525,
    "isSeed": true
  },
  {
    "id": "track-26",
    "title": "Alternative Dreams",
    "artist": "Goldfire Studios",
    "genre": "EDM",
    "BPM": 114,
    "keySignature": "D Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-26/300/300",
    "audioSrc": "audio/track-26.webm",
    "prices": {
      "standard": 37.99,
      "premium": 51.99,
      "exclusive": 285.99
    },
    "streams": 633426,
    "isSeed": true
  },
  {
    "id": "track-27",
    "title": "Midnight Memories",
    "artist": "Midnight Echo",
    "genre": "Sound Effects",
    "BPM": 133,
    "keySignature": "E Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-27/300/300",
    "audioSrc": "audio/track-27.webm",
    "prices": {
      "standard": 20.99,
      "premium": 58.99,
      "exclusive": 296.99
    },
    "streams": 657327,
    "isSeed": true
  },
  {
    "id": "track-28",
    "title": "Vintage Anthem",
    "artist": "Sound Catalyst",
    "genre": "Dance-Pop",
    "BPM": 87,
    "keySignature": "F# Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-28/300/300",
    "audioSrc": "audio/track-28.mp3",
    "prices": {
      "standard": 23.99,
      "premium": 65.99,
      "exclusive": 307.99
    },
    "streams": 681228,
    "isSeed": true
  },
  {
    "id": "track-29",
    "title": "Electric Vibes",
    "artist": "Howler Audio",
    "genre": "Alternative Rock",
    "BPM": 106,
    "keySignature": "C# Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-29/300/300",
    "audioSrc": "audio/track-29.mp3",
    "prices": {
      "standard": 26.99,
      "premium": 72.99,
      "exclusive": 318.99
    },
    "streams": 705129,
    "isSeed": true
  },
  {
    "id": "track-30",
    "title": "Chilled Ocean",
    "artist": "Cyber Punk",
    "genre": "Ambient",
    "BPM": 125,
    "keySignature": "G Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-30/300/300",
    "audioSrc": "audio/track-30.mp3",
    "prices": {
      "standard": 29.99,
      "premium": 49.99,
      "exclusive": 329.99
    },
    "streams": 729030,
    "isSeed": true
  },
  {
    "id": "track-31",
    "title": "Secret Odyssey",
    "artist": "Wave Master",
    "genre": "Pop",
    "BPM": 79,
    "keySignature": "F Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-31/300/300",
    "audioSrc": "audio/track-31.mp3",
    "prices": {
      "standard": 32.99,
      "premium": 56.99,
      "exclusive": 340.99
    },
    "streams": 752931,
    "isSeed": true
  },
  {
    "id": "track-32",
    "title": "Acoustic Pulse",
    "artist": "PixiJS Game Audio",
    "genre": "Lo-Fi Hip Hop",
    "BPM": 98,
    "keySignature": "C Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-32/300/300",
    "audioSrc": "audio/track-32.mp3",
    "prices": {
      "standard": 35.99,
      "premium": 63.99,
      "exclusive": 351.99
    },
    "streams": 776832,
    "isSeed": true
  },
  {
    "id": "track-33",
    "title": "Summer Skyline",
    "artist": "Synth Shaman",
    "genre": "Synth-Pop",
    "BPM": 117,
    "keySignature": "A Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-33/300/300",
    "audioSrc": "audio/track-33.mp3",
    "prices": {
      "standard": 38.99,
      "premium": 70.99,
      "exclusive": 362.99
    },
    "streams": 800733,
    "isSeed": true
  },
  {
    "id": "track-34",
    "title": "Neon Journey",
    "artist": "Beat Bandit",
    "genre": "EDM",
    "BPM": 136,
    "keySignature": "D Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-34/300/300",
    "audioSrc": "audio/track-34.mp3",
    "prices": {
      "standard": 21.99,
      "premium": 77.99,
      "exclusive": 373.99
    },
    "streams": 824634,
    "isSeed": true
  },
  {
    "id": "track-35",
    "title": "Cyber Horizon",
    "artist": "Rafael Reis",
    "genre": "Sound Effects",
    "BPM": 90,
    "keySignature": "E Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-35/300/300",
    "audioSrc": "audio/track-35.mp3",
    "prices": {
      "standard": 24.99,
      "premium": 54.99,
      "exclusive": 384.99
    },
    "streams": 848535,
    "isSeed": true
  },
  {
    "id": "track-36",
    "title": "Cozy Frequency",
    "artist": "Lofi Dreamer",
    "genre": "Dance-Pop",
    "BPM": 109,
    "keySignature": "F# Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-36/300/300",
    "audioSrc": "audio/track-36.mp3",
    "prices": {
      "standard": 27.99,
      "premium": 61.99,
      "exclusive": 395.99
    },
    "streams": 32436,
    "isSeed": true
  },
  {
    "id": "track-37",
    "title": "Deep Sunset",
    "artist": "SoundManager Audio",
    "genre": "Alternative Rock",
    "BPM": 128,
    "keySignature": "C# Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-37/300/300",
    "audioSrc": "audio/track-37.mp3",
    "prices": {
      "standard": 30.99,
      "premium": 68.99,
      "exclusive": 206.99
    },
    "streams": 56337,
    "isSeed": true
  },
  {
    "id": "track-38",
    "title": "Luminous Rain",
    "artist": "MDN Audio",
    "genre": "Ambient",
    "BPM": 82,
    "keySignature": "G Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-38/300/300",
    "audioSrc": "audio/track-38.mp3",
    "prices": {
      "standard": 33.99,
      "premium": 75.99,
      "exclusive": 217.99
    },
    "streams": 80238,
    "isSeed": true
  },
  {
    "id": "track-39",
    "title": "Retro Whisper",
    "artist": "Aero Groove",
    "genre": "Pop",
    "BPM": 101,
    "keySignature": "F Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-39/300/300",
    "audioSrc": "audio/track-39.mp3",
    "prices": {
      "standard": 36.99,
      "premium": 52.99,
      "exclusive": 228.99
    },
    "streams": 104139,
    "isSeed": true
  },
  {
    "id": "track-40",
    "title": "Sunset Drive",
    "artist": "SoundHelix Band",
    "genre": "Lo-Fi Hip Hop",
    "BPM": 120,
    "keySignature": "C Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-40/300/300",
    "audioSrc": "audio/track-40.mp3",
    "prices": {
      "standard": 19.99,
      "premium": 59.99,
      "exclusive": 239.99
    },
    "streams": 128040,
    "isSeed": true
  },
  {
    "id": "track-41",
    "title": "Cosmic Storm",
    "artist": "Pulse Pilot",
    "genre": "Synth-Pop",
    "BPM": 139,
    "keySignature": "A Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-41/300/300",
    "audioSrc": "audio/track-41.mp3",
    "prices": {
      "standard": 22.99,
      "premium": 66.99,
      "exclusive": 250.99
    },
    "streams": 151941,
    "isSeed": true
  },
  {
    "id": "track-42",
    "title": "Urban Solitude",
    "artist": "Sonic Architect",
    "genre": "EDM",
    "BPM": 93,
    "keySignature": "D Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-42/300/300",
    "audioSrc": "audio/track-42.mp3",
    "prices": {
      "standard": 25.99,
      "premium": 73.99,
      "exclusive": 261.99
    },
    "streams": 175842,
    "isSeed": true
  },
  {
    "id": "track-43",
    "title": "Echoing Boulevard",
    "artist": "Goldfire Studios",
    "genre": "Sound Effects",
    "BPM": 112,
    "keySignature": "E Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-43/300/300",
    "audioSrc": "audio/track-43.mp3",
    "prices": {
      "standard": 28.99,
      "premium": 50.99,
      "exclusive": 272.99
    },
    "streams": 199743,
    "isSeed": true
  },
  {
    "id": "track-44",
    "title": "Starlight Echo",
    "artist": "Midnight Echo",
    "genre": "Dance-Pop",
    "BPM": 131,
    "keySignature": "F# Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-44/300/300",
    "audioSrc": "audio/track-44.mp3",
    "prices": {
      "standard": 31.99,
      "premium": 57.99,
      "exclusive": 283.99
    },
    "streams": 223644,
    "isSeed": true
  },
  {
    "id": "track-45",
    "title": "Glitch Groove",
    "artist": "Sound Catalyst",
    "genre": "Alternative Rock",
    "BPM": 85,
    "keySignature": "C# Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-45/300/300",
    "audioSrc": "audio/track-45.mp3",
    "prices": {
      "standard": 34.99,
      "premium": 64.99,
      "exclusive": 294.99
    },
    "streams": 247545,
    "isSeed": true
  },
  {
    "id": "track-46",
    "title": "Alternative Dreams",
    "artist": "Howler Audio",
    "genre": "Ambient",
    "BPM": 104,
    "keySignature": "G Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-46/300/300",
    "audioSrc": "audio/track-46.mp3",
    "prices": {
      "standard": 37.99,
      "premium": 71.99,
      "exclusive": 305.99
    },
    "streams": 271446,
    "isSeed": true
  },
  {
    "id": "track-47",
    "title": "Midnight Memories",
    "artist": "Cyber Punk",
    "genre": "Pop",
    "BPM": 123,
    "keySignature": "F Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-47/300/300",
    "audioSrc": "audio/track-47.mp3",
    "prices": {
      "standard": 20.99,
      "premium": 78.99,
      "exclusive": 316.99
    },
    "streams": 295347,
    "isSeed": true
  },
  {
    "id": "track-48",
    "title": "Vintage Anthem",
    "artist": "Wave Master",
    "genre": "Lo-Fi Hip Hop",
    "BPM": 77,
    "keySignature": "C Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-48/300/300",
    "audioSrc": "audio/track-48.mp3",
    "prices": {
      "standard": 23.99,
      "premium": 55.99,
      "exclusive": 327.99
    },
    "streams": 319248,
    "isSeed": true
  },
  {
    "id": "track-49",
    "title": "Electric Vibes",
    "artist": "PixiJS Game Audio",
    "genre": "Synth-Pop",
    "BPM": 96,
    "keySignature": "A Minor",
    "coverArt": "https://picsum.photos/seed/picsum-seed-49/300/300",
    "audioSrc": "audio/track-49.webm",
    "prices": {
      "standard": 26.99,
      "premium": 62.99,
      "exclusive": 338.99
    },
    "streams": 343149,
    "isSeed": true
  },
  {
    "id": "track-50",
    "title": "Chilled Ocean",
    "artist": "Synth Shaman",
    "genre": "EDM",
    "BPM": 115,
    "keySignature": "D Major",
    "coverArt": "https://picsum.photos/seed/picsum-seed-50/300/300",
    "audioSrc": "audio/track-50.mp3",
    "prices": {
      "standard": 29.99,
      "premium": 69.99,
      "exclusive": 349.99
    },
    "streams": 367050,
    "isSeed": true
  }
];

class BeatFlowDB {
  constructor() {
    this.db = null;
  }

  /**
   * Initializes the IndexedDB database.
   * If the database is empty, seeds it with initial tracks.
   */
  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('Database failed to open:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        try {
          await this.seedIfEmpty();
          resolve(this);
        } catch (err) {
          reject(err);
        }
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create store for tracks if it doesn't exist
        if (!db.objectStoreNames.contains('tracks')) {
          db.createObjectStore('tracks', { keyPath: 'id' });
        }

        // Create store for sales history if it doesn't exist
        if (!db.objectStoreNames.contains('sales')) {
          db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  /**
   * Seeds the database with default tracks if the tracks store is empty.
   */
  async seedIfEmpty() {
    const tracks = await this.getAllTracks();
    const hasOldGen = tracks.some(t => 
      t.id.startsWith('track-gen-') || 
      t.title === 'Classic Canyon' ||
      (typeof t.audioSrc === 'string' && (t.audioSrc.startsWith('http') || t.audioSrc.includes('audio/song-')))
    );
    
    // Self-healing check: if the database has less than 50 tracks or contains old dynamic/broken tracks
    if (tracks.length < 50 || hasOldGen) {
      console.log('Seeding BeatFlow database with initial tracks (50 unique local tracks migration)...');
      const tx = this.db.transaction('tracks', 'readwrite');
      const store = tx.objectStore('tracks');
      
      // Clear store to ensure clean slate for exactly 50 unique tracks
      store.clear();
      
      for (const track of SEED_TRACKS) {
        store.put(track);
      }
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => {
          console.log('Database seeded successfully.');
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      });
    }
  }

  /**
   * Gets all tracks from the database.
   */
  getAllTracks() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('tracks', 'readonly');
      const store = tx.objectStore('tracks');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Gets a specific track by its ID.
   */
  getTrack(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('tracks', 'readonly');
      const store = tx.objectStore('tracks');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Adds or updates a track in the database.
   */
  saveTrack(track) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('tracks', 'readwrite');
      const store = tx.objectStore('tracks');
      const request = store.put(track);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Deletes a track from the database by ID.
   */
  deleteTrack(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('tracks', 'readwrite');
      const store = tx.objectStore('tracks');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Increments the stream count for a track.
   */
  async incrementStreamCount(id) {
    const track = await this.getTrack(id);
    if (track) {
      track.streams = (track.streams || 0) + 1;
      await this.saveTrack(track);
      return track.streams;
    }
    return 0;
  }

  /**
   * Adds a new sale to the database.
   */
  addSale(sale) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('sales', 'readwrite');
      const store = tx.objectStore('sales');
      const request = store.add(sale);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Gets all sales transactions from the database.
   */
  getAllSales() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('sales', 'readonly');
      const store = tx.objectStore('sales');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Export database class globally so it can be referenced across files
window.BeatFlowDB = BeatFlowDB;
