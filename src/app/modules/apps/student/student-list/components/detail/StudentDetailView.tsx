import { FC } from "react";
import { Student } from "../../core/_models";
import { useListView } from "../../core/ListViewProvider";

type Props = {
  student: Student;
  onClose: () => void;
};

const StudentDetailView: FC<Props> = ({ student, onClose }) => {
  const { setItemIdForUpdate } = useListView();

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : name[0].toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEdit = () => {
    onClose();
    setItemIdForUpdate(student.id);
  };

  const mockCourses = [
    {
      id: 1,
      name: "Introduction to Programming",
      grade: "A",
      instructor: "Dr. Sarah Johnson",
    },
    {
      id: 2,
      name: "Data Structures",
      grade: "A-",
      instructor: "Prof. Michael Chen",
    },
    {
      id: 3,
      name: "Web Development",
      grade: "B+",
      instructor: "Dr. Emily Rodriguez",
    },
    {
      id: 4,
      name: "Database Systems",
      grade: "A",
      instructor: "Prof. David Thompson",
    },
  ];

  // Helper to mask password display
  const maskPassword = (password?: string) => {
    if (!password) return "N/A";
    return "•".repeat(Math.min(password.length, 12));
  };

  return (
    <div className="d-flex flex-column gap-7 gap-lg-10">
      {/* Header Card */}
      <div className="card card-flush">
        <div className="card-body">
          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center">
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                <div className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-2">
                    <span className="text-gray-900 fs-2 fw-bold me-3">
                      {student.name}
                    </span>
                    <span
                      className={`badge ${
                        student.status === "Active"
                          ? "badge-light-success"
                          : student.status === "Graduated"
                          ? "badge-light-info"
                          : "badge-light-warning"
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>
                  <div className="d-flex flex-wrap fw-semibold fs-6 mb-4 pe-2">
                    <a
                      href={`mailto:${student.email}`}
                      className="d-flex align-items-center text-gray-400 text-hover-primary me-5 mb-2"
                    >
                      <i className="ki-duotone ki-sms fs-4 me-1"></i>
                      {student.email}
                    </a>
                    <span className="d-flex align-items-center text-gray-400 me-5 mb-2">
                      <i className="ki-duotone ki-profile-circle fs-4 me-1"></i>
                      Student ID: {student.id}
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
                        <i className="ki-duotone ki-book fs-3 text-primary me-2"></i>
                        <div className="fs-2 fw-bold">
                          {student.courseCount || 0}
                        </div>
                      </div>
                      <div className="fw-semibold fs-6 text-gray-400">
                        Courses
                      </div>
                    </div>

                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                      <div className="d-flex align-items-center">
                        <i className="ki-duotone ki-chart-simple fs-3 text-success me-2"></i>
                        <div className="fs-2 fw-bold">
                          {student.gpa?.toFixed(2) || "N/A"}
                        </div>
                      </div>
                      <div className="fw-semibold fs-6 text-gray-400">GPA</div>
                    </div>

                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                      <div className="d-flex align-items-center">
                        <i className="ki-duotone ki-calendar fs-3 text-warning me-2"></i>
                        <div className="fs-7 fw-bold">
                          {formatDate(student.enrollmentDate)}
                        </div>
                      </div>
                      <div className="fw-semibold fs-6 text-gray-400">
                        Enrolled
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Rows */}
      <div className="row g-6 g-xl-9">
        {/* Left Column */}
        <div className="col-lg-6">
          <div className="card card-flush mb-6 mb-xl-9">
            <div className="card-header">
              <div className="card-title">
                <h3 className="fw-bold m-0">Academic Information</h3>
              </div>
            </div>
            <div className="card-body pt-0">
              <div className="mb-7">
                <div className="d-flex align-items-center mb-3">
                  <span className="text-gray-800 fw-bold me-2">Status:</span>
                  <span
                    className={`badge ${
                      student.status === "Active"
                        ? "badge-light-success"
                        : student.status === "Graduated"
                        ? "badge-light-info"
                        : "badge-light-warning"
                    }`}
                  >
                    {student.status}
                  </span>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <span className="text-gray-800 fw-bold me-2">GPA:</span>
                  <span className="text-gray-600">
                    {student.gpa?.toFixed(2) || "N/A"}
                  </span>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <span className="text-gray-800 fw-bold me-2">
                    Enrollment Date:
                  </span>
                  <span className="text-gray-600">
                    {formatDate(student.enrollmentDate)}
                  </span>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <span className="text-gray-800 fw-bold me-2">
                    Total Courses:
                  </span>
                  <span className="text-gray-600">
                    {student.courseCount || 0}
                  </span>
                </div>

                {/* NEW Password Field */}
                <div className="d-flex align-items-center">
                  <span className="text-gray-800 fw-bold me-2">Password:</span>
                  <span className="text-gray-600">{maskPassword("apple")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-lg-6">
          <div className="card card-flush mb-6 mb-xl-9">
            <div className="card-header">
              <div className="card-title">
                <h3 className="fw-bold m-0">Enrolled Courses</h3>
              </div>
            </div>
            <div className="card-body pt-0">
              <div className="table-responsive">
                <table className="table table-row-dashed align-middle gs-0 gy-4">
                  <thead>
                    <tr className="border-0">
                      <th className="p-0 min-w-150px">Course</th>
                      <th className="p-0 min-w-100px">Grade</th>
                      <th className="p-0 min-w-150px">Instructor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockCourses.map((course) => (
                      <tr key={course.id}>
                        <td>
                          <span className="text-gray-800 fw-bold text-hover-primary fs-6">
                            {course.name}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-light-success fw-bold">
                            {course.grade}
                          </span>
                        </td>
                        <td>
                          <span className="text-gray-600 fs-7">
                            {course.instructor}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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
            <i className="ki-duotone ki-pencil fs-2"></i>
            Edit Student
          </button>
        </div>
      </div>
    </div>
  );
};

export { StudentDetailView };
