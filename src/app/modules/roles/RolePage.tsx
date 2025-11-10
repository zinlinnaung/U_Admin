import React, { useState } from "react";
import { KTIcon } from "../../../_metronic/helpers";

interface Permission {
  id: string;
  label: string;
  description: string;
}

interface PermissionGroup {
  type: string;
  permissions: Permission[];
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

export function RolePage() {
  // ✅ Permission groups (grouped by type)
  const PERMISSION_GROUPS: PermissionGroup[] = [
    {
      type: "Students",
      permissions: [
        {
          id: "create_student",
          label: "Create Student",
          description: "Can create new students",
        },
        {
          id: "edit_student",
          label: "Edit Student",
          description: "Can edit student info",
        },
        {
          id: "delete_student",
          label: "Delete Student",
          description: "Can delete student records",
        },
        {
          id: "view_student",
          label: "View Student",
          description: "Can view student details",
        },
      ],
    },
    {
      type: "Instructors",
      permissions: [
        {
          id: "create_instructor",
          label: "Create Instructor",
          description: "Can create new instructors",
        },
        {
          id: "edit_instructor",
          label: "Edit Instructor",
          description: "Can edit instructor details",
        },
        {
          id: "delete_instructor",
          label: "Delete Instructor",
          description: "Can delete instructors",
        },
        {
          id: "view_instructor",
          label: "View Instructor",
          description: "Can view instructor details",
        },
      ],
    },
    {
      type: "Courses",
      permissions: [
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
          id: "view_course",
          label: "View Course",
          description: "Can view course content",
        },
      ],
    },
  ];

  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      name: "Admin",
      description: "Full access to all system features",
      permissions: PERMISSION_GROUPS.flatMap((g) =>
        g.permissions.map((p) => p.id)
      ),
    },
    {
      id: 2,
      name: "Instructor",
      description: "Can create, edit, and manage courses",
      permissions: [
        "create_course",
        "edit_course",
        "view_course",
        "view_student",
      ],
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // ✅ Reset form state
  const resetForm = () => {
    setEditingRole(null);
    setName("");
    setDescription("");
    setSelectedPermissions([]);
    setShowModal(false);
  };

  // ✅ Add role
  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  // ✅ Edit role
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setName(role.name);
    setDescription(role.description || "");
    setSelectedPermissions(role.permissions);
    setShowModal(true);
  };

  // ✅ Delete role
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      setRoles(roles.filter((r) => r.id !== id));
    }
  };

  // ✅ Toggle individual permission
  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // ✅ Toggle all in a group
  const toggleGroup = (group: PermissionGroup) => {
    const allSelected = group.permissions.every((p) =>
      selectedPermissions.includes(p.id)
    );
    if (allSelected) {
      // Deselect all
      setSelectedPermissions((prev) =>
        prev.filter((p) => !group.permissions.some((gp) => gp.id === p))
      );
    } else {
      // Select all
      const newPermissions = group.permissions
        .map((p) => p.id)
        .filter((id) => !selectedPermissions.includes(id));
      setSelectedPermissions((prev) => [...prev, ...newPermissions]);
    }
  };

  // ✅ Submit form
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newRole: Role = {
      id: editingRole ? editingRole.id : Date.now(),
      name,
      description,
      permissions: selectedPermissions,
    };

    if (editingRole) {
      setRoles(roles.map((r) => (r.id === editingRole.id ? newRole : r)));
    } else {
      setRoles([...roles, newRole]);
    }

    resetForm();
  };

  return (
    <>
      {/* Header */}
      <div className="card mb-5 mb-xl-10 m-10">
        <div className="card-header border-0 pt-5 d-flex justify-content-between align-items-center">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold fs-3 mb-1">
              Role Management
            </span>
            <span className="text-muted mt-1 fw-semibold fs-7">
              Manage user roles and permissions
            </span>
          </h3>

          <button className="btn btn-sm btn-primary" onClick={handleAdd}>
            <KTIcon iconName="plus" className="fs-2 me-1" />
            Add Role
          </button>
        </div>

        {/* Table */}
        <div className="card-body py-3">
          <div className="table-responsive">
            <table className="table table-row-bordered align-middle gy-4">
              <thead>
                <tr className="fw-bold text-muted">
                  <th className="min-w-150px">Role</th>
                  <th className="min-w-200px">Description</th>
                  <th className="min-w-250px">Permissions</th>
                  <th className="text-end min-w-100px">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td>{role.name}</td>
                    <td>
                      {role.description || (
                        <span className="text-muted">No description</span>
                      )}
                    </td>
                    <td>
                      {role.permissions.length === 0 ? (
                        <span className="text-muted">No permissions</span>
                      ) : (
                        <div className="d-flex flex-wrap gap-1">
                          {role.permissions.map((permId) => (
                            <span
                              key={permId}
                              className="badge badge-light-primary"
                            >
                              {permId}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-2"
                        onClick={() => handleEdit(role)}
                      >
                        <KTIcon iconName="pencil" className="fs-3" />
                      </button>
                      <button
                        className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                        onClick={() => handleDelete(role.id)}
                      >
                        <KTIcon iconName="trash" className="fs-3" />
                      </button>
                    </td>
                  </tr>
                ))}
                {roles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-10">
                      No roles found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingRole ? "Edit Role" : "Create Role"}
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-icon"
                  onClick={resetForm}
                >
                  <KTIcon iconName="cross" className="fs-2" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Role name */}
                  <div className="mb-5">
                    <label className="form-label fw-semibold">Role Name</label>
                    <input
                      type="text"
                      className="form-control form-control-solid"
                      placeholder="e.g. Instructor"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-5">
                    <label className="form-label fw-semibold">
                      Role Description
                    </label>
                    <textarea
                      className="form-control form-control-solid"
                      placeholder="Brief description of the role"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Grouped Permissions */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold fs-5 mb-3">
                      Permissions
                    </label>

                    {PERMISSION_GROUPS.map((group) => {
                      const allSelected = group.permissions.every((p) =>
                        selectedPermissions.includes(p.id)
                      );

                      return (
                        <div key={group.type} className="mb-5">
                          {/* Group Header */}
                          <div className="form-check form-check-custom form-check-solid mb-3">
                            <input
                              className="form-check-input me-3"
                              type="checkbox"
                              id={`group-${group.type}`}
                              checked={allSelected}
                              onChange={() => toggleGroup(group)}
                            />
                            <label
                              htmlFor={`group-${group.type}`}
                              className="form-check-label fw-bold fs-6 text-dark"
                            >
                              {group.type}
                            </label>
                          </div>

                          {/* Group Permissions */}
                          <div className="row ms-6">
                            {group.permissions.map((p) => (
                              <div key={p.id} className="col-md-6 mb-3">
                                <div className="form-check form-check-custom form-check-solid">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={selectedPermissions.includes(p.id)}
                                    onChange={() => togglePermission(p.id)}
                                    id={p.id}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={p.id}
                                  >
                                    <strong>{p.label}</strong>
                                    <div className="text-muted small">
                                      {p.description}
                                    </div>
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="separator border-gray-300 my-4"></div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal footer */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingRole ? "Update Role" : "Create Role"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RolePage;
