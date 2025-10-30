import { FC, useEffect, useState } from "react";
import { useQueryRequest } from "../../core/QueryRequestProvider";
import { initialQueryState } from "../../../../../../../_metronic/helpers";

const StudentsListSearchComponent: FC = () => {
  const { updateState } = useQueryRequest();
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== undefined && searchTerm !== null) {
        updateState({ search: searchTerm, ...initialQueryState });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="card-title">
      <div className="d-flex align-items-center position-relative my-1">
        <i className="ki-duotone ki-magnifier fs-3 position-absolute ms-5">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
        <input
          type="text"
          data-kt-student-table-filter="search"
          className="form-control form-control-solid w-250px ps-13"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export { StudentsListSearchComponent };
