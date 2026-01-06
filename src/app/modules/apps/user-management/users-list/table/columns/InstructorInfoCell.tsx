import { FC } from "react";
import { Instructor } from "../../core/_models";

type Props = {
  instructor: Instructor;
};

const InstructorInfoCell: FC<Props> = ({ instructor }) => {
  const getInitials = (name?: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getRandomColor = (name?: string) => {
    const colors = [
      "bg-light-primary text-primary",
      "bg-light-success text-success",
      "bg-light-info text-info",
      "bg-light-warning text-warning",
      "bg-light-danger text-danger",
    ];
    const index = (name?.length || 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="d-flex align-items-center">
      {/* Avatar */}
      {/* <div className="symbol symbol-circle symbol-50px overflow-hidden me-3">
        <div className="symbol-label">
          <div
            className={`symbol-label fs-3 ${getRandomColor(instructor.name)}`}
          >
            {getInitials(instructor.name)}
          </div>
        </div>
      </div> */}
      {/* Name & Email */}
      <div className="d-flex flex-column">
        <a href="#" className="text-gray-800 text-hover-primary mb-1 fw-bold">
          {instructor.fullName}
        </a>
        {/* {instructor.email && (
          <span className="text-muted fs-7">{instructor.email}</span>
        )} */}
      </div>
    </div>
  );
};

export { InstructorInfoCell };
