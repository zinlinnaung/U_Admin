import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { KTIcon } from "../../../../_metronic/helpers";

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
  content: Question[];
  created_at: string;
}

const API_URL = "https://mypadminapi.bitmyanmar.info/api/feedback-templates";

const FeedbackSystem: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("id");

  const [activeTab, setActiveTab] = useState<"create" | "preview">("create");
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // States
  const [draftQuestions, setDraftQuestions] = useState<Question[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [form, setForm] = useState<Question>({
    id: Date.now().toString(),
    question: "",
    type: "radio",
    options: ["Option 1"],
  });

  // Load Template if ID exists
  useEffect(() => {
    if (editId) {
      loadTemplate(editId);
    }
  }, [editId]);

  const loadTemplate = async (id: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      setTemplateName(response.data.name);
      setDraftQuestions(response.data.content || []);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const finalizeTemplate = async () => {
    if (!templateName) return alert("Please name this template");
    if (draftQuestions.length === 0) return alert("Add questions first");

    setIsSaving(true);
    const payload = {
      name: templateName,
      description: "Feedback Template",
      content: draftQuestions,
    };

    try {
      if (editId) {
        await axios.patch(`${API_URL}/${editId}`, payload);
        alert("Template updated successfully!");
      } else {
        await axios.post(API_URL, payload);
        alert("New template saved!");
      }
      navigate(-1); // Back to list
    } catch (error) {
      alert("Error saving template.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return <div className="p-10 text-center fs-4">Loading Template...</div>;

  return (
    <div className="card shadow-sm">
      <div className="card-header border-bottom">
        <div className="card-title d-flex align-items-center">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-sm btn-icon btn-light me-4"
          >
            <KTIcon iconName="arrow-left" className="fs-2" />
          </button>
          <h3 className="fw-bolder m-0">
            {editId ? `Edit: ${templateName}` : "Create New Feedback"}
          </h3>
        </div>
        <div className="card-toolbar">
          <ul className="nav nav-tabs nav-line-tabs nav-stretch fs-6 border-0">
            <li className="nav-item">
              <button
                className={`nav-link border-0 ${
                  activeTab === "create" ? "active" : ""
                }`}
                onClick={() => setActiveTab("create")}
              >
                Builder
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link border-0 ${
                  activeTab === "preview" ? "active" : ""
                }`}
                onClick={() => setActiveTab("preview")}
              >
                Preview
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="card-body bg-light-soft">
        {activeTab === "create" ? (
          <div className="row">
            <div className="col-lg-7">
              <div className="card shadow-none border bg-white p-8 mb-5">
                <div className="mb-7">
                  <label className="form-label fw-bold fs-6">
                    Template Name
                  </label>
                  <input
                    className="form-control form-control-solid"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>

                <div className="bg-light rounded p-6 mb-8 border border-dashed border-primary">
                  <h5 className="mb-4">Add New Question</h5>
                  <input
                    className="form-control mb-4"
                    placeholder="Question Text"
                    value={form.question}
                    onChange={(e) =>
                      setForm({ ...form, question: e.target.value })
                    }
                  />
                  <select
                    className="form-select mb-4"
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as any })
                    }
                  >
                    <option value="radio">Single Choice</option>
                    <option value="checkbox">Multiple Choice</option>
                    <option value="text">Text Area</option>
                  </select>

                  {form.type !== "text" && (
                    <div className="mb-4 ps-4 border-start border-3">
                      {form.options.map((opt, i) => (
                        <div key={i} className="d-flex mb-2">
                          <input
                            className="form-control form-control-sm"
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
                        className="btn btn-link btn-sm p-0"
                        onClick={addOption}
                      >
                        + Add Option
                      </button>
                    </div>
                  )}
                  <button
                    className="btn btn-dark w-100"
                    onClick={addQuestionToDraft}
                  >
                    Add Question
                  </button>
                </div>

                <div className="separator mb-6"></div>
                <h5 className="mb-4">
                  Question List ({draftQuestions.length})
                </h5>
                {draftQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="d-flex align-items-center mb-3 p-4 bg-light rounded border"
                  >
                    <span className="badge badge-circle badge-primary me-4">
                      {idx + 1}
                    </span>
                    <div className="flex-grow-1 fw-bold">
                      {q.question}{" "}
                      <span className="text-muted fs-8">({q.type})</span>
                    </div>
                    <button
                      className="btn btn-icon btn-sm btn-light-danger"
                      onClick={() =>
                        setDraftQuestions(
                          draftQuestions.filter((x) => x.id !== q.id)
                        )
                      }
                    >
                      <KTIcon iconName="trash" className="fs-3" />
                    </button>
                  </div>
                ))}

                <button
                  className="btn btn-primary w-100 mt-8 fs-5 fw-bolder"
                  onClick={finalizeTemplate}
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editId
                    ? "Update Template"
                    : "Save Template"}
                </button>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="alert alert-dismissible bg-light-primary d-flex flex-column flex-sm-row p-5 mb-10">
                <KTIcon
                  iconName="information-5"
                  className="fs-2hx text-primary me-4 mb-5 mb-sm-0"
                />
                <div className="d-flex flex-column pe-0 pe-sm-10">
                  <h4 className="fw-semibold">Builder Instructions</h4>
                  <span>
                    Use the form on the left to add questions. Your changes are
                    stored as a draft until you click "Save Template".
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mw-700px mx-auto bg-white p-10 rounded shadow-sm border mt-5">
            <h2 className="text-center mb-10 fw-bolder">
              {templateName || "Form Preview"}
            </h2>
            {draftQuestions.map((q, i) => (
              <div key={q.id} className="mb-10">
                <label className="form-label fw-bolder fs-5 mb-4">
                  {i + 1}. {q.question}
                </label>
                {q.type === "text" ? (
                  <textarea
                    className="form-control form-control-solid"
                    rows={3}
                    placeholder="User response area..."
                  />
                ) : (
                  q.options.map((o, idx) => (
                    <div
                      key={idx}
                      className="form-check form-check-custom form-check-solid mb-4"
                    >
                      <input
                        className="form-check-input"
                        type={q.type === "radio" ? "radio" : "checkbox"}
                        name={`preview-${q.id}`}
                      />
                      <label className="form-check-label fw-bold text-gray-700">
                        {o}
                      </label>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackSystem;
