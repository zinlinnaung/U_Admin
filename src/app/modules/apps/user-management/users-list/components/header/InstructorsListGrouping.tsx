import { FC } from "react";
import { useListView } from "../../core/ListViewProvider";
import { useQueryResponseData } from "../../core/QueryResponseProvider";

const InstructorsListGrouping: FC = () => {
  const { selected, clearSelected } = useListView();
  const instructors = useQueryResponseData();

  const deleteSelectedInstructors = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selected.length} instructors?`
      )
    ) {
      // Add your bulk delete logic here
      console.log("Delete instructors:", selected);
      clearSelected();
    }
  };

  return (
    <div className="d-flex justify-content-end align-items-center">
      <div className="fw-bold me-5">
        <span className="me-2">{selected.length}</span> Selected
      </div>

      <button
        type="button"
        className="btn btn-danger"
        onClick={deleteSelectedInstructors}
      >
        Delete Selected
      </button>
    </div>
  );
};

export { InstructorsListGrouping };
