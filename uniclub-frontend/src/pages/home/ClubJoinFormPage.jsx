import { useMemo, useState } from 'react'
import {
  ALL_CLUBS,
  CLUB_JOIN_FORM_REQUESTS,
  MY_CLUB_MEMBERSHIPS,
} from '../../data/mockData'
import '../../styles/club-join-form.css'

const CLUB_FALLBACK = ALL_CLUBS[0]
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

function ClubJoinFormPage({ clubId }) {
  const club = ALL_CLUBS.find((item) => item.id === clubId) || CLUB_FALLBACK
  const membership = MY_CLUB_MEMBERSHIPS.find((item) => item.clubId === club.id)
  const canManageForms = membership?.role?.toLowerCase() === 'leader'
  const [forms, setForms] = useState(() =>
    CLUB_JOIN_FORM_REQUESTS.filter((form) => form.clubId === club.id)
  )
  const [detailForm, setDetailForm] = useState(null)
  const [editorMode, setEditorMode] = useState(null)
  const [editingFormId, setEditingFormId] = useState(null)
  const [draft, setDraft] = useState(createDraft())
  const activeForm = useMemo(
    () => forms.find((form) => form.status === 'active') || null,
    [forms]
  )

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

  function submitForm(event) {
    event.preventDefault()
    const nextForm = {
      id: editingFormId || `form-${club.id}-${Date.now()}`,
      clubId: club.id,
      title: draft.title.trim(),
      description: draft.description.trim(),
      status: editorMode === 'create' ? 'inactive' : forms.find((form) => form.id === editingFormId)?.status || 'inactive',
      updatedAt: new Date().toLocaleDateString('en-GB'),
      questions: draft.questions.map((question, index) => ({
        id: question.id || `q${index + 1}`,
        label: question.label.trim(),
        placeholder: DEFAULT_ANSWER_PLACEHOLDER,
      })),
    }

    setForms((items) => {
      if (editorMode === 'edit') {
        return items.map((item) => (item.id === editingFormId ? nextForm : item))
      }

      return [nextForm, ...items]
    })
    setDetailForm((form) => (form?.id === nextForm.id ? nextForm : form))
    closeEditor()
  }

  function toggleFormStatus(formId) {
    setForms((items) =>
      items.map((form) => {
        if (form.id === formId) {
          return {
            ...form,
            status: form.status === 'active' ? 'inactive' : 'active',
            updatedAt: new Date().toLocaleDateString('en-GB'),
          }
        }

        return {
          ...form,
          status: items.find((item) => item.id === formId)?.status === 'inactive' ? 'inactive' : form.status,
        }
      })
    )
  }

  if (!canManageForms) {
    return (
      <main className="club-join-form-page">
        <section className="club-join-form-empty">
          <h1>Join Form</h1>
          <p>Only the club leader can manage join forms.</p>
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
