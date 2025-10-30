import { ColumnDef } from "@tanstack/react-table";

import { Student } from "../../core/_models";
import { StudentInfoCell } from "./StudentInfoCell";
import { StudentGPACell } from "./StudentGPACell";
import { StudentStatusCell } from "./StudentStatusCell";
import { StudentLastLoginCell } from "./StudentLastLoginCell";
import { StudentCustomHeader } from "./StudentCustomHeader";
import { StudentActionsCell } from "./StudentActionsCell";
import { StudentSelectionCell } from "./StudentSelectionCell";
import { StudentSelectionHeader } from "./StudentSelectionHeader";

const studentsColumns: ColumnDef<Student>[] = [
  {
    header: () => <StudentSelectionHeader />,
    id: "selection",
    cell: (info) => <StudentSelectionCell id={info.row.original.id} />,
  },
  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="ID"
        className="min-w-100px"
      />
    ),
    id: "id",
    cell: (info) => (
      <span className="badge badge-light-info fw-bold fs-7">
        {info.row.original.id}
      </span>
    ),
  },
  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="Name"
        className="min-w-200px"
      />
    ),
    id: "name",
    cell: (info) => <StudentInfoCell student={info.row.original} />,
  },
  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="Course Count"
        className="min-w-125px"
      />
    ),
    id: "courseCount",
    cell: (info) => (
      <div className="d-flex align-items-center">
        <i className="ki-duotone ki-book fs-2 text-primary me-2">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
        <span className="fw-bold text-gray-800">
          {info.row.original.courseCount || 0}
        </span>
      </div>
    ),
  },
  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="GPA"
        className="min-w-100px"
      />
    ),
    id: "gpa",
    cell: (info) => <StudentGPACell gpa={info.row.original.gpa} />,
  },
  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="Status"
        className="min-w-125px"
      />
    ),
    id: "status",
    cell: (info) => <StudentStatusCell status={info.row.original.status} />,
  },
  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="Last Login"
        className="min-w-200px"
      />
    ),
    id: "lastLogin",
    cell: (info) => (
      <StudentLastLoginCell lastLogin={info.row.original.lastLogin} />
    ),
  },
  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="Actions"
        className="text-end min-w-100px"
      />
    ),
    id: "actions",
    cell: (info) => <StudentActionsCell id={info.row.original.id} />,
  },
];

export { studentsColumns };
