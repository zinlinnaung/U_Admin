import { FC, useEffect, useState } from "react";
import { MenuComponent } from "../../../../../../../_metronic/assets/ts/components";
import { ID } from "../../../../../../../_metronic/helpers";

import { useListView } from "../../core/ListViewProvider";
import { StudentDetailModal } from "../../components/detail/StudentDetailModal";
import { deleteStudent } from "../../core/_requests"; // import delete function

type Props = {
  id?: ID;
};

const StudentActionsCell: FC<Props> = ({ id }) => {
  const [showDetail, setShowDetail] = useState(false);
  const { setItemIdForUpdate } = useListView(); // get refetch to reload table

  useEffect(() => {
    MenuComponent.reinitialization();
  }, []);

  const handleView = () => {
    setShowDetail(true);
  };

  const handleEdit = () => {
    setItemIdForUpdate(id);
  };

  const handleEnrollCourse = () => {
    console.log("Enroll in course:", id);
  };

  const handleViewGrades = () => {
    console.log("View grades for:", id);
  };

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(id); // call API
        alert("Student deleted successfully!");
      } catch (err) {
        console.error(err);
        alert("Failed to delete student. Try again.");
      }
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

      <div
        className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-200px py-4"
        data-kt-menu="true"
      >
        <div className="menu-item px-3">
          <a className="menu-link px-3" onClick={handleView}>
            <i className="ki-duotone ki-eye fs-5 me-2"></i>
            View Details
          </a>
        </div>

        <div className="menu-item px-3">
          <a className="menu-link px-3" onClick={handleEdit}>
            <i className="ki-duotone ki-pencil fs-5 me-2"></i>
            Edit Student
          </a>
        </div>

        <div className="menu-item px-3">
          <a className="menu-link px-3" onClick={handleEnrollCourse}>
            <i className="ki-duotone ki-book fs-5 me-2"></i>
            Enroll in Course
          </a>
        </div>

        <div className="menu-item px-3">
          <a className="menu-link px-3" onClick={handleViewGrades}>
            <i className="ki-duotone ki-chart-simple fs-5 me-2"></i>
            View Grades
          </a>
        </div>

        <div className="separator my-2"></div>

        <div className="menu-item px-3">
          <a className="menu-link px-3 text-danger" onClick={handleDelete}>
            <i className="ki-duotone ki-trash fs-5 me-2"></i>
            Delete Student
          </a>
        </div>
      </div>

      <StudentDetailModal
        studentId={id || null}
        show={showDetail}
        onHide={() => setShowDetail(false)}
      />
    </>
  );
};

export { StudentActionsCell };
