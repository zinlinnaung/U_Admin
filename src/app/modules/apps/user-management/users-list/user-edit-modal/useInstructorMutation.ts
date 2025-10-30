import { useMutation } from "@tanstack/react-query";
import { useQueryResponse } from "../core/QueryResponseProvider";
import { createInstructor, updateInstructor } from "../core/_requests";
import { Instructor } from "../core/_models";

export const useCreateInstructor = () => {
  const { refetch } = useQueryResponse();

  return useMutation({
    mutationFn: (instructor: Instructor) => createInstructor(instructor),
    onSuccess: () => {
      // Refetch the instructor list
      refetch();
    },
  });
};

export const useUpdateInstructor = () => {
  const { refetch } = useQueryResponse();

  return useMutation({
    mutationFn: (instructor: Instructor) => updateInstructor(instructor),
    onSuccess: () => {
      // Refetch the instructor list
      refetch();
    },
  });
};
