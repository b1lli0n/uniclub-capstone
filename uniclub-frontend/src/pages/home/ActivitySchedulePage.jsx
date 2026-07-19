import { useState } from 'react'
import '../../styles/schedule.css'

const WEEK_DAYS = [
  { id: 'mon', label: 'Monday', short: 'Mon' },
  { id: 'tue', label: 'Tuesday', short: 'Tue' },
  { id: 'wed', label: 'Wednesday', short: 'Wed' },
  { id: 'thu', label: 'Thursday', short: 'Thu' },
  { id: 'fri', label: 'Friday', short: 'Fri' },
  { id: 'sat', label: 'Saturday', short: 'Sat' },
  { id: 'sun', label: 'Sunday', short: 'Sun' }
]

const MOCK_ACTIVITIES = [
  {
    id: 'act1',
    dayIndex: 0, // Monday
    time: '14:00 - 15:30',
    title: 'Weekly Club Meeting',
    type: 'meeting',
    description: 'General meeting to discuss upcoming events and member status.',
    location: 'Meeting Room A',
    points: 20
  },
  {
    id: 'act2',
    dayIndex: 2, // Wednesday
    time: '09:00 - 11:00',
    title: 'Design Workshop',
    type: 'workshop',
    description: 'Learning Figma basics and UI/UX design principles.',
    location: 'Lab Room 302',
    points: 50
  },
  {
    id: 'act3',
    dayIndex: 4, // Friday
    time: '18:00 - 21:00',
    title: 'Bowling Night',
    type: 'outing',
    description: 'Social bonding session at the bowling center.',
    location: 'SuperBowl District 1',
    points: 30
  },
  {
    id: 'act4',
    dayIndex: 5, // Saturday (Today in user screenshot logic)
    time: '13:00 - 15:00',
    title: 'Charity Planning',
    type: 'meeting',
    description: 'Organizing the volunteer event for next month.',
    location: 'Open Space Hall',
    points: 20
  }
]

const ACTIVITY_TYPES = [
  { id: 'meeting', label: 'Meeting', emoji: '👥' },
  { id: 'workshop', label: 'Workshop', emoji: '💡' },
  { id: 'outing', label: 'Social Outing', emoji: '🎳' }
]

function ActivitySchedulePage({ userRole }) {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0); 
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null, title: '', date: '', type: 'meeting', startTime: '', endTime: '', location: '', description: ''
  });
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [activitiesList, setActivitiesList] = useState(MOCK_ACTIVITIES);

  const normalizedRole = userRole?.toLowerCase() || ''
  const isAdmin =
    normalizedRole === 'leader' ||
    normalizedRole === 'event management' ||
    normalizedRole === 'secretary'

  // Logic simulate "Today" is June 20, 2026 (Saturday)
  const baseToday = new Date(2026, 5, 20) 

  const getMonday = (offset) => {
    const d = new Date(baseToday)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + (offset * 7)
    return new Date(d.setDate(diff))
  }

  const monday = getMonday(weekOffset)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const handlePrevWeek = () => setWeekOffset(prev => prev - 1)
  const handleNextWeek = () => setWeekOffset(prev => prev + 1)

  const getWeekRangeString = () => {
    const options = { month: 'long', day: 'numeric' }
    if (monday.getMonth() === sunday.getMonth()) {
      return `${monday.toLocaleDateString('en-US', { month: 'long' })} ${monday.getDate()} - ${sunday.getDate()}, ${monday.getFullYear()}`
    }
    return `${monday.toLocaleDateString('en-US', options)} - ${sunday.toLocaleDateString('en-US', options)}, ${sunday.getFullYear()}`
  }

  const filteredActivities = activitiesList.filter(act => 
    activeFilter === 'all' || act.type === activeFilter
  )

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({ id: null, title: '', date: '2026-06-20', type: 'meeting', startTime: '', endTime: '', location: '', description: '' });
    setShowFormModal(true);
  };

  const handleOpenEdit = (e, activity) => {
    e.stopPropagation();
    setIsEditing(true);
    const [start, end] = (activity.time || '00:00 - 00:00').split(' - ');
    setFormData({
      id: activity.id,
      title: activity.title,
      date: '2026-06-20',
      type: activity.type,
      startTime: parseTimeForInput(start),
      endTime: parseTimeForInput(end),
      location: activity.location,
      description: activity.description || ''
    });
    setShowFormModal(true);
  };

  const handleOpenDelete = (e, activity) => {
    e.stopPropagation();
    setActivityToDelete(activity);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    setActivitiesList(activitiesList.filter(a => a.id !== activityToDelete.id));
    setShowDeleteModal(false);
    setActivityToDelete(null);
    if (selectedActivity?.id === activityToDelete.id) setSelectedActivity(null);
  };

  const parseTimeForInput = (timeStr) => {
    if (!timeStr) return '00:00';
    const parts = timeStr.split(' ');
    if (parts.length < 2) return timeStr; // Already in 24h format maybe
    const [time, modifier] = parts;
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const formatTimeForDisplay = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${minutes} ${ampm}`;
  };

  const handleSaveActivity = () => {
    const timeDisplay = `${formatTimeForDisplay(formData.startTime)} - ${formatTimeForDisplay(formData.endTime)}`;
    if (isEditing) {
      setActivitiesList(activitiesList.map(a => a.id === formData.id ? { ...a, ...formData, time: timeDisplay } : a));
    } else {
      const newActivity = {
        ...formData,
        id: `act${Date.now()}`,
        dayIndex: (new Date(formData.date).getDay() + 6) % 7,
        time: timeDisplay,
        points: 20
      };
      setActivitiesList([...activitiesList, newActivity]);
    }
    setShowFormModal(false);
  };

  return (
    <div className="schedule-page">
      <header className="schedule-header">
        <div className="schedule-header__title">
          <h1>Weekly Activity Schedule</h1>
          <p className="schedule-header__subtitle">Manage your club participation & upcoming events</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {isAdmin && (
            <button className="btn-create-activity" onClick={handleOpenCreate}>
              <svg style={{ width: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Create Activity
            </button>
          )}

          <div className="schedule-nav">
            <button className="schedule-nav__btn" title="Previous Week" onClick={handlePrevWeek}>
              <svg style={{ width: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <div className="schedule-nav__current">{getWeekRangeString()}</div>
            <button className="schedule-nav__btn" title="Next Week" onClick={handleNextWeek}>
              <svg style={{ width: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </header>

      <div className="schedule-filters" style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        {[
          { id: 'all', label: 'All Activities' },
          { id: 'meeting', label: 'Meetings' },
          { id: 'workshop', label: 'Workshops' },
          { id: 'outing', label: 'Outings' }
        ].map(opt => (
          <button
            key={opt.id}
            type="button"
            className={activeFilter === opt.id ? 'is-active' : ''}
            onClick={() => setActiveFilter(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="schedule-grid">
        {WEEK_DAYS.map((day, idx) => {
          const currentDate = new Date(monday)
          currentDate.setDate(monday.getDate() + idx)
          const isToday = currentDate.toDateString() === baseToday.toDateString()
          const dayActivities = filteredActivities.filter(a => a.dayIndex === idx)

          return (
            <div key={day.id} className={`schedule-col ${isToday ? 'schedule-col--today' : ''}`}>
              {isToday && <div className="today-badge">TODAY</div>}
              <div className="schedule-col__header">
                <span className="schedule-col__day">{day.label}</span>
                <span className="schedule-col__date">{currentDate.getDate()}</span>
              </div>

              <div className="schedule-col__content">
                {dayActivities.map(activity => (
                  <div key={activity.id} className={`activity-card activity-card--${activity.type}`} onClick={() => setSelectedActivity(activity)} style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span className="activity-card__time">{activity.time}</span>
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                          <button onClick={(e) => handleOpenEdit(e, activity)} style={{ background: 'rgba(253, 126, 20, 0.1)', border: 'none', padding: '4px', borderRadius: '6px', color: '#fd7e14', cursor: 'pointer' }}>
                            <svg style={{ width: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          </button>
                          <button onClick={(e) => handleOpenDelete(e, activity)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '4px', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}>
                            <svg style={{ width: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>
                          </button>
                        </div>
                      )}
                    </div>
                    <h3 className="activity-card__title">{activity.title}</h3>
                    <div className="activity-card__pts">
                      <svg style={{ width: '12px' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      +{activity.points || activity.pts || 0} pts
                    </div>
                  </div>
                ))}
                {dayActivities.length === 0 && (
                  <div className="schedule-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span>No Activity</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="points-modal-overlay" onClick={() => setSelectedActivity(null)} style={{ zIndex: 900 }}>
          <div className="points-modal shadow-2xl" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="points-modal__header">
              <h3>Activity Detail</h3>
              <button className="points-modal__close" onClick={() => setSelectedActivity(null)}>&times;</button>
            </div>
            <div className="points-modal__body">
              <div className="activity-detail-hero">{selectedActivity.type === 'meeting' ? '👥' : selectedActivity.type === 'workshop' ? '💡' : '🎳'}</div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px', color: '#0f172a' }}>{selectedActivity.title}</h2>
              <div className="activity-card__pts" style={{ fontSize: '13px', padding: '6px 12px', borderRadius: '12px', marginBottom: '24px' }}>Attend to earn +{selectedActivity.points || selectedActivity.pts} Achievement Points</div>
              <div className="activity-detail-meta">
                <div className="meta-box"><div className="meta-box__icon"><svg style={{ width: '20px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg></div><div className="meta-box__info"><h5>Time</h5><p>{selectedActivity.time}</p></div></div>
                <div className="meta-box"><div className="meta-box__icon"><svg style={{ width: '20px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></div><div className="meta-box__info"><h5>Location</h5><p>{selectedActivity.location}</p></div></div>
              </div>
              <div className="activity-description">
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>About this activity</h4>
                <p style={{ color: '#334155', lineHeight: '1.6', fontSize: '15px' }}>{selectedActivity.description}</p>
              </div>
            </div>
            <div className="points-modal__footer" style={{ marginTop: '24px' }}>
              <button className="btn-primary" style={{ width: '100%', height: '52px', background: '#fd7e14', fontSize: '16px', fontWeight: '700' }} onClick={() => setSelectedActivity(null)}>Join Activity</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Update Activity Modal */}
      {showFormModal && (
        <div className="points-modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }} onClick={() => setShowFormModal(false)}>
          <div className="points-modal shadow-2xl" style={{ maxWidth: '520px', width: '100%', maxHeight: '90vh', padding: '0', borderRadius: '32px', border: 'none', background: 'white', position: 'relative', animation: 'slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '32px 40px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{isEditing ? 'Update Activity' : 'Create New Activity'}</h2>
              <button onClick={() => setShowFormModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
            </div>
            <div style={{ padding: '0 40px 20px', overflowY: 'auto', flex: 1 }} className="glass-body">
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>TITLE *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Weekly Meeting" style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '16px', color: '#1e293b', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#fd7e14'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>DATE *</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '16px', color: '#1e293b' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>CATEGORY</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '16px', color: '#1e293b', background: 'white' }}>
                    {ACTIVITY_TYPES.map(type => <option key={type.id} value={type.id}>{type.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>START TIME *</label><input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '16px', color: '#1e293b' }} /></div>
                <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>END TIME *</label><input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '16px', color: '#1e293b' }} /></div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>LOCATION</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Room A1, Main Hall" style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '16px', color: '#1e293b' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>DESCRIPTION</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the activity..." style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '16px', color: '#1e293b', resize: 'none' }} />
              </div>
            </div>
            <div style={{ padding: '0 40px 40px', display: 'flex', gap: '16px', justifyContent: 'center', flexShrink: 0 }}>
              <button style={{ flex: 1, padding: '18px', borderRadius: '16px', border: 'none', background: '#f1f5f9', color: '#334155', fontWeight: '800', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setShowFormModal(false)}>Cancel</button>
              <button style={{ flex: 1, padding: '18px', borderRadius: '16px', border: 'none', background: '#fd7e14', color: 'white', fontWeight: '800', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 20px rgba(253, 126, 20, 0.2)' }} onClick={handleSaveActivity}>{isEditing ? 'Save Changes' : 'Create New'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="points-modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1100 }} onClick={() => setShowDeleteModal(false)}>
          <div className="points-modal shadow-2xl" style={{ maxWidth: '450px', width: '100%', padding: '40px', borderRadius: '32px', border: 'none', background: 'white', animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ background: '#fef2f2', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ef4444' }}><svg style={{ width: '32px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg></div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 12px' }}>Delete Activity?</h2>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>Are you sure you want to delete <strong>"{activityToDelete?.title}"</strong>? This action cannot be undone.</p>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button style={{ flex: 1, padding: '16px', borderRadius: '16px', border: 'none', background: '#f1f5f9', color: '#334155', fontWeight: '800', fontSize: '16px', cursor: 'pointer' }} onClick={() => setShowDeleteModal(false)}>No, Keep it</button>
              <button style={{ flex: 1, padding: '16px', borderRadius: '16px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.2)' }} onClick={handleDeleteConfirm}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivitySchedulePage;
