import { useState, useEffect } from 'react'
import '../../styles/my-profile.css'
import { getMyProfile, updateMyProfile } from '../../api/profile.api'

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
    avatarInitial:
      user?.avatarInitial || user?.fullName?.slice(0, 1).toUpperCase() || 'U',
    role: user?.role || 'UniClub member',
    studentCode: '',
    major: '',
    campus: '',
    socialLinks: {
      facebook: '',
      github: '',
      linkedin: '',
    },
  }
}

function MyProfilePage({ currentUser }) {
  const [isEditing, setIsEditing] = useState(false)
  const [genderOpen, setGenderOpen] = useState(false)
  const [profile, setProfile] = useState(() => createProfileFromUser(currentUser))

  const selectedGenderLabel =
    GENDER_OPTIONS.find((option) => option.value === profile.gender)?.label ||
    'Other'

  useEffect(() => {
    async function fetchProfile() {
      const res = await getMyProfile()
      const user = res.data.user
      const profileData = res.data.profile

      setProfile({
        fullName: user.full_name || '',
        phone: profileData.phone || '',
        email: user.email || '',
        gender: 'other',
        birthDate: '',
        avatarInitial: user.full_name?.slice(0, 1).toUpperCase() || 'U',
        role: user.role || 'student',
        studentCode: profileData.student_code || '',
        major: profileData.major || '',
        campus: profileData.campus || '',
        socialLinks: profileData.social_links || {
          facebook: '',
          github: '',
          linkedin: '',
        },
      })
    }

    fetchProfile()
  }, [])

  function updateProfileField(field, value) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleEditAction() {
    setGenderOpen(false)

    if (!isEditing) {
      setIsEditing(true)
      return
    }

    await updateMyProfile({
      student_code: profile.studentCode,
      phone: profile.phone,
      major: profile.major,
      campus: profile.campus,
      social_links: profile.socialLinks,
    })

    setIsEditing(false)
  }

  return (
    <main className="my-profile-page">
      <section className="my-profile-cover" aria-label="Profile cover">
        <div className="my-profile-cover__content">
          <h1>My Profile</h1>
        </div>
      </section>

      <section
        className={`my-profile-form-card${isEditing ? ' is-editing' : ''}`}
        aria-labelledby="profile-form-title"
      >
        <header className="my-profile-form-card__header">
          <div className="my-profile-avatar-wrap">
            <div className="my-profile-avatar" aria-hidden="true">
              {profile.avatarInitial}
            </div>
            {isEditing ? (
              <button type="button" className="my-profile-avatar__edit">
                Change
              </button>
            ) : null}
          </div>
          <div>
            <h2 id="profile-form-title">{profile.fullName}</h2>
            <p>{profile.role}</p>
          </div>
        </header>

        <form className="my-profile-form">
          <div className="my-profile-form__section-title">
            Personal Information
          </div>

          <label className="my-profile-field">
            <span>Full Name</span>
            <input type="text" value={profile.fullName} disabled />
          </label>

          <label className="my-profile-field">
            <span>Phone Number</span>
            <input
              type="tel"
              value={profile.phone}
              placeholder="Ex: 0912345678"
              disabled={!isEditing}
              onChange={(event) =>
                updateProfileField('phone', event.target.value)
              }
            />
          </label>

          <label className="my-profile-field">
            <span>Email</span>
            <input type="email" value={profile.email} disabled />
          </label>

          <label className="my-profile-field">
            <span>Student Code</span>
            <input
              type="text"
              value={profile.studentCode}
              disabled={!isEditing}
              onChange={(event) =>
                updateProfileField('studentCode', event.target.value)
              }
            />
          </label>

          <label className="my-profile-field">
            <span>Major</span>
            <input
              type="text"
              value={profile.major}
              disabled={!isEditing}
              onChange={(event) =>
                updateProfileField('major', event.target.value)
              }
            />
          </label>

          <label className="my-profile-field">
            <span>Campus</span>
            <input
              type="text"
              value={profile.campus}
              disabled={!isEditing}
              onChange={(event) =>
                updateProfileField('campus', event.target.value)
              }
            />
          </label>

          <label className="my-profile-field">
            <span>Facebook</span>
            <input
              type="text"
              value={profile.socialLinks.facebook}
              disabled={!isEditing}
              onChange={(event) =>
                updateProfileField('socialLinks', {
                  ...profile.socialLinks,
                  facebook: event.target.value,
                })
              }
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