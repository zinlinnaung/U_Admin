import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { KTCard, KTCardBody, KTIcon } from "../../../../_metronic/helpers";
import { Modal } from "react-bootstrap"; // Ensure you have react-bootstrap installed

interface Enrollment {
  id: string;
  userId: string;
  status: "IN_PROGRESS" | "DONE";
  completedPercentage: number;
  createdAt: string;
  updatedAt: string;
  Course: { name: string };
}

interface BasicItem {
  id: string;
  username?: string;
  name?: string;
}

const UserOnCourseList: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Search & Modal State
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Data for Autocomplete
  const [allUsers, setAllUsers] = useState<BasicItem[]>([]);
  const [allCourses, setAllCourses] = useState<BasicItem[]>([]);

  // Form State
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [courseQuery, setCourseQuery] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrollRes, usersRes, coursesRes] = await Promise.all([
        axios.get("https://mypadminapi.bitmyanmar.info/api/user-on-course"),
        axios.get("https://mypadminapi.bitmyanmar.info/api/users"),
        axios.get("https://mypadminapi.bitmyanmar.info/api/courses"),
      ]);

      setEnrollments(enrollRes.data);
      setAllUsers(usersRes.data);
      setAllCourses(coursesRes.data);

      // Map usernames for the table display
      const nameMap: Record<string, string> = {};
      usersRes.data.forEach((u: any) => (nameMap[u.id] = u.username || u.name));
      setUsernames(nameMap);
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Table Data
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      const uname = usernames[e.userId]?.toLowerCase() || "";
      const cname = e.Course?.name?.toLowerCase() || "";
      return (
        uname.includes(searchTerm.toLowerCase()) ||
        cname.includes(searchTerm.toLowerCase())
      );
    });
  }, [enrollments, searchTerm, usernames]);

  // Handle Enrollment Submission
  const handleEnroll = async () => {
    if (!selectedUser || !selectedCourse)
      return alert("Please select both user and course");
    try {
      await axios.post(
        "https://mypadminapi.bitmyanmar.info/api/user-on-course/enroll",
        {
          userId: selectedUser,
          courseId: selectedCourse,
        }
      );
      setShowModal(false);
      fetchData(); // Refresh list
    } catch (error) {
      alert("Enrollment failed. User might already be enrolled.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <div className="p-5 text-muted">Loading records...</div>;

  return (
    <>
      <KTCard>
        {/* Table Header with Search and Add Button */}
        <div className="card-header border-0 pt-6">
          <div className="card-title">
            <div className="d-flex align-items-center position-relative my-1">
              <KTIcon
                iconName="magnifier"
                iconType="duotone"
                className="fs-1 position-absolute ms-6"
              />
              <input
                type="text"
                className="form-control form-control-solid w-250px ps-15"
                placeholder="Search Student or Course"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <KTIcon iconName="plus" iconType="duotone" className="fs-2" />
              Add Enrollment
            </button>
          </div>
        </div>

        <KTCardBody className="py-3">
          <div className="table-responsive">
            <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
              <thead>
                <tr className="fw-bold text-muted text-uppercase fs-7">
                  <th className="min-w-150px">Student</th>
                  <th className="min-w-150px">Course</th>
                  <th className="min-w-100px">Date</th>
                  <th className="min-w-120px">Progress</th>
                  <th className="min-w-100px text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="symbol symbol-45px me-5">
                          <span className="symbol-label bg-light-info text-info fw-bold">
                            {(usernames[item.userId] || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="d-flex justify-content-start flex-column">
                          <span className="text-dark fw-bold fs-6">
                            {usernames[item.userId]}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-dark fw-bold fs-6">
                        {item.Course?.name}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted fs-7">
                        {formatDate(item.createdAt)}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-column w-100">
                        <span className="text-muted fs-7 fw-bold">
                          {item.completedPercentage}%
                        </span>
                        <div className="progress h-6px w-100">
                          <div
                            className={`progress-bar ${
                              item.status === "DONE"
                                ? "bg-success"
                                : "bg-primary"
                            }`}
                            style={{ width: `${item.completedPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="text-end">
                      <span
                        className={`badge badge-light-${
                          item.status === "DONE" ? "success" : "warning"
                        } fw-bold px-4 py-3`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </KTCardBody>
      </KTCard>

      {/* ENROLLMENT MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <div className="modal-header">
          <h2 className="fw-bold">New Enrollment</h2>
          <div
            className="btn btn-icon btn-sm btn-active-icon-primary"
            onClick={() => setShowModal(false)}
          >
            <KTIcon iconName="cross" className="fs-1" />
          </div>
        </div>

        <div className="modal-body mx-5 mx-xl-15 my-7">
          <form className="form">
            {/* User Selection */}
            <div className="fv-row mb-7">
              <label className="fs-6 fw-semibold form-label mb-2">
                Select User
              </label>
              <input
                type="text"
                className="form-control form-control-solid"
                placeholder="Type username..."
                value={userQuery}
                onChange={(e) => {
                  setUserQuery(e.target.value);
                  setSelectedUser("");
                }}
              />
              {userQuery && !selectedUser && (
                <div
                  className="bg-white border rounded shadow-sm p-2 position-absolute w-100 z-index-1 mt-1"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {allUsers
                    .filter((u) =>
                      u.username
                        ?.toLowerCase()
                        .includes(userQuery.toLowerCase())
                    )
                    .map((u) => (
                      <div
                        key={u.id}
                        className="p-2 cursor-pointer hover-bg-light"
                        onClick={() => {
                          setSelectedUser(u.id);
                          setUserQuery(u.username || "");
                        }}
                      >
                        {u.username}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Course Selection */}
            <div className="fv-row mb-7">
              <label className="fs-6 fw-semibold form-label mb-2">
                Select Course
              </label>
              <input
                type="text"
                className="form-control form-control-solid"
                placeholder="Type course name..."
                value={courseQuery}
                onChange={(e) => {
                  setCourseQuery(e.target.value);
                  setSelectedCourse("");
                }}
              />
              {courseQuery && !selectedCourse && (
                <div
                  className="bg-white border rounded shadow-sm p-2 position-absolute w-100 z-index-1 mt-1"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {allCourses
                    .filter((c) =>
                      c.name?.toLowerCase().includes(courseQuery.toLowerCase())
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        className="p-2 cursor-pointer hover-bg-light"
                        onClick={() => {
                          setSelectedCourse(c.id);
                          setCourseQuery(c.name || "");
                        }}
                      >
                        {c.name}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="text-center pt-15">
              <button
                type="button"
                className="btn btn-light me-3"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleEnroll}
              >
                <span className="indicator-label">Enroll Student</span>
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default UserOnCourseList;
