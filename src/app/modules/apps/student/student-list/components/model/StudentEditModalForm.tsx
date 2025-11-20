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
    username: "",
    password: "",
    email: "",
    phone: "",
    displayName: "",
    region: "",
    township: "",
    country: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    gender: "",
    platform: "Facebook",
    platformOtherText: "",
    specialNeeds: false,
    acceptedTerms: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load student when editing
  useEffect(() => {
    if (!studentId) return;

    setLoading(true);

    getStudentById(studentId)
      .then((student) => {
        if (student) {
          setFormData({
            ...student,
            password: "", // blank for edit
          });
        }
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.username.trim()) newErrors.username = "Username required";
    if (!formData.email.trim()) newErrors.email = "Email required";
    if (!formData.displayName.trim())
      newErrors.displayName = "Display name required";

    if (!studentId && !formData.password.trim())
      newErrors.password = "Password required";

    if (!formData.gender.trim()) newErrors.gender = "Gender required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const data = { ...formData };
      if (studentId && !data.password) delete data.password;

      if (studentId) {
        await updateStudent(data);
        alert("Student updated!");
      } else {
        await createStudent(data);
        alert("Student created!");
      }

      await refetch();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Saving failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && studentId) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border spinner-border-sm me-2"></span>
        Loading...
      </div>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3 className="fw-bold mb-7">Student Information</h3>

      {/* Username */}
      <div className="fv-row mb-5">
        <label className="required fw-semibold mb-2">Username</label>
        <input
          type="text"
          name="username"
          className={clsx("form-control form-control-solid", {
            "is-invalid": errors.username,
          })}
          value={formData.username}
          onChange={handleInputChange}
        />
        {errors.username && (
          <div className="invalid-feedback">{errors.username}</div>
        )}
      </div>

      {/* Email */}
      <div className="fv-row mb-5">
        <label className="required fw-semibold mb-2">Email</label>
        <input
          type="email"
          name="email"
          className={clsx("form-control form-control-solid", {
            "is-invalid": errors.email,
          })}
          value={formData.email}
          onChange={handleInputChange}
        />
        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
      </div>

      {/* Display Name */}
      <div className="fv-row mb-5">
        <label className="required fw-semibold mb-2">Display Name</label>
        <input
          type="text"
          name="displayName"
          className={clsx("form-control form-control-solid", {
            "is-invalid": errors.displayName,
          })}
          value={formData.displayName}
          onChange={handleInputChange}
        />
        {errors.displayName && (
          <div className="invalid-feedback">{errors.displayName}</div>
        )}
      </div>

      {/* Password */}
      <div className="fv-row mb-5">
        <label className={clsx("fw-semibold mb-2", { required: !studentId })}>
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
              studentId ? "Leave blank to keep existing" : "Enter password"
            }
            value={formData.password}
            onChange={handleInputChange}
          />
          <button
            type="button"
            className="btn btn-light"
            onClick={() => setShowPassword(!showPassword)}
          >
            <i
              className={
                showPassword ? "ki-outline ki-eye-slash" : "ki-outline ki-eye"
              }
            ></i>
          </button>
        </div>
        {errors.password && (
          <div className="invalid-feedback d-block">{errors.password}</div>
        )}
      </div>

      {/* Phone */}
      <div className="fv-row mb-5">
        <label className="fw-semibold mb-2">Phone</label>
        <input
          type="text"
          name="phone"
          className="form-control form-control-solid"
          value={formData.phone}
          onChange={handleInputChange}
        />
      </div>

      {/* Gender */}
      <div className="fv-row mb-5">
        <label className="required fw-semibold mb-2">Gender</label>
        <select
          name="gender"
          className={clsx("form-select form-select-solid", {
            "is-invalid": errors.gender,
          })}
          value={formData.gender}
          onChange={handleInputChange}
        >
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        {errors.gender && (
          <div className="invalid-feedback">{errors.gender}</div>
        )}
      </div>

      {/* Platform */}
      <div className="fv-row mb-5">
        <label className="fw-semibold mb-2">How did you know us?</label>
        <select
          name="platform"
          className="form-select form-select-solid"
          value={formData.platform}
          onChange={handleInputChange}
        >
          <option value="">Select</option>
          <option value="Facebook">Facebook</option>
          <option value="TikTok">TikTok</option>
          <option value="YouTube">YouTube</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Platform Other Text */}
      {formData.platform === "Other" && (
        <div className="fv-row mb-5">
          <label className="fw-semibold mb-2">Tell more</label>
          <input
            type="text"
            name="platformOtherText"
            className="form-control form-control-solid"
            value={formData.platformOtherText}
            onChange={handleInputChange}
          />
        </div>
      )}

      {/* Special needs */}
      <div className="form-check form-check-solid mb-5">
        <input
          type="checkbox"
          name="specialNeeds"
          className="form-check-input"
          checked={formData.specialNeeds}
          onChange={handleInputChange}
        />
        <label className="form-check-label">Special needs</label>
      </div>

      {/* Terms */}
      <div className="form-check form-check-solid mb-5">
        <input
          type="checkbox"
          name="acceptedTerms"
          className="form-check-input"
          checked={formData.acceptedTerms}
          onChange={handleInputChange}
        />
        <label className="form-check-label">Accepted Terms</label>
      </div>

      {/* Buttons */}
      <div className="text-end">
        <button type="button" className="btn btn-light me-3" onClick={onClose}>
          Cancel
        </button>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {!loading && (studentId ? "Update Student" : "Create Student")}
          {loading && (
            <span className="spinner-border spinner-border-sm ms-2"></span>
          )}
        </button>
      </div>
    </form>
  );
};

export { StudentEditModalForm };
