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

const PERMISSIONS = [
  {
    id: "create_course",
    label: "Create Course",
    description: "Can create new courses",
  },
  {
    id: "edit_course",
    label: "Edit Course",
    description: "Can edit existing courses",
  },
  {
    id: "delete_course",
    label: "Delete Course",
    description: "Can delete courses",
  },
  {
    id: "view_analytics",
    label: "View Analytics",
    description: "Can view course analytics",
  },
  {
    id: "manage_students",
    label: "Manage Students",
    description: "Can manage student enrollments",
  },
  {
    id: "grade_assignments",
    label: "Grade Assignments",
    description: "Can grade student work",
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
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load instructor data when editing
  useEffect(() => {
    if (instructorId) {
      console.log("🔍 Loading instructor:", instructorId);
      setLoading(true);
      getInstructorById(instructorId)
        .then((instructor) => {
          if (instructor) {
            console.log("✅ Loaded instructor:", instructor);
            setFormData(instructor);
          }
        })
        .catch((error) => {
          console.error("❌ Error loading instructor:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Reset form for new instructor
      setFormData({
        id: undefined,
        name: "",
        email: "",
        password: "",
        courseCount: 0,
        enrollmentCount: 0,
      });
    }
  }, [instructorId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const selectAllPermissions = () => {
    setSelectedPermissions(PERMISSIONS.map((p) => p.id));
  };

  const deselectAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!instructorId && !formData.password?.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const instructorData = {
        ...formData,
      };

      if (instructorId) {
        console.log("📝 Updating instructor:", instructorData);
        await updateInstructor(instructorData);
        console.log("✅ Instructor updated successfully");
      } else {
        console.log("➕ Creating instructor:", instructorData);
        await createInstructor(instructorData);
        console.log("✅ Instructor created successfully");
      }

      await refetch();
      console.log("🔄 List refreshed");

      alert(
        instructorId
          ? "Instructor updated successfully!"
          : "Instructor created successfully!"
      );

      onClose();
    } catch (error) {
      console.error("❌ Error saving instructor:", error);
      alert("Error saving instructor. Please try again.");
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
      <div className="mb-7">
        <h3 className="fw-bold text-dark mb-5">Basic Information</h3>

        <div className="fv-row mb-5">
          <label className="required fw-semibold fs-6 mb-2">Full Name</label>
          <input
            type="text"
            name="name"
            className={clsx("form-control form-control-solid", {
              "is-invalid": errors.name,
            })}
            placeholder="Enter instructor name"
            value={formData.name || ""}
            onChange={handleInputChange}
            disabled={loading}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="fv-row mb-5">
          <label className="required fw-semibold fs-6 mb-2">Email</label>
          <input
            type="email"
            name="email"
            className={clsx("form-control form-control-solid", {
              "is-invalid": errors.email,
            })}
            placeholder="example@university.edu"
            value={formData.email || ""}
            onChange={handleInputChange}
            disabled={loading}
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
            className={clsx("form-control form-control-solid", {
              "is-invalid": errors.password,
            })}
            placeholder={
              instructorId ? "Enter new password (optional)" : "Enter password"
            }
            value={formData.password || ""}
            onChange={handleInputChange}
            disabled={loading}
          />
          {errors.password && (
            <div className="invalid-feedback">{errors.password}</div>
          )}
        </div>
      </div>

      <div className="mb-7">
        <div className="d-flex align-items-center justify-content-between mb-5">
          <h3 className="fw-bold text-dark mb-0">Permissions</h3>
          <div>
            <button
              type="button"
              className="btn btn-sm btn-light me-2"
              onClick={selectAllPermissions}
              disabled={loading}
            >
              Select All
            </button>
            <button
              type="button"
              className="btn btn-sm btn-light"
              onClick={deselectAllPermissions}
              disabled={loading}
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className="row g-3">
          {PERMISSIONS.map((permission) => (
            <div key={permission.id} className="col-md-6">
              <div className="form-check form-check-custom form-check-solid">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`permission_${permission.id}`}
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={() => handlePermissionToggle(permission.id)}
                  disabled={loading}
                />
                <label
                  className="form-check-label"
                  htmlFor={`permission_${permission.id}`}
                >
                  <div className="fw-bold text-gray-800">
                    {permission.label}
                  </div>
                  <div className="text-gray-600 fs-7">
                    {permission.description}
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPermissions.length > 0 && (
        <div className="mb-7">
          <div className="notice d-flex bg-light-primary rounded border-primary border border-dashed p-6">
            <i className="ki-duotone ki-shield-tick fs-2tx text-primary me-4">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            <div className="d-flex flex-stack flex-grow-1">
              <div className="fw-semibold">
                <h4 className="text-gray-900 fw-bold">
                  {selectedPermissions.length} Permission
                  {selectedPermissions.length !== 1 ? "s" : ""} Selected
                </h4>
                <div className="fs-6 text-gray-700">
                  {PERMISSIONS.filter((p) => selectedPermissions.includes(p.id))
                    .map((p) => p.label)
                    .join(", ")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

export { InstructorEditModalForm };
