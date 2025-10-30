import { FC, useState, useEffect } from "react";
import clsx from "clsx";
import { ID } from "../../../../../../../_metronic/helpers";
import { useQueryResponse } from "../../core/QueryResponseProvider";
import { Student } from "../../core/_models";
import {
  createStudent,
  getStudentById,
  updateStudent,
} from "../../core/_requests";

type Props = {
  studentId?: ID;
  onClose: () => void;
};

const StudentEditModalForm: FC<Props> = ({ studentId, onClose }) => {
  const { refetch } = useQueryResponse();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Student>({
    id: undefined,
    name: "",
    email: "",
    password: "", // ✅ Added password field
    enrollmentDate: "",
    courseCount: 0,
    gpa: 0,
    status: "Active",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (studentId) {
      setLoading(true);
      getStudentById(studentId)
        .then((student) => {
          if (student) {
            setFormData((prev) => ({
              ...prev,
              ...student,
              password: "", // keep blank when editing for security
            }));
          }
        })
        .catch((error) => console.error("❌ Error loading student:", error))
        .finally(() => setLoading(false));
    } else {
      setFormData({
        id: undefined,
        name: "",
        email: "",
        password: "",
        enrollmentDate: "",
        courseCount: 0,
        gpa: 0,
        status: "Active",
      });
    }
  }, [studentId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "gpa" || name === "courseCount"
          ? parseFloat(value) || 0
          : value,
    }));
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

    if (!formData.name?.trim()) newErrors.name = "Name is required";

    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!studentId && !formData.password?.trim()) {
      // only required when creating
      newErrors.password = "Password is required";
    }

    if (formData.gpa !== undefined && (formData.gpa < 0 || formData.gpa > 4))
      newErrors.gpa = "GPA must be between 0 and 4";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const studentData = { ...formData };

      if (studentId) {
        // Don't send empty password if user didn't change it
        if (!studentData.password) delete studentData.password;

        await updateStudent(studentData);
        alert("Student updated successfully!");
      } else {
        await createStudent(studentData);
        alert("Student created successfully!");
      }

      await refetch();
      onClose();
    } catch (error) {
      console.error("❌ Error saving student:", error);
      alert("Error saving student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && studentId) {
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
        <h3 className="fw-bold text-dark mb-5">Student Information</h3>

        {/* Name */}
        <div className="fv-row mb-5">
          <label className="required fw-semibold fs-6 mb-2">Full Name</label>
          <input
            type="text"
            name="name"
            className={clsx("form-control form-control-solid", {
              "is-invalid": errors.name,
            })}
            placeholder="Enter student name"
            value={formData.name || ""}
            onChange={handleInputChange}
            disabled={loading}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        {/* Email */}
        <div className="fv-row mb-5">
          <label className="required fw-semibold fs-6 mb-2">Email</label>
          <input
            type="email"
            name="email"
            className={clsx("form-control form-control-solid", {
              "is-invalid": errors.email,
            })}
            placeholder="student@university.edu"
            value={formData.email || ""}
            onChange={handleInputChange}
            disabled={loading}
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email}</div>
          )}
        </div>

        {/* ✅ Password */}
        <div className="fv-row mb-5 position-relative">
          <label
            className={clsx("fw-semibold fs-6 mb-2", {
              required: !studentId,
            })}
          >
            Password
          </label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className={clsx("form-control form-control-solid", {
                "is-invalid": errors.password,
              })}
              placeholder={
                studentId
                  ? "Leave blank to keep current password"
                  : "Enter password"
              }
              value={formData.password || ""}
              onChange={handleInputChange}
              disabled={loading}
            />
            <button
              type="button"
              className="btn btn-icon btn-light"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              <i
                className={clsx(
                  "ki-duotone",
                  showPassword ? "ki-eye-slash" : "ki-eye"
                )}
              ></i>
            </button>
          </div>
          {errors.password && (
            <div className="invalid-feedback d-block">{errors.password}</div>
          )}
        </div>

        <div className="row">
          <div className="col-md-6">
            {/* GPA */}
            <div className="fv-row mb-5">
              <label className="fw-semibold fs-6 mb-2">GPA</label>
              <input
                type="number"
                name="gpa"
                step="0.01"
                min="0"
                max="4"
                className={clsx("form-control form-control-solid", {
                  "is-invalid": errors.gpa,
                })}
                placeholder="0.00"
                value={formData.gpa || ""}
                onChange={handleInputChange}
                disabled={loading}
              />
              {errors.gpa && (
                <div className="invalid-feedback">{errors.gpa}</div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="col-md-6">
            <div className="fv-row mb-5">
              <label className="fw-semibold fs-6 mb-2">Status</label>
              <select
                name="status"
                className="form-select form-select-solid"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enrollment Date */}
        <div className="fv-row mb-5">
          <label className="fw-semibold fs-6 mb-2">Enrollment Date</label>
          <input
            type="date"
            name="enrollmentDate"
            className="form-control form-control-solid"
            value={formData.enrollmentDate || ""}
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
          {!loading && (studentId ? "Update Student" : "Create Student")}
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

export { StudentEditModalForm };
