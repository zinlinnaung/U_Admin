import { FC } from "react";
import { useListView } from "../../core/ListViewProvider";

const StudentsListToolbar: FC = () => {
  const { setItemIdForUpdate } = useListView();

  const openAddStudentModal = () => {
    setItemIdForUpdate(null);
  };

  return (
    <div
      className="d-flex justify-content-end"
      data-kt-student-table-toolbar="base"
    >
      <button
        type="button"
        className="btn btn-primary"
        onClick={openAddStudentModal}
      >
        <i className="ki-duotone ki-plus fs-2"></i>
        Add Student
      </button>
    </div>
  );
};

export { StudentsListToolbar };
