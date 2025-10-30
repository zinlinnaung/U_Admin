import { Column } from "react-table";
import { RoleInfoCell } from "./RoleInfoCell";
import { RoleActionsCell } from "./RoleActionsCell";
import { RoleSelectionCell } from "./RoleSelectionCell";
import { RoleCustomHeader } from "./RoleCustomHeader";
import { RoleSelectionHeader } from "./RoleSelectionHeader";
import { Role } from "../../../core/_models";

const rolesColumns: ReadonlyArray<Column<Role>> = [
  {
    Header: (props) => <RoleSelectionHeader tableProps={props} />,
    id: "selection",
    Cell: ({ ...props }) => (
      <RoleSelectionCell id={props.data[props.row.index].id} />
    ),
  },
  {
    Header: (props) => (
      <RoleCustomHeader
        tableProps={props}
        title="Role Name"
        className="min-w-200px"
      />
    ),
    id: "name",
    Cell: ({ ...props }) => <RoleInfoCell role={props.data[props.row.index]} />,
  },
  {
    Header: (props) => (
      <RoleCustomHeader
        tableProps={props}
        title="Description"
        className="min-w-250px"
      />
    ),
    accessor: "description",
  },
  {
    Header: (props) => (
      <RoleCustomHeader
        tableProps={props}
        title="Permissions"
        className="min-w-125px"
      />
    ),
    id: "permissions",
    Cell: ({ ...props }) => {
      const role = props.data[props.row.index];
      const permissionCount = role.permissions?.length || 0;
      return (
        <div className="badge badge-light-primary fw-bolder">
          {permissionCount}{" "}
          {permissionCount === 1 ? "Permission" : "Permissions"}
        </div>
      );
    },
  },
  {
    Header: (props) => (
      <RoleCustomHeader
        tableProps={props}
        title="Users"
        className="min-w-100px"
      />
    ),
    id: "userCount",
    Cell: ({ ...props }) => {
      const userCount = props.data[props.row.index].userCount || 0;
      return (
        <div className="badge badge-light-info fw-bolder">
          {userCount} {userCount === 1 ? "User" : "Users"}
        </div>
      );
    },
  },
  {
    Header: (props) => (
      <RoleCustomHeader
        tableProps={props}
        title="Status"
        className="min-w-100px"
      />
    ),
    id: "status",
    Cell: ({ ...props }) => {
      const status = props.data[props.row.index].status;
      return (
        <div
          className={`badge badge-light-${
            status === "Active" ? "success" : "danger"
          } fw-bolder`}
        >
          {status}
        </div>
      );
    },
  },
  {
    Header: (props) => (
      <RoleCustomHeader
        tableProps={props}
        title="Actions"
        className="text-end min-w-100px"
      />
    ),
    id: "actions",
    Cell: ({ ...props }) => (
      <RoleActionsCell
        id={props.data[props.row.index].id}
        isSystemRole={props.data[props.row.index].isSystemRole}
      />
    ),
  },
];

export { rolesColumns };
