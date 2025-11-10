import { FC, useState, useEffect } from "react";
import clsx from "clsx";
import { ID } from "../../../../../../_metronic/helpers";
import { useQueryResponse } from "../core/QueryResponseProvider";
import { Instructor } from "../core/_models";
import {
  createInstructor,
  getInstructorById,
  updateInstructor,
} from "../core/_requests";

type Props = {
  instructorId?: ID;
  onClose: () => void;
};

const ROLES = [
  {
    id: "admin",
    label: "Admin",
    description: "Full access to all features and data.",
  },
  {
    id: "instructor",
    label: "Instructor",
    description: "Can create and manage courses and grade students.",
  },
  {
    id: "assistant",
    label: "Assistant",
    description: "Helps manage course materials and monitor progress.",
  },
  {
    id: "viewer",
    label: "Viewer",
    description: "Can view dashboards but cannot make changes.",
  },
];

const InstructorEditModalForm: FC<Props> = ({ instructorId, onClose }) => {
  const { refetch } = useQueryResponse();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Instructor>({
    id: undefined,
    name: "",
    email: "",
    password: "",
    courseCount: 0,
    enrollmentCount: 0,
    roles: [],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load instructor data
  useEffect(() => {
    if (instructorId) {
      setLoading(true);
      getInstructorById(instructorId)
        .then((instructor) => {
          if (instructor) {
            setFormData({
              ...instructor,
              roles: instructor.roles || [],
            });
          }
        })
        .catch((err) => console.error("Failed to load instructor:", err))
        .finally(() => setLoading(false));
    }
  }, [instructorId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const updated = { ...errors };
      delete updated[name];
      setErrors(updated);
    }
  };

  const toggleRole = (roleId: string) => {
    setFormData((prev) => {
      const newRoles = (prev.roles || []).includes(roleId)
        ? (prev.roles || []).filter((r) => r !== roleId)
        : [...(prev.roles || []), roleId];
      return { ...prev, roles: newRoles };
    });
    if (errors.roles) {
      const updated = { ...errors };
      delete updated.roles;
      setErrors(updated);
    }
  };

  // const validateForm = (): boolean => {
  //   const newErrors: { [key: string]: string } = {};
  //   if (!formData.name.trim()) newErrors.name = "Name is required";
  //   if (!formData.email.trim()) newErrors.email = "Email is required";
  //   else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
  //     newErrors.email = "Invalid email address";
  //   if (!instructorId && !formData.password.trim())
  //     newErrors.password = "Password is required";
  //   else if (formData.password && formData.password.length < 6)
  //     newErrors.password = "Password must be at least 6 characters";
  //   if (!formData.roles || formData.roles.length === 0)
  //     newErrors.roles = "Select at least one role";

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!validateForm()) return;

    setLoading(true);
    try {
      const data = { ...formData };
      if (instructorId) {
        await updateInstructor(data);
      } else {
        await createInstructor(data);
      }
      await refetch();
      alert(
        instructorId
          ? "Instructor updated successfully!"
          : "Instructor created successfully!"
      );
      onClose();
    } catch (error) {
      console.error("Error saving instructor:", error);
      alert("Failed to save instructor.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && instructorId) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
        <span className="ms-2">Loading...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      {/* --- Basic Info --- */}
      <div className="mb-7">
        <h3 className="fw-bold text-dark mb-5">Instructor Details</h3>

        <div className="fv-row mb-5">
          <label className="required fw-semibold fs-6 mb-2">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={clsx("form-control form-control-solid", {
              "is-invalid": errors.name,
            })}
            placeholder="Enter full name"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="fv-row mb-5">
          <label className="required fw-semibold fs-6 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={clsx("form-control form-control-solid", {
              "is-invalid": errors.email,
            })}
            placeholder="example@domain.com"
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email}</div>
          )}
        </div>

        <div className="fv-row mb-5">
          <label
            className={clsx("fw-semibold fs-6 mb-2", {
              required: !instructorId,
            })}
          >
            Password{" "}
            {instructorId && (
              <span className="text-muted">(leave blank to keep current)</span>
            )}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={clsx("form-control form-control-solid", {
              "is-invalid": errors.password,
            })}
            placeholder={
              instructorId ? "Enter new password (optional)" : "Enter password"
            }
          />
          {errors.password && (
            <div className="invalid-feedback">{errors.password}</div>
          )}
        </div>
      </div>

      {/* --- Roles Selection --- */}
      <div className="mb-7">
        <div className="d-flex align-items-center justify-content-between mb-5">
          <h3 className="fw-bold text-dark mb-0">Assign Roles</h3>
        </div>

        <div className="row">
          {ROLES.map((role) => (
            <div key={role.id} className="col-md-6 mb-3">
              <div className="form-check form-check-custom form-check-solid">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={role.id}
                  checked={(formData.roles || []).includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                />
                <label className="form-check-label" htmlFor={role.id}>
                  <strong>{role.label}</strong>
                  <div className="text-muted small">{role.description}</div>
                </label>
              </div>
            </div>
          ))}
        </div>
        {errors.roles && (
          <div className="text-danger mt-2 small">{errors.roles}</div>
        )}
      </div>

      {/* --- Actions --- */}
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
            (instructorId ? "Update Instructor" : "Create Instructor")}
          {loading && (
            <span className="indicator-progress">
              Please wait...
              <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export { InstructorEditModalForm };
