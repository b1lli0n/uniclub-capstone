const CATEGORY_GRADIENTS = {
  sport: 'linear-gradient(135deg, #ffce96 0%, #f5b87a 100%)',
  academic: 'linear-gradient(135deg, #a8d8ff 0%, #7eb8f0 100%)',
  art: 'linear-gradient(135deg, #f5b0d8 0%, #e88fc4 100%)',
  event: 'linear-gradient(135deg, #c4f0a8 0%, #9ed87e 100%)',
}

const ROLE_LABELS = {
  president: 'Leader',
  member: 'Member',
  secretary: 'Secretary',
  treasurer: 'Treasurer',
  event_manager: 'Event manager',
}

export function formatRoleLabel(role = '') {
  return ROLE_LABELS[role] || role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('vi-VN')
}

export function mapClubFromApi(club, extras = {}) {
  const category = (club.category || 'academic').toLowerCase()

  return {
    id: club._id || club.id,
    name: club.name || '',
    description: club.description || '',
    category,
    categoryLabel: (club.category || 'ACADEMIC').toUpperCase(),
    members: extras.memberCount ?? club.member_count ?? club.members ?? 0,
    events: extras.eventCount ?? club.event_count ?? club.events ?? 0,
    logoUrl: club.logo_url || '',
    status: club.status || 'active',
    gradient: CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.academic,
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

  return {
    id: member._id || user._id,
    name: user.full_name || user.name || 'Unknown',
    role: formatRoleLabel(member.role),
    rawRole: member.role,
    tone: tones[index % tones.length],
    email: user.email || '',
    avatarUrl: user.avatar_url || '',
  }
}

export function mapJoinRequestFromApi(request) {
  const club = request.club_id || {}
  const form = request.form_id || {}

  return {
    id: request._id,
    requestId: request._id,
    club: club.name || '',
    clubId: club._id || '',
    category: (club.category || '').toUpperCase(),
    status: request.status || 'pending',
    sentDate: formatDate(request.create_at || request.created_at),
    type: 'Join Request',
    content: form.title || 'Club join request',
    responder: request.reviewed_by?.full_name || '-',
    sender: request.user_id?.full_name || '-',
    responseTime: formatDate(request.reviewed_at),
    sentTime: '',
    answers: request.answers || [],
    reviewNote: request.review_note || '',
    questions: form.questions || [],
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
    sentTime: '',
    type: 'Club Invitation',
    content: invitation.message || invitation.content || 'You have been invited to join this club.',
    responder: invitation.responded_by?.full_name || '-',
    sender: sender.full_name || sender.name || '-',
    responseTime: formatDate(invitation.responded_at || invitation.reviewed_at),
    role: formatRoleLabel(invitation.role || invitation.invited_role || 'member'),
    reviewNote: invitation.review_note || invitation.response_note || '',
  }
}

export function mapPresidentJoinRequestFromApi(request, formQuestions = []) {
  const user = request.user_id || {}
  const answers = (request.answers || []).map((answer, index) => ({
    question: formQuestions[index] || `Question ${index + 1}`,
    answer,
  }))

  return {
    id: request._id,
    clubId: request.club_id?._id || request.club_id,
    applicantName: user.full_name || 'Unknown',
    email: user.email || '',
    status: request.status || 'pending',
    submittedAt: formatDate(request.create_at || request.created_at),
    requestedRole: 'Member',
    reason: request.answers?.[0] || '',
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
    expiresAt: '-',
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
    content: invitation.message || 'You are invited to join this club.',
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
  Leader: 'president',
  'Vice leader': 'president',
  Secretary: 'secretary',
  Treasurer: 'treasurer',
  Member: 'member',
}

export function mapAdminRoleToApi(role) {
  return ADMIN_ROLE_TO_BE[role] || role.toLowerCase().replace(/\s+/g, '_')
}

export function mapCreationRequestFromApi(request) {
  return {
    id: request._id,
    clubName: request.club_name || '',
    sender: request.requested_by?.full_name || 'Unknown',
    leader: request.requested_by?.full_name || 'Unknown',
    sentDate: formatDate(request.created_at),
    status: request.status || 'pending',
    category: request.category || 'Not specified',
    memberCount: request.member_ids?.length || 0,
    description: request.description || request.reason || '',
    logoText: (request.club_name || 'CL').slice(0, 2).toUpperCase(),
    logoUrl: request.logo_url || '',
  }
}

export function mapAdminClubFromApi(club) {
  const createdBy = club.created_by || {}
  const memberCount = club.member_count ?? (Array.isArray(club.members) ? club.members.length : 0)

  return {
    id: club._id,
    clubName: club.name || '',
    leader: createdBy.full_name || 'Unknown',
    members: memberCount,
    status: club.status || 'active',
    category: club.category || '',
    createdAt: new Date(club.created_at || Date.now()).getTime(),
    createdDate: formatDate(club.created_at),
    description: club.description || '',
    logoUrl: club.logo_url || '',
    memberList: Array.isArray(club.members)
      ? club.members.map((member, index) => mapMemberFromApi(member, index))
      : [],
  }
}
