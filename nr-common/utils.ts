import {
  DERIVED_EVENT_PLUS_CODE_PREFIX_MINIMUM_LENGTH,
  OPEN_LOCATION_CODE_PREFIX_TAG_NAME,
  OPEN_LOCATION_CODE_TAG_NAME,
} from "./constants.ts";
import { eventSchema, type Event } from "./mod.ts";

function last<T>(items: T[]): T {
  const lastIndex = Math.max(items.length - 1, 0);
  return items[lastIndex];
}

function unique<T>(items: T[]): T[] {
  const dedupedItems = items.filter(
    (item, index) => items.indexOf(item) === index
  );
  return dedupedItems;
}

export function isHex(s: string): boolean {
  return s.split("").every((c) => "0123456789abcdef".split("").includes(c));
}

export function isHexKey(key: string): boolean {
  if (!isHex(key)) {
    return false;
  }
  if (key.length !== 64) {
    return false;
  }
  return true;
}

export function isPlusCode(code: string) {
  // Test against a regex that does a reasonable job of finding bad values
  const re =
    /(^|\s)([23456789C][23456789CFGHJMPQRV][023456789CFGHJMPQRVWX]{6}\+[23456789CFGHJMPQRVWX]*)(\s|$)/i;
  const simpleTestResult = re.test(code);
  if (simpleTestResult === false) {
    return false;
  }

  // Don't allow just 1 trailing character after the plus
  if (code.length > 9) {
    const [, trailing] = code.split("+");
    if (trailing.length === 1) {
      return false;
    }
  }

  // Check if any characters follow a zero like `AA00AA00+` is invalid
  const { failed } = code.split("").reduce(
    ({ failed, zeroSeen }, letter) => {
      if (failed || letter === "+") {
        return { failed, zeroSeen };
      }
      if (letter === "0") {
        return { failed, zeroSeen: true };
      } else {
        if (zeroSeen) {
          return { failed: true, zeroSeen };
        } else {
          return { failed, zeroSeen };
        }
      }
    },
    { failed: false, zeroSeen: false }
  );
  if (failed) {
    return false;
  }

  return true;
}

export function getCurrentTimestamp() {
  return Math.round(Date.now() / 1e3);
}

export function getFirstTagValueFromEvent(
  nostrEvent: Event,
  tagName: string
): string | undefined {
  const firstMatchingTagPair = nostrEvent.tags.find(([key]) => key === tagName);

  if (typeof firstMatchingTagPair === "undefined") {
    return;
  }

  const [, firstValue] = firstMatchingTagPair;

  return firstValue;
}

export function getFirstLabelValueFromTags(
  tags: string[][],
  labelName: string
): string | undefined {
  const matchingTag = tags.find(
    (tag) => tag[0] === "l" && last(tag) === labelName
  );
  if (typeof matchingTag === "undefined") {
    return;
  }
  const labelValue = matchingTag[1];
  return labelValue;
}

export function createLabelTags(
  labelName: string,
  labelValue: string | string[]
) {
  const tags = [
    ["L", labelName],
    [
      "l",
      ...(Array.isArray(labelValue) ? labelValue : [labelValue]),
      labelName,
    ],
  ];
  return tags;
}

export function getFirstLabelValueFromEvent(
  nostrEvent: Event,
  labelName: string
): string | undefined {
  return getFirstLabelValueFromTags(nostrEvent.tags, labelName);
}

export function getPlusCodePrefix(plusCode: string, length: number): string {
  const prefix = plusCode.substring(0, length);
  const paddedPrefix = prefix.padEnd(8, "0");
  const prefixPlusCode = `${paddedPrefix}+`;
  return prefixPlusCode;
}

// TODO This should accept a maximumLength as well
export function getAllPlusCodePrefixes(
  plusCode: string,
  minimumLength: number
): string[] {
  if (minimumLength % 2 !== 0) {
    throw new Error("#HqXbxX-invalid-minimum-length");
  }
  const numberOfCodes = (8 - minimumLength) / 2 + 1;
  const plusCodes = Array.from({ length: numberOfCodes }, (_value, index) =>
    getPlusCodePrefix(plusCode, minimumLength + index * 2)
  );
  const uniquePlusCodePrefixes = unique(plusCodes);
  return uniquePlusCodePrefixes;
}

export function getPlusCodeAndPlusCodePrefixTags(plusCode: string) {
  const plusCodeTags = createLabelTags(OPEN_LOCATION_CODE_TAG_NAME, plusCode);
  const plusCodePrefixes = getAllPlusCodePrefixes(
    plusCode,
    DERIVED_EVENT_PLUS_CODE_PREFIX_MINIMUM_LENGTH
  );
  const plusCodePrefixTags = createLabelTags(
    OPEN_LOCATION_CODE_PREFIX_TAG_NAME,
    plusCodePrefixes
  );
  const tags = [...plusCodeTags, ...plusCodePrefixTags];
  return tags;
}
