import { FC, useState, useEffect, useMemo } from "react";
import axios from "axios";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Modal } from "react-bootstrap";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  Row,
  ColumnDef,
} from "@tanstack/react-table";

// Metronic & Helpers

import {
  ID,
  isNotEmpty,
  KTCard,
  KTCardBody,
} from "../../../../_metronic/helpers";
import {
  ListViewProvider,
  useListView,
} from "./users-list/core/ListViewProvider";
import {
  QueryResponseProvider,
  useQueryResponse,
  useQueryResponseData,
  useQueryResponseLoading,
} from "./users-list/core/QueryResponseProvider";
import { InstructorsListPagination } from "./users-list/components/pagination/InstructorsListPagination";
import { InstructorsListLoading } from "./users-list/components/loading/InstructorsListLoading";
import { QueryRequestProvider } from "./users-list/core/QueryRequestProvider";
import { InstructorsListHeader } from "./users-list/components/header/InstructorsListHeader";

// --- 1. CONFIG & MODELS ---
const API_URL = "https://mypadminapi.bitmyanmar.info/api";

export interface Role {
  id: string;
  name: string;
}
export interface Instructor {
  id?: ID;
  userId?: string;
  fullName?: string;
  bio?: string;
  user?: { email: string; username: string };
  roles?: Role[];
  roleIds?: string[];
}

// --- 2. API SERVICES ---
const api = {
  getById: (id: ID): Promise<Instructor> =>
    axios.get(`${API_URL}/instructors/${id}`).then((res) => res.data),

  create: (data: Instructor) => axios.post(`${API_URL}/instructors`, data),

  update: (data: Instructor) => {
    const { id, user, roles, ...payload } = data;
    return axios.patch(`${API_URL}/instructors/${id}`, payload);
  },

  getRoles: (): Promise<Role[]> =>
    axios.get(`${API_URL}/roles`).then((res) => res.data),
};

// --- 3. MODAL COMPONENT (Form + Logic) ---
const InstructorEditModal: FC = () => {
  const { itemIdForUpdate, setItemIdForUpdate } = useListView();
  const { refetch } = useQueryResponse();
  const [roles, setRoles] = useState<Role[]>([]);
  const show = itemIdForUpdate !== undefined;

  useEffect(() => {
    if (show) api.getRoles().then(setRoles);
  }, [show]);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      userId: "",
      bio: "",
      roleIds: [] as string[],
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Full name is required"),
      userId: Yup.string().required("User UUID is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (isNotEmpty(itemIdForUpdate)) {
          await api.update({ id: itemIdForUpdate as ID, ...values });
        } else {
          await api.create(values);
        }
        refetch();
        handleClose();
      } catch (e) {
        console.error("API Error:", e);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (isNotEmpty(itemIdForUpdate)) {
      api.getById(itemIdForUpdate as ID).then((data) => {
        formik.setValues({
          fullName: data.fullName || "",
          userId: data.userId || "",
          bio: data.bio || "",
          roleIds: data.roles?.map((r) => r.id) || [],
        });
      });
    } else {
      formik.resetForm();
    }
  }, [itemIdForUpdate]);

  const handleClose = () => {
    setItemIdForUpdate(undefined);
    formik.resetForm();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      size="lg"
      centered
    >
      <form onSubmit={formik.handleSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>
            {itemIdForUpdate ? "Edit Instructor" : "Add New Instructor"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="scroll-y mx-5 mx-xl-15 my-7">
          <div className="fv-row mb-7">
            <label className="required fw-bold fs-6 mb-2">Full Name</label>
            <input
              {...formik.getFieldProps("fullName")}
              className="form-control form-control-solid"
            />
            {formik.touched.fullName && formik.errors.fullName && (
              <div className="fv-plugins-message-container text-danger">
                {formik.errors.fullName}
              </div>
            )}
          </div>

          <div className="fv-row mb-7">
            <label className="required fw-bold fs-6 mb-2">User UUID</label>
            <input
              {...formik.getFieldProps("userId")}
              disabled={isNotEmpty(itemIdForUpdate)}
              className="form-control form-control-solid"
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            />
          </div>

          <div className="fv-row mb-7">
            <label className="fw-bold fs-6 mb-2">Bio</label>
            <textarea
              {...formik.getFieldProps("bio")}
              className="form-control form-control-solid"
              rows={3}
            />
          </div>

          <div className="fv-row">
            <label className="fw-bold fs-6 mb-2">Assign Roles</label>
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
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-light me-3"
          >
            Discard
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={formik.isSubmitting}
          >
            <span className="indicator-label">Submit</span>
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

// --- 4. TABLE COMPONENT ---
const InstructorsTable: FC = () => {
  const instructors = useQueryResponseData() as Instructor[];
  const isLoading = useQueryResponseLoading();
  const { setItemIdForUpdate } = useListView();

  const columns = useMemo<ColumnDef<Instructor>[]>(
    () => [
      {
        header: "Instructor",
        accessorKey: "fullName",
        cell: (info) => (
          <div className="d-flex flex-column">
            <span className="text-gray-800 fw-bold text-hover-primary mb-1">
              {info.row.original.fullName}
            </span>
            <span className="text-muted fs-7">
              {info.row.original.user?.email}
            </span>
          </div>
        ),
      },
      {
        header: "Roles",
        accessorKey: "roles",
        cell: (info) => (
          <div className="d-flex flex-wrap gap-1">
            {info.row.original.roles?.map((role) => (
              <span
                key={role.id}
                className="badge badge-light-success fs-7 fw-bold"
              >
                {role.name}
              </span>
            ))}
          </div>
        ),
      },
      {
        header: "Actions",
        id: "actions",
        cell: (info) => (
          <button
            className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
            onClick={() => setItemIdForUpdate(info.row.original.id)}
          >
            <i className="ki-duotone ki-pencil fs-2">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </button>
        ),
      },
    ],
    [setItemIdForUpdate]
  );

  const table = useReactTable({
    data: instructors || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <KTCardBody className="py-4">
      <div className="table-responsive">
        <table className="table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                className="text-start text-muted fw-bolder fs-7 text-uppercase gs-0"
              >
                {hg.headers.map((h) => (
                  <th key={h.id}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="text-gray-600 fw-bold">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row: Row<Instructor>) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">
                  No instructors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <InstructorsListPagination />
      {isLoading && <InstructorsListLoading />}
    </KTCardBody>
  );
};

// --- 5. MAIN PAGE WRAPPER ---
const InstructorsListWrapper = () => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ListViewProvider>
        <KTCard>
          <InstructorsListHeader />
          <InstructorsTable />
        </KTCard>
        <InstructorEditModal />
      </ListViewProvider>
    </QueryResponseProvider>
  </QueryRequestProvider>
);

export { InstructorsListWrapper };
