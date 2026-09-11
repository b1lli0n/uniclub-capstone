import { useState, useEffect, useRef } from 'react'
import '../../styles/my-profile.css'
import { getMyProfile, updateMyProfile } from '../../api/profile.api'
import { useToast } from '../../components/common/notificationContext'

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

function createProfileFromUser(user) {
  const userId = user?.id || user?._id || ''
  const localAvatar = userId ? localStorage.getItem(`uniclub_custom_avatar_${userId}`) : ''
  return {
    id: userId,
    fullName: user?.fullName || user?.full_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    gender: user?.gender || 'other',
    birthDate: user?.birthDate || '',
    avatarUrl: user?.avatarUrl || user?.avatar_url || user?.avatar || localAvatar || '',
    avatarInitial:
      user?.avatarInitial || user?.fullName?.slice(0, 1).toUpperCase() || user?.full_name?.slice(0, 1).toUpperCase() || 'U',
    role: user?.role || 'UniClub member',
    studentCode: '',
    campus: '',
  }
}

// Regex chuẩn số điện thoại Việt Nam: 10 chữ số, bắt đầu bằng 0 hoặc +84 với các đầu số 3, 5, 7, 8, 9
const VN_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/

function MyProfilePage({ currentUser }) {
  const showToast = useToast()
  const [profile, setProfile] = useState(() => createProfileFromUser(currentUser))

  // State cho Modal "Chỉnh sửa hồ sơ" (Edit Profile Popup)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    studentCode: '',
    phone: '',
    campus: 'Can Tho',
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [phoneError, setPhoneError] = useState('')

  // State cho Modal "Cắt và xoay" kiểu Google Profile
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [selectedAvatarPreview, setSelectedAvatarPreview] = useState(null)
  const [isSavingAvatar, setIsSavingAvatar] = useState(false)
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [imgNaturalSize, setImgNaturalSize] = useState({ width: 1, height: 1 })
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, size: 200 })
  const [activeDrag, setActiveDrag] = useState(null) // null | 'move' | 'nw' | 'ne' | 'se' | 'sw'
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, boxX: 0, boxY: 0, boxSize: 0 })
  const fileInputRef = useRef(null)

  // Tính toán kích thước hiển thị của ảnh vừa trong khung chứa 460x340
  const MAX_VIEW_W = 460
  const MAX_VIEW_H = 340

  const isRotated90 = rotation === 90 || rotation === 270
  const currentNaturalW = isRotated90 ? imgNaturalSize.height : imgNaturalSize.width
  const currentNaturalH = isRotated90 ? imgNaturalSize.width : imgNaturalSize.height
  const imgAspect = currentNaturalW / (currentNaturalH || 1)

  let displayW = MAX_VIEW_W
  let displayH = MAX_VIEW_H
  if (imgAspect >= MAX_VIEW_W / MAX_VIEW_H) {
    displayW = MAX_VIEW_W
    displayH = Math.round(MAX_VIEW_W / imgAspect)
  } else {
    displayH = MAX_VIEW_H
    displayW = Math.round(MAX_VIEW_H * imgAspect)
  }

  // Tự động căn chỉnh crop box ban đầu khi mở ảnh hoặc đổi góc xoay
  const initCropBox = (fitW, fitH) => {
    const size = Math.round(Math.min(fitW, fitH) * 0.82)
    const x = Math.round((fitW - size) / 2)
    const y = Math.round((fitH - size) / 2)
    setCropBox({ x, y, size })
  }

  useEffect(() => {
    let active = true
    async function fetchProfile() {
      try {
        const profileRes = await getMyProfile()

        if (!active) return

        const user = profileRes.data.user
        const profileData = profileRes.data.profile
        const localAvatar = user?._id ? localStorage.getItem(`uniclub_custom_avatar_${user._id}`) : ''

        // Ưu tiên đúng hình của user trong database, sau đó đến local cache của đúng user
        const resolvedAvatarUrl =
          profileData?.avatar || user?.avatar_url || localAvatar || ''

        setProfile({
          id: user._id || '',
          fullName: user.full_name || '',
          phone: profileData.phone || '',
          email: user.email || '',
          gender: 'other',
          birthDate: '',
          avatarUrl: resolvedAvatarUrl,
          avatarInitial: user.full_name?.slice(0, 1).toUpperCase() || 'U',
          role: user.role || 'student',
          studentCode: profileData.student_code || '',
          campus: profileData.campus || 'Can Tho',
        })
      } catch (err) {
        console.error("Error fetching profile data:", err)
      }
    }

    fetchProfile()
    return () => { active = false }
  }, [])

  // Mở Popup chỉnh sửa hồ sơ
  function handleOpenEditModal() {
    setEditFormData({
      studentCode: profile.studentCode || '',
      phone: profile.phone || '',
      campus: profile.campus || 'Can Tho',
    })
    setPhoneError('')
    setIsEditModalOpen(true)
  }

  // Đóng Popup chỉnh sửa hồ sơ
  function handleCloseEditModal() {
    setIsEditModalOpen(false)
    setPhoneError('')
  }

  // Cập nhật trường trong Form popup
  function handleEditFieldChange(field, value) {
    if (field === 'phone') {
      setPhoneError('')
    }
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Kiểm tra số điện thoại sau khi người dùng gõ xong và rời khỏi ô nhập (onBlur)
  function handlePhoneBlur() {
    const cleanPhone = (editFormData.phone || '').trim()
    if (!cleanPhone) {
      setPhoneError('')
      return
    }
    if (!VN_PHONE_REGEX.test(cleanPhone)) {
      setPhoneError('Invalid phone number')
    } else {
      setPhoneError('')
    }
  }

  // Lưu thông tin từ Popup chỉnh sửa
  async function handleSaveProfileModal(e) {
    if (e) e.preventDefault()

    // Kiểm tra chuẩn số điện thoại
    const cleanPhone = (editFormData.phone || '').trim()
    if (cleanPhone) {
      if (!VN_PHONE_REGEX.test(cleanPhone)) {
        setPhoneError('Invalid phone number')
        showToast({
          type: 'error',
          title: 'Invalid phone number',
          message: 'Please enter a valid phone number.',
        })
        return
      }
    }

    setPhoneError('')
    setIsSavingProfile(true)

    try {
      await updateMyProfile({
        student_code: editFormData.studentCode,
        phone: cleanPhone,
        campus: editFormData.campus,
      })
      setIsEditing(false)
      // Display notification when profile is updated.

      // Cập nhật State hồ sơ hiển thị
      setProfile((prev) => ({
        ...prev,
        studentCode: editFormData.studentCode,
        phone: cleanPhone,
        campus: editFormData.campus,
      }))

      setIsEditModalOpen(false)
      showToast({
        type: 'success',
        title: 'Profile updated',
        message: 'Your profile information has been saved successfully.',
      })
    } catch (err) {
      console.error(err)
      showToast({
        type: 'error',
        title: 'Update failed',
        message: err.message || 'Failed to update profile.',
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Xử lý khi người dùng chọn file ảnh từ máy
  function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast({
        type: 'error',
        title: 'Invalid file',
        message: 'Please choose a valid image file (JPG, PNG, WebP).',
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result
      setSelectedAvatarPreview(dataUrl)
      setRotation(0)

      // Đo kích thước gốc của ảnh
      const tempImg = new Image()
      tempImg.onload = () => {
        setImgNaturalSize({ width: tempImg.naturalWidth, height: tempImg.naturalHeight })
        const aspect = tempImg.naturalWidth / tempImg.naturalHeight
        let w = MAX_VIEW_W
        let h = MAX_VIEW_H
        if (aspect >= MAX_VIEW_W / MAX_VIEW_H) {
          w = MAX_VIEW_W
          h = Math.round(MAX_VIEW_W / aspect)
        } else {
          h = MAX_VIEW_H
          w = Math.round(MAX_VIEW_H * aspect)
        }
        initCropBox(w, h)
        setIsAvatarModalOpen(true)
      }
      tempImg.src = dataUrl
    }
    reader.readAsDataURL(file)

    event.target.value = ''
  }

  // Xoay 90 độ
  function handleRotate() {
    const nextRot = (rotation + 90) % 360
    setRotation(nextRot)

    const nextIsRotated90 = nextRot === 90 || nextRot === 270
    const nw = nextIsRotated90 ? imgNaturalSize.height : imgNaturalSize.width
    const nh = nextIsRotated90 ? imgNaturalSize.width : imgNaturalSize.height
    const aspect = nw / (nh || 1)

    let w = MAX_VIEW_W
    let h = MAX_VIEW_H
    if (aspect >= MAX_VIEW_W / MAX_VIEW_H) {
      w = MAX_VIEW_W
      h = Math.round(MAX_VIEW_W / aspect)
    } else {
      h = MAX_VIEW_H
      w = Math.round(MAX_VIEW_H * aspect)
    }
    initCropBox(w, h)
  }

  // Mở trình chọn file
  function handleAvatarClick() {
    fileInputRef.current?.click()
  }

  // Đóng Modal avatar
  function handleCloseAvatarModal() {
    setIsAvatarModalOpen(false)
    setSelectedAvatarPreview(null)
    setRotation(0)
  }

  // Bắt đầu kéo crop box hoặc kéo các góc resize
  function startDrag(type, clientX, clientY) {
    setActiveDrag(type)
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      boxX: cropBox.x,
      boxY: cropBox.y,
      boxSize: cropBox.size,
    }
  }

  function handleDragMove(clientX, clientY) {
    if (!activeDrag) return
    const dx = clientX - dragStartRef.current.mouseX
    const dy = clientY - dragStartRef.current.mouseY
    const { boxX, boxY, boxSize } = dragStartRef.current
    const minSize = 60

    if (activeDrag === 'move') {
      const newX = Math.max(0, Math.min(boxX + dx, displayW - cropBox.size))
      const newY = Math.max(0, Math.min(boxY + dy, displayH - cropBox.size))
      setCropBox((prev) => ({ ...prev, x: newX, y: newY }))
    } else if (activeDrag === 'se') {
      const delta = Math.max(dx, dy)
      const newSize = Math.max(minSize, Math.min(boxSize + delta, displayW - boxX, displayH - boxY))
      setCropBox((prev) => ({ ...prev, size: newSize }))
    } else if (activeDrag === 'nw') {
      const delta = Math.min(dx, dy)
      let newSize = Math.max(minSize, boxSize - delta)
      let newX = boxX + (boxSize - newSize)
      let newY = boxY + (boxSize - newSize)
      if (newX < 0) {
        newSize += newX
        newX = 0
        newY = boxY + (boxSize - newSize)
      }
      if (newY < 0) {
        newSize += newY
        newY = 0
        newX = boxX + (boxSize - newSize)
      }
      setCropBox({ x: newX, y: newY, size: newSize })
    } else if (activeDrag === 'ne') {
      const delta = Math.max(dx, -dy)
      const newSize = Math.max(minSize, Math.min(boxSize + delta, displayW - boxX, boxY + boxSize))
      const newY = boxY + (boxSize - newSize)
      setCropBox((prev) => ({ ...prev, y: Math.max(0, newY), size: newSize }))
    } else if (activeDrag === 'sw') {
      const delta = Math.max(-dx, dy)
      const newSize = Math.max(minSize, Math.min(boxSize + delta, boxX + boxSize, displayH - boxY))
      const newX = boxX + (boxSize - newSize)
      setCropBox((prev) => ({ ...prev, x: Math.max(0, newX), size: newSize }))
    }
  }

  function handleEndDrag() {
    setActiveDrag(null)
  }

  // Xuất ảnh sau khi Crop & Xoay góc bằng HTML5 Canvas
  function getGoogleCroppedAvatarBase64() {
    return new Promise((resolve) => {
      const origImg = new Image()
      origImg.onload = () => {
        const natW = origImg.naturalWidth
        const natH = origImg.naturalHeight

        // 1. Tạo Canvas xoay toàn bộ ảnh gốc
        const rotCanvas = document.createElement('canvas')
        if (rotation === 90 || rotation === 270) {
          rotCanvas.width = natH
          rotCanvas.height = natW
        } else {
          rotCanvas.width = natW
          rotCanvas.height = natH
        }

        const rotCtx = rotCanvas.getContext('2d')
        rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2)
        rotCtx.rotate((rotation * Math.PI) / 180)
        rotCtx.drawImage(origImg, -natW / 2, -natH / 2)

        // 2. Tính tỉ lệ giữa canvas xoay và khung hiển thị trên màn hình
        const scale = rotCanvas.width / (displayW || 1)
        const cropX = Math.round(cropBox.x * scale)
        const cropY = Math.round(cropBox.y * scale)
        const cropSize = Math.round(cropBox.size * scale)

        // 3. Xuất ra Canvas vuông 400x400
        const finalCanvas = document.createElement('canvas')
        const outputSize = 400
        finalCanvas.width = outputSize
        finalCanvas.height = outputSize
        const finalCtx = finalCanvas.getContext('2d')

        finalCtx.imageSmoothingEnabled = true
        finalCtx.imageSmoothingQuality = 'high'
        finalCtx.drawImage(
          rotCanvas,
          cropX,
          cropY,
          cropSize,
          cropSize,
          0,
          0,
          outputSize,
          outputSize
        )

        resolve(finalCanvas.toDataURL('image/jpeg', 0.92))
      }
      origImg.src = selectedAvatarPreview
    })
  }

  // Lưu avatar
  async function handleSaveAvatar() {
    if (!selectedAvatarPreview) return

    setIsSavingAvatar(true)
    try {
      // Xuất ảnh cropped & rotated từ canvas
      const croppedImage = await getGoogleCroppedAvatarBase64()

      // 1. Lưu tạm thời dạng local (localStorage theo userId của đúng user)
      const userKey = profile.id ? `uniclub_custom_avatar_${profile.id}` : 'uniclub_custom_avatar'
      localStorage.setItem(userKey, croppedImage)

      // 2. Gửi cập nhật lên backend
      await updateMyProfile({
        avatar: croppedImage,
      })

      // 3. Cập nhật state UI
      setProfile((prev) => ({
        ...prev,
        avatarUrl: croppedImage,
      }))

      setIsAvatarModalOpen(false)
      setSelectedAvatarPreview(null)

      showToast({
        type: 'success',
        title: 'Avatar updated',
        message: 'Your profile picture has been updated successfully.',
      })
    } catch (err) {
      console.error(err)
      const croppedImage = await getGoogleCroppedAvatarBase64()
      const userKey = profile.id ? `uniclub_custom_avatar_${profile.id}` : 'uniclub_custom_avatar'
      localStorage.setItem(userKey, croppedImage)
      setProfile((prev) => ({
        ...prev,
        avatarUrl: croppedImage,
      }))
      setIsAvatarModalOpen(false)
      showToast({
        type: 'success',
        title: 'Avatar saved locally',
        message: 'Your profile picture has been updated on your device.',
      })
    } finally {
      setIsSavingAvatar(false)
    }
  }

  return (
    <main className="my-profile-page">
      <section className="my-profile-cover" aria-label="Profile cover">
        <div className="my-profile-cover__content">
          <h1>My Profile</h1>
        </div>
      </section>

      <section
        className="my-profile-form-card"
        aria-labelledby="profile-form-title"
      >
        <header className="my-profile-form-card__header">
          {/* Facebook-style Avatar Container */}
          <div className="my-profile-avatar-wrap">
            {/* Input file ẩn */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <div
              className="my-profile-avatar my-profile-avatar--clickable"
              onClick={handleAvatarClick}
              role="button"
              tabIndex={0}
              title="Click to change profile picture"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleAvatarClick()
                }
              }}
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName || 'User Avatar'}
                  className="my-profile-avatar__img"
                />
              ) : (
                <span className="my-profile-avatar__initial">
                  {profile.avatarInitial}
                </span>
              )}

              {/* Hover overlay kiểu FB */}
              <div className="my-profile-avatar__overlay" aria-hidden="true">
                <svg
                  className="my-profile-avatar__overlay-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </div>

            {/* Nút camera nhỏ ở góc dưới giống Facebook */}
            <button
              type="button"
              className="my-profile-avatar__camera-badge"
              onClick={handleAvatarClick}
              title="Change profile picture"
              aria-label="Change profile picture"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
              >
                <path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm7-4h-2.58l-1.71-1.87A1.996 1.996 0 0 0 13.25 2.5h-2.5c-.56 0-1.08.23-1.46.63L7.58 5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-7 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
              </svg>
            </button>
          </div>

          <div>
            <h2 id="profile-form-title" data-testid="profile-full-name">{profile.fullName}</h2>
            <p>{profile.role}</p>
          </div>
        </header>

        {/* Google-style "Cắt và xoay" Modal */}
        {isAvatarModalOpen && (
          <div
            className="google-crop-modal-overlay"
            onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
            onMouseUp={handleEndDrag}
            onTouchMove={(e) => {
              if (e.touches.length === 1) {
                handleDragMove(e.touches[0].clientX, e.touches[0].clientY)
              }
            }}
            onTouchEnd={handleEndDrag}
          >
            <div
              className="google-crop-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="google-crop-title"
            >
              {/* Header: Back arrow, "Crop and rotate", 3-dots */}
              <div className="google-crop-modal__header">
                <button
                  type="button"
                  className="google-crop-modal__header-btn"
                  onClick={handleCloseAvatarModal}
                  aria-label="Back"
                  title="Back"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <h3 id="google-crop-title">Crop and rotate</h3>
                <button
                  type="button"
                  className="google-crop-modal__header-btn"
                  onClick={handleCloseAvatarModal}
                  aria-label="More options"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
              </div>

              {/* Viewport chứa ảnh và khung cắt */}
              <div className="google-crop-modal__body">
                <div
                  className="google-crop-workspace"
                  style={{ width: displayW, height: displayH }}
                >
                  {/* Ảnh gốc hiển thị (có xoay) */}
                  <img
                    src={selectedAvatarPreview}
                    alt="Preview"
                    className="google-crop-img"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      width: isRotated90 ? displayH : displayW,
                      height: isRotated90 ? displayW : displayH,
                    }}
                    draggable={false}
                  />

                  {/* SVG Lớp phủ tối xung quanh hình tròn */}
                  <svg
                    className="google-crop-svg-mask"
                    width={displayW}
                    height={displayH}
                  >
                    <defs>
                      <mask id="google-circle-mask">
                        <rect width={displayW} height={displayH} fill="#ffffff" />
                        <circle
                          cx={cropBox.x + cropBox.size / 2}
                          cy={cropBox.y + cropBox.size / 2}
                          r={cropBox.size / 2}
                          fill="#000000"
                        />
                      </mask>
                    </defs>
                    <rect
                      width={displayW}
                      height={displayH}
                      fill="rgba(0, 0, 0, 0.65)"
                      mask="url(#google-circle-mask)"
                    />
                  </svg>

                  {/* Khung cắt hình vuông viền tròn với 4 góc kéo (Crop Box) */}
                  <div
                    className="google-crop-box"
                    style={{
                      left: cropBox.x,
                      top: cropBox.y,
                      width: cropBox.size,
                      height: cropBox.size,
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      startDrag('move', e.clientX, e.clientY)
                    }}
                    onTouchStart={(e) => {
                      if (e.touches.length === 1) {
                        startDrag('move', e.touches[0].clientX, e.touches[0].clientY)
                      }
                    }}
                  >
                    {/* Vòng tròn định hình viền trắng */}
                    <div className="google-crop-circle-guide" />

                    {/* 4 Góc trắng kéo resize (Corner Brackets) */}
                    <div
                      className="google-crop-handle google-crop-handle--nw"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        startDrag('nw', e.clientX, e.clientY)
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        if (e.touches.length === 1) {
                          startDrag('nw', e.touches[0].clientX, e.touches[0].clientY)
                        }
                      }}
                    />
                    <div
                      className="google-crop-handle google-crop-handle--ne"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        startDrag('ne', e.clientX, e.clientY)
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        if (e.touches.length === 1) {
                          startDrag('ne', e.touches[0].clientX, e.touches[0].clientY)
                        }
                      }}
                    />
                    <div
                      className="google-crop-handle google-crop-handle--sw"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        startDrag('sw', e.clientX, e.clientY)
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        if (e.touches.length === 1) {
                          startDrag('sw', e.touches[0].clientX, e.touches[0].clientY)
                        }
                      }}
                    />
                    <div
                      className="google-crop-handle google-crop-handle--se"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        startDrag('se', e.clientX, e.clientY)
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation()
                        if (e.touches.length === 1) {
                          startDrag('se', e.touches[0].clientX, e.touches[0].clientY)
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Nút Xoay 90 độ ở giữa dưới */}
                <div className="google-crop-rotate-wrap">
                  <button
                    type="button"
                    className="google-crop-rotate-btn"
                    onClick={handleRotate}
                    title="Rotate 90°"
                  >
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                    <span>Rotate</span>
                  </button>
                </div>
              </div>

              {/* Footer: Nút Save */}
              <div className="google-crop-modal__footer">
                <button
                  type="button"
                  className="google-crop-save-btn"
                  onClick={handleSaveAvatar}
                  disabled={isSavingAvatar}
                >
                  {isSavingAvatar ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phần xem thông tin hồ sơ (View Profile) */}
        <div className="my-profile-view-section">
          <div className="my-profile-view-section__header">
            <div className="my-profile-form__section-title">
              Personal Information
            </div>
            <button
              type="button"
              className="my-profile-open-edit-btn"
              onClick={handleOpenEditModal}
              data-testid="profile-open-edit-modal-btn"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="my-profile-details-grid">
            <div className="my-profile-detail-item">
              <span className="my-profile-detail-item__label">Full Name</span>
              <span className="my-profile-detail-item__value">{profile.fullName || '—'}</span>
            </div>

            <div className="my-profile-detail-item">
              <span className="my-profile-detail-item__label">Phone Number</span>
              <span className="my-profile-detail-item__value">{profile.phone || 'Not updated'}</span>
            </div>

            <div className="my-profile-detail-item">
              <span className="my-profile-detail-item__label">Email</span>
              <span className="my-profile-detail-item__value">{profile.email || '—'}</span>
            </div>

            <div className="my-profile-detail-item">
              <span className="my-profile-detail-item__label">Student Code (MSSV)</span>
              <span className="my-profile-detail-item__value">{profile.studentCode || 'Not updated'}</span>
            </div>

            <div className="my-profile-detail-item my-profile-detail-item--full">
              <span className="my-profile-detail-item__label">Campus</span>
              <span className="my-profile-detail-item__value">{profile.campus || 'Can Tho'}</span>
            </div>
          </div>
        </div>

        {/* Modal / Popup Chỉnh sửa hồ sơ (Edit Profile Popup) */}
        {isEditModalOpen && (
          <div className="my-profile-edit-modal-overlay" onClick={handleCloseEditModal}>
            <div
              className="my-profile-edit-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-profile-modal-title"
            >
              <div className="my-profile-edit-modal__header">
                <h3 id="edit-profile-modal-title">Edit Profile</h3>
                <button
                  type="button"
                  className="my-profile-edit-modal__close-btn"
                  onClick={handleCloseEditModal}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <form className="my-profile-edit-modal__form" onSubmit={handleSaveProfileModal}>
                <div className="my-profile-edit-modal__body">
                  <label className="my-profile-field">
                    <span>Full Name</span>
                    <input type="text" value={profile.fullName} disabled title="Full name linked with your account" />
                  </label>

                  <label className="my-profile-field">
                    <span>Email</span>
                    <input type="email" value={profile.email} disabled title="Email linked with your account" />
                  </label>

                  <label className="my-profile-field">
                    <span>Student Code (MSSV)</span>
                    <input
                      type="text"
                      value={editFormData.studentCode}
                      placeholder="e.g. CE123456"
                      onChange={(e) => handleEditFieldChange('studentCode', e.target.value)}
                    />
                  </label>

                  <label className="my-profile-field">
                    <span>Phone Number</span>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      placeholder="e.g. 0912345678"
                      onChange={(e) => handleEditFieldChange('phone', e.target.value)}
                      onBlur={handlePhoneBlur}
                    />
                  </label>

                  <label className="my-profile-field my-profile-field--full">
                    <span>Campus</span>
                    <input
                      type="text"
                      value={editFormData.campus}
                      placeholder="e.g. Can Tho"
                      onChange={(e) => handleEditFieldChange('campus', e.target.value)}
                    />
                  </label>

                  {phoneError && (
                    <div className="my-profile-field-error" role="alert">
                      {phoneError}
                    </div>
                  )}
                </div>

                <div className="my-profile-edit-modal__footer">
                  <button
                    type="button"
                    className="my-profile-modal-btn my-profile-modal-btn--cancel"
                    onClick={handleCloseEditModal}
                    disabled={isSavingProfile}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="my-profile-modal-btn my-profile-modal-btn--save"
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default MyProfilePage
