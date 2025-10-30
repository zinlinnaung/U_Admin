import { FC } from "react";
import { Instructor } from "../../core/_models";
import { useListView } from "../../core/ListViewProvider";

type Props = {
  instructor: Instructor;
  onClose: () => void;
};

const InstructorDetailView: FC<Props> = ({ instructor, onClose }) => {
  const { setItemIdForUpdate } = useListView();

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : name[0].toUpperCase();
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) {
      return diffHours < 1 ? "Just now" : `${diffHours} hours ago`;
    }
    return `${diffDays} days ago`;
  };

  const handleEdit = () => {
    // Close detail modal
    onClose();
    // Open edit modal
    setItemIdForUpdate(instructor.id);
  };

  // Mock permissions - replace with actual data from instructor object
  const permissions = [
    { id: "create_course", label: "Create Course", granted: true },
    { id: "edit_course", label: "Edit Course", granted: true },
    { id: "delete_course", label: "Delete Course", granted: false },
    { id: "view_analytics", label: "View Analytics", granted: true },
    { id: "manage_students", label: "Manage Students", granted: true },
    { id: "grade_assignments", label: "Grade Assignments", granted: true },
  ];

  // Mock courses - replace with actual data
  const recentCourses = [
    {
      id: 1,
      name: "Introduction to Programming",
      students: 45,
      status: "Active",
    },
    { id: 2, name: "Data Structures", students: 38, status: "Active" },
    { id: 3, name: "Web Development", students: 52, status: "Active" },
    { id: 4, name: "Database Systems", students: 30, status: "Completed" },
  ];

  return (
    <div className="d-flex flex-column gap-5 gap-lg">
      {/* Header Card */}
      <div className="card card-flush">
        <div className="card-body">
          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center">
            {/* Avatar */}
            {/* <div className="symbol symbol-100px symbol-lg-150px me-5 mb-5 mb-sm-0">
              <div className="symbol-label fs-2 fw-bold bg-light-primary text-primary">
                {getInitials(instructor.name)}
              </div>
            </div> */}

            {/* Basic Info */}
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                <div className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-2">
                    <span className="text-gray-900 fs-2 fw-bold me-1">
                      {instructor.name}
                    </span>
                    <span className="badge badge-light-success">Active</span>
                  </div>
                  <div className="d-flex flex-wrap fw-semibold fs-6 mb-4 pe-2">
                    <a
                      href={`mailto:${instructor.email}`}
                      className="d-flex align-items-center text-gray-400 text-hover-primary me-5 mb-2"
                    >
                      <i className="ki-duotone ki-sms fs-4 me-1">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      {instructor.email}
                    </a>
                    <span className="d-flex align-items-center text-gray-400 me-5 mb-2">
                      <i className="ki-duotone ki-profile-circle fs-4 me-1">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                      </i>
                      Instructor ID: {instructor.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="d-flex flex-wrap flex-stack">
                <div className="d-flex flex-column flex-grow-1 pe-8">
                  <div className="d-flex flex-wrap">
                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                      <div className="d-flex align-items-center">
                        <i className="ki-duotone ki-book fs-3 text-primary me-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                        <div className="fs-2 fw-bold">
                          {instructor.courseCount || 0}
                        </div>
                      </div>
                      <div className="fw-semibold fs-6 text-gray-400">
                        Courses
                      </div>
                    </div>

                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                      <div className="d-flex align-items-center">
                        <i className="ki-duotone ki-profile-user fs-3 text-success me-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                        <div className="fs-2 fw-bold">
                          {instructor.enrollmentCount || 0}
                        </div>
                      </div>
                      <div className="fw-semibold fs-6 text-gray-400">
                        Students
                      </div>
                    </div>

                    {/* <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                      <div className="d-flex align-items-center">
                        <i className="ki-duotone ki-chart-line-up fs-3 text-info me-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                        <div className="fs-2 fw-bold">4.8</div>
                      </div>
                      <div className="fw-semibold fs-6 text-gray-400">
                        Rating
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-6 g-xl-9">
        {/* Left Column */}
        <div className="col-lg-6">
          {/* Account Details */}
          <div className="card card-flush mb-6 mb-xl-9">
            <div className="card-header">
              <div className="card-title">
                <h3 className="fw-bold m-0">Account Details</h3>
              </div>
            </div>
            <div className="card-body pt-0">
              <div className="mb-7">
                <div className="d-flex align-items-center mb-3">
                  <span className="text-gray-800 fw-bold me-2">
                    Last Login:
                  </span>
                  <span className="text-gray-600">
                    {formatDateTime(instructor.lastLogin)}
                    {instructor.lastLogin && (
                      <span className="text-muted fs-7 ms-2">
                        ({getRelativeTime(instructor.lastLogin)})
                      </span>
                    )}
                  </span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <span className="text-gray-800 fw-bold me-2">Status:</span>
                  <span className="badge badge-light-success">Active</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <span className="text-gray-800 fw-bold me-2">
                    Member Since:
                  </span>
                  <span className="text-gray-600">January 2024</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="text-gray-800 fw-bold me-2">
                    Department:
                  </span>
                  <span className="text-gray-600">Computer Science</span>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          {/* <div className="card card-flush">
            <div className="card-header">
              <div className="card-title">
                <h3 className="fw-bold m-0">Permissions</h3>
              </div>
            </div>
            <div className="card-body pt-0">
              <div className="d-flex flex-column gap-3">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="d-flex align-items-center"
                  >
                    {permission.granted ? (
                      <i className="ki-duotone ki-check-circle fs-2 text-success me-3">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    ) : (
                      <i className="ki-duotone ki-cross-circle fs-2 text-gray-400 me-3">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    )}
                    <span
                      className={
                        permission.granted
                          ? "text-gray-800 fw-semibold"
                          : "text-gray-400"
                      }
                    >
                      {permission.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div> */}
        </div>

        {/* Right Column */}
        <div className="col-lg-4">
          <div className="card card-flush">
            <div className="card-header">
              <div className="card-title">
                <h3 className="fw-bold m-0">Permissions</h3>
              </div>
            </div>
            <div className="card-body pt-0">
              <div className="d-flex flex-column gap-3">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="d-flex align-items-center"
                  >
                    {permission.granted ? (
                      <i className="ki-duotone ki-check-circle fs-2 text-success me-3">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    ) : (
                      <i className="ki-duotone ki-cross-circle fs-2 text-gray-400 me-3">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    )}
                    <span
                      className={
                        permission.granted
                          ? "text-gray-800 fw-semibold"
                          : "text-gray-400"
                      }
                    >
                      {permission.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* <div className="card card-flush mb-6 mb-xl-9">
            <div className="card-header">
              <div className="card-title">
                <h3 className="fw-bold m-0">Recent Courses</h3>
              </div>
            </div>
            <div className="card-body pt-0">
              <div className="table-responsive">
                <table className="table table-row-dashed align-middle gs-0 gy-4">
                  <thead>
                    <tr className="border-0">
                      <th className="p-0 min-w-200px">Course</th>
                      <th className="p-0 min-w-100px">Students</th>
                      <th className="p-0 min-w-100px">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCourses.map((course) => (
                      <tr key={course.id}>
                        <td>
                          <span className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">
                            {course.name}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-light fw-bold">
                            {course.students}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              course.status === "Active"
                                ? "badge-light-success"
                                : "badge-light-secondary"
                            }`}
                          >
                            {course.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          
          <div className="card card-flush">
            <div className="card-header">
              <div className="card-title">
                <h3 className="fw-bold m-0">Recent Activity</h3>
              </div>
            </div>
            <div className="card-body pt-0">
              <div className="timeline-label">
                <div className="timeline-item">
                  <div className="timeline-label fw-bold text-gray-800 fs-6">
                    08:42
                  </div>
                  <div className="timeline-badge">
                    <i className="fa fa-genderless text-success fs-1"></i>
                  </div>
                  <div className="timeline-content fw-semibold text-gray-800 ps-3">
                    Created new course "Advanced Algorithms"
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-label fw-bold text-gray-800 fs-6">
                    10:00
                  </div>
                  <div className="timeline-badge">
                    <i className="fa fa-genderless text-primary fs-1"></i>
                  </div>
                  <div className="timeline-content fw-semibold text-gray-800 ps-3">
                    Graded 15 assignments
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-label fw-bold text-gray-800 fs-6">
                    14:37
                  </div>
                  <div className="timeline-badge">
                    <i className="fa fa-genderless text-info fs-1"></i>
                  </div>
                  <div className="timeline-content fw-semibold text-gray-800 ps-3">
                    Updated course materials
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-label fw-bold text-gray-800 fs-6">
                    16:50
                  </div>
                  <div className="timeline-badge">
                    <i className="fa fa-genderless text-warning fs-1"></i>
                  </div>
                  <div className="timeline-content fw-semibold text-gray-800 ps-3">
                    Posted announcement to students
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card card-flush">
        <div className="card-body text-end">
          <button
            type="button"
            className="btn btn-light me-3"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleEdit}
          >
            <i className="ki-duotone ki-pencil fs-2">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Edit Instructor
          </button>
        </div>
      </div>
    </div>
  );
};

export { InstructorDetailView };
