import { ColumnDef } from "@tanstack/react-table";
import { Student } from "../../core/_models";
import { StudentCustomHeader } from "./StudentCustomHeader";
import { StudentActionsCell } from "./StudentActionsCell";

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
    cell: (info) => <span>{info.row.original.platform}</span>,
  },

  // {
  //   header: (props) => (
  //     <StudentCustomHeader
  //       tableProps={props}
  //       title="Special Needs"
  //       className="min-w-150px"
  //     />
  //   ),
  //   id: "specialNeeds",
  //   cell: (info) => (
  //     <span>{info.row.original.specialNeeds ? "Yes" : "No"}</span>
  //   ),
  // },

  // {
  //   header: (props) => (
  //     <StudentCustomHeader
  //       tableProps={props}
  //       title="Accepted Terms"
  //       className="min-w-150px"
  //     />
  //   ),
  //   id: "acceptedTerms",
  //   cell: (info) => <span>{info.row.original.acceptedTerms ? "✔" : "✘"}</span>,
  // },

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
