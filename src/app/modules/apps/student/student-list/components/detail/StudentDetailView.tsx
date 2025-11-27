import { FC } from "react";
import { Student } from "../../core/_models";
import { useListView } from "../../core/ListViewProvider";

type Props = {
  student: Student;
  onClose: () => void;
};

const StudentDetailView: FC<Props> = ({ student, onClose }) => {
  const { setItemIdForUpdate } = useListView();

  const maskPassword = () => {
    if (!student.password) return "N/A";
    return "•".repeat(8);
  };

  const formatDOB = (year?: string, month?: string, day?: string) => {
    if (!year || !month || !day) return "N/A";
    return `${day.padStart(2, "0")} / ${month.padStart(2, "0")} / ${year}`;
  };

  const handleEdit = () => {
    onClose();
    setItemIdForUpdate(student.id);
  };

  return (
    <div className="d-flex flex-column gap-7 gap-lg-10">
      {/* HEADER */}
      <div className="card card-flush">
        <div className="card-body">
          <div className="d-flex flex-column">
            <h2 className="fw-bold text-gray-900 mb-2">
              {student.displayName}
            </h2>

            <div className="d-flex align-items-center text-gray-600 mb-2">
              <i className="ki-duotone ki-profile-circle fs-4 me-1"></i>
              Username:{" "}
              <span className="ms-2 fw-semibold">{student.username}</span>
            </div>

            <div className="d-flex align-items-center text-gray-600 mb-2">
              <i className="ki-duotone ki-sms fs-4 me-1"></i>
              Email:
              <a
                href={`mailto:${student.email}`}
                className="ms-2 text-hover-primary fw-semibold"
              >
                {student.email}
              </a>
            </div>

            {student.phone && (
              <div className="d-flex align-items-center text-gray-600">
                <i className="ki-duotone ki-call fs-4 me-1"></i>
                Phone: <span className="ms-2 fw-semibold">{student.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAILS */}
      <div className="card card-flush">
        <div className="card-header">
          <h3 className="card-title fw-bold">Student Information</h3>
        </div>

        <div className="card-body pt-0">
          <div className="mb-5">
            <div className="mb-3">
              <span className="fw-bold text-gray-800 me-2">Display Name:</span>
              <span className="text-gray-600">{student.displayName}</span>
            </div>

            <div className="mb-3">
              <span className="fw-bold text-gray-800 me-2">Gender:</span>
              <span className="text-gray-600">{student.gender || "N/A"}</span>
            </div>

            <div className="mb-3">
              <span className="fw-bold text-gray-800 me-2">Date of Birth:</span>
              <span className="text-gray-600">
                {formatDOB(student.dobDay, student.dobMonth, student.dobYear)}
              </span>
            </div>

            <div className="mb-3">
              <span className="fw-bold text-gray-800 me-2">Region:</span>
              <span className="text-gray-600">{student.region || "N/A"}</span>
            </div>

            <div className="mb-3">
              <span className="fw-bold text-gray-800 me-2">Township:</span>
              <span className="text-gray-600">{student.township || "N/A"}</span>
            </div>

            <div className="mb-3">
              <span className="fw-bold text-gray-800 me-2">Country:</span>
              <span className="text-gray-600">{student.country || "N/A"}</span>
            </div>

            <div className="mb-3">
              <span className="fw-bold text-gray-800 me-2">
                How did you know us:
              </span>
              <span className="text-gray-600">{student.platform || "N/A"}</span>
            </div>

            {student.platform === "Other" && (
              <div className="mb-3">
                <span className="fw-bold text-gray-800 me-2">
                  Platform Details:
                </span>
                <span className="text-gray-600">
                  {student.platformOtherText || "N/A"}
                </span>
              </div>
            )}

            <div className="mb-3">
              <span className="fw-bold text-gray-800 me-2">Special Needs:</span>
              <span className="text-gray-600">
                {student.specialNeeds ? "Yes" : "No"}
              </span>
            </div>

            <div className="mb-3">
              <span className="fw-bold text-gray-800 me-2">
                Accepted Terms:
              </span>
              <span className="text-gray-600">
                {student.acceptedTerms ? "Accepted" : "Not Accepted"}
              </span>
            </div>

            <div className="mb-3">
              <span className="fw-bold text-gray-800 me-2">Password:</span>
              <span className="text-gray-600">{maskPassword()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="card card-flush">
        <div className="card-body text-end">
          <button className="btn btn-light me-3" onClick={onClose}>
            Close
          </button>

          <button className="btn btn-primary" onClick={handleEdit}>
            <i className="ki-duotone ki-pencil fs-2"></i>
            Edit Student
          </button>
        </div>
      </div>
    </div>
  );
};

export { StudentDetailView };
