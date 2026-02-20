import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useMasterSku() {
  return useQuery(api.queries.getMasterSku);
}

export function useAddMasterSku() {
  return useMutation(api.mutations.addMasterSku);
}

export function useUpdateMasterSku() {
  return useMutation(api.mutations.updateMasterSku);
}

export function useBulkUpsertSku() {
  return useMutation(api.mutations.bulkUpsertSku);
}

export function useSeedData() {
  return useMutation(api.seed.seedData);
}
