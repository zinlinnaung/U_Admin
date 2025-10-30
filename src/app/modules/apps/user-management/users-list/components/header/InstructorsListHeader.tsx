import { FC } from "react";
import { useListView } from "../../core/ListViewProvider";
import { InstructorsListSearchComponent } from "./InstructorsListSearchComponent";
import { InstructorsListGrouping } from "./InstructorsListGrouping";
import { InstructorsListToolbar } from "./InstructorListToolbar";

const InstructorsListHeader: FC = () => {
  const { selected } = useListView();

  return (
    <div className="card-header border-0 pt-6">
      <InstructorsListSearchComponent />
      {/* begin::Card toolbar */}
      <div className="card-toolbar">
        {/* begin::Group actions */}
        {selected.length > 0 ? (
          <InstructorsListGrouping />
        ) : (
          <InstructorsListToolbar />
        )}
        {/* end::Group actions */}
      </div>
      {/* end::Card toolbar */}
    </div>
  );
};

export { InstructorsListHeader };
