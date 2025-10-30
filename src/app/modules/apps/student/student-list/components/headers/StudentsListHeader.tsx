import { FC } from "react";
import { useListView } from "../../core/ListViewProvider";
import { StudentsListSearchComponent } from "./StudentsListSearchComponent";
import { StudentsListToolbar } from "./StudentsListToolbar";
import { StudentsListGrouping } from "./StudentsListGrouping";

const StudentsListHeader: FC = () => {
  const { selected } = useListView();

  return (
    <div className="card-header border-0 pt-6">
      <StudentsListSearchComponent />
      <div className="card-toolbar">
        {selected.length > 0 ? (
          <StudentsListGrouping />
        ) : (
          <StudentsListToolbar />
        )}
      </div>
    </div>
  );
};

export { StudentsListHeader };
