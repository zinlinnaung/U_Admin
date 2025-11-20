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
import { studentsColumns } from "./columns/_columns";
import { Student } from "../core/_models";

import { KTCardBody } from "../../../../../../_metronic/helpers";
import { StudentListLoading } from "../components/loading/StudentListLoading";
import { StudentsListPagination } from "../components/pagination/StudentsListPagination";

const StudentsTable = () => {
  const students = useQueryResponseData();
  const isLoading = useQueryResponseLoading();
  const data = useMemo(() => students, [students]);
  const columns = useMemo(() => studentsColumns, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <KTCardBody className="py-4  ">
      <div className="table-responsive">
        <table
          id="kt_table_students"
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
              table.getRowModel().rows.map((row: Row<Student>) => (
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
                    No students found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <StudentsListPagination />
      {isLoading && <StudentListLoading />}
    </KTCardBody>
  );
};

export { StudentsTable };
