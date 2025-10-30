import { KTCard } from "../../../../../_metronic/helpers";

import { QueryRequestProvider } from "./core/QueryRequestProvider";
import { QueryResponseProvider } from "./core/QueryResponseProvider";
import { ListViewProvider } from "./core/ListViewProvider";
import { StudentsListHeader } from "./components/headers/StudentsListHeader";
import { StudentsTable } from "./table/StudentsTable";
import { StudentEditModalWrapper } from "./components/model/StudentEditModalWrapper";

const StudentsList = () => {
  return (
    <>
      <KTCard>
        <StudentsListHeader />
        <StudentsTable />
      </KTCard>
      <StudentEditModalWrapper />
    </>
  );
};

const StudentsListWrapper = () => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ListViewProvider>
        <StudentsList />
      </ListViewProvider>
    </QueryResponseProvider>
  </QueryRequestProvider>
);

export { StudentsListWrapper };
