import { ColumnDef } from "@tanstack/react-table";
import { InstructorInfoCell } from "./InstructorInfoCell";
import { InstructorLastLoginCell } from "./InstructorLastLoginCell";
import { InstructorPasswordCell } from "./InstructorPasswordCell";
import { InstructorStatsCell } from "./InstructorStatsCell";
import { InstructorActionsCell } from "./InstructorActionsCell";
import { InstructorSelectionCell } from "./InstructorSelectionCell";
import { InstructorCustomHeader } from "./InstructorCustomHeader";
import { InstructorSelectionHeader } from "./InstructorSelectionHeader";
import { Instructor } from "../../core/_models";

const instructorsColumns: ColumnDef<Instructor>[] = [
  {
    header: () => <InstructorSelectionHeader />,
    id: "selection",
    cell: (info) => <InstructorSelectionCell id={info.row.original.id} />,
  },
  {
    header: (props) => (
      <InstructorCustomHeader
        tableProps={props}
        title="ID"
        className="min-w-100px"
      />
    ),
    id: "id",
    cell: (info) => (
      <span className="badge badge-light-primary fw-bold fs-7">
        {info.row.original.id}
      </span>
    ),
  },
  {
    header: (props) => (
      <InstructorCustomHeader
        tableProps={props}
        title="Name"
        className="min-w-200px"
      />
    ),
    id: "name",
    cell: (info) => <InstructorInfoCell instructor={info.row.original} />,
  },

  // {
  //   header: (props) => (
  //     <InstructorCustomHeader
  //       tableProps={props}
  //       title="Course Count"
  //       className="min-w-125px"
  //     />
  //   ),
  //   id: "courseCount",
  //   cell: (info) => (
  //     <InstructorStatsCell
  //       count={info.row.original.courseCount || 0}
  //       type="course"
  //     />
  //   ),
  // },
  // {
  //   header: (props) => (
  //     <InstructorCustomHeader
  //       tableProps={props}
  //       title="Enrollment Count"
  //       className="min-w-150px"
  //     />
  //   ),
  //   id: "enrollmentCount",
  //   cell: (info) => (
  //     <InstructorStatsCell
  //       count={info.row.original.enrollmentCount || 0}
  //       type="enrollment"
  //     />
  //   ),
  // },
  {
    header: (props) => (
      <InstructorCustomHeader
        tableProps={props}
        title="Last Login"
        className="min-w-200px"
      />
    ),
    id: "lastLogin",
    cell: (info) => (
      <InstructorLastLoginCell lastLogin={info.row.original.updatedAt} />
    ),
  },
  {
    header: (props) => (
      <InstructorCustomHeader
        tableProps={props}
        title="Actions"
        className="text-end min-w-100px"
      />
    ),
    id: "actions",
    cell: (info) => <InstructorActionsCell id={info.row.original.id} />,
  },
];

export { instructorsColumns };
