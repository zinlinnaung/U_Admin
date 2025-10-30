import { FC } from "react";
import { ID } from "../../../../../../../_metronic/helpers";

type Props = {
  id?: ID;
};

const InstructorPasswordCell: FC<Props> = ({ id }) => {
  const handleResetPassword = () => {
    // Add your password reset logic here
    console.log("Reset password for instructor:", id);
  };

  return (
    <div className="d-flex align-items-center">
      <span className="text-gray-600 fw-semibold">••••••••</span>
      <button
        className="btn btn-sm btn-icon btn-light-primary ms-2"
        title="Reset password"
        onClick={handleResetPassword}
      >
        <i className="ki-duotone ki-key fs-2">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
      </button>
    </div>
  );
};

export { InstructorPasswordCell };
