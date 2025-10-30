import { InstructorsListHeader } from "./components/header/InstructorsListHeader";
import { InstructorsTable } from "./table/InstructorsTable";

import { KTCard } from "../../../../../_metronic/helpers";
import { InstructorEditModalWrapper } from "./user-edit-modal/InstructorEditModalWrapper";
import { QueryRequestProvider } from "./core/QueryRequestProvider";
import { QueryResponseProvider } from "./core/QueryResponseProvider";
import { ListViewProvider } from "./core/ListViewProvider";

const InstructorsList = () => {
  return (
    <>
      <KTCard>
        <InstructorsListHeader />
        <InstructorsTable />
      </KTCard>
      <InstructorEditModalWrapper />
    </>
  );
};

const InstructorsListWrapper = () => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ListViewProvider>
        <InstructorsList />
      </ListViewProvider>
    </QueryResponseProvider>
  </QueryRequestProvider>
);

export { InstructorsListWrapper };
