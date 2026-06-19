import { useRef, useState } from 'react'
// Mock data import: replace with API data when BE is ready.
import { AVAILABLE_MEMBERS, CREATE_CLUB_CATEGORIES } from '../../data/mockData'
import '../../styles/create-club.css'

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
  const fileInputRef = useRef(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [memberPick, setMemberPick] = useState('')
  const [members, setMembers] = useState([])
  const [logoName, setLogoName] = useState('')

  function handleAddMember() {
    if (!memberPick) return
    const option = AVAILABLE_MEMBERS.find((m) => m.value === memberPick)
    if (!option || members.some((m) => m.value === memberPick)) return
    setMembers((prev) => [...prev, option])
    setMemberPick('')
  }

  function handleRemoveMember(value) {
    setMembers((prev) => prev.filter((m) => m.value !== value))
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    setLogoName(file ? file.name : '')
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit?.({ name, category, description, members, logoName })
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

              <div className="create-club-member-row">
                <select
                  className="create-club-member-row__select"
                  value={memberPick}
                  onChange={(event) => setMemberPick(event.target.value)}
                  aria-label="Select member"
                >
                  {AVAILABLE_MEMBERS.map((option) => (
                    <option key={option.value || 'empty'} value={option.value} disabled={option.value === ''}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button type="button" className="create-club-btn create-club-btn--outline" onClick={handleAddMember}>
                  Add
                </button>
              </div>

              {members.length > 0 ? (
                <ul className="create-club-member-list">
                  {members.map((member) => (
                    <li key={member.value}>
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
          <button type="submit" className="create-club-btn create-club-btn--primary">
            Create Club
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateClubPage
