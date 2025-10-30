import { FC, useEffect, useState } from "react";
import { MenuComponent } from "../../../../../../../_metronic/assets/ts/components";
import { ID } from "../../../../../../../_metronic/helpers";

import { useListView } from "../../core/ListViewProvider";
import { InstructorDetailModal } from "../../components/detail/InstructorDetailModal";

type Props = {
  id?: ID;
};

const InstructorActionsCell: FC<Props> = ({ id }) => {
  const [showDetail, setShowDetail] = useState(false);
  const { setItemIdForUpdate } = useListView();

  useEffect(() => {
    MenuComponent.reinitialization();
  }, []);

  const handleView = () => {
    setShowDetail(true);
  };

  const handleEdit = () => {
    // Open the edit modal by setting the instructor ID
    setItemIdForUpdate(id);
  };

  const handleResetPassword = () => {
    console.log("Reset password for:", id);
  };

  const handleViewCourses = () => {
    console.log("View courses for:", id);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this instructor?")) {
      console.log("Delete instructor:", id);
    }
  };

  return (
    <>
      <a
        href="#"
        className="btn btn-light btn-active-light-primary btn-sm"
        data-kt-menu-trigger="click"
        data-kt-menu-placement="bottom-end"
      >
        Actions
        <i className="ki-duotone ki-down fs-5 ms-1"></i>
      </a>
      {/* Menu */}
      <div
        className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-200px py-4"
        data-kt-menu="true"
      >
        {/* View */}
        <div className="menu-item px-3">
          <a className="menu-link px-3" onClick={handleView}>
            <i className="ki-duotone ki-eye fs-5 me-2">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
            </i>
            View Details
          </a>
        </div>
        {/* Edit */}
        <div className="menu-item px-3">
          <a className="menu-link px-3" onClick={handleEdit}>
            <i className="ki-duotone ki-pencil fs-5 me-2">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Edit Instructor
          </a>
        </div>
        {/* Reset Password */}
        <div className="menu-item px-3">
          <a className="menu-link px-3" onClick={handleResetPassword}>
            <i className="ki-duotone ki-key fs-5 me-2">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Reset Password
          </a>
        </div>
        {/* View Courses */}
        <div className="menu-item px-3">
          <a className="menu-link px-3" onClick={handleViewCourses}>
            <i className="ki-duotone ki-book fs-5 me-2">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            View Courses
          </a>
        </div>
        <div className="separator my-2"></div>
        {/* Delete */}
        <div className="menu-item px-3">
          <a className="menu-link px-3 text-danger" onClick={handleDelete}>
            <i className="ki-duotone ki-trash fs-5 me-2">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
              <span className="path4"></span>
              <span className="path5"></span>
            </i>
            Delete Instructor
          </a>
        </div>
      </div>

      {/* Detail Modal */}
      <InstructorDetailModal
        instructorId={id || null}
        show={showDetail}
        onHide={() => setShowDetail(false)}
      />
    </>
  );
};

export { InstructorActionsCell };
