import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useTasks() {
  return useQuery(api.seed.getTasks);
}

export function usePipelineItems() {
  return useQuery(api.seed.getPipelineItems);
}

export function useAgents() {
  return useQuery(api.seed.getAgents);
}

export function useMemoryEntries() {
  return useQuery(api.seed.getMemoryEntries);
}

export function useCalendarEvents() {
  return useQuery(api.seed.getCalendarEvents);
}

export function useMessages() {
  return useQuery(api.seed.getMessages);
}
