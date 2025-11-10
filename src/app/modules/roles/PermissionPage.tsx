import React, { useState } from "react";
import { KTIcon } from "../../../_metronic/helpers";

interface Permission {
  id: string;
  label: string;
}

interface PermissionGroup {
  type: string;
  permissions: Permission[];
}

export function PermissionPage() {
  // ✅ Permission groups
  const PERMISSION_GROUPS: PermissionGroup[] = [
    {
      type: "Students",
      permissions: [
        { id: "create_student", label: "Create Student" },
        { id: "edit_student", label: "Edit Student" },
        { id: "delete_student", label: "Delete Student" },
        { id: "view_student", label: "View Student" },
      ],
    },
    {
      type: "Instructors",
      permissions: [
        { id: "create_instructor", label: "Create Instructor" },
        { id: "edit_instructor", label: "Edit Instructor" },
        { id: "delete_instructor", label: "Delete Instructor" },
        { id: "view_instructor", label: "View Instructor" },
      ],
    },
    {
      type: "Courses",
      permissions: [
        { id: "create_course", label: "Create Course" },
        { id: "edit_course", label: "Edit Course" },
        { id: "delete_course", label: "Delete Course" },
        { id: "view_course", label: "View Course" },
      ],
    },
  ];

  // ✅ State for selected permissions
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // ✅ Toggle a single permission
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

  return (
    <div className="card mb-5 mb-xl-10 m-10">
      <div className="card-header border-0 pt-5 d-flex justify-content-between align-items-center">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">
            Permissions Management
          </span>
          <span className="text-muted mt-1 fw-semibold fs-7">
            Manage system permissions by type
          </span>
        </h3>
      </div>

      <div className="card-body py-5">
        {PERMISSION_GROUPS.map((group) => {
          const allSelected = group.permissions.every((p) =>
            selectedPermissions.includes(p.id)
          );

          return (
            <div key={group.type} className="mb-7">
              {/* Type header with master checkbox */}
              <div className="d-flex align-items-center mb-3">
                <div className="form-check form-check-custom form-check-solid">
                  <input
                    className="form-check-input me-3"
                    type="checkbox"
                    id={`group-${group.type}`}
                    checked={allSelected}
                    onChange={() => toggleGroup(group)}
                  />
                  <label
                    htmlFor={`group-${group.type}`}
                    className="form-check-label fs-5 fw-bold text-dark"
                  >
                    {group.type}
                  </label>
                </div>
              </div>

              {/* Permissions under group */}
              <div className="row ms-6">
                {group.permissions.map((perm) => (
                  <div key={perm.id} className="col-md-3 mb-3">
                    <div className="form-check form-check-custom form-check-solid">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={perm.id}
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                      />
                      <label
                        htmlFor={perm.id}
                        className="form-check-label fw-semibold text-gray-700"
                      >
                        {perm.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="separator border-gray-300 my-6"></div>
            </div>
          );
        })}

        {/* Summary */}
        <div className="mt-5">
          <h5 className="fw-bold mb-3">Selected Permissions:</h5>
          {selectedPermissions.length === 0 ? (
            <span className="text-muted">No permissions selected</span>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {selectedPermissions.map((id) => (
                <span key={id} className="badge badge-light-primary">
                  {id}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PermissionPage;
