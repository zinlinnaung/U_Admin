import React, { useState, useEffect } from "react";
import axios from "axios";

// --- Types ---
interface Question {
  id: string;
  question: string;
  type: "radio" | "checkbox" | "text";
  options: string[];
}

interface FeedbackTemplate {
  id: string;
  name: string;
  content: Question[]; // Changed from 'questions' to 'content' to match backend
  created_at: string;
}

const API_URL = "https://mypadminapi.bitmyanmar.info/api/feedback-templates"; // Update with your actual URL

const FeedbackSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"create" | "preview">("create");
  const [templates, setTemplates] = useState<FeedbackTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  // Draft States
  const [draftQuestions, setDraftQuestions] = useState<Question[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [form, setForm] = useState<Question>({
    id: Date.now().toString(),
    question: "",
    type: "radio",
    options: ["Option 1"],
  });

  // --- API: Fetch All Templates ---
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // --- Handlers ---
  const addOption = () =>
    setForm({
      ...form,
      options: [...form.options, `Option ${form.options.length + 1}`],
    });

  const addQuestionToDraft = () => {
    if (!form.question) return alert("Enter a question");
    setDraftQuestions([
      ...draftQuestions,
      { ...form, id: Math.random().toString(36).substr(2, 9) },
    ]);
    setForm({
      id: Date.now().toString(),
      question: "",
      type: "radio",
      options: ["Option 1"],
    });
  };

  // --- API: Save Template ---
  const finalizeTemplate = async () => {
    if (!templateName) return alert("Please name this template");
    if (draftQuestions.length === 0) return alert("Add questions first");

    const payload = {
      name: templateName,
      description: "Feedback Template",
      content: draftQuestions, // Array of questions
    };

    try {
      await axios.post(API_URL, payload);
      alert("Template saved to database!");
      setDraftQuestions([]);
      setTemplateName("");
      fetchTemplates(); // Refresh list
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template.");
    }
  };

  // --- API: Delete Template ---
  const deleteTemplate = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  return (
    <div className="card card-custom shadow-sm">
      <div className="card-header card-header-stretch border-bottom">
        <div className="card-title">
          <h3 className="fw-bolder text-dark">Feedback Management</h3>
        </div>
        <div className="card-toolbar">
          <ul className="nav nav-tabs nav-line-tabs nav-stretch fs-6 border-0">
            <li className="nav-item">
              <a
                className={`nav-link cursor-pointer ${
                  activeTab === "create" ? "active" : ""
                }`}
                onClick={() => setActiveTab("create")}
              >
                Create & Library
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link cursor-pointer ${
                  activeTab === "preview" ? "active" : ""
                }`}
                onClick={() => setActiveTab("preview")}
              >
                Form Preview
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="card-body bg-light-soft">
        {activeTab === "create" ? (
          <div className="row">
            {/* LEFT SIDE: BUILDER */}
            <div className="col-lg-7">
              <div className="card shadow-none border bg-white p-8">
                <h4 className="fw-bolder mb-6 text-primary">
                  Step 1: Build Template
                </h4>
                <div className="mb-7">
                  <label className="form-label fw-bold">Template Name</label>
                  <input
                    className="form-control form-control-solid border-primary"
                    placeholder="Template Title"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>

                <div className="bg-light rounded p-5 mb-5 border border-dashed">
                  <label className="form-label fw-bold text-dark">
                    New Question
                  </label>
                  <input
                    className="form-control mb-3"
                    placeholder="Question text..."
                    value={form.question}
                    onChange={(e) =>
                      setForm({ ...form, question: e.target.value })
                    }
                  />
                  <select
                    className="form-select mb-3"
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as any })
                    }
                  >
                    <option value="radio">Single Choice</option>
                    <option value="checkbox">Multiple Choice</option>
                    <option value="text">Text Box</option>
                  </select>
                  {form.type !== "text" && (
                    <div className="mb-3">
                      {form.options.map((opt, i) => (
                        <div key={i} className="d-flex mb-2">
                          <input
                            className="form-control form-control-sm me-2"
                            value={opt}
                            onChange={(e) => {
                              const n = [...form.options];
                              n[i] = e.target.value;
                              setForm({ ...form, options: n });
                            }}
                          />
                        </div>
                      ))}
                      <button
                        className="btn btn-sm btn-link"
                        onClick={addOption}
                      >
                        + Add Option
                      </button>
                    </div>
                  )}
                  <button
                    className="btn btn-sm btn-dark w-100 fw-bold"
                    onClick={addQuestionToDraft}
                  >
                    Add Question to List
                  </button>
                </div>

                <div className="separator my-5"></div>
                <h5 className="mb-4">
                  Draft ({draftQuestions.length} Questions)
                </h5>
                {draftQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="d-flex align-items-center mb-3 bg-white border p-3 rounded"
                  >
                    <span className="badge badge-light-primary me-3">
                      {idx + 1}
                    </span>
                    <div className="flex-grow-1 fw-bold text-gray-700">
                      {q.question}
                    </div>
                    <button
                      className="btn btn-sm btn-icon btn-light-danger"
                      onClick={() =>
                        setDraftQuestions(
                          draftQuestions.filter((x) => x.id !== q.id)
                        )
                      }
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-primary w-100 mt-5 fw-bolder"
                  onClick={finalizeTemplate}
                  disabled={draftQuestions.length === 0}
                >
                  Save Template to Database
                </button>
              </div>
            </div>

            {/* RIGHT SIDE: LIBRARY */}
            <div className="col-lg-5">
              <div className="ps-lg-5">
                <h4 className="fw-bolder mb-6">Available Templates</h4>
                {loading ? (
                  <p>Loading...</p>
                ) : templates.length === 0 ? (
                  <p className="text-muted">No templates found.</p>
                ) : (
                  templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="card border-0 shadow-sm mb-5 bg-white"
                    >
                      <div className="card-body p-5">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="fs-5 fw-bolder text-gray-800">
                            {tpl.name}
                          </span>
                          <span className="badge badge-light-success">
                            {tpl.content?.length || 0} Qs
                          </span>
                        </div>
                        <div className="text-muted fs-7 mb-4">
                          Created:{" "}
                          {new Date(tpl.created_at).toLocaleDateString()}
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-light-primary flex-grow-1 fw-bold"
                            onClick={() => setActiveTab("preview")}
                          >
                            View Preview
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-light-danger"
                            onClick={() => deleteTemplate(tpl.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* PREVIEW TAB */
          <div className="max-w-600px mx-auto bg-white p-10 rounded border shadow-sm mt-5">
            <h2 className="fw-bolder mb-8 text-center">
              Live Preview (Latest)
            </h2>
            {templates.length === 0 ? (
              <p className="text-center">No template available.</p>
            ) : (
              templates[0].content.map((q, i) => (
                <div key={q.id} className="mb-8">
                  <label className="form-label fw-bolder fs-5 text-dark">
                    {i + 1}. {q.question}
                  </label>
                  {q.type === "text" ? (
                    <textarea
                      className="form-control form-control-solid"
                      rows={2}
                    />
                  ) : (
                    q.options.map((o, idx) => (
                      <div
                        key={idx}
                        className="form-check form-check-custom form-check-solid mb-3"
                      >
                        <input className="form-check-input" type={q.type} />
                        <label className="form-check-label fw-bold text-gray-600">
                          {o}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackSystem;
