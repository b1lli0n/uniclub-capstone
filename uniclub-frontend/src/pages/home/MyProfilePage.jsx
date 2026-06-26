import { useState } from 'react'
import '../../styles/my-profile.css'

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

function createProfileFromUser(user) {
  return {
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    gender: user?.gender || 'other',
    birthDate: user?.birthDate || '',
    avatarInitial: user?.avatarInitial || user?.fullName?.slice(0, 1).toUpperCase() || 'U',
    role: user?.role || 'UniClub member',
  }
}

function MyProfilePage({ currentUser }) {
  const [isEditing, setIsEditing] = useState(false)
  const [genderOpen, setGenderOpen] = useState(false)
  const [profile, setProfile] = useState(() => createProfileFromUser(currentUser))
  const selectedGenderLabel =
    GENDER_OPTIONS.find((option) => option.value === profile.gender)?.label || 'Other'

  function updateProfileField(field, value) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleEditAction() {
    setGenderOpen(false)
    setIsEditing((current) => !current)
  }

  return (
    <main className="my-profile-page">
      <section className="my-profile-cover" aria-label="Profile cover">
        <div className="my-profile-cover__content">
          <h1>My Profile</h1>
        </div>
      </section>

      <section className={`my-profile-form-card${isEditing ? ' is-editing' : ''}`} aria-labelledby="profile-form-title">
        <header className="my-profile-form-card__header">
          <div className="my-profile-avatar-wrap">
            <div className="my-profile-avatar" aria-hidden="true">{profile.avatarInitial}</div>
            {isEditing ? (
              <button type="button" className="my-profile-avatar__edit">Change</button>
            ) : null}
          </div>
          <div>
            <h2 id="profile-form-title">{profile.fullName}</h2>
            <p>{profile.role}</p>
          </div>
        </header>

        <form className="my-profile-form">
          <div className="my-profile-form__section-title">Personal Information</div>

          <label className="my-profile-field">
            <span>Full Name</span>
            <input
              type="text"
              value={profile.fullName}
              disabled={!isEditing}
              onChange={(event) => updateProfileField('fullName', event.target.value)}
            />
          </label>

          <label className="my-profile-field">
            <span>Phone Number</span>
            <input
              type="tel"
              value={profile.phone}
              placeholder="Ex: 0912345678"
              disabled={!isEditing}
              onChange={(event) => updateProfileField('phone', event.target.value)}
            />
          </label>

          <label className="my-profile-field">
            <span>Email</span>
            <input
              type="email"
              value={profile.email}
              disabled={!isEditing}
              onChange={(event) => updateProfileField('email', event.target.value)}
            />
          </label>

          <div className="my-profile-field my-profile-field--select">
            <span>Gender</span>
            <div
              className={`my-profile-select${genderOpen ? ' is-open' : ''}${!isEditing ? ' is-disabled' : ''}`}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setGenderOpen(false)
                }
              }}
            >
              <button
                type="button"
                className="my-profile-select__button"
                disabled={!isEditing}
                aria-haspopup="listbox"
                aria-expanded={genderOpen}
                onClick={() => setGenderOpen((current) => !current)}
              >
                <span>{selectedGenderLabel}</span>
                <svg viewBox="0 0 12 8" fill="currentColor" aria-hidden="true">
                  <path d="M6 8L0 0h12L6 8z" />
                </svg>
              </button>

              {genderOpen ? (
                <div className="my-profile-select__menu" role="listbox" aria-label="Gender">
                  {GENDER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={profile.gender === option.value}
                      className="my-profile-select__option"
                      onClick={() => {
                        updateProfileField('gender', option.value)
                        setGenderOpen(false)
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <label className="my-profile-field">
            <span>Date of Birth</span>
            <input
              type="text"
              value={profile.birthDate}
              placeholder="dd/mm/yyyy"
              disabled={!isEditing}
              onChange={(event) => updateProfileField('birthDate', event.target.value)}
            />
          </label>

          <div className="my-profile-form__actions">
            <button type="button" onClick={handleEditAction}>
              {isEditing ? 'Update' : 'Edit'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default MyProfilePage
