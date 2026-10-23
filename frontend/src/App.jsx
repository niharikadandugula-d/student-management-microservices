
import { useEffect, useState } from 'react'
import './App.css'

const API = 'http://127.0.0.1:8000'

const emptyStudentForm = {
  name: '',
  email: '',
  age: '',
  course: 'Python Programming',
}

const emptyCourseForm = {
  title: '',
  description: '',
  instructor: '',
  duration: '',
}

function App() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [studentForm, setStudentForm] = useState({ ...emptyStudentForm })
  const [courseForm, setCourseForm] = useState({ ...emptyCourseForm })
  const [activeTab, setActiveTab] = useState('students')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingStudentId, setEditingStudentId] = useState(null)

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const text = await response.text()
      let detail = text

      try {
        const parsed = JSON.parse(text)
        detail = parsed.detail || text
      } catch {
        // Keep the original response text.
      }

      throw new Error(detail || `Request failed: ${response.status}`)
    }

    if (response.status === 204) return null
    return response.json()
  }

  async function loadData() {
    setLoading(true)

    try {
      const [studentData, courseData] = await Promise.all([
        request('/students'),
        request('/courses'),
      ])

      setStudents(Array.isArray(studentData) ? studentData : [])
      setCourses(Array.isArray(courseData) ? courseData : [])
    } catch (error) {
      setMessage(
        `Could not load data. Check that the API Gateway and services are running. ${error.message}`
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function resetStudentForm() {
    setStudentForm({ ...emptyStudentForm })
    setEditingStudentId(null)
  }

  function startEditStudent(student) {
    setEditingStudentId(student.id)
    setStudentForm({
      name: student.name || '',
      email: student.email || '',
      age: String(student.age ?? ''),
      course: student.course || '',
    })
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditStudent() {
    resetStudentForm()
    setMessage('')
  }

  async function handleStudentSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    const isEditing = editingStudentId !== null

    try {
      const payload = {
        name: studentForm.name.trim(),
        email: studentForm.email.trim(),
        age: Number(studentForm.age),
        course: studentForm.course.trim(),
      }

      if (isEditing) {
        await request(`/students/${editingStudentId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      } else {
        await request('/students', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }

      resetStudentForm()
      await loadData()
      setMessage(
        isEditing
          ? 'Student updated successfully.'
          : 'Student added successfully.'
      )
    } catch (error) {
      setMessage(
        `Could not ${isEditing ? 'update' : 'add'} student: ${error.message}`
      )
    } finally {
      setSaving(false)
    }
  }

  async function deleteStudent(id) {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return
    }

    try {
      await request(`/students/${id}`, { method: 'DELETE' })

      if (editingStudentId === id) {
        resetStudentForm()
      }

      await loadData()
      setMessage('Student deleted successfully.')
    } catch (error) {
      setMessage(`Could not delete student: ${error.message}`)
    }
  }

  async function addCourse(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await request('/courses', {
        method: 'POST',
        body: JSON.stringify({
          title: courseForm.title.trim(),
          description: courseForm.description.trim(),
          instructor: courseForm.instructor.trim(),
          duration: courseForm.duration.trim(),
        }),
      })

      setCourseForm({ ...emptyCourseForm })
      await loadData()
      setMessage('Course added successfully.')
    } catch (error) {
      setMessage(`Could not add course: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function deleteCourse(id) {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return
    }

    try {
      await request(`/courses/${id}`, { method: 'DELETE' })
      await loadData()
      setMessage('Course deleted successfully.')
    } catch (error) {
      setMessage(`Could not delete course: ${error.message}`)
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>StudentHub</h2>
            <span>Management System</span>
          </div>
        </div>

        <p className="menu-label">WORKSPACE</p>

        <button
          type="button"
          className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <span>▦</span> Students
          <span className="nav-count">{students.length}</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <span>▤</span> Courses
          <span className="nav-count">{courses.length}</span>
        </button>

        <div className="sidebar-footer">
          <span className="status-dot" />
          Microservices connected
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">STUDENT MANAGEMENT PLATFORM</p>
            <h1>StudentHub Dashboard</h1>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={loadData}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </header>

        <section className="welcome-section">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h2>Manage your students and courses</h2>
            <p>
              Create, view, edit, and manage records from one dashboard.
            </p>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <p>Total Students</p>
            <h2>{students.length}</h2>
            <span>Registered student records</span>
          </div>

          <div className="stat-card">
            <p>Total Courses</p>
            <h2>{courses.length}</h2>
            <span>Available course records</span>
          </div>

          <div className="stat-card">
            <p>System Status</p>
            <h2 className="healthy-text">Connected</h2>
            <span>API Gateway · Port 8000</span>
          </div>
        </section>

        {message && (
          <div className="message-banner" role="status">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage('')}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        <section className="workspace">
          <div className="section-heading">
            <div>
              <p className="eyebrow">RECORD MANAGEMENT</p>
              <h2>
                {activeTab === 'students'
                  ? 'Student directory'
                  : 'Course directory'}
              </h2>
            </div>

            <span className="record-badge">
              {activeTab === 'students'
                ? students.length
                : courses.length}{' '}
              records
            </span>
          </div>

          {activeTab === 'students' ? (
            <>
              <form
                className="entry-form"
                onSubmit={handleStudentSubmit}
              >
                <h3>
                  {editingStudentId !== null
                    ? `Edit student #${editingStudentId}`
                    : 'Add a student'}
                </h3>

                <div className="form-grid">
                  <label>
                    Student name
                    <input
                      required
                      minLength={2}
                      placeholder="Enter full name"
                      value={studentForm.name}
                      onChange={(event) =>
                        setStudentForm({
                          ...studentForm,
                          name: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Email address
                    <input
                      required
                      type="email"
                      placeholder="student@example.com"
                      value={studentForm.email}
                      onChange={(event) =>
                        setStudentForm({
                          ...studentForm,
                          email: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Age
                    <input
                      required
                      type="number"
                      min="1"
                      max="120"
                      placeholder="Enter age"
                      value={studentForm.age}
                      onChange={(event) =>
                        setStudentForm({
                          ...studentForm,
                          age: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Course
                    <input
                      required
                      minLength={2}
                      placeholder="Enter course name"
                      value={studentForm.course}
                      onChange={(event) =>
                        setStudentForm({
                          ...studentForm,
                          course: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? 'Saving...'
                      : editingStudentId !== null
                        ? 'Update Student'
                        : '+ Add Student'}
                  </button>

                  {editingStudentId !== null && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={cancelEditStudent}
                      disabled={saving}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>

              <div className="table-container">
                {loading ? (
                  <p className="empty-state">Loading students...</p>
                ) : students.length === 0 ? (
                  <p className="empty-state">
                    No students found. Add your first student above.
                  </p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Age</th>
                        <th>Course</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td>#{student.id}</td>
                          <td>
                            <div className="person-cell">
                              <div className="avatar">
                                {(student.name || 'S')
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <strong>{student.name}</strong>
                            </div>
                          </td>
                          <td>{student.email}</td>
                          <td>{student.age}</td>
                          <td>{student.course}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                type="button"
                                className="edit-button"
                                onClick={() => startEditStudent(student)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="delete-button"
                                onClick={() => deleteStudent(student.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <>
              <form className="entry-form" onSubmit={addCourse}>
                <h3>Add a course</h3>

                <div className="form-grid">
                  <label>
                    Course title
                    <input
                      required
                      placeholder="Enter course title"
                      value={courseForm.title}
                      onChange={(event) =>
                        setCourseForm({
                          ...courseForm,
                          title: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Instructor
                    <input
                      required
                      placeholder="Enter instructor name"
                      value={courseForm.instructor}
                      onChange={(event) =>
                        setCourseForm({
                          ...courseForm,
                          instructor: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Duration
                    <input
                      required
                      placeholder="Example: 8 weeks"
                      value={courseForm.duration}
                      onChange={(event) =>
                        setCourseForm({
                          ...courseForm,
                          duration: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Description
                    <input
                      required
                      placeholder="Describe the course"
                      value={courseForm.description}
                      onChange={(event) =>
                        setCourseForm({
                          ...courseForm,
                          description: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : '+ Add Course'}
                  </button>
                </div>
              </form>

              <div className="table-container">
                {loading ? (
                  <p className="empty-state">Loading courses...</p>
                ) : courses.length === 0 ? (
                  <p className="empty-state">
                    No courses found. Add your first course above.
                  </p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Course</th>
                        <th>Description</th>
                        <th>Instructor</th>
                        <th>Duration</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id}>
                          <td>#{course.id}</td>
                          <td>
                            <strong>{course.title}</strong>
                          </td>
                          <td>{course.description}</td>
                          <td>{course.instructor}</td>
                          <td>{course.duration}</td>
                          <td>
                            <button
                              type="button"
                              className="delete-button"
                              onClick={() => deleteCourse(course.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </section>

        <footer className="page-footer">
          StudentHub Management System · React + FastAPI Microservices
        </footer>
      </main>
    </div>
  )
}

export default App
