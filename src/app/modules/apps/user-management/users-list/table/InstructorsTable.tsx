import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  Row,
} from "@tanstack/react-table";
import {
  useQueryResponseData,
  useQueryResponseLoading,
} from "../core/QueryResponseProvider";
import { instructorsColumns } from "./columns/_columns";
import { Instructor } from "../core/_models";

import { KTCardBody } from "../../../../../../_metronic/helpers";
import { InstructorsListPagination } from "../components/pagination/InstructorsListPagination";
import { InstructorsListLoading } from "../components/loading/InstructorsListLoading";

const InstructorsTable = () => {
  const instructors = useQueryResponseData();
  const isLoading = useQueryResponseLoading();
  const data = useMemo(() => instructors, [instructors]);
  const columns = useMemo(() => instructorsColumns, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <KTCardBody className="py-4">
      <div className="table-responsive">
        <table
          id="kt_table_instructors"
          className="table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer"
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="text-start text-muted fw-bolder fs-7 text-uppercase gs-0"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="text-gray-600 fw-bold">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row: Row<Instructor>) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <div className="d-flex text-center w-100 align-content-center justify-content-center">
                    No instructors found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <InstructorsListPagination />
      {isLoading && <InstructorsListLoading />}
    </KTCardBody>
  );
};

export { InstructorsTable };
