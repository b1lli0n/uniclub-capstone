import { useEffect, useMemo, useRef, useState } from 'react'
import { ALL_CLUBS } from '../../data/mockData'
import {
  getPointRules,
  createPointRule,
  updatePointRule,
  togglePointRuleStatus,
  awardPointsManually,
  getActionTypes,
} from '../../api/pointRule.api'
import { getMyClubs } from '../../api/memberClubMembership.api'
import { getClubMembersForManagement } from '../../api/clubMember.api'
import { useConfirm, useToast } from '../../components/common/notificationContext'
import '../../styles/club-point-rules.css'

const CLUB_FALLBACK = ALL_CLUBS[0]
const RULE_COLORS = ['blue', 'indigo', 'purple', 'pink']

const DEFAULT_ACTION_OPTIONS = [
  { value: '', label: '-- Select Action Type --' },
  { value: 'register_event', label: 'Register Event' },
  { value: 'checkin', label: 'Check In' },
  { value: 'attendance', label: 'Attend Event' },
  { value: 'feedback', label: 'Provide Feedback' },
  { value: 'meeting', label: 'Weekly Meeting' },
  { value: 'performance', label: 'Guitar Performance' },
  { value: 'volunteer', label: 'Volunteer Work' },
]

const DEFAULT_DRAFT = {
  actionTypeId: '',
  actionValue: '',
  rewardPoints: '',
  description: '',
  limitEvent: '',
  limitDay: '',
  active: true,
}

function RuleIcon({ type }) {
  if (type === 'checkin' || type === 'attendance') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    )
  }

  if (type === 'volunteer') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01" />
    </svg>
  )
}

function CustomSelect({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const selectedOption = options.find((option) => option.value === value) || options[0]

  useEffect(() => {
    function handlePointerDown(event) {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  return (
    <div className="club-point-rules-select" ref={dropdownRef}>
      <button
        type="button"
        className={`club-point-rules-select__trigger${isOpen ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{selectedOption.label}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen ? (
        <div className="club-point-rules-select__menu" role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`club-point-rules-select__option${option.value === value ? ' is-selected' : ''}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value, option)
                setIsOpen(false)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function parsePointValue(value) {
  const numeric = Number.parseInt(String(value || '').replace(/[^\d-]/g, ''), 10)
  return Number.isFinite(numeric) ? numeric : 0
}

function mapApiRuleToUi(rule, index = 0) {
  const at = rule.action_type_id || {}
  return {
    id: rule._id,
    actionTypeId: at._id || rule.action_type_id,
    actionValue: at.code || 'event',
    title: at.name || 'Point Rule',
    description: at.description || '',
    rewardPoints: `+${rule.reward_point} pts`,
    rewardPointNum: rule.reward_point,
    limitEvent: rule.limit_per_event > 0 ? `${rule.limit_per_event} ${rule.limit_per_event === 1 ? 'time' : 'times'}` : 'Unlimited',
    limitDay: rule.limit_per_day > 0 ? `${rule.limit_per_day} ${rule.limit_per_day === 1 ? 'time' : 'times'}` : 'Unlimited',
    limitEventNum: rule.limit_per_event || 0,
    limitDayNum: rule.limit_per_day || 0,
    tag: 'Rule',
    color: RULE_COLORS[index % RULE_COLORS.length],
    status: rule.is_active ? 'ACTIVE' : 'INACTIVE',
    rawRule: rule,
  }
}

function createDraft(rule) {
  if (!rule) return { ...DEFAULT_DRAFT }

  return {
    actionTypeId: rule.actionTypeId || '',
    actionValue: rule.actionValue || '',
    rewardPoints: String(parsePointValue(rule.rewardPointNum || rule.rewardPoints)),
    description: rule.description || '',
    limitEvent: String((rule.limitEventNum ?? parsePointValue(rule.limitEvent)) || ''),
    limitDay: String((rule.limitDayNum ?? parsePointValue(rule.limitDay)) || ''),
    active: rule.status === 'ACTIVE',
  }
}

function ClubPointRulesPage({ clubId, isLeader = false }) {
  const confirm = useConfirm()
  const showToast = useToast()
  const club = ALL_CLUBS.find((item) => item.id === clubId) || CLUB_FALLBACK
  const [isManager, setIsManager] = useState(isLeader)
  const [rulesList, setRulesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionTypes, setActionTypes] = useState([])
  const [editingRule, setEditingRule] = useState(null)
  const [draft, setDraft] = useState(createDraft())

  // Award Points Modal State
  const [awardModalOpen, setAwardModalOpen] = useState(false)
  const [membersList, setMembersList] = useState([])
  const [awardDraft, setAwardDraft] = useState({
    memberId: '',
    ruleId: '',
    rewardPoint: '50',
    reason: 'Biểu diễn văn nghệ mốc 09:15',
  })

  const [targetClubId, setTargetClubId] = useState(clubId)

  // Check user role and load rules from real backend API
  useEffect(() => {
    let cancelled = false

    async function initPage() {
      setLoading(true)
      try {
        const [myClubsRes, typesRes] = await Promise.all([
          getMyClubs(),
          getActionTypes().catch(() => ({ data: [] })),
        ])

        if (cancelled) return

        const memberships = myClubsRes.data || []
        const mine = memberships.find(
          m => String(m.club_id?._id || m.club_id) === String(clubId) ||
               (m.club_id?.name && m.club_id.name.toLowerCase().includes(String(clubId).toLowerCase()))
        )

        const actualClubId = mine ? (mine.club_id?._id || mine.club_id) : clubId
        setTargetClubId(actualClubId)

        const userRole = (mine?.role || '').toLowerCase()
        const presidentRole = userRole === 'president'
        setIsManager(presidentRole)

        if (typesRes.data && typesRes.data.length > 0) {
          setActionTypes(typesRes.data)
        }

        const rulesRes = await getPointRules(actualClubId, presidentRole)
        if (!cancelled && rulesRes.data) {
          setRulesList(rulesRes.data.map((item, idx) => mapApiRuleToUi(item, idx)))
        }
      } catch (err) {
        console.error('Failed to load point rules from API:', err)
        if (!cancelled) setRulesList([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    initPage()
    return () => {
      cancelled = true
    }
  }, [clubId])

  const actionOptions = useMemo(() => {
    if (actionTypes.length === 0) return DEFAULT_ACTION_OPTIONS
    return [
      { value: '', label: '-- Select Action Type --', id: '' },
      ...actionTypes.map((at) => ({
        value: at.code,
        label: at.name,
        id: at._id,
        description: at.description,
      })),
    ]
  }, [actionTypes])

  const visibleRules = useMemo(
    () => rulesList.filter((rule) => isManager || rule.status === 'ACTIVE'),
    [isManager, rulesList]
  )

  async function refreshRules() {
    try {
      const activeId = targetClubId || clubId
      const res = await getPointRules(activeId, isManager)
      if (res.data) {
        setRulesList(res.data.map((item, idx) => mapApiRuleToUi(item, idx)))
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function openAwardModal() {
    setAwardModalOpen(true)
    const activeId = targetClubId || clubId
    try {
      let rawData = null
      try {
        const res = await getClubMembersForManagement(activeId, { status: 'active' })
        rawData = res.data
      } catch (e) {
        console.warn('API getClubMembersForManagement active error:', e)
        try {
          const resAll = await getClubMembersForManagement(activeId)
          rawData = resAll.data
        } catch (e2) {
          console.warn('API getClubMembersForManagement all error:', e2)
        }
      }

      let list = []
      if (Array.isArray(rawData)) {
        list = rawData
      } else if (rawData && Array.isArray(rawData.members)) {
        list = rawData.members
      }

      setMembersList(list)
      if (list.length > 0) {
        const firstId = list[0].member_id || list[0]._id || list[0].id
        setAwardDraft((curr) => ({ ...curr, memberId: firstId }))
      }
    } catch (err) {
      console.error('Failed to fetch club members:', err)
      setMembersList([])
    }
  }

  async function submitAwardPoints(e) {
    e.preventDefault()
    if (!awardDraft.memberId) {
      showToast({ type: 'error', title: 'Missing member', message: 'Please select a member to award points.' })
      return
    }

    const safeMembers = Array.isArray(membersList) ? membersList : []
    const selectedMember = safeMembers.find((m) => String(m.member_id || m._id || m.id) === String(awardDraft.memberId))
    const memberName = selectedMember?.full_name || selectedMember?.user_id?.full_name || 'Member'

    try {
      const activeId = targetClubId || clubId
      await awardPointsManually(activeId, awardDraft.memberId, {
        rule_id: awardDraft.ruleId || undefined,
        reward_point: Number(awardDraft.rewardPoint),
        reason: awardDraft.reason.trim() || 'Cộng điểm thưởng đóng góp hoạt động CLB',
      })

      showToast({
        type: 'success',
        title: 'Points awarded!',
        message: `Đã trao +${awardDraft.rewardPoint} điểm thưởng cho thành viên ${memberName} thành công!`,
      })
      setAwardModalOpen(false)
    } catch (err) {
      console.error(err)
      showToast({
        type: 'error',
        title: 'Award failed',
        message: err.message || 'Failed to award points to member.',
      })
    }
  }

  function openCreateModal() {
    setEditingRule({ mode: 'create' })
    setDraft(createDraft())
  }

  function openUpdateModal(rule) {
    setEditingRule(rule)
    setDraft(createDraft(rule))
  }

  function closeModal() {
    setEditingRule(null)
    setDraft(createDraft())
  }

  function updateDraft(field, value) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleToggleRuleStatus(rule) {
    const nextActive = rule.status !== 'ACTIVE'
    try {
      await togglePointRuleStatus(clubId, rule.id, nextActive)
      showToast({
        type: 'success',
        title: nextActive ? 'Rule activated' : 'Rule deactivated',
        message: `${rule.title} is now ${nextActive ? 'ACTIVE' : 'INACTIVE'}.`,
      })
      await refreshRules()
    } catch (err) {
      console.error(err)
      showToast({
        type: 'error',
        title: 'Update failed',
        message: err.message || 'Could not toggle point rule status.',
      })
    }
  }

  async function submitRule(event) {
    event.preventDefault()
    const isCreate = editingRule?.mode === 'create'

    try {
      if (isCreate) {
        const selectedOpt = actionOptions.find((opt) => opt.value === draft.actionValue)
        const actionTypeId = selectedOpt?.id || draft.actionTypeId

        await createPointRule(clubId, {
          action_type_id: actionTypeId,
          reward_point: parsePointValue(draft.rewardPoints),
          limit_per_event: parsePointValue(draft.limitEvent),
          limit_per_day: parsePointValue(draft.limitDay),
          is_active: draft.active,
        })
        showToast({
          type: 'success',
          title: 'Point rule created',
          message: 'New point rule has been created successfully.',
        })
      } else {
        await updatePointRule(clubId, editingRule.id, {
          reward_point: parsePointValue(draft.rewardPoints),
          limit_per_event: parsePointValue(draft.limitEvent),
          limit_per_day: parsePointValue(draft.limitDay),
        })
        showToast({
          type: 'success',
          title: 'Point rule updated',
          message: 'Point rule updated successfully.',
        })
      }

      await refreshRules()
      closeModal()
    } catch (err) {
      console.error(err)
      showToast({
        type: 'error',
        title: isCreate ? 'Creation failed' : 'Update failed',
        message: err.message || 'Could not save point rule.',
      })
    }
  }

  if (loading) {
    return (
      <main className="club-point-rules-page">
        <section className="club-point-rules-hero">
          <h1>Point Rules</h1>
          <p>Loading point rules from database...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="club-point-rules-page">
      <section className="club-point-rules-hero">
        <div>
          <span>{club.name}</span>
          <h1>Point Rules</h1>
          <p>View point earning rules and manage how club activities award reward points.</p>
        </div>
        {isManager ? (
          <div className="club-point-rules-hero__actions">
            <button type="button" className="club-point-rules-hero__award-btn" onClick={openAwardModal}>
              🏆 Award Points
            </button>
            <button type="button" onClick={openCreateModal}>
              + Create Point Rule
            </button>
          </div>
        ) : null}
      </section>

      <section className="club-point-rules-grid" aria-label="Point rules">
        {visibleRules.map((rule) => {
          const isActive = rule.status === 'ACTIVE'

          return (
            <article key={rule.id} className={`club-point-rule-card${!isActive ? ' is-disabled' : ''}`}>
              <div className="club-point-rule-card__header">
                <div className={`club-point-rule-card__icon club-point-rule-card__icon--${rule.color}`}>
                  <RuleIcon type={rule.actionValue} />
                </div>
                <div className="club-point-rule-card__title-group">
                  <div className="club-point-rule-card__top">
                    <h2>{rule.title}</h2>
                    {isManager ? (
                      <div className="club-point-rule-card__actions">
                        <button
                          type="button"
                          className="club-point-rule-card__edit-btn"
                          aria-label={`Update ${rule.title}`}
                          onClick={() => openUpdateModal(rule)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <span className="club-point-rule-card__tag">{rule.tag}</span>
                    )}
                  </div>

                  {isManager ? (
                    <div className="club-point-rule-card__admin-status">
                      <label className="club-point-rules-switch">
                        <input
                          type="checkbox"
                          checked={isActive}
                          aria-label={`${isActive ? 'Deactivate' : 'Activate'} ${rule.title}`}
                          onChange={() => handleToggleRuleStatus(rule)}
                        />
                        <span />
                      </label>
                      <strong className={`club-point-rule-card__status${isActive ? '' : ' is-inactive'}`}>
                        {isActive ? 'ACTIVE' : 'INACTIVE'}
                      </strong>
                    </div>
                  ) : (
                    <strong className="club-point-rule-card__status">ACTIVE</strong>
                  )}
                </div>
              </div>

              <p className="club-point-rule-card__description">{rule.description}</p>

              <div className="club-point-rule-card__boxes" style={{ gridTemplateColumns: '1fr' }}>
                <div>
                  <span>Reward Points</span>
                  <strong className="is-reward">{rule.rewardPoints}</strong>
                </div>
              </div>

              <div className="club-point-rule-card__limits">
                <div>
                  <span>Limit / activity</span>
                  <strong>{rule.limitEvent}</strong>
                </div>
                <div>
                  <span>Limit / day</span>
                  <strong>{rule.limitDay}</strong>
                </div>
              </div>
            </article>
          )
        })}

        {visibleRules.length === 0 ? (
          <div className="club-point-rules-empty">
            <div className="club-point-rules-empty__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3>Hiện tại chưa có point rule nào hoạt động</h3>
            <p>Ban chủ nhiệm CLB chưa bật hoặc tạo quy tắc cộng điểm thưởng nào cho các hoạt động.</p>
          </div>
        ) : null}
      </section>

      {/* Award Points Modal */}
      {awardModalOpen ? (
        <div className="club-point-rules-modal" role="dialog" aria-modal="true" aria-labelledby="award-points-title">
          <button type="button" className="club-point-rules-modal__backdrop" aria-label="Close award modal" onClick={() => setAwardModalOpen(false)} />
          <form className="club-point-rules-modal__panel" onSubmit={submitAwardPoints}>
            <div className="club-point-rules-modal__header">
              <h2 id="award-points-title">🏆 Award Points to Member</h2>
              <button type="button" onClick={() => setAwardModalOpen(false)}>Close</button>
            </div>

            <label className="club-point-rules-field">
              <span>Select Member *</span>
              <select
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '12px',
                  border: '1px solid #e0d6cd',
                  padding: '0 12px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#2c2520',
                  background: '#fff',
                }}
                value={awardDraft.memberId}
                onChange={(e) => setAwardDraft({ ...awardDraft, memberId: e.target.value })}
              >
                {(Array.isArray(membersList) ? membersList : []).map((m) => {
                  const mId = m.member_id || m._id || m.id
                  const name = m.full_name || m.user_id?.full_name || 'Member'
                  const email = m.email || m.user_id?.email || ''
                  return (
                    <option key={mId} value={mId}>
                      {name} ({email}) - Role: {m.role}
                    </option>
                  )
                })}
              </select>
            </label>

            <label className="club-point-rules-field">
              <span>Select Point Rule (Optional)</span>
              <select
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '12px',
                  border: '1px solid #e0d6cd',
                  padding: '0 12px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#2c2520',
                  background: '#fff',
                }}
                value={awardDraft.ruleId}
                onChange={(e) => {
                  const rId = e.target.value
                  const selectedRule = visibleRules.find((r) => r.id === rId)
                  setAwardDraft({
                    ...awardDraft,
                    ruleId: rId,
                    rewardPoint: selectedRule
                      ? String(selectedRule.rewardPointNum || parsePointValue(selectedRule.rewardPoints))
                      : awardDraft.rewardPoint,
                  })
                }}
              >
                <option value="">-- Custom Reward / Direct Award --</option>
                {visibleRules.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.rewardPoints})
                  </option>
                ))}
              </select>
            </label>

            <label className="club-point-rules-field">
              <span>Reward Points (+Pts) *</span>
              <input
                type="number"
                min="1"
                value={awardDraft.rewardPoint}
                onChange={(e) => setAwardDraft({ ...awardDraft, rewardPoint: e.target.value })}
                placeholder="50"
              />
            </label>

            <label className="club-point-rules-field">
              <span>Reason / Description *</span>
              <textarea
                rows={3}
                value={awardDraft.reason}
                onChange={(e) => setAwardDraft({ ...awardDraft, reason: e.target.value })}
                placeholder="Ví dụ: Biểu diễn Guitar tiết mục mốc 09:15 / Hỗ trợ tình nguyện sự kiện Gala..."
              />
            </label>

            <div className="club-point-rules-modal__footer">
              <button type="button" onClick={() => setAwardModalOpen(false)}>Cancel</button>
              <button type="submit" style={{ background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)' }}>
                Confirm Award Points
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Edit / Create Rule Modal */}
      {editingRule ? (
        <div className="club-point-rules-modal" role="dialog" aria-modal="true" aria-labelledby="point-rule-editor-title">
          <button type="button" className="club-point-rules-modal__backdrop" aria-label="Close point rule editor" onClick={closeModal} />
          <form className="club-point-rules-modal__panel" onSubmit={submitRule}>
            <div className="club-point-rules-modal__header">
              <h2 id="point-rule-editor-title">
                {editingRule.mode === 'create' ? 'Create Point Rule' : 'Update Point Rule'}
              </h2>
              <button type="button" onClick={closeModal}>Close</button>
            </div>

            {editingRule.mode === 'create' ? (
              <label className="club-point-rules-field">
                <span>Action type *</span>
                <CustomSelect
                  value={draft.actionValue}
                  onChange={(value, option) => {
                    updateDraft('actionValue', value)
                    updateDraft('actionTypeId', option?.id || '')
                    if (option?.description) {
                      updateDraft('description', option.description)
                    }
                  }}
                  options={actionOptions}
                />
              </label>
            ) : null}

            <label className="club-point-rules-field">
              <span>Reward Points *</span>
              <input
                type="number"
                min="0"
                value={draft.rewardPoints}
                onChange={(event) => updateDraft('rewardPoints', event.target.value)}
                placeholder="Ví dụ: 50"
              />
            </label>

            <label className="club-point-rules-field">
              <span>Description</span>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(event) => updateDraft('description', event.target.value)}
                placeholder="Briefly describe what this rule is for..."
              />
            </label>

            <div className="club-point-rules-form-grid">
              <label className="club-point-rules-field">
                <span>Limit / Activity</span>
                <input
                  type="number"
                  min="0"
                  value={draft.limitEvent}
                  onChange={(event) => updateDraft('limitEvent', event.target.value)}
                  placeholder="0 for unlimited"
                />
              </label>
              <label className="club-point-rules-field">
                <span>Limit / Day</span>
                <input
                  type="number"
                  min="0"
                  value={draft.limitDay}
                  onChange={(event) => updateDraft('limitDay', event.target.value)}
                  placeholder="0 for unlimited"
                />
              </label>
            </div>

            {editingRule.mode === 'create' ? (
              <label className="club-point-rules-check">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(event) => updateDraft('active', event.target.checked)}
                />
                <span />
                Activate this rule
              </label>
            ) : null}

            <div className="club-point-rules-modal__footer">
              <button type="button" onClick={closeModal}>Cancel</button>
              <button type="submit" disabled={editingRule.mode === 'create' && !draft.actionValue}>
                {editingRule.mode === 'create' ? 'Create New' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  )
}

export default ClubPointRulesPage
