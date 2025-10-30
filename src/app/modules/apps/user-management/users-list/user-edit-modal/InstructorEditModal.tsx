import { FC, useState, useEffect } from "react";
import { Modal } from "react-bootstrap";

import { InstructorEditModalForm } from "./InstructorEditModalForm";
import { useListView } from "../core/ListViewProvider";

const InstructorEditModal: FC = () => {
  const { itemIdForUpdate, setItemIdForUpdate } = useListView();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (itemIdForUpdate !== undefined) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [itemIdForUpdate]);

  const handleClose = () => {
    setItemIdForUpdate(undefined);
    setShow(false);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {itemIdForUpdate ? "Edit Instructor" : "Add New Instructor"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InstructorEditModalForm
          instructorId={itemIdForUpdate}
          onClose={handleClose}
        />
      </Modal.Body>
    </Modal>
  );
};

export { InstructorEditModal };
