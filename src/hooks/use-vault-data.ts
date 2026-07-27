"use client";

import { useQuery } from "@tanstack/react-query";
import { getCollections, getComponents } from "@/services/vault-service";

export function useVaultData() {
  const components = useQuery({
    queryKey: ["components"],
    queryFn: getComponents,
  });

  const collections = useQuery({
    queryKey: ["collections"],
    queryFn: getCollections,
  });

  return {
    components,
    collections,
    isLoading: components.isLoading || collections.isLoading,
    isError: components.isError || collections.isError,
  };
}
