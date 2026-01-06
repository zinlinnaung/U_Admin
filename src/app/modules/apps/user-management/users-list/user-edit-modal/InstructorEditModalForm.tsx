import { FC, useState, useEffect } from "react";
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
  instructorId?: ID; // Fixed: Changed from string to ID
  onClose: () => void;
};

const editInstructorSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  userId: Yup.string().required("User UUID is required"),
});

const InstructorEditModalForm: FC<Props> = ({ instructorId, onClose }) => {
  const { refetch } = useQueryResponse();
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    getAllRoles().then(setRoles);
  }, []);

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
          // Casting instructorId to ID ensures compatibility with the model
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
        }
      });
    }
  }, [instructorId]);

  return (
    <form className="form" onSubmit={formik.handleSubmit} noValidate>
      <div className="d-flex flex-column scroll-y me-n7 pe-7">
        <div className="fv-row mb-7">
          <label className="required fw-bold fs-6 mb-2">Full Name</label>
          <input
            {...formik.getFieldProps("fullName")}
            type="text"
            className="form-control form-control-solid"
          />
        </div>

        <div className="fv-row mb-7">
          <label className="required fw-bold fs-6 mb-2">User UUID</label>
          <input
            {...formik.getFieldProps("userId")}
            disabled={isNotEmpty(instructorId)}
            className="form-control form-control-solid"
          />
        </div>

        <div className="fv-row mb-7">
          <label className="fw-bold fs-6 mb-2">Bio</label>
          <textarea
            {...formik.getFieldProps("bio")}
            className="form-control form-control-solid"
          />
        </div>

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
                    if (current.includes(role.id)) {
                      formik.setFieldValue(
                        "roleIds",
                        current.filter((i) => i !== role.id)
                      );
                    } else {
                      formik.setFieldValue("roleIds", [...current, role.id]);
                    }
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
