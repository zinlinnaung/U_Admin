import { FC } from "react";
import { useListView } from "../../core/ListViewProvider";

const InstructorSelectionHeader: FC = () => {
  const { isAllSelected, onSelectAll } = useListView();

  return (
    <div className="form-check form-check-sm form-check-custom form-check-solid me-3">
      <input
        className="form-check-input"
        type="checkbox"
        data-kt-check={isAllSelected}
        data-kt-check-target="#kt_table_instructors .form-check-input"
        checked={isAllSelected}
        onChange={onSelectAll}
      />
    </div>
  );
};

export { InstructorSelectionHeader };
