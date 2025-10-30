import { FC, useState, createContext, useContext } from "react";
import {
  QueryState,
  QueryRequestContextProps,
  initialQueryState,
  WithChildren,
} from "../../../../../../_metronic/helpers";

const QueryRequestContext = createContext<QueryRequestContextProps>({
  state: initialQueryState,
  updateState: () => {},
});

const QueryRequestProvider: FC<WithChildren> = ({ children }) => {
  const [state, setState] = useState<QueryState>(initialQueryState);

  const updateState = (updates: Partial<QueryState>) => {
    const updatedState = { ...state, ...updates } as QueryState;
    setState(updatedState);
  };

  return (
    <QueryRequestContext.Provider value={{ state, updateState }}>
      {children}
    </QueryRequestContext.Provider>
  );
};

const useQueryRequest = () => useContext(QueryRequestContext);

export { QueryRequestProvider, useQueryRequest };
