import { FC } from "react";

type Props = {
  gpa?: number;
};

const StudentGPACell: FC<Props> = ({ gpa }) => {
  const getGPAColor = (gpa?: number) => {
    if (!gpa) return "badge-light-secondary";
    if (gpa >= 3.7) return "badge-light-success";
    if (gpa >= 3.0) return "badge-light-primary";
    if (gpa >= 2.0) return "badge-light-warning";
    return "badge-light-danger";
  };

  return (
    <span className={`badge ${getGPAColor(gpa)} fw-bold fs-6`}>
      {gpa ? gpa.toFixed(2) : "N/A"}
    </span>
  );
};

export { StudentGPACell };
