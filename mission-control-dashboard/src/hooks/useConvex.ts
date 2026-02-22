import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// Master SKU
export function useMasterSku() {
  return useQuery(api.queries.getMasterSku);
}

export function useMasterSkuByBarcode(barcode: string) {
  return useQuery(api.queries.getMasterSkuByBarcode, { barcode });
}

export function useMasterSkuByBrand(brand: string) {
  return useQuery(api.queries.getMasterSkuByBrand, { brand });
}

export function useInsertMasterSku() {
  return useMutation(api.mutations.insertMasterSku);
}

export function useUpdateMasterSkuById() {
  return useMutation(api.mutations.updateMasterSkuById);
}

export function useBulkUpsertMasterSku() {
  return useMutation(api.mutations.bulkUpsertMasterSku);
}

// Daily Stock Snapshot
export function useDailyStockSnapshotByDate(report_date: string) {
  return useQuery(api.queries.getDailyStockSnapshotByDate, { report_date });
}

export function useLatestDailyStockSnapshot() {
  return useQuery(api.queries.getLatestDailyStockSnapshot);
}

export function useAllDailyStockSnapshot() {
  return useQuery(api.queries.getAllDailyStockSnapshot);
}

export function useUpsertDailyStockSnapshot() {
  return useMutation(api.mutations.upsertDailyStockSnapshot);
}

// Sell Out Log
export function useSellOutLogByBarcode(barcode: string) {
  return useQuery(api.queries.getSellOutLogByBarcode, { barcode });
}

export function useInsertSellOutLog() {
  return useMutation(api.mutations.insertSellOutLog);
}

// Replenishment Log
export function useReplenishmentLogByBarcode(barcode: string) {
  return useQuery(api.queries.getReplenishmentLogByBarcode, { barcode });
}

export function useRecentReplenishmentLogs(limit?: number) {
  return useQuery(api.queries.getRecentReplenishmentLogs, { limit });
}

export function useInsertReplenishmentLog() {
  return useMutation(api.mutations.insertReplenishmentLog);
}

// LPO Table
export function useLpoTable() {
  return useQuery(api.queries.getLpoTable);
}

export function useLpoTableByPoNumber(po_number: string) {
  return useQuery(api.queries.getLpoTableByPoNumber, { po_number });
}

export function useInsertLpoTable() {
  return useMutation(api.mutations.insertLpoTable);
}

// LPO Line Items
export function useLpoLineItemsByPoNumber(po_number: string) {
  return useQuery(api.queries.getLpoLineItemsByPoNumber, { po_number });
}

export function useInsertLpoLineItems() {
  return useMutation(api.mutations.insertLpoLineItems);
}

export function useUpdateLpoLineItemDelivery() {
  return useMutation(api.mutations.updateLpoLineItemDelivery);
}

// Invoice Table
export function useInvoiceTable() {
  return useQuery(api.queries.getInvoiceTable);
}

export function useInvoiceTableByPoNumber(po_number: string) {
  return useQuery(api.queries.getInvoiceTableByPoNumber, { po_number });
}

export function useInsertInvoiceTable() {
  return useMutation(api.mutations.insertInvoiceTable);
}

// Invoice Line Items
export function useInvoiceLineItemsByInvoiceNumber(invoice_number: string) {
  return useQuery(api.queries.getInvoiceLineItemsByInvoiceNumber, { invoice_number });
}

export function useInsertInvoiceLineItems() {
  return useMutation(api.mutations.insertInvoiceLineItems);
}

export function useProcessInvoiceWithLpoMatch() {
  return useMutation(api.mutations.processInvoiceWithLpoMatch);
}

// Brand Performance
export function useBrandPerformance() {
  return useQuery(api.queries.getBrandPerformance);
}

export function useBrandPerformanceByYearMonth(year: number, month: number) {
  return useQuery(api.queries.getBrandPerformanceByYearMonth, { year, month });
}

export function useBrandPerformanceWithFilters(filters: {
  year?: number;
  month?: number;
  brand?: string;
  customer?: string;
}) {
  return useQuery(api.queries.getBrandPerformanceWithFilters, filters);
}

export function useBrandPerformanceMTD() {
  return useQuery(api.queries.getBrandPerformanceMTD);
}

export function useBrandPerformanceYTD() {
  return useQuery(api.queries.getBrandPerformanceYTD);
}

export function useUniqueBrands() {
  return useQuery(api.queries.getUniqueBrands);
}

export function useUniqueCustomers() {
  return useQuery(api.queries.getUniqueCustomers);
}

export function useInsertBrandPerformance() {
  return useMutation(api.mutations.insertBrandPerformance);
}

// Agent Event Log
export function useAgentEventLog() {
  return useQuery(api.queries.getAgentEventLog);
}

export function useAgentEventLogByAgent(agent: string) {
  return useQuery(api.queries.getAgentEventLogByAgent, { agent });
}

export function useRecentAgentEvents(limit?: number) {
  return useQuery(api.queries.getRecentAgentEvents, { limit });
}

export function useInsertAgentEventLog() {
  return useMutation(api.mutations.insertAgentEventLog);
}

// Messages
export function useMessages() {
  return useQuery(api.queries.getMessages);
}

export function useInsertMessage() {
  return useMutation(api.mutations.insertMessage);
}

// Calendar Events
export function useCalendarEvents() {
  return useQuery(api.queries.getCalendarEvents);
}

export function useCalendarEventsByDate(event_date: string) {
  return useQuery(api.queries.getCalendarEventsByDate, { event_date });
}

export function useInsertCalendarEvent() {
  return useMutation(api.mutations.insertCalendarEvent);
}

export function useDeleteCalendarEvent() {
  return useMutation(api.mutations.deleteCalendarEvent);
}

// Knowledge Base
export function useKnowledgeBase() {
  return useQuery(api.queries.getKnowledgeBase);
}

export function useKnowledgeBaseByKey(key: string) {
  return useQuery(api.queries.getKnowledgeBaseByKey, { key });
}

export function useUpdateKnowledgeBase() {
  return useMutation(api.mutations.updateKnowledgeBase);
}

export const useUpdateLpo = () => {
  return useMutation(api.mutations.updateLpo);
};

export const useUpdateLpoLineItem = () => {
  return useMutation(api.mutations.updateLpoLineItem);
};
