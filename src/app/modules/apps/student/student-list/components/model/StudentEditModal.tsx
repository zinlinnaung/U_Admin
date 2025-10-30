import { FC, useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useListView } from "../../core/ListViewProvider";
import { StudentEditModalForm } from "./StudentEditModalForm";

const StudentEditModal: FC = () => {
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
          {itemIdForUpdate ? "Edit Student" : "Add New Student"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <StudentEditModalForm
          studentId={itemIdForUpdate}
          onClose={handleClose}
        />
      </Modal.Body>
    </Modal>
  );
};

export { StudentEditModal };
