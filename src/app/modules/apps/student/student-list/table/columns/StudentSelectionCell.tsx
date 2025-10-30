import { FC } from "react";
import { useListView } from "../../core/ListViewProvider";
import { ID } from "../../../../../../../_metronic/helpers";

type Props = {
  id?: ID;
};

const StudentSelectionCell: FC<Props> = ({ id }) => {
  const { selected, onSelect } = useListView();

  return (
    <div className="form-check form-check-sm form-check-custom form-check-solid">
      <input
        className="form-check-input"
        type="checkbox"
        data-kt-check-target="#kt_table_students .form-check-input"
        checked={selected.includes(id as ID)}
        onChange={() => onSelect(id as ID)}
      />
    </div>
  );
};

export { StudentSelectionCell };
