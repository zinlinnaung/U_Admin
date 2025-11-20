import { FC } from "react";
import { Student } from "../../core/_models";

type Props = {
  student: Student;
};

const StudentInfoCell: FC<Props> = ({ student }) => {
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
      {/* <div className="symbol symbol-circle symbol-50px overflow-hidden me-3">
        <div className="symbol-label">
          <div className={`symbol-label fs-3 ${getRandomColor(student.name)}`}>
            {getInitials(student.name)}
          </div>
        </div>
      </div> */}
      <div className="d-flex flex-column">
        <a href="#" className="text-gray-800 text-hover-primary mb-1 fw-bold">
          {student.username}
        </a>
        {/* {student.email && (
          <span className="text-muted fs-7">{student.email}</span>
        )} */}
      </div>
    </div>
  );
};

export { StudentInfoCell };
