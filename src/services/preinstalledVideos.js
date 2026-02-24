/**
 * Preinstalled background video clips hosted on Supabase Storage.
 * 40 clips across 3 categories: Cinematic, Luxury, Aesthetic.
 * These are available for all users in the "Clips" visual style.
 */

const SUPABASE_CLIPS =
  "https://bmpxhntqtcgmqghydpxl.supabase.co/storage/v1/object/public/clips";

export const PREINSTALLED_VIDEOS = [
  // ═══════════════════════════════════════════
  // CINEMATIC — Faceless aesthetic, moody visuals
  // ═══════════════════════════════════════════
  {
    id: "clip_cin_1",
    name: "Cinematic 1",
    category: "cinematic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/faceless.mp4`,
  },
  {
    id: "clip_cin_2",
    name: "Cinematic 2",
    category: "cinematic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/faceless_1.mp4`,
  },
  {
    id: "clip_cin_3",
    name: "Cinematic 3",
    category: "cinematic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/faceless_3.mp4`,
  },
  {
    id: "clip_cin_4",
    name: "Cinematic 4",
    category: "cinematic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/faceless_5.mp4`,
  },
  {
    id: "clip_cin_5",
    name: "Cinematic 5",
    category: "cinematic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/faceless_11.mp4`,
  },
  {
    id: "clip_cin_6",
    name: "Cinematic 6",
    category: "cinematic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/faceless_12.mp4`,
  },
  {
    id: "clip_cin_7",
    name: "Cinematic 7",
    category: "cinematic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/faceless_17.mp4`,
  },
  {
    id: "clip_cin_8",
    name: "Cinematic 8",
    category: "cinematic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/faceless_26.mp4`,
  },
  {
    id: "clip_cin_9",
    name: "Cinematic 9",
    category: "cinematic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/faceless_30.mp4`,
  },
  {
    id: "clip_cin_10",
    name: "Cinematic 10",
    category: "cinematic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/faceless_34.mp4`,
  },

  // ═══════════════════════════════════════════
  // LUXURY — Elegant, lifestyle, luxe vibes
  // ═══════════════════════════════════════════
  {
    id: "clip_lux_1",
    name: "Luxe 1",
    category: "luxury",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/luxe_2.mp4`,
  },
  {
    id: "clip_lux_2",
    name: "Luxe 2",
    category: "luxury",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/luxe_10.mp4`,
  },
  {
    id: "clip_lux_3",
    name: "Luxe 3",
    category: "luxury",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/luxe_19.mp4`,
  },
  {
    id: "clip_lux_4",
    name: "Luxe 4",
    category: "luxury",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/luxe_28.mp4`,
  },
  {
    id: "clip_lux_5",
    name: "Luxe 5",
    category: "luxury",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/luxe_37.mp4`,
  },
  {
    id: "clip_lux_6",
    name: "Luxe 6",
    category: "luxury",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/luxe_42.mp4`,
  },
  {
    id: "clip_lux_7",
    name: "Luxe 7",
    category: "luxury",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/luxe_58.mp4`,
  },
  {
    id: "clip_lux_8",
    name: "Luxe 8",
    category: "luxury",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/luxe_67.mp4`,
  },
  {
    id: "clip_lux_9",
    name: "Luxe 9",
    category: "luxury",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/luxe_78.mp4`,
  },
  {
    id: "clip_lux_10",
    name: "Luxe 10",
    category: "luxury",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/luxe_106.mp4`,
  },
  {
    id: "clip_lux_11",
    name: "Luxe 11",
    category: "luxury",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/luxe_131.mp4`,
  },
  {
    id: "clip_lux_12",
    name: "Luxe 12",
    category: "luxury",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/luxe_136.mp4`,
  },
  {
    id: "clip_lux_13",
    name: "Luxe 13",
    category: "luxury",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/luxe_138.mp4`,
  },
  {
    id: "clip_lux_14",
    name: "Luxe 14",
    category: "luxury",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/luxe_168.mp4`,
  },
  {
    id: "clip_lux_15",
    name: "Luxe 15",
    category: "luxury",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/luxe_178.mp4`,
  },

  // ═══════════════════════════════════════════
  // AESTHETIC — Abstract, ambient, moody loops
  // ═══════════════════════════════════════════
  {
    id: "clip_aes_1",
    name: "Aesthetic 1",
    category: "aesthetic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/aesthetic_271.mp4`,
  },
  {
    id: "clip_aes_2",
    name: "Aesthetic 2",
    category: "aesthetic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/aesthetic_280.mp4`,
  },
  {
    id: "clip_aes_3",
    name: "Aesthetic 3",
    category: "aesthetic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/aesthetic_290.mp4`,
  },
  {
    id: "clip_aes_4",
    name: "Aesthetic 4",
    category: "aesthetic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/aesthetic_300.mp4`,
  },
  {
    id: "clip_aes_5",
    name: "Aesthetic 5",
    category: "aesthetic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/aesthetic_312.mp4`,
  },
  {
    id: "clip_aes_6",
    name: "Aesthetic 6",
    category: "aesthetic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/aesthetic_324.mp4`,
  },
  {
    id: "clip_aes_7",
    name: "Aesthetic 7",
    category: "aesthetic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/aesthetic_341.mp4`,
  },
  {
    id: "clip_aes_8",
    name: "Aesthetic 8",
    category: "aesthetic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/aesthetic_360.mp4`,
  },
  {
    id: "clip_aes_9",
    name: "Aesthetic 9",
    category: "aesthetic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/aesthetic_369.mp4`,
  },
  {
    id: "clip_aes_10",
    name: "Aesthetic 10",
    category: "aesthetic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/aesthetic_390.mp4`,
  },
  {
    id: "clip_aes_11",
    name: "Aesthetic 11",
    category: "aesthetic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/aesthetic_405.mp4`,
  },
  {
    id: "clip_aes_12",
    name: "Aesthetic 12",
    category: "aesthetic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/aesthetic_419.mp4`,
  },
  {
    id: "clip_aes_13",
    name: "Aesthetic 13",
    category: "aesthetic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/aesthetic_424.mp4`,
  },
  {
    id: "clip_aes_14",
    name: "Aesthetic 14",
    category: "aesthetic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/aesthetic_430.mp4`,
  },
  {
    id: "clip_aes_15",
    name: "Aesthetic 15",
    category: "aesthetic",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/aesthetic_545.mp4`,
  },

  // ═══════════════════════════════════════════
  // GAMING — Videogame gameplay, action clips
  // ═══════════════════════════════════════════
  {
    id: "clip_gaming_1",
    name: "Gaming 1",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_gta_0001.mp4`,
  },
  {
    id: "clip_gaming_2",
    name: "Gaming 2",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_gta_0002.mp4`,
  },
  {
    id: "clip_gaming_3",
    name: "Gaming 3",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_pubg_0002.mp4`,
  },
  {
    id: "clip_gaming_4",
    name: "Gaming 4",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_pubg_0006.mp4`,
  },
  {
    id: "clip_gaming_5",
    name: "Gaming 5",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_pubg_0009.mp4`,
  },
  {
    id: "clip_gaming_6",
    name: "Gaming 6",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_pubg_0001.mp4`,
  },
  {
    id: "clip_gaming_7",
    name: "Gaming 7",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_pubg_0003.mp4`,
  },
  {
    id: "clip_gaming_8",
    name: "Gaming 8",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_pubg_0004.mp4`,
  },
  {
    id: "clip_gaming_9",
    name: "Gaming 9",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_pubg_0014.mp4`,
  },
  {
    id: "clip_gaming_10",
    name: "Gaming 10",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_pubg_0015.mp4`,
  },
  {
    id: "clip_gaming_11",
    name: "Gaming 11",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_redmogly_0001.mp4`,
  },
  {
    id: "clip_gaming_12",
    name: "Gaming 12",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_redmogly_0004.mp4`,
  },
  {
    id: "clip_gaming_13",
    name: "Gaming 13",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_redmogly_0005.mp4`,
  },
  {
    id: "clip_gaming_14",
    name: "Gaming 14",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_redmogly_0002.mp4`,
  },
  {
    id: "clip_gaming_15",
    name: "Gaming 15",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_redmogly_0003.mp4`,
  },
  {
    id: "clip_gaming_16",
    name: "Gaming 16",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_capi_0007.mp4`,
  },
  {
    id: "clip_gaming_17",
    name: "Gaming 17",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_capi_0017.mp4`,
  },
  {
    id: "clip_gaming_18",
    name: "Gaming 18",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_capi_0001.mp4`,
  },
  {
    id: "clip_gaming_19",
    name: "Gaming 19",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_capi_0013.mp4`,
  },
  {
    id: "clip_gaming_20",
    name: "Gaming 20",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_capi_0019.mp4`,
  },
  {
    id: "clip_gaming_21",
    name: "Gaming 21",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_capi_0027.mp4`,
  },
  {
    id: "clip_gaming_22",
    name: "Gaming 22",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_capi_0033.mp4`,
  },
  {
    id: "clip_gaming_23",
    name: "Gaming 23",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_capi_0021.mp4`,
  },
  {
    id: "clip_gaming_24",
    name: "Gaming 24",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_capi_0028.mp4`,
  },
  {
    id: "clip_gaming_25",
    name: "Gaming 25",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_capi_0035.mp4`,
  },
  {
    id: "clip_gaming_26",
    name: "Gaming 26",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_capi_0036.mp4`,
  },
  {
    id: "clip_gaming_27",
    name: "Gaming 27",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_capi_0040.mp4`,
  },
  {
    id: "clip_gaming_28",
    name: "Gaming 28",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_capi_0052.mp4`,
  },
  {
    id: "clip_gaming_29",
    name: "Gaming 29",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_capi_0058.mp4`,
  },
  {
    id: "clip_gaming_30",
    name: "Gaming 30",
    category: "gaming",
    thumbnail: "",
    url: `${SUPABASE_CLIPS}/gaming_capi_0056.mp4`,
  },
];

/**
 * Categories for the clip selector UI
 */
export const PREINSTALLED_CATEGORIES = [
  { id: "all", icon: "🎬", label: "Todos" },
  { id: "cinematic", icon: "🎥", label: "Cinemático" },
  { id: "luxury", icon: "💎", label: "Luxury" },
  { id: "aesthetic", icon: "✨", label: "Aesthetic" },
  { id: "gaming", icon: "🎮", label: "Gaming" },
];

/**
 * Get clips filtered by category
 */
export function getPreinstalledByCategory(category) {
  if (!category || category === "all") return PREINSTALLED_VIDEOS;
  return PREINSTALLED_VIDEOS.filter((v) => v.category === category);
}

/**
 * Get a specific clip by ID
 */
export function getPreinstalledById(id) {
  return PREINSTALLED_VIDEOS.find((v) => v.id === id);
}
