import { ColumnDef } from "@tanstack/react-table";
import { Student } from "../../core/_models";
import { StudentCustomHeader } from "./StudentCustomHeader";
import { StudentActionsCell } from "./StudentActionsCell";

// Custom sorting function for the 'Date of Birth' column
// It creates a comparable Date object from the separate day, month, and year fields.
const dobSortingFn: ColumnDef<Student>["sortingFn"] = (
  rowA,
  rowB,
  columnId
) => {
  // Helper to safely coerce a possibly undefined or string value to a number.
  const toNum = (v?: string | number): number =>
    typeof v === "number" ? v : Number(v ?? 0);

  // NOTE: Month in JavaScript Date is 0-indexed (Jan=0, Dec=11), so we subtract 1 from dobMonth.
  const dateA = new Date(
    toNum(rowA.original.dobYear),
    toNum(rowA.original.dobMonth) - 1,
    toNum(rowA.original.dobDay)
  ).getTime();
  const dateB = new Date(
    toNum(rowB.original.dobYear),
    toNum(rowB.original.dobMonth) - 1,
    toNum(rowB.original.dobDay)
  ).getTime();

  if (dateA < dateB) return -1; // rowA comes first
  if (dateA > dateB) return 1; // rowB comes first
  return 0; // Dates are equal
};

export const studentsColumns: ColumnDef<Student>[] = [
  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="ID"
        className="min-w-80px"
      />
    ),
    id: "id",
    accessorKey: "id", // <-- Enables Sorting
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
        title="User Name"
        className="min-w-150px"
      />
    ),
    id: "username",
    accessorKey: "username", // <-- Enables Sorting
    cell: (info) => <span>{info.row.original.username}</span>,
  },

  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="Email"
        className="min-w-200px"
      />
    ),
    id: "email",
    accessorKey: "email", // <-- Enables Sorting
    cell: (info) => <span>{info.row.original.email}</span>,
  },

  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="Phone"
        className="min-w-150px"
      />
    ),
    id: "phone",
    accessorKey: "phone", // <-- Enables Sorting
    cell: (info) => <span>{info.row.original.phone}</span>,
  },

  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="Display Name"
        className="min-w-200px"
      />
    ),
    id: "displayName",
    accessorKey: "displayName", // <-- Enables Sorting
    cell: (info) => <span>{info.row.original.displayName}</span>,
  },

  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="Region"
        className="min-w-150px"
      />
    ),
    id: "region",
    accessorKey: "region", // <-- Enables Sorting
    cell: (info) => <span>{info.row.original.region}</span>,
  },

  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="Township"
        className="min-w-150px"
      />
    ),
    id: "township",
    accessorKey: "township", // <-- Enables Sorting
    cell: (info) => <span>{info.row.original.township}</span>,
  },

  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="Country"
        className="min-w-150px"
      />
    ),
    id: "country",
    accessorKey: "country", // <-- Enables Sorting
    cell: (info) => <span>{info.row.original.country}</span>,
  },

  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="Date of Birth"
        className="min-w-200px"
      />
    ),
    id: "dob",
    sortingFn: dobSortingFn, // <-- Enables Sorting (Custom Logic)
    cell: (info) => {
      const s = info.row.original;
      return <span>{`${s.dobDay}-${s.dobMonth}-${s.dobYear}`}</span>;
    },
  },

  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="Gender"
        className="min-w-120px"
      />
    ),
    id: "gender",
    accessorKey: "gender", // <-- Enables Sorting
    cell: (info) => <span>{info.row.original.gender}</span>,
  },

  {
    header: (props) => (
      <StudentCustomHeader
        tableProps={props}
        title="Platform"
        className="min-w-200px"
      />
    ),
    id: "platform",
    accessorKey: "platform", // <-- Enables Sorting
    cell: (info) => <span>{info.row.original.platform}</span>,
  },

  // The 'Actions' column is not typically sortable.
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
