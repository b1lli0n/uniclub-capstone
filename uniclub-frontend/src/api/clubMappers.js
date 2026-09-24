const CATEGORY_GRADIENTS = {
  sport: 'linear-gradient(135deg, #ffce96 0%, #f5b87a 100%)',
  academic: 'linear-gradient(135deg, #a8d8ff 0%, #7eb8f0 100%)',
  art: 'linear-gradient(135deg, #f5b0d8 0%, #e88fc4 100%)',
  event: 'linear-gradient(135deg, #c4f0a8 0%, #9ed87e 100%)',
  other: 'linear-gradient(135deg, #e2d9f3 0%, #c5b4e8 100%)',
}

const ROLE_LABELS = {
  president: 'President',
  secretary: 'Secretary',
  treasurer: 'Treasurer',
  event_manager: 'Event Manager',
  member: 'Member',
  leader: 'President',
  'vice leader': 'Member',
}


export const STATUS_LABELS = {
  pending: 'Pending',
  waiting_member_approval: 'Waiting Member Approval',
  approved: 'Approved',
  accepted: 'Accepted',
  rejected: 'Rejected',
  declined: 'Declined',
  cancelled: 'Cancelled',
  expired: 'Expired',
  active: 'Active',
  coming_soon: 'Coming Soon',
  opening: 'Opening',
  closed: 'Closed',
}

export function formatStatusLabel(status = '') {
  const key = String(status).toLowerCase().trim()
  return STATUS_LABELS[key] || status
}

export function formatRoleLabel(role = '') {
  return ROLE_LABELS[role] || role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-GB')
}

export function mapClubFromApi(club, extras = {}) {
  let category = (club.category || 'academic').toLowerCase().trim()
  if (category === 'arts') category = 'art'
  if (category === 'sports') category = 'sport'
  if (category === 'events') category = 'event'
  // Normalize unknown categories to 'other'
  const knownCategories = ['academic', 'sport', 'art', 'event', 'other']
  if (!knownCategories.includes(category)) category = 'other'

  const leader = club.president_id || extras.leader || {}
  const leaderName =
    (typeof leader === 'object' && leader?.full_name) ||
    (typeof leader === 'string' && leader ? leader : '') ||
    (typeof club.leader === 'string' && club.leader ? club.leader : '') ||
    (typeof extras.leader === 'string' ? extras.leader : '') ||
    ''

  const membersVal =
    extras.memberCount ??
    club.member_count ??
    club.members_count ??
    club.members ??
    club.total_members ??
    0

  const eventsVal =
    extras.eventCount ??
    club.event_count ??
    club.events_count ??
    club.events ??
    club.total_events ??
    0

  return {
    id: club._id || club.id,
    name: club.name || '',
    slogan: club.slogan || '',
    description: club.description || '',
    category,
    categoryLabel: (club.category || 'ACADEMIC').toUpperCase(),
    leader: leaderName,
    leaderId: leader._id || null,
    members: membersVal,
    events: eventsVal,
    logoUrl: club.logo_url || '',
    status: club.status || 'active',
    gradient: CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.other,
  }
}

export function mapMyClubFromApi(membership) {
  const club = membership.club_id || membership.club || {}

  return {
    ...mapClubFromApi(club),
    membershipRole: formatRoleLabel(membership.role),
    joinedDate: formatDate(membership.joined_at),
    membershipId: membership._id,
    rawRole: membership.role,
  }
}

export function mapMemberFromApi(member, index = 0) {
  const user = member.user_id || member.user || {}
  const tones = ['#f5b87a', '#7eb8f0', '#e88fc4', '#9ed87e', '#c9a0f5']
  const userId = user._id || member.user_id?._id || (typeof member.user_id === 'string' ? member.user_id : null) || member._id

  return {
    id: member._id || user._id,
    userId: userId,
    name: user.full_name || user.name || 'Unknown',
    role: formatRoleLabel(member.role),
    rawRole: member.role,
    tone: tones[index % tones.length],
    email: user.email || '',
    avatarUrl: user.avatar_url || '',
    joinedDate: member.joined_at ? formatDate(member.joined_at) : '',
    rewardPoint: member.reward_point || 0,
    rankingPoint: member.ranking_point || 0,
  }
}

export function mapJoinRequestFromApi(request) {
  const club = request.club_id || {}
  const form = request.form_id || {}
  const formQuestions = form.questions || []

  const formattedAnswers = (request.answers || []).map((ans, idx) => {
    const qId = ans?.question_id || ans?.questionId
    const matchedQ = formQuestions.find((q) => String(q._id || q.id) === String(qId)) || formQuestions[idx]
    const qText = typeof matchedQ === 'string' ? matchedQ : (matchedQ?.content || matchedQ?.label || `Question ${idx + 1}`)
    const valText = typeof ans === 'string' ? ans : (ans?.value || '')
    return {
      question: qText,
      answer: valText,
      value: valText,
    }
  })

  return {
    id: request._id,
    requestId: request._id,
    club: club.name || '',
    clubId: club._id || '',
    category: (club.category || '').toUpperCase(),
    status: request.status || 'pending',
    sentDate: formatDate(request.create_at || request.created_at),
    type: 'Join Request',
    content: form.title || 'Club Membership Application',
    responder: request.reviewed_by?.full_name || '-',
    sender: request.user_id?.full_name || '-',
    responseTime: formatDate(request.reviewed_at),
    sentTime: '',
    answers: formattedAnswers,
    rawAnswers: request.answers || [],
    reviewNote: request.review_note || '',
    questions: formQuestions,
  }
}

export function mapMemberInvitationFromApi(invitation) {
  const club = invitation.club_id || invitation.club || {}
  const sender = invitation.invited_by || invitation.sender || invitation.created_by || {}

  return {
    id: invitation._id || invitation.id,
    requestId: invitation._id || invitation.id,
    club: club.name || invitation.club_name || '',
    clubId: club._id || invitation.club_id || '',
    category: (club.category || invitation.category || '').toUpperCase(),
    status: invitation.status || 'pending',
    sentDate: formatDate(invitation.create_at || invitation.created_at || invitation.createdAt),
    expiresAt: invitation.expires_at ? formatDate(invitation.expires_at) : '',
    sentTime: '',
    type: invitation.is_creation_invite ? 'Founding Member Invitation' : 'Club Invitation',
    content: invitation.message || invitation.content || (invitation.is_creation_invite ? 'You received an invitation to be a founding member of this club.' : 'You received an invitation to join this club.'),
    responder: invitation.responded_by?.full_name || '-',
    sender: sender.full_name || sender.name || '-',
    responseTime: formatDate(invitation.responded_at || invitation.reviewed_at),
    role: formatRoleLabel(invitation.role || invitation.invited_role || 'member'),
    reviewNote: invitation.review_note || invitation.response_note || '',
    isCreationInvite: Boolean(invitation.is_creation_invite),
  }
}

export function mapPresidentJoinRequestFromApi(request, formQuestions = []) {
  const user = request.user_id || {}
  const questionsList = request.form_id?.questions || formQuestions || []

  const answers = (request.answers || []).map((answer, index) => {
    const qId = answer?.question_id || answer?.questionId
    const matchedQ = questionsList.find((q) => String(q._id || q.id) === String(qId)) || questionsList[index]
    const questionText = typeof matchedQ === 'string' ? matchedQ : (matchedQ?.content || matchedQ?.label || `Question ${index + 1}`)

    let answerText = ''
    if (typeof answer === 'string') {
      answerText = answer
    } else if (answer && typeof answer === 'object') {
      if (typeof answer.value === 'string') {
        answerText = answer.value
      } else {
        const numKeys = Object.keys(answer).filter((k) => !isNaN(k)).sort((a, b) => Number(a) - Number(b))
        if (numKeys.length > 0) {
          answerText = numKeys.map((k) => answer[k]).join('')
        } else {
          answerText = String(answer.value ?? '')
        }
      }
    }

    return {
      question: questionText,
      answer: answerText,
    }
  })

  const firstReason = answers[0]?.answer || ''

  return {
    id: request._id,
    clubId: request.club_id?._id || request.club_id,
    applicantName: user.full_name || 'Unknown',
    email: user.email || '',
    status: request.status || 'pending',
    submittedAt: formatDate(request.create_at || request.created_at),
    requestedRole: 'Member',
    reason: firstReason,
    answers,
    reviewNote: request.review_note || '',
    avatarUrl: user.avatar_url || '',
  }
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** BE uses rejected; UI label/CSS uses declined */
export function toInvitationUiStatus(status = '') {
  return status === 'rejected' ? 'declined' : status
}

export function toInvitationApiStatus(status = '') {
  return status === 'declined' ? 'rejected' : status
}

/** Map invitation for ClubInvitationsPage (secretary UI) */
export function mapClubInvitationFromApi(invitation) {
  const recipient = invitation.invited_user_id || {}
  const sender = invitation.invited_by || {}
  const name = recipient.full_name || 'Unknown'
  const rawStatus = invitation.status || 'pending'

  return {
    id: invitation._id,
    clubId: invitation.club_id?._id || invitation.club_id,
    recipientId: recipient._id || '',
    recipientName: name,
    recipientEmail: recipient.email || '',
    recipientMeta: invitation.role ? formatRoleLabel(invitation.role) : '',
    initials: getInitials(name) || 'NA',
    status: toInvitationUiStatus(rawStatus),
    rawStatus,
    message: invitation.message || '',
    role: invitation.role || 'member',
    sentAt: formatDateTime(invitation.created_at),
    expiresAt: invitation.expires_at ? formatDateTime(invitation.expires_at) : '-',
    respondedAt: invitation.updated_at && rawStatus !== 'pending'
      ? formatDateTime(invitation.updated_at)
      : undefined,
    sentBy: sender.full_name || '-',
  }
}

/** Map received invitation for MyRequestsPage (member UI) */
export function mapReceivedInvitationFromApi(invitation) {
  const club = invitation.club_id || {}
  const sender = invitation.invited_by || {}
  const rawStatus = invitation.status || 'pending'

  return {
    id: invitation._id,
    invitationId: invitation._id,
    club: club.name || '',
    clubId: club._id || invitation.club_id || '',
    category: (club.category || '').toUpperCase(),
    status: toInvitationUiStatus(rawStatus),
    rawStatus,
    sentDate: formatDate(invitation.created_at),
    type: 'Club Invitation',
    content: invitation.message || 'You received an invitation to join this club.',
    responder: '-',
    sender: sender.full_name || '-',
    responseTime:
      invitation.updated_at && rawStatus !== 'pending'
        ? formatDate(invitation.updated_at)
        : '-',
    sentTime: '',
    role: formatRoleLabel(invitation.role || 'member'),
  }
}

const ADMIN_ROLE_TO_BE = {
  President: 'president',
  Secretary: 'secretary',
  Treasurer: 'treasurer',
  'Event Manager': 'event_manager',
  Member: 'member',
  Leader: 'president',
  'Vice leader': 'president',
}


export function mapAdminRoleToApi(role) {
  return ADMIN_ROLE_TO_BE[role] || role.toLowerCase().replace(/\s+/g, '_')
}

export function mapCreationRequestFromApi(request) {
  const members = Array.isArray(request.members) ? request.members : []
  const acceptedCount = members.filter((m) => m.status === 'accepted').length

  return {
    id: request._id,
    clubName: request.club_name || '',
    sender: request.requested_by?.full_name || 'Unknown',
    leader: request.requested_by?.full_name || 'Unknown',
    sentDate: formatDate(request.created_at),
    status: request.status || 'pending',
    category: request.category || 'Not specified',
    memberCount: members.length || request.member_ids?.length || 0,
    acceptedCount,
    members,
    description: request.description || request.reason || '',
    slogan: request.slogan || '',
    logoText: (request.club_name || 'CL').slice(0, 2).toUpperCase(),
    logoUrl: request.logo_url || '',
  }
}

export function mapAdminClubFromApi(club) {
  const isObjectId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val)
  const leaderObj =
    (typeof club.president_id === 'object' && club.president_id !== null)
      ? club.president_id
      : (typeof club.created_by === 'object' && club.created_by !== null ? club.created_by : null)

  let leaderName = leaderObj?.full_name || leaderObj?.name || ''
  if (!leaderName && typeof club.leader === 'string' && !isObjectId(club.leader)) {
    leaderName = club.leader
  }
  if (!leaderName && typeof club.leader_name === 'string' && !isObjectId(club.leader_name)) {
    leaderName = club.leader_name
  }
  if (!leaderName && Array.isArray(club.members)) {
    const pres = club.members.find(
      (m) => m.role === 'president' || m.role === 'leader' || m.rawRole === 'president'
    )
    if (pres) {
      leaderName = pres.user_id?.full_name || pres.user?.full_name || pres.name || ''
    }
  }
  if (!leaderName) {
    leaderName = 'Unknown'
  }
  const memberCount = club.member_count ?? (Array.isArray(club.members) ? club.members.length : (club.members || 0))

  return {
    id: club._id || club.id,
    clubName: club.name || club.clubName || '',
    slogan: club.slogan || '',
    leader: leaderName,
    leaderId: leaderObj?._id || club.leaderId || null,
    members: memberCount,
    status: club.status || 'active',
    category: club.category || '',
    createdAt: new Date(club.created_at || club.createdAt || Date.now()).getTime(),
    createdDate: formatDate(club.created_at || club.createdAt),
    description: club.description || '',
    logoUrl: club.logo_url || club.logoUrl || '',
    memberList: Array.isArray(club.members)
      ? club.members.map((member, index) => mapMemberFromApi(member, index))
      : [],
  }
}
