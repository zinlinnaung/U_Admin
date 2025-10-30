import { FC } from "react";
import { useListView } from "../../core/ListViewProvider";

const InstructorsListToolbar: FC = () => {
  const { setItemIdForUpdate } = useListView();
  const openAddInstructorModal = () => {
    setItemIdForUpdate(null);
  };

  return (
    <div
      className="d-flex justify-content-end"
      data-kt-instructor-table-toolbar="base"
    >
      {/* begin::Add instructor */}
      <button
        type="button"
        className="btn btn-primary"
        onClick={openAddInstructorModal}
      >
        <i className="ki-duotone ki-plus fs-2"></i>
        Add Instructor
      </button>
      {/* end::Add instructor */}
    </div>
  );
};

export { InstructorsListToolbar };
