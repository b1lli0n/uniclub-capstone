import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ALL_CLUBS,
  MY_CLUB_MEMBERSHIPS,
  POINT_RULES,
} from '../../data/mockData'
import '../../styles/club-point-rules.css'

const CLUB_FALLBACK = ALL_CLUBS[0]
const MANAGER_ROLES = ['leader', 'vice leader']
const RULE_COLORS = ['blue', 'indigo', 'purple', 'pink']

const ACTION_TYPE_OPTIONS = [
  { value: '', label: '-- Select Action Type --' },
  { value: 'event', label: 'Attend Event' },
  { value: 'checkin', label: 'Check In' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'organize', label: 'Organize Event' },
  { value: 'feedback', label: 'Provide Feedback' },
  { value: 'recruit', label: 'Recruit Members' },
  { value: 'task', label: 'Complete Task' },
  { value: 'milestone', label: 'Reach Milestone' },
  { value: 'post', label: 'Create Post' },
  { value: 'comment', label: 'Comment on Post' },
  { value: 'like', label: 'Like Post' },
  { value: 'support', label: 'Support Event' },
  { value: 'meeting', label: 'Attend Meeting' },
  { value: 'leader', label: 'Leadership Role' },
  { value: 'donate', label: 'Donate Funds' },
  { value: 'mentoring', label: 'Mentor Members' },
  { value: 'award', label: 'Receive Award' },
  { value: 'activity', label: 'Participate in Activity' },
  { value: 'training', label: 'Complete Training' },
]

const DEFAULT_DRAFT = {
  actionValue: '',
  achievementPoints: '',
  rewardPoints: '',
  description: '',
  limitEvent: '',
  limitDay: '',
  active: true,
}

function RuleIcon({ type }) {
  if (type === 'checkin') {
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

  if (type === 'recruit') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.9" />
        <path d="M16 3.1a4 4 0 0 1 0 7.8" />
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
                onChange(option.value)
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

function getActionLabel(actionValue) {
  return ACTION_TYPE_OPTIONS.find((option) => option.value === actionValue)?.label || 'Point Rule'
}

function parsePointValue(value) {
  const numeric = Number.parseInt(String(value || '').replace(/[^\d-]/g, ''), 10)
  return Number.isFinite(numeric) ? numeric : 0
}

function normalizeLimit(value) {
  const numeric = Number.parseInt(String(value || '').replace(/[^\d]/g, ''), 10)
  return Number.isFinite(numeric) && numeric > 0 ? `${numeric} ${numeric === 1 ? 'time' : 'times'}` : 'Unlimited'
}

function createDraft(rule) {
  if (!rule) return { ...DEFAULT_DRAFT }

  return {
    actionValue: rule.actionValue || '',
    achievementPoints: String(parsePointValue(rule.achievementPoints)),
    rewardPoints: String(parsePointValue(rule.rewardPoints)),
    description: rule.description || '',
    limitEvent: String(parsePointValue(rule.limitEvent) || ''),
    limitDay: String(parsePointValue(rule.limitDay) || ''),
    active: rule.status === 'ACTIVE',
  }
}

function ClubPointRulesPage({ clubId }) {
  const club = ALL_CLUBS.find((item) => item.id === clubId) || CLUB_FALLBACK
  const membership = MY_CLUB_MEMBERSHIPS.find((item) => item.clubId === club.id)
  const isManager = MANAGER_ROLES.includes(membership?.role?.toLowerCase())
  const [rulesList, setRulesList] = useState(POINT_RULES)
  const [editingRule, setEditingRule] = useState(null)
  const [draft, setDraft] = useState(createDraft())

  const visibleRules = useMemo(
    () => rulesList.filter((rule) => isManager || rule.status === 'ACTIVE'),
    [isManager, rulesList]
  )

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

  function toggleRuleStatus(ruleId) {
    setRulesList((items) =>
      items.map((rule) =>
        rule.id === ruleId
          ? { ...rule, status: rule.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : rule
      )
    )
  }

  function submitRule(event) {
    event.preventDefault()
    const isCreate = editingRule?.mode === 'create'
    const nextRule = {
      id: isCreate ? `point-rule-${club.id}-${Date.now()}` : editingRule.id,
      actionValue: draft.actionValue,
      title: getActionLabel(draft.actionValue),
      description: draft.description.trim(),
      achievementPoints: `+${parsePointValue(draft.achievementPoints)} pts`,
      rewardPoints: `+${parsePointValue(draft.rewardPoints)} bonus`,
      limitEvent: normalizeLimit(draft.limitEvent),
      limitDay: normalizeLimit(draft.limitDay),
      tag: isCreate ? 'Custom' : editingRule.tag,
      color: isCreate
        ? RULE_COLORS[rulesList.length % RULE_COLORS.length]
        : editingRule.color,
      status: draft.active ? 'ACTIVE' : 'INACTIVE',
    }

    setRulesList((items) =>
      isCreate
        ? [nextRule, ...items]
        : items.map((rule) => (rule.id === editingRule.id ? nextRule : rule))
    )
    closeModal()
  }

  return (
    <main className="club-point-rules-page">
      <section className="club-point-rules-hero">
        <div>
          <span>{club.name}</span>
          <h1>Point Rules</h1>
          <p>View point earning rules and manage how club activities award achievement and reward points.</p>
        </div>
        {isManager ? (
          <button type="button" onClick={openCreateModal}>Create Point Rule</button>
        ) : null}
      </section>

      <section className="club-point-rules-grid" aria-label="Point rules">
        {isManager ? (
          <button type="button" className="club-point-rule-card club-point-rule-card--add" onClick={openCreateModal}>
            <span className="club-point-rule-card__add-icon">+</span>
            <strong>Create New Point Rule</strong>
          </button>
        ) : null}

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
                          onChange={() => toggleRuleStatus(rule.id)}
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

              <div className="club-point-rule-card__boxes">
                <div>
                  <span>Achievement</span>
                  <strong className="is-achievement">{rule.achievementPoints}</strong>
                </div>
                <div>
                  <span>Reward</span>
                  <strong className="is-reward">{rule.rewardPoints}</strong>
                </div>
              </div>

              <div className="club-point-rule-card__limits">
                <div>
                  <span>Limit / event</span>
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
      </section>

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

            <label className="club-point-rules-field">
              <span>Action type *</span>
              <CustomSelect
                value={draft.actionValue}
                onChange={(value) => updateDraft('actionValue', value)}
                options={ACTION_TYPE_OPTIONS}
              />
            </label>

            <div className="club-point-rules-form-grid">
              <label className="club-point-rules-field">
                <span>Achievement Points</span>
                <input
                  type="number"
                  min="0"
                  value={draft.achievementPoints}
                  onChange={(event) => updateDraft('achievementPoints', event.target.value)}
                  placeholder="0"
                />
              </label>
              <label className="club-point-rules-field">
                <span>Reward Bonus</span>
                <input
                  type="number"
                  min="0"
                  value={draft.rewardPoints}
                  onChange={(event) => updateDraft('rewardPoints', event.target.value)}
                  placeholder="0"
                />
              </label>
            </div>

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
                <span>Limit / Event</span>
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

            <label className="club-point-rules-check">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(event) => updateDraft('active', event.target.checked)}
              />
              <span />
              Activate this rule
            </label>

            <div className="club-point-rules-modal__footer">
              <button type="button" onClick={closeModal}>Cancel</button>
              <button type="submit" disabled={!draft.actionValue}>
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
