import { FC, useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { ID } from "../../../../../../../_metronic/helpers";
import { Student } from "../../core/_models";
import { getStudentById } from "../../core/_requests";
import { StudentDetailView } from "./StudentDetailView";

type Props = {
  studentId: ID | null;
  show: boolean;
  onHide: () => void;
};

const StudentDetailModal: FC<Props> = ({ studentId, show, onHide }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (studentId && show) {
      setLoading(true);
      getStudentById(studentId)
        .then((data) => {
          if (data) {
            setStudent(data);
          }
        })
        .catch((error) => {
          console.error("Error loading student:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [studentId, show]);

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">Student Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        {loading ? (
          <div className="text-center py-10">
            <span className="spinner-border spinner-border-lg align-middle"></span>
            <p className="text-muted mt-3">Loading student details...</p>
          </div>
        ) : student ? (
          <StudentDetailView student={student} onClose={onHide} />
        ) : (
          <div className="text-center py-10">
            <p className="text-muted">Student not found</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export { StudentDetailModal };
