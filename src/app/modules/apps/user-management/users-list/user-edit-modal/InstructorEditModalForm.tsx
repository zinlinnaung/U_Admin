import { FC, useState, useEffect } from "react";
import axios from "axios"; // Assuming you use axios for the direct user search
import * as Yup from "yup";
import { useFormik } from "formik";
import { ID, isNotEmpty } from "../../../../../../_metronic/helpers";
import { Instructor, Role } from "../core/_models";
import {
  createInstructor,
  getInstructorById,
  updateInstructor,
  getAllRoles,
} from "../core/_requests";
import { useQueryResponse } from "../core/QueryResponseProvider";

type Props = {
  instructorId?: ID;
  onClose: () => void;
};

const editInstructorSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  userId: Yup.string().required("Please select a user"),
});

const InstructorEditModalForm: FC<Props> = ({ instructorId, onClose }) => {
  const { refetch } = useQueryResponse();
  const [roles, setRoles] = useState<Role[]>([]);

  // --- New States for User Search ---
  const [searchTerm, setSearchTerm] = useState("");
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState("");

  useEffect(() => {
    getAllRoles().then(setRoles);
  }, []);

  // --- Search Logic ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        setIsSearching(true);
        try {
          // Adjust this URL to your actual users search endpoint
          const res = await axios.get(
            `https://mypadminapi.bitmyanmar.info/api/users?search=${searchTerm}`
          );
          setAvailableUsers(res.data || []);
        } catch (err) {
          console.error("User search failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setAvailableUsers([]);
      }
    }, 400); // Debounce time

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      userId: "",
      bio: "",
      roleIds: [] as string[],
    },
    validationSchema: editInstructorSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        if (isNotEmpty(instructorId)) {
          await updateInstructor({ id: instructorId as ID, ...values });
        } else {
          await createInstructor(values);
        }
        refetch();
        onClose();
      } catch (ex) {
        console.error(ex);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (instructorId) {
      getInstructorById(instructorId).then((data) => {
        if (data) {
          formik.setValues({
            fullName: data.fullName || "",
            userId: data.userId || "",
            bio: data.bio || "",
            roleIds: data.roles?.map((r) => r.id) || [],
          });
          setSelectedUsername(data.user?.username || "");
        }
      });
    }
  }, [instructorId]);

  return (
    <form className="form" onSubmit={formik.handleSubmit} noValidate>
      <div className="d-flex flex-column scroll-y me-n7 pe-7">
        {/* Full Name */}
        <div className="fv-row mb-7">
          <label className="required fw-bold fs-6 mb-2">Full Name</label>
          <input
            {...formik.getFieldProps("fullName")}
            type="text"
            className="form-control form-control-solid"
          />
        </div>

        {/* User Search Picker */}
        <div className="fv-row mb-7 position-relative">
          <label className="required fw-bold fs-6 mb-2">
            Select User Account
          </label>

          {formik.values.userId ? (
            // Display when a user is already selected
            <div className="d-flex align-items-center bg-light-info border border-info border-dashed p-3 rounded">
              <div className="flex-grow-1">
                <span className="text-muted fs-7 d-block">
                  Connected Username:
                </span>
                <span className="fw-bold text-info fs-6">
                  {selectedUsername}
                </span>
              </div>
              {!instructorId && ( // Only allow clearing if it's a new entry
                <button
                  type="button"
                  className="btn btn-sm btn-icon btn-active-light-danger"
                  onClick={() => {
                    formik.setFieldValue("userId", "");
                    setSelectedUsername("");
                    setSearchTerm("");
                  }}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          ) : (
            // Display Search Input
            <>
              <div className="input-group input-group-solid">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control form-control-solid"
                  placeholder="Type username to search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isSearching && (
                  <span className="input-group-text">
                    <div className="spinner-border spinner-border-sm text-primary"></div>
                  </span>
                )}
              </div>

              {/* Dropdown Results */}
              {availableUsers.length > 0 && (
                <div
                  className="dropdown-menu show w-100 shadow-sm p-2 overflow-auto"
                  style={{ maxHeight: "200px", zIndex: 105 }}
                >
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="dropdown-item py-2"
                      onClick={() => {
                        formik.setFieldValue("userId", user.id);
                        setSelectedUsername(user.username);
                        setAvailableUsers([]);
                      }}
                    >
                      <div className="d-flex flex-column">
                        <span className="fw-bold">{user.username}</span>
                        <span className="text-muted fs-7">{user.email}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {formik.touched.userId && formik.errors.userId && (
            <div className="text-danger fs-7 mt-2">{formik.errors.userId}</div>
          )}
        </div>

        {/* Bio */}
        <div className="fv-row mb-7">
          <label className="fw-bold fs-6 mb-2">Bio</label>
          <textarea
            {...formik.getFieldProps("bio")}
            className="form-control form-control-solid"
          />
        </div>

        {/* Roles */}
        <div className="fv-row mb-7">
          <label className="fw-bold fs-6 mb-2">Roles</label>
          <div className="d-flex flex-wrap gap-5 mt-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className="form-check form-check-custom form-check-solid"
              >
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={formik.values.roleIds.includes(role.id)}
                  onChange={() => {
                    const current = [...formik.values.roleIds];
                    const next = current.includes(role.id)
                      ? current.filter((i) => i !== role.id)
                      : [...current, role.id];
                    formik.setFieldValue("roleIds", next);
                  }}
                />
                <label className="form-check-label">{role.name}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center pt-15">
        <button type="reset" onClick={onClose} className="btn btn-light me-3">
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={formik.isSubmitting}
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export { InstructorEditModalForm };
