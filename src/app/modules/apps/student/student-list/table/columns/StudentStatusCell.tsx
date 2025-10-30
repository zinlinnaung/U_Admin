import { FC } from "react";

type Props = {
  status?: "Active" | "Inactive" | "Graduated";
};

const StudentStatusCell: FC<Props> = ({ status }) => {
  const getStatusBadge = () => {
    switch (status) {
      case "Active":
        return "badge-light-success";
      case "Inactive":
        return "badge-light-warning";
      case "Graduated":
        return "badge-light-info";
      default:
        return "badge-light-secondary";
    }
  };

  return (
    <span className={`badge ${getStatusBadge()} fw-bold`}>
      {status || "Unknown"}
    </span>
  );
};

export { StudentStatusCell };
