import { Filter } from "nostr-tools";
import { MapLayer, NOSTROOTS_VALIDATION_PUBKEY } from "@common/constants";

// TODO - Move these into `nr-common` (they depend on nostr-tools)

export function trustrootsMapFilter(): Filter {
  const filter = {
    kinds: [30398],
    authors: [NOSTROOTS_VALIDATION_PUBKEY],
  };

  return filter;
}

export function openLocationCodePrefixFilter(
  plusCodePrefixes: string[],
): Filter {
  const filter = {
    "#L": ["open-location-code-prefix"],
    "#l": plusCodePrefixes,
  };

  return filter;
}

export function addOpenLocationCodePrefixToFilter(
  filter: Filter,
  plusCodePrefixes: string[],
): Filter {
  const plusCodeFilter = openLocationCodePrefixFilter(plusCodePrefixes);
  const combinedFilter = { ...filter, ...plusCodeFilter };
  return combinedFilter;
}

export function trustrootsMapFilterForPlusCodePrefixes(
  plusCodePrefixes: string[],
): Filter {
  const baseFilter = trustrootsMapFilter();
  const filter = addOpenLocationCodePrefixToFilter(
    baseFilter,
    plusCodePrefixes,
  );
  return filter;
}

export function filterForMapLayerConfig(layerConfig: MapLayer): Filter {
  const filter: Filter = {
    authors: [layerConfig.pubkey],
    kinds: [layerConfig.kind],
  };
  return filter;
}

export function filterForMapLayerConfigForPlusCodePrefixes(
  layerConfig: MapLayer,
  plusCodePrefixes: string[],
): Filter {
  const baseFilter = filterForMapLayerConfig(layerConfig);
  const filter = addOpenLocationCodePrefixToFilter(
    baseFilter,
    plusCodePrefixes,
  );
  return filter;
}
