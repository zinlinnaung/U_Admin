import {
  FC,
  useContext,
  useState,
  useEffect,
  useMemo,
  createContext,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createResponseContext,
  initialQueryResponse,
  initialQueryState,
  PaginationState,
  WithChildren,
  stringifyRequestQuery,
} from "../../../../../../_metronic/helpers";
import { getInstructors } from "./_requests";
import { Instructor } from "./_models";
import { useQueryRequest } from "./QueryRequestProvider";

const QueryResponseContext =
  createResponseContext<Instructor>(initialQueryResponse);

const QueryResponseProvider: FC<WithChildren> = ({ children }) => {
  const { state } = useQueryRequest();
  const [query, setQuery] = useState<string>(stringifyRequestQuery(state));
  const updatedQuery = useMemo(() => stringifyRequestQuery(state), [state]);

  useEffect(() => {
    if (query !== updatedQuery) {
      setQuery(updatedQuery);
    }
  }, [updatedQuery]);

  // ✅ FIXED FOR V5
  const {
    isFetching,
    refetch,
    data: response,
  } = useQuery({
    queryKey: ["instructors", query],
    queryFn: () => getInstructors(query),
    gcTime: 0,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });

  return (
    <QueryResponseContext.Provider
      value={{ isLoading: isFetching, refetch, response, query }}
    >
      {children}
    </QueryResponseContext.Provider>
  );
};

const useQueryResponse = () => useContext(QueryResponseContext);

const useQueryResponseData = (): Instructor[] => {
  const { response } = useQueryResponse();
  if (!response) {
    return [];
  }

  return (response?.data || []) as Instructor[];
};

const useQueryResponsePagination = () => {
  const defaultPaginationState: PaginationState = {
    links: [],
    ...initialQueryState,
  };

  const { response } = useQueryResponse();
  if (!response || !response.payload || !response.payload.pagination) {
    return defaultPaginationState;
  }

  return response.payload.pagination;
};

const useQueryResponseLoading = (): boolean => {
  const { isLoading } = useQueryResponse();
  return isLoading;
};

export {
  QueryResponseProvider,
  useQueryResponse,
  useQueryResponseData,
  useQueryResponsePagination,
  useQueryResponseLoading,
};
