import { useApiQuery } from "./useApiQuery";
import { useApiMutation } from "./useApiMutation";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../lib/apiClient";

export function useConsultationDetail(id) {
  return useApiQuery({
    queryKey: ["consultation", id],
    url: `consultations/${id}`,
    enabled: !!id,
  });
}

export function useRequestConsultation(options = {}) {
  return useApiMutation({
    url: "consultations/request",
    method: "POST",
    ...options,
  });
}

export function usePayConsultation(id, options = {}) {
  return useApiMutation({
    url: `consultations/${id}/payment`,
    method: "POST",
    ...options,
  });
}

export function useChatHistory(consultationId) {
  return useApiQuery({
    queryKey: ["chat", consultationId],
    url: `consultations/${consultationId}/messages`,
    enabled: !!consultationId,
  });
}

export function useSendMessage(consultationId, options = {}) {
  return useApiMutation({
    url: `consultations/${consultationId}/messages`,
    method: "POST",
    ...options,
  });
}

export function useRespondToConsultation(options = {}) {
  const { onSuccess, onError, ...rest } = options;
  return useMutation({
    mutationFn: ({ consultationId, action }) =>
      apiFetch(`consultations/${consultationId}/respond`, {
        method: "PATCH",
        body: { action },
      }),
    onSuccess,
    onError,
    ...rest,
  });
}

/** Fetch all consultations for the currently logged-in user (patient or doctor). */
export function useMyConsultations(options = {}) {
  return useApiQuery({
    queryKey: ["my-consultations"],
    url: "consultations/my",
    ...options,
  });
}

/**
 * Verify payment status by polling Midtrans API.
 * Call this after user returns from Midtrans payment page.
 * Essential for dev/sandbox where webhooks cannot reach localhost.
 */
export function useVerifyPayment(consultationId, options = {}) {
  return useApiQuery({
    queryKey: ["verify-payment", consultationId],
    url: `consultations/${consultationId}/verify-payment`,
    enabled: !!consultationId,
    staleTime: 0,         // always re-fetch fresh
    refetchOnMount: true,
    ...options,
  });
}

export function useGeneratePrescription(consultationId, options = {}) {
  return useApiMutation({
    url: `consultations/${consultationId}/prescriptions`,
    method: "POST",
    ...options,
  });
}
