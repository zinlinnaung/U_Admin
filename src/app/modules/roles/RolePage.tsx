import React, { useState, useEffect } from "react";
import axios from "axios";
import { KTIcon } from "../../../_metronic/helpers";

// API Endpoint
const API_URL = "https://mypadminapi.bitmyanmar.info/api/roles";

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
  id: string; // Changed to string (UUID from backend)
  name: string;
  description: string;
  permissions: string[];
  _count?: {
    instructors: number;
  };
}

export function RolePage() {
  // ✅ Permission groups (Updated IDs to match Backend Enums)
  const PERMISSION_GROUPS: PermissionGroup[] = [
    {
      type: "Students",
      permissions: [
        {
          id: "CREATE_STUDENT",
          label: "Create Student",
          description: "Can create new students",
        },
        {
          id: "EDIT_STUDENT",
          label: "Edit Student",
          description: "Can edit student info",
        },
        {
          id: "DELETE_STUDENT",
          label: "Delete Student",
          description: "Can delete student records",
        },
        {
          id: "VIEW_STUDENT",
          label: "View Student",
          description: "Can view student details",
        },
      ],
    },
    {
      type: "Instructors",
      permissions: [
        {
          id: "CREATE_INSTRUCTOR",
          label: "Create Instructor",
          description: "Can create new instructors",
        },
        {
          id: "EDIT_INSTRUCTOR",
          label: "Edit Instructor",
          description: "Can edit instructor details",
        },
        {
          id: "DELETE_INSTRUCTOR",
          label: "Delete Instructor",
          description: "Can delete instructors",
        },
        {
          id: "VIEW_INSTRUCTOR",
          label: "View Instructor",
          description: "Can view instructor details",
        },
      ],
    },
    {
      type: "Courses",
      permissions: [
        {
          id: "CREATE_COURSE",
          label: "Create Course",
          description: "Can create new courses",
        },
        {
          id: "EDIT_COURSE",
          label: "Edit Course",
          description: "Can edit existing courses",
        },
        {
          id: "DELETE_COURSE",
          label: "Delete Course",
          description: "Can delete courses",
        },
        {
          id: "VIEW_COURSE",
          label: "View Course",
          description: "Can view course content",
        },
      ],
    },
  ];

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // ✅ Fetch Roles from API
  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      alert("Failed to load roles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

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
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        // Refresh list
        fetchRoles();
      } catch (error) {
        console.error("Error deleting role:", error);
        alert("Failed to delete role");
      }
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

  // ✅ Submit form (Create or Update)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      name,
      description,
      permissions: selectedPermissions,
    };

    try {
      if (editingRole) {
        // UPDATE
        await axios.patch(`${API_URL}/${editingRole.id}`, payload);
      } else {
        // CREATE
        await axios.post(API_URL, payload);
      }

      resetForm();
      fetchRoles(); // Refresh data from server
    } catch (error) {
      console.error("Error saving role:", error);
      alert("Failed to save role. Please check inputs.");
    }
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
            {isLoading ? (
              <div className="d-flex justify-content-center py-10">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
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
                      <td>
                        <span className="fw-bold text-dark">{role.name}</span>
                      </td>
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
            )}
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
