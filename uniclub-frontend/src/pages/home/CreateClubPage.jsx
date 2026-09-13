import { useRef, useState, useEffect } from 'react'
import { requestCreateClub } from '../../api/club.api'
import { apiRequest, toQueryString } from '../../api/api'
import { useToast } from '../../components/common/notificationContext'
import '../../styles/create-club.css'

const CREATE_CLUB_CATEGORIES = [
  { value: '', label: 'Select category...' },
  { value: 'academic', label: 'Academic' },
  { value: 'sport', label: 'Sports' },
  { value: 'art', label: 'Arts' },
  { value: 'event', label: 'Events' },
]

function SectionIcon({ type }) {
  if (type === 'clipboard') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
      </svg>
    )
  }

  if (type === 'people') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CreateClubPage({ onCancel, onSubmit }) {
  const showToast = useToast()
  const fileInputRef = useRef(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [memberSuggestions, setMemberSuggestions] = useState([])
  const [members, setMembers] = useState([])
  const [logoName, setLogoName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const [showDropdown, setShowDropdown] = useState(false)

  async function fetchUserSuggestions(query = memberSearch) {
    setSearchLoading(true)
    try {
      const res = await apiRequest(`/profile/search${toQueryString({ q: query })}`)
      const list = (res.data || []).map((u) => ({
        value: u.value || u._id,
        label: u.label || `${u.name || u.full_name} (${u.email})`,
        name: u.name || u.full_name,
        email: u.email,
      }))
      setMemberSuggestions(list.filter((u) => !members.some((m) => String(m.value) === String(u.value))))
    } catch {
      setMemberSuggestions([])
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    const delay = setTimeout(() => {
      if (active) fetchUserSuggestions(memberSearch)
    }, 250)
    return () => { active = false; clearTimeout(delay) }
  }, [memberSearch, members])

  function handleAddMember(option) {
    if (!option || members.some((m) => String(m.value) === String(option.value))) return
    setMembers((prev) => [...prev, option])
    setMemberSearch('')
    setShowDropdown(false)
  }

  function handleRemoveMember(value) {
    setMembers((prev) => prev.filter((m) => String(m.value) !== String(value)))
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    setLogoName(file ? file.name : '')
    if (!file) {
      setLogoUrl('')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setLogoUrl(typeof reader.result === 'string' ? reader.result : '')
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await requestCreateClub({
        club_name: name,
        description,
        reason: description,
        logo_url: logoUrl || 'https://placehold.co/200x200/png',
        member_ids: members.map((member) => member.value),
      })
      // Display notification when club creation request is submitted.
      showToast({
        type: 'success',
        title: 'Request submitted',
        message: 'Your club creation request has been sent for review.',
      })
      onSubmit?.({ name, category, description, members, logoName })
    } catch (error) {
      console.error(error)
      showToast({
        type: 'error',
        title: 'Submit failed',
        message: error.message || 'Could not submit club creation request.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="create-club-page">
      <h1 className="create-club-page__title">Create Club</h1>

      <form className="create-club-form" onSubmit={handleSubmit}>
        <div className="create-club-form__grid">
          <section className="create-club-card create-club-card--basic">
            <h2 className="create-club-card__heading">
              <span className="create-club-card__icon" aria-hidden="true">
                <SectionIcon type="clipboard" />
              </span>
              Basic Information
            </h2>

            <div className="create-club-field">
              <label htmlFor="club-name">
                Club Name <span className="create-club-required">*</span>
              </label>
              <input
                id="club-name"
                data-testid="create-club-name-input"
                type="text"
                placeholder="Example: Web Development Club"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="create-club-field">
              <label htmlFor="club-category">
                Category <span className="create-club-required">*</span>
              </label>
              <select
                id="club-category"
                data-testid="create-club-category-select"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
              >
                {CREATE_CLUB_CATEGORIES.map((option) => (
                  <option key={option.value || 'empty'} value={option.value} disabled={option.value === ''}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="create-club-field">
              <label htmlFor="club-desc">Description</label>
              <textarea
                id="club-desc"
                data-testid="create-club-desc-textarea"
                rows={5}
                placeholder="Enter a detailed description for this club..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </section>

          <div className="create-club-side-stack">
            <section className="create-club-card create-club-card--members">
              <h2 className="create-club-card__heading">
                <span className="create-club-card__icon" aria-hidden="true">
                  <SectionIcon type="people" />
                </span>
                Add Members
              </h2>


              <div className="create-club-member-row" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    className="create-club-member-row__select"
                    placeholder="Search student by name or email..."
                    value={memberSearch}
                    onFocus={() => {
                      setShowDropdown(true)
                      fetchUserSuggestions(memberSearch)
                    }}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    onChange={(e) => {
                      setMemberSearch(e.target.value)
                      setShowDropdown(true)
                    }}
                    aria-label="Search member"
                    autoComplete="off"
                  />
                  {showDropdown && (memberSuggestions.length > 0 || searchLoading) && (
                    <ul style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                      background: '#ffffff', border: '1px solid #cbd5e1',
                      borderRadius: '0.5rem', margin: '0.25rem 0 0 0', padding: '0.25rem 0', listStyle: 'none',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)', maxHeight: '220px', overflowY: 'auto',
                    }}>
                      {searchLoading && <li style={{ padding: '0.6rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>Loading students...</li>}
                      {!searchLoading && memberSuggestions.map((option) => (
                        <li key={String(option.value)} style={{ padding: 0 }}>
                          <button
                            type="button"
                            style={{
                              width: '100%', textAlign: 'left', padding: '0.6rem 1rem',
                              background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem',
                              color: '#0f172a', display: 'flex', flexDirection: 'column', gap: '0.15rem',
                              transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                            onMouseDown={(e) => { e.preventDefault(); handleAddMember(option) }}
                          >
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{option.name}</span>
                            <span style={{ color: '#475569', fontSize: '0.8rem' }}>{option.email}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {members.length > 0 ? (
                <ul className="create-club-member-list">
                  {members.map((member) => (
                    <li key={String(member.value)}>
                      <span>{member.label}</span>
                      <button
                        type="button"
                        className="create-club-member-list__remove"
                        onClick={() => handleRemoveMember(member.value)}
                        aria-label={`Remove ${member.label}`}
                      >
                        x
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            <section className="create-club-card create-club-card--logo">
              <h2 className="create-club-card__heading">
                <span className="create-club-card__icon" aria-hidden="true">
                  <SectionIcon type="image" />
                </span>
                Club Logo
              </h2>

              <div className="create-club-file">
                <input
                  ref={fileInputRef}
                  id="club-logo"
                  type="file"
                  accept="image/*"
                  className="create-club-file__input"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className="create-club-btn create-club-btn--accent"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </button>
                <span className="create-club-file__name">
                  {logoName || 'No file selected'}
                </span>
              </div>
            </section>
          </div>
        </div>

        <div className="create-club-actions">
          <button type="button" className="create-club-btn create-club-btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" data-testid="create-club-submit-btn" className="create-club-btn create-club-btn--primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Create Club'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateClubPage
