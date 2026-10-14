// Links and facts used across the page. Change campaign details here, not in components.

export const LINKS = {
  tvAdsForm: 'https://forms.gle/8ug7ggcsWoBFGJxbA',
  whatsappJonathan: 'https://wa.me/60109780807',
  telJonathan: 'tel:+60109780807',
  mallWebsite: 'https://bintangmegamall.com/',
  mallDirectory: 'https://bintangmegamall.com/directory',
  mallContact: 'https://bintangmegamall.com/contact/',
} as const;

export const CONTACT = {
  name: 'Jonathan',
  phoneDisplay: '+60 10 978 0807',
} as const;

export const HOTEL_ROOMS = 290;

/**
 * Registration deadline as 'YYYY-MM-DD' (Malaysia time). Leave null to hide the
 * "Registration closes ..." chip on the first screen.
 */
export const REGISTRATION_DEADLINE: string | null = null;

export const SECTION_IDS = {
  shopTenants: 'shop-tenants',
  tvAds: 'tv-advertising',
} as const;
