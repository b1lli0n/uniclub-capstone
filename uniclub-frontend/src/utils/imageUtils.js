/**
 * Utility functions to ensure all images in the application strictly come from
 * the local `/uploads/` directory (e.g., `/uploads/events/` and `/uploads/clubs/`).
 */

export const UPLOAD_EVENT_IMAGES = [
  { value: '/uploads/events/sport_event.png', label: 'Sports Event (/uploads/events/sport_event.png)' },
  { value: '/uploads/events/workshop_event.png', label: 'Workshop Event (/uploads/events/workshop_event.png)' },
  { value: '/uploads/events/community_event.png', label: 'Community Event (/uploads/events/community_event.png)' },
  { value: '/uploads/events/entertainment_event.png', label: 'Entertainment Event (/uploads/events/entertainment_event.png)' },
]

export const UPLOAD_CLUB_LOGOS = [
  { value: '/uploads/clubs/coding_club_logo.png', label: 'Coding Club' },
  { value: '/uploads/clubs/music_club_logo.png', label: 'Music Club' },
  { value: '/uploads/clubs/dance_club_logo.png', label: 'Dance Club' },
  { value: '/uploads/clubs/basketball_club_logo.png', label: 'Basketball Club' },
  { value: '/uploads/clubs/chess_club_logo.png', label: 'Chess Club' },
  { value: '/uploads/clubs/debate_club_logo.png', label: 'Debate Club' },
  { value: '/uploads/clubs/environmental_club_logo.png', label: 'Environmental Club' },
  { value: '/uploads/clubs/film_club_logo.png', label: 'Film Club' },
  { value: '/uploads/clubs/gaming_club_logo.png', label: 'Gaming Club' },
  { value: '/uploads/clubs/photography_club_logo.png', label: 'Photography Club' },
  { value: '/uploads/clubs/startup_club_logo.png', label: 'Startup Club' },
  { value: '/uploads/clubs/volunteer_club_logo.png', label: 'Volunteer Club' },
]

export function resolveEventUploadImage(mediaUrisOrUrl, category = '') {
  let url = Array.isArray(mediaUrisOrUrl) ? mediaUrisOrUrl[0] : mediaUrisOrUrl
  if (url && typeof url === 'string') {
    if (url.includes('/uploads/events/')) {
      return url.substring(url.indexOf('/uploads/events/'))
    }
    if (url.includes('/uploads/')) {
      return url.substring(url.indexOf('/uploads/'))
    }
  }

  // Auto-pick from /uploads/events/ based on category
  const cat = (category || '').toLowerCase()
  if (cat.includes('sport') || cat.includes('football') || cat.includes('basketball') || cat.includes('volleyball') || cat.includes('badminton') || cat.includes('tennis') || cat.includes('run')) {
    return '/uploads/events/sport_event.png'
  }
  if (cat.includes('workshop') || cat.includes('academic') || cat.includes('tech') || cat.includes('code') || cat.includes('math') || cat.includes('finance')) {
    return '/uploads/events/workshop_event.png'
  }
  if (cat.includes('community') || cat.includes('csr') || cat.includes('volunteer') || cat.includes('social')) {
    return '/uploads/events/community_event.png'
  }
  return '/uploads/events/entertainment_event.png'
}

export function resolveClubLogo(logoUrl, nameOrCategory = '') {
  if (logoUrl && typeof logoUrl === 'string') {
    if (logoUrl.includes('/uploads/clubs/')) {
      return logoUrl.substring(logoUrl.indexOf('/uploads/clubs/'))
    }
    if (logoUrl.includes('/uploads/')) {
      return logoUrl.substring(logoUrl.indexOf('/uploads/'))
    }
  }

  const key = (nameOrCategory || '').toLowerCase()
  if (key.includes('code') || key.includes('coding') || key.includes('it') || key.includes('tech')) return '/uploads/clubs/coding_club_logo.png'
  if (key.includes('music')) return '/uploads/clubs/music_club_logo.png'
  if (key.includes('dance')) return '/uploads/clubs/dance_club_logo.png'
  if (key.includes('basketball') || key.includes('sport')) return '/uploads/clubs/basketball_club_logo.png'
  if (key.includes('chess')) return '/uploads/clubs/chess_club_logo.png'
  if (key.includes('debate')) return '/uploads/clubs/debate_club_logo.png'
  if (key.includes('environment') || key.includes('environmental') || key.includes('green')) return '/uploads/clubs/environmental_club_logo.png'
  if (key.includes('film') || key.includes('movie')) return '/uploads/clubs/film_club_logo.png'
  if (key.includes('game') || key.includes('gaming') || key.includes('esport')) return '/uploads/clubs/gaming_club_logo.png'
  if (key.includes('photo') || key.includes('photography')) return '/uploads/clubs/photography_club_logo.png'
  if (key.includes('startup') || key.includes('business')) return '/uploads/clubs/startup_club_logo.png'
  if (key.includes('volunteer') || key.includes('social')) return '/uploads/clubs/volunteer_club_logo.png'

  return '/uploads/clubs/music_club_logo.png'
}
