import { FC } from "react";

type Props = {
  count: number;
  type: "course" | "enrollment";
};

const InstructorStatsCell: FC<Props> = ({ count, type }) => {
  const getIcon = () => {
    if (type === "course") {
      return (
        <i className="ki-duotone ki-book fs-2 text-primary me-2">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
      );
    }
    return (
      <i className="ki-duotone ki-profile-user fs-2 text-success me-2">
        <span className="path1"></span>
        <span className="path2"></span>
        <span className="path3"></span>
      </i>
    );
  };

  const getBadgeColor = () => {
    if (type === "course") {
      if (count === 0) return "badge-light-secondary";
      if (count < 5) return "badge-light-warning";
      return "badge-light-primary";
    } else {
      if (count === 0) return "badge-light-secondary";
      if (count < 100) return "badge-light-info";
      return "badge-light-success";
    }
  };

  return (
    <div className="d-flex align-items-center">
      {getIcon()}
      <div className="d-flex flex-column">
        <span className="fw-bold text-gray-800 fs-6">{count}</span>
        <span className={`badge ${getBadgeColor()} fs-8 mt-1`}>
          {type === "course" ? "Courses" : "Students"}
        </span>
      </div>
    </div>
  );
};

export { InstructorStatsCell };
