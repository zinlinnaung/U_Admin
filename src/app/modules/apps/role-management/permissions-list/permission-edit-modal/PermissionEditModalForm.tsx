import { FC, useState, useEffect } from "react";
import clsx from "clsx";
import { ID } from "../../../../../../_metronic/helpers";
import { useQueryResponse } from "../core/QueryResponseProvider";
import { Permission, PERMISSION_MODULES } from "../../core/_models";
import {
  createPermission,
  getPermissionById,
  updatePermission,
} from "../../core/_requests";

type Props = {
  permissionId?: ID;
  onClose: () => void;
};

const PermissionEditModalForm: FC<Props> = ({ permissionId, onClose }) => {
  const { refetch } = useQueryResponse();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Permission>({
    id: undefined,
    name: "",
    slug: "",
    module: "",
    description: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (permissionId) {
      setLoading(true);
      getPermissionById(permissionId)
        .then((permission) => {
          if (permission) {
            setFormData((prev) => ({
              ...prev,
              ...permission,
            }));
          }
        })
        .catch((error) => console.error("❌ Error loading permission:", error))
        .finally(() => setLoading(false));
    } else {
      setFormData({
        id: undefined,
        name: "",
        slug: "",
        module: "",
        description: "",
      });
    }
  }, [permissionId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Auto-generate slug from name
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .replace(/\s+/g, ".")
        .replace(/[^a-z0-9.]/g, "");
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: slug,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Permission name is required";
    }

    if (!formData.slug?.trim()) {
      newErrors.slug = "Permission slug is required";
    }

    if (!formData.module?.trim()) {
      newErrors.module = "Module is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (permissionId) {
        await updatePermission(formData);
        alert("Permission updated successfully!");
      } else {
        await createPermission(formData);
        alert("Permission created successfully!");
      }

      await refetch();
      onClose();
    } catch (error) {
      console.error("❌ Error saving permission:", error);
      alert("Error saving permission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && permissionId) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
        <span className="ms-2">Loading...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="mb-7">
        <h3 className="fw-bold text-dark mb-5">Permission Information</h3>

        {/* Permission Name */}
        <div className="fv-row mb-5">
          <label className="required fw-semibold fs-6 mb-2">
            Permission Name
          </label>
          <input
            type="text"
            name="name"
            className={clsx("form-control form-control-solid", {
              "is-invalid": errors.name,
            })}
            placeholder="Enter permission name (e.g., Create Course)"
            value={formData.name || ""}
            onChange={handleInputChange}
            disabled={loading}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        {/* Permission Slug */}
        <div className="fv-row mb-5">
          <label className="required fw-semibold fs-6 mb-2">
            Permission Slug
          </label>
          <input
            type="text"
            name="slug"
            className={clsx("form-control form-control-solid", {
              "is-invalid": errors.slug,
            })}
            placeholder="Auto-generated (e.g., course.create)"
            value={formData.slug || ""}
            onChange={handleInputChange}
            disabled={loading}
          />
          {errors.slug && <div className="invalid-feedback">{errors.slug}</div>}
          <div className="form-text">
            Format: module.action (e.g., course.create, student.view)
          </div>
        </div>

        {/* Module */}
        <div className="fv-row mb-5">
          <label className="required fw-semibold fs-6 mb-2">Module</label>
          <select
            name="module"
            className={clsx("form-select form-select-solid", {
              "is-invalid": errors.module,
            })}
            value={formData.module || ""}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="">Select Module</option>
            {PERMISSION_MODULES.map((module) => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>
          {errors.module && (
            <div className="invalid-feedback">{errors.module}</div>
          )}
        </div>

        {/* Description */}
        <div className="fv-row mb-5">
          <label className="fw-semibold fs-6 mb-2">Description</label>
          <textarea
            name="description"
            className="form-control form-control-solid"
            rows={3}
            placeholder="Enter permission description"
            value={formData.description || ""}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="text-end">
        <button
          type="button"
          className="btn btn-light me-3"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {!loading &&
            (permissionId ? "Update Permission" : "Create Permission")}
          {loading && (
            <span className="indicator-progress" style={{ display: "block" }}>
              Please wait...
              <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export { PermissionEditModalForm };
