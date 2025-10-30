import { FC } from "react";
import { HeaderContext } from "@tanstack/react-table";
import { Instructor } from "../../core/_models";

type Props = {
  className?: string;
  title?: string;
  tableProps: HeaderContext<Instructor, unknown>;
};

const InstructorCustomHeader: FC<Props> = ({ className, title }) => {
  return <div className={className}>{title}</div>;
};

export { InstructorCustomHeader };
