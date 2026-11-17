import type { Offer, PeriodCode } from "../models/offer.ts";
import { API_URL, readJson } from "../utils/api.ts";
import { isOfferList } from "../utils/guards.ts";

export const getOffers = async (
  token: string,
  period?: PeriodCode,
  search?: string,
  signal?: AbortSignal,
): Promise<Offer[]> => {
  const queryParts: string[] = [];
  if (period !== undefined) queryParts.push(`period=${encodeURIComponent(period)}`);
  const normalizedSearch = search?.trim();
  if (normalizedSearch) queryParts.push(`search=${encodeURIComponent(normalizedSearch)}`);
  const query = queryParts.length === 0 ? "" : `?${queryParts.join("&")}`;
  const response = await fetch(`${API_URL}/offers${query}`, {
    headers: { Authorization: token },
    signal,
  });
  return readJson(response, isOfferList, "Chargement des offres impossible");
};
