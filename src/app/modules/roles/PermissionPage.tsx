import React from "react";

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

  return (
    <div className="card mb-5 mb-xl-10 m-10">
      <div className="card-header border-0 pt-5 d-flex justify-content-between align-items-center">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">
            Permissions Management
          </span>
          <span className="text-muted mt-1 fw-semibold fs-7">
            View system permissions by type
          </span>
        </h3>
      </div>

      <div className="card-body py-5">
        {PERMISSION_GROUPS.map((group) => (
          <div key={group.type} className="mb-7">
            {/* Type Header */}
            <h5 className="fw-bold text-dark mb-4">{group.type}</h5>

            {/* Permissions List */}
            <div className="row ms-3">
              {group.permissions.map((perm) => (
                <div key={perm.id} className="col-md-3 mb-3">
                  <div className="d-flex align-items-center">
                    <span className="bullet bullet-dot bg-primary me-2 h-8px w-8px"></span>
                    <span className="text-gray-800 fw-semibold">
                      {perm.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="separator border-gray-300 my-5"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PermissionPage;
