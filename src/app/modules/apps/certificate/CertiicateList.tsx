import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { KTCard, KTCardBody, KTIcon } from "../../../../_metronic/helpers";
// Adjust paths based on your project structure

// Define the interface based on your API response
interface CertificateTemplate {
  id: string;
  name: string;
  backgroundImage: string;
  created_at: string;
}

const CertificateList: React.FC = () => {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const API_URL =
    "https://mypadminapi.bitmyanmar.info/api/certificate-templates";

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(API_URL);
      setTemplates(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching templates:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setTemplates(templates.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };

  return (
    <KTCard>
      {/* Header */}
      <div className="card-header border-0 pt-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">
            Certificate Templates
          </span>
          <span className="text-muted mt-1 fw-semibold fs-7">
            Manage your certificate designs
          </span>
        </h3>
        <div className="card-toolbar">
          <button
            type="button"
            className="btn btn-sm btn-light-primary"
            onClick={() => navigate("/apps/certificate")}
          >
            <KTIcon iconName="plus" className="fs-2" />
            New Template
          </button>
        </div>
      </div>

      {/* Body */}
      <KTCardBody className="py-3">
        <div className="table-responsive">
          <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
            <thead>
              <tr className="fw-bold text-muted">
                <th className="min-w-150px">Name</th>
                <th className="min-w-140px">Created Date</th>
                <th className="min-w-100px text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="symbol symbol-45px me-5">
                          <div className="symbol-label bg-light-primary text-primary fs-2 fw-bold">
                            {template.name.charAt(0)}
                          </div>
                        </div>
                        <div className="d-flex justify-content-start flex-column">
                          <span className="text-dark fw-bold text-hover-primary fs-6">
                            {template.name}
                          </span>
                          <span className="text-muted fw-semibold text-muted d-block fs-7">
                            ID: {template.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted fw-semibold text-muted d-block fs-7">
                        {new Date(template.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end flex-shrink-0">
                        {/* EDIT BUTTON */}
                        <button
                          onClick={() =>
                            navigate(`/apps/certificate?id=${template.id}`)
                          }
                          className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                        >
                          <KTIcon iconName="pencil" className="fs-3" />
                        </button>

                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                        >
                          <KTIcon iconName="trash" className="fs-3" />
                        </button>
                      </div>
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

export default CertificateList;
