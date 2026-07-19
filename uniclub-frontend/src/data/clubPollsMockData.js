export const CLUB_POLL_STATUS_OPTIONS = [
  { value: 'all', label: 'All polls' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
]

export const CLUB_POLLS = [
  {
    id: 'poll-2401', clubId: 'music', title: 'Choose the theme for our July showcase',
    description: 'Help the Music Club choose a direction for the upcoming student showcase.',
    options: [{ id: 'o1', label: 'Acoustic night', votes: 18 }, { id: 'o2', label: 'Pop & indie', votes: 26 }, { id: 'o3', label: 'Vietnamese classics', votes: 12 }],
    status: 'open', closesAt: '24 Jul 2026, 18:00', createdAt: '18 Jul 2026, 09:15', createdBy: 'Ha Van Son', voters: 56,
  },
  {
    id: 'poll-2398', clubId: 'music', title: 'Practice slot for new members',
    description: 'Select the most convenient recurring practice time for the new-member group.',
    options: [{ id: 'o1', label: 'Tuesday, 18:00', votes: 21 }, { id: 'o2', label: 'Thursday, 18:00', votes: 34 }, { id: 'o3', label: 'Saturday, 09:00', votes: 15 }],
    status: 'open', closesAt: '26 Jul 2026, 18:00', createdAt: '17 Jul 2026, 14:40', createdBy: 'Ha Van Son', voters: 70,
  },
  {
    id: 'poll-2386', clubId: 'music', title: 'Club hoodie colour',
    description: 'Thank you for voting on the colour of the club hoodie this semester.',
    options: [{ id: 'o1', label: 'Navy blue', votes: 42 }, { id: 'o2', label: 'Cream', votes: 18 }, { id: 'o3', label: 'Burgundy', votes: 27 }],
    status: 'closed', closesAt: '12 Jul 2026, 20:00', createdAt: '06 Jul 2026, 10:00', createdBy: 'Ha Van Son', voters: 87,
  },
]
