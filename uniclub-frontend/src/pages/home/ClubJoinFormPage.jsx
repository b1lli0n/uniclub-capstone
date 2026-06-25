import { useEffect, useMemo, useState } from 'react'
import { getClubById } from '../../api/club.api'
import { getMyClubs } from '../../api/memberClubMembership.api'
import {
  getPresidentJoinForm,
  createPresidentJoinForm,
  updatePresidentJoinForm,
  togglePresidentJoinFormStatus,
} from '../../api/joinFormManagement.api'
import { mapClubFromApi } from '../../api/clubMappers'
import '../../styles/club-join-form.css'

const DEFAULT_ANSWER_PLACEHOLDER = 'Type your answer...'
const emptyQuestion = { label: '', placeholder: DEFAULT_ANSWER_PLACEHOLDER }

function createDraft(form) {
  return {
    title: form?.title || '',
    description: form?.description || '',
    questions: form?.questions?.map((question) => ({ ...question })) || [
      { ...emptyQuestion, id: 'q1' },
    ],
  }
}

function createQuestionId() {
  return `q-${Date.now()}-${Math.round(Math.random() * 1000)}`
}

function mapFormFromApi(apiForm) {
  if (!apiForm) return null
  return {
    id: apiForm._id || apiForm.id,
    clubId: apiForm.club_id,
    title: apiForm.title || '',
    description: apiForm.description || '',
    status: apiForm.status || 'inactive',
    updatedAt: apiForm.updated_at ? new Date(apiForm.updated_at).toLocaleDateString('en-GB') : '',
    questions: (apiForm.questions || []).map((q, idx) => ({
      id: `q${idx + 1}`,
      label: q,
      placeholder: 'Type your answer...',
    })),
  }
}

function ClubJoinFormPage({ clubId }) {
  const [loading, setLoading] = useState(true)
  const [club, setClub] = useState(null)
  const [canManageForms, setCanManageForms] = useState(false)
  const [forms, setForms] = useState([])

  const [detailForm, setDetailForm] = useState(null)
  const [editorMode, setEditorMode] = useState(null)
  const [editingFormId, setEditingFormId] = useState(null)
  const [draft, setDraft] = useState(createDraft())

  const activeForm = useMemo(
    () => forms.find((form) => form.status === 'active') || null,
    [forms]
  )

  useEffect(() => {
    let cancelled = false

    async function loadFormPageData() {
      setLoading(true)
      try {
        const [clubRes, myClubsRes, formRes] = await Promise.all([
          getClubById(clubId),
          getMyClubs(),
          getPresidentJoinForm(clubId).catch((err) => {
            if (err.status === 404 || err.message?.includes('404')) {
              return { data: null }
            }
            throw err
          }),
        ])

        if (cancelled) return

        setClub(mapClubFromApi(clubRes.data))

        const membership = (myClubsRes.data || []).find((item) => {
          const id = item.club_id?._id || item.club_id
          return String(id) === String(clubId)
        })
        setCanManageForms(membership?.role === 'president')

        if (formRes.data) {
          setForms([mapFormFromApi(formRes.data)])
        } else {
          setForms([])
        }
      } catch (error) {
        console.error('loadFormPageData error:', error)
        if (!cancelled) {
          setClub(null)
          setCanManageForms(false)
          setForms([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadFormPageData()
    return () => {
      cancelled = true
    }
  }, [clubId])

  function openCreateModal() {
    setEditorMode('create')
    setEditingFormId(null)
    setDraft(createDraft())
  }

  function openEditModal(form) {
    setEditorMode('edit')
    setEditingFormId(form.id)
    setDraft(createDraft(form))
  }

  function closeEditor() {
    setEditorMode(null)
    setEditingFormId(null)
    setDraft(createDraft())
  }

  function updateDraftField(field, value) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateDraftQuestion(questionId, field, value) {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === questionId
          ? { ...question, [field]: value, placeholder: DEFAULT_ANSWER_PLACEHOLDER }
          : question
      ),
    }))
  }

  function addDraftQuestion() {
    setDraft((current) => ({
      ...current,
      questions: [...current.questions, { ...emptyQuestion, id: createQuestionId() }],
    }))
  }

  function removeDraftQuestion(questionId) {
    setDraft((current) => ({
      ...current,
      questions:
        current.questions.length > 1
          ? current.questions.filter((question) => question.id !== questionId)
          : current.questions,
    }))
  }

  async function submitForm(event) {
    event.preventDefault()
    
    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      questions: draft.questions.map((q) => q.label.trim()).filter(Boolean),
    }

    try {
      let response
      if (editorMode === 'edit') {
        response = await updatePresidentJoinForm(clubId, editingFormId, payload)
      } else {
        response = await createPresidentJoinForm(clubId, payload)
      }
      
      const mapped = mapFormFromApi(response.data)
      
      setForms((items) => {
        if (editorMode === 'edit') {
          return items.map((item) => (item.id === editingFormId ? mapped : item))
        }
        return [mapped, ...items.map(item => ({ ...item, status: 'inactive' }))]
      })
      
      setDetailForm((form) => (form?.id === mapped.id ? mapped : form))
      closeEditor()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Failed to save join form')
    }
  }

  async function toggleFormStatus(formId) {
    const targetForm = forms.find((form) => form.id === formId)
    if (!targetForm) return

    const nextStatus = targetForm.status === 'active' ? 'inactive' : 'active'
    
    try {
      await togglePresidentJoinFormStatus(clubId, formId, nextStatus)
      
      setForms((items) =>
        items.map((form) => {
          if (form.id === formId) {
            return {
              ...form,
              status: nextStatus,
            }
          }
          return {
            ...form,
            status: nextStatus === 'active' ? 'inactive' : form.status,
          }
        })
      )
    } catch (error) {
      console.error(error)
      alert(error.message || 'Failed to toggle form status')
    }
  }

  if (loading) {
    return (
      <main className="club-join-form-page">
        <section className="club-join-form-empty">
          <h1>Join Form</h1>
          <p>Loading join form...</p>
        </section>
      </main>
    )
  }

  if (!canManageForms) {
    return (
      <main className="club-join-form-page">
        <section className="club-join-form-empty">
          <h1>Join Form</h1>
          <p>Only the club president can manage join forms.</p>
        </section>
      </main>
    )
  }

  if (!club) {
    return (
      <main className="club-join-form-page">
        <section className="club-join-form-empty">
          <h1>Join Form</h1>
          <p>Club not found.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="club-join-form-page">
      <section className="club-join-form-hero">
        <div>
          <span>{club.name}</span>
          <h1>Join Form</h1>
          <p>Build the form students complete before sending a join request.</p>
        </div>
        <button type="button" onClick={openCreateModal}>Create Form</button>
      </section>

      <section className="club-join-form-layout">
        <div className="club-join-form-list" aria-label="Join forms">
          {forms.map((form) => (
            <article key={form.id} className="club-join-form-card">
              <div>
                <div className="club-join-form-card__topline">
                  <span className={`club-join-form-status club-join-form-status--${form.status}`}>
                    {form.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  <small>{form.updatedAt}</small>
                </div>
                <h2>{form.title}</h2>
                <p>{form.description}</p>
                <div className="club-join-form-card__meta">
                  <span>{form.questions.length} questions</span>
                </div>
              </div>

              <div className="club-join-form-card__actions">
                <button type="button" onClick={() => setDetailForm(form)}>View</button>
                <button type="button" onClick={() => openEditModal(form)}>Update</button>
                <button
                  type="button"
                  className={form.status === 'active' ? 'is-deactivate' : 'is-activate'}
                  onClick={() => toggleFormStatus(form.id)}
                >
                  {form.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="club-join-form-preview" aria-label="Active join form preview">
          <span>Active form</span>
          <h2>{activeForm?.title || 'No active form'}</h2>
          <p>{activeForm?.description || 'Create or activate a form before students can use it.'}</p>
          <div className="club-join-form-preview__questions">
            {(activeForm?.questions || []).map((question) => (
              <label key={question.id}>
                <span>{question.label}</span>
                <textarea placeholder={question.placeholder} rows={3} disabled />
              </label>
            ))}
          </div>
        </aside>
      </section>

      {detailForm ? (
        <div className="club-join-form-modal" role="dialog" aria-modal="true" aria-labelledby="join-form-detail-title">
          <button
            type="button"
            className="club-join-form-modal__backdrop"
            aria-label="Close form details"
            onClick={() => setDetailForm(null)}
          />
          <section className="club-join-form-modal__panel">
            <div className="club-join-form-modal__header">
              <div>
                <h2 id="join-form-detail-title">{detailForm.title}</h2>
                <p>{detailForm.status === 'active' ? 'Active' : 'Inactive'} - {detailForm.updatedAt}</p>
              </div>
              <button type="button" onClick={() => setDetailForm(null)}>Close</button>
            </div>
            <p className="club-join-form-modal__description">{detailForm.description}</p>
            <div className="club-join-form-modal__questions">
              {detailForm.questions.map((question, index) => (
                <div key={question.id}>
                  <span>Question {index + 1}</span>
                  <strong>{question.label}</strong>
                  <textarea placeholder={question.placeholder} rows={3} disabled />
                </div>
              ))}
            </div>
            <div className="club-join-form-modal__actions">
              <button type="button" onClick={() => openEditModal(detailForm)}>Update</button>
              <button
                type="button"
                className={detailForm.status === 'active' ? 'is-deactivate' : 'is-activate'}
                onClick={() => {
                  toggleFormStatus(detailForm.id)
                  setDetailForm((form) => ({
                    ...form,
                    status: form.status === 'active' ? 'inactive' : 'active',
                  }))
                }}
              >
                {detailForm.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {editorMode ? (
        <div className="club-join-form-modal" role="dialog" aria-modal="true" aria-labelledby="join-form-editor-title">
          <button
            type="button"
            className="club-join-form-modal__backdrop"
            aria-label="Close form editor"
            onClick={closeEditor}
          />
          <form className="club-join-form-modal__panel club-join-form-editor" onSubmit={submitForm}>
            <div className="club-join-form-modal__header">
              <div>
                <h2 id="join-form-editor-title">{editorMode === 'create' ? 'Create Form' : 'Update Form'}</h2>
                <p>{club.name}</p>
              </div>
              <button type="button" onClick={closeEditor}>Close</button>
            </div>

            <label className="club-join-form-editor__field">
              <span>Form title</span>
              <input
                type="text"
                value={draft.title}
                onChange={(event) => updateDraftField('title', event.target.value)}
                required
              />
            </label>

            <label className="club-join-form-editor__field">
              <span>Description</span>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(event) => updateDraftField('description', event.target.value)}
                required
              />
            </label>

            <div className="club-join-form-editor__questions">
              {draft.questions.map((question, index) => (
                <div key={question.id} className="club-join-form-editor__question">
                  <div>
                    <strong>Question {index + 1}</strong>
                    <button type="button" onClick={() => removeDraftQuestion(question.id)}>Remove</button>
                  </div>
                  <input
                    type="text"
                    value={question.label}
                    placeholder="Type the question students will answer"
                    onChange={(event) => updateDraftQuestion(question.id, 'label', event.target.value)}
                    required
                  />
                  <textarea placeholder={DEFAULT_ANSWER_PLACEHOLDER} rows={3} disabled />
                </div>
              ))}
            </div>

            <div className="club-join-form-editor__actions">
              <button type="button" onClick={addDraftQuestion}>Add Question</button>
              <button type="submit">{editorMode === 'create' ? 'Create' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  )
}

export default ClubJoinFormPage
