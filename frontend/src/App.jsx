
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

function App() {
  const emptyForm = {
    name: "",
    email: "",
    password: "",
    gender: "",
    country: "",
    languages: [],
  };

  const [form, setForm] = useState(emptyForm);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState(null);

  async function loadStudents() {
    try {
      const response = await fetch(`${API}/students`);
      if (!response.ok) throw new Error("Could not load students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      setMessage("Cannot connect to backend. Check if it is running.");
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  function handleLanguage(event) {
    const { value, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      languages: checked
        ? [...previous.languages, value]
        : previous.languages.filter((language) => language !== value),
    }));
  }

  async function saveStudent(event) {
    event.preventDefault();
    setMessage("");

    try {
      const url = editId
        ? `${API}/students/${editId}`
        : `${API}/students`;

      const response = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save student");
      }

      setMessage(editId ? "Student updated successfully!" : "Student registered successfully!");
      setForm(emptyForm);
      setEditId(null);
      await loadStudents();
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    }
  }

  function editStudent(student) {
    setForm({
      name: student.name || "",
      email: student.email || "",
      password: student.password || "",
      gender: student.gender || "",
      country: student.country || "",
      languages: student.languages || [],
    });

    setEditId(student._id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteStudent(id) {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/students/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Unable to delete student");

      setMessage("Student deleted successfully!");
      await loadStudents();
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditId(null);
    setMessage("");
  }

  return (
    <main className="container">
      <h1>Student Registration System</h1>

      <section className="card">
        <h2>{editId ? "Update Student" : "Register Student"}</h2>

        {message && <p className="message">{message}</p>}

        <form onSubmit={saveStudent}>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label>Gender</label>
          <div className="options">
            {["Male", "Female", "Other"].map((gender) => (
              <label key={gender} className="option">
                <input
                  type="radio"
                  name="gender"
                  value={gender}
                  checked={form.gender === gender}
                  onChange={handleChange}
                  required
                />
                {gender}
              </label>
            ))}
          </div>

          <label htmlFor="country">Country</label>
          <select
            id="country"
            name="country"
            value={form.country}
            onChange={handleChange}
            required
          >
            <option value="">Select country</option>
            <option value="India">India</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
          </select>

          <label>Languages Known</label>
          <div className="options">
            {["English", "Hindi", "Tamil", "Telugu"].map((language) => (
              <label key={language} className="option">
                <input
                  type="checkbox"
                  value={language}
                  checked={form.languages.includes(language)}
                  onChange={handleLanguage}
                />
                {language}
              </label>
            ))}
          </div>

          <div className="buttons">
            <button type="submit">
              {editId ? "Update Student" : "Register"}
            </button>
            <button type="button" className="secondary" onClick={resetForm}>
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Registered Students</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Country</th>
                <th>Languages</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6">No students registered yet.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.gender}</td>
                    <td>{student.country}</td>
                    <td>{(student.languages || []).join(", ")}</td>
                    <td>
                      <button onClick={() => editStudent(student)}>
                        Edit
                      </button>
                      <button
                        className="danger"
                        onClick={() => deleteStudent(student._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default App;