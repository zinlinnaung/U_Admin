import { FC, useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { ID } from "../../../../../../../_metronic/helpers";
import { Instructor } from "../../core/_models";
import { getInstructorById } from "../../core/_requests";
import { InstructorDetailView } from "./InstructorDetailView";

type Props = {
  instructorId: ID | null;
  show: boolean;
  onHide: () => void;
};

const InstructorDetailModal: FC<Props> = ({ instructorId, show, onHide }) => {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (instructorId && show) {
      setLoading(true);
      getInstructorById(instructorId)
        .then((data) => {
          if (data) {
            setInstructor(data);
          }
        })
        .catch((error) => {
          console.error("Error loading instructor:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [instructorId, show]);

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">Instructor Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        {loading ? (
          <div className="text-center py-10">
            <span className="spinner-border spinner-border-lg align-middle"></span>
            <p className="text-muted mt-3">Loading instructor details...</p>
          </div>
        ) : instructor ? (
          <InstructorDetailView instructor={instructor} onClose={onHide} />
        ) : (
          <div className="text-center py-10">
            <p className="text-muted">Instructor not found</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export { InstructorDetailModal };
