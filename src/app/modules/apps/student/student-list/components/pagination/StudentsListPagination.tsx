import { FC } from "react";
import clsx from "clsx";
import {
  useQueryResponseLoading,
  useQueryResponsePagination,
} from "../../core/QueryResponseProvider";
import { useQueryRequest } from "../../core/QueryRequestProvider";
import { useQueryResponseData } from "../../core/QueryResponseProvider";

const mappedLabel = (label: string): string => {
  if (label === "&laquo; Previous") {
    return "Previous";
  }

  if (label === "Next &raquo;") {
    return "Next";
  }

  return label;
};

const StudentsListPagination: FC = () => {
  const pagination = useQueryResponsePagination();
  const isLoading = useQueryResponseLoading();
  const { updateState } = useQueryRequest();
  const data = useQueryResponseData();

  const updatePage = (page: number | null | undefined) => {
    if (!page || isLoading || pagination.page === page) {
      return;
    }

    updateState({ page, items_per_page: pagination.items_per_page || 10 });
  };

  // Calculate total from data or use a safe fallback
  const total = data?.length || 0;
  const itemsPerPage = pagination.items_per_page || 10;
  const currentPage = pagination.page || 1;

  return (
    <div className="row">
      <div className="col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start">
        {total > 0 && (
          <div className="dataTables_info">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, total)} of {total} instructors
          </div>
        )}
      </div>
      <div className="col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end">
        <div id="kt_table_instructors_paginate">
          <ul className="pagination">
            {pagination.links?.map((link) => {
              return (
                <li
                  key={link.label}
                  className={clsx("page-item", {
                    active: currentPage === link.page,
                    disabled: isLoading,
                    previous: link.label === "&laquo; Previous",
                    next: link.label === "Next &raquo;",
                  })}
                >
                  <a
                    className={clsx("page-link", {
                      "page-text":
                        link.label === "&laquo; Previous" ||
                        link.label === "Next &raquo;",
                    })}
                    onClick={() => updatePage(link.page)}
                    style={{ cursor: "pointer" }}
                  >
                    {mappedLabel(link.label)}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export { StudentsListPagination };
