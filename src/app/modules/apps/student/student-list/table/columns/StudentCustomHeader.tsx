import { FC } from "react";
import { HeaderContext } from "@tanstack/react-table";
import { Student } from "../../core/_models";

type Props = {
  className?: string;
  title?: string;
  tableProps: HeaderContext<Student, unknown>;
};

const StudentCustomHeader: FC<Props> = ({ className, title }) => {
  return <div className={className}>{title}</div>;
};

export { StudentCustomHeader };
