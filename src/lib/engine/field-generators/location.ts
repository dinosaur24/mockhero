/**
 * Location field generators: city, country, postal_code, address, state_province, latitude, longitude
 */

import type { FieldGenerator } from "../types";
import { getCachedLocaleData } from "./identity";

export const cityGenerator: FieldGenerator = (_params, ctx) => {
  const { cities } = getCachedLocaleData(ctx.locale);
  return ctx.prng.pick(cities).city;
};

export const countryGenerator: FieldGenerator = (params, ctx) => {
  if (params.code === true) {
    return getCachedLocaleData(ctx.locale).countryCode;
  }
  return getCachedLocaleData(ctx.locale).countryName;
};

export const postalCodeGenerator: FieldGenerator = (_params, ctx) => {
  const { cities } = getCachedLocaleData(ctx.locale);
  return ctx.prng.pick(cities).postal;
};

export const stateProvinceGenerator: FieldGenerator = (_params, ctx) => {
  const { cities } = getCachedLocaleData(ctx.locale);
  const city = ctx.prng.pick(cities);
  return city.state ?? "";
};

export const addressGenerator: FieldGenerator = (_params, ctx) => {
  const localeData = getCachedLocaleData(ctx.locale);
  const city = ctx.prng.pick(localeData.cities);
  const street = ctx.prng.pick(localeData.streetNames);
  const pattern = ctx.prng.pick(localeData.streetPatterns);
  const number = ctx.prng.nextInt(1, 250);

  const address = pattern
    .replace("{number}", String(number))
    .replace("{street}", street);

  return `${address}, ${city.postal} ${city.city}`;
};

export const latitudeGenerator: FieldGenerator = (params, ctx) => {
  const min = (params.min as number) ?? -90;
  const max = (params.max as number) ?? 90;
  return ctx.prng.nextFloat(min, max, 6);
};

export const longitudeGenerator: FieldGenerator = (params, ctx) => {
  const min = (params.min as number) ?? -180;
  const max = (params.max as number) ?? 180;
  return ctx.prng.nextFloat(min, max, 6);
};
