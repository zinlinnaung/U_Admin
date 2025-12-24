import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { KTCard, KTCardBody, KTIcon } from "../../../../_metronic/helpers";

interface FeedbackTemplate {
  id: string;
  name: string;
  content: any[];
  created_at: string;
}

const FeedbackList: React.FC = () => {
  const [templates, setTemplates] = useState<FeedbackTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = "https://mypadminapi.bitmyanmar.info/api/feedback-templates";

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const deleteTemplate = async (id: string) => {
    if (!window.confirm("Delete this feedback template?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (error) {
      alert("Delete failed");
    }
  };

  return (
    <KTCard>
      <div className="card-header border-0 pt-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">
            Feedback Templates
          </span>
          <span className="text-muted mt-1 fw-semibold fs-7">
            Manage survey forms and questions
          </span>
        </h3>
        <div className="card-toolbar">
          <button
            className="btn btn-sm btn-light-primary"
            onClick={() => navigate("/apps/feedback")}
          >
            <KTIcon iconName="plus" className="fs-2" /> New Feedback
          </button>
        </div>
      </div>

      <KTCardBody className="py-3">
        <div className="table-responsive">
          <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
            <thead>
              <tr className="fw-bold text-muted">
                <th className="min-w-200px">Template Name</th>
                <th className="min-w-100px">Questions</th>
                <th className="min-w-150px">Created At</th>
                <th className="min-w-100px text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : (
                templates.map((tpl) => (
                  <tr key={tpl.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="symbol symbol-45px me-5">
                          <span className="symbol-label bg-light-warning text-warning fw-bold">
                            {tpl.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-dark fw-bold text-hover-primary fs-6">
                          {tpl.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-light-info">
                        {tpl.content?.length || 0} Qs
                      </span>
                    </td>
                    <td>{new Date(tpl.created_at).toLocaleDateString()}</td>
                    <td className="text-end">
                      <button
                        onClick={() => navigate(`/apps/feedback?id=${tpl.id}`)}
                        className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                      >
                        <KTIcon iconName="pencil" className="fs-3" />
                      </button>
                      <button
                        onClick={() => deleteTemplate(tpl.id)}
                        className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                      >
                        <KTIcon iconName="trash" className="fs-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </KTCardBody>
    </KTCard>
  );
};

export default FeedbackList;
