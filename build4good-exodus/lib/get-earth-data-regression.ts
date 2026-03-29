import { getEarthData } from "@/lib/nasaPower";

const EARTH_DATA_PARAMETERS = [
  "T2M",
  "PRECTOTCORR",
  "RH2M",
  "WS2M",
  "ALLSKY_SFC_SW_DWN",
] as const;

type EarthDataParameter = (typeof EARTH_DATA_PARAMETERS)[number];
type EarthDataResult = Awaited<ReturnType<typeof getEarthData>>;

type NasaParameterSeries = Record<string, number>;

type NasaPowerPayload = {
  properties?: {
    parameter?: Partial<Record<EarthDataParameter, NasaParameterSeries>>;
  };
};

function getLinearRegressionCoefficients(series: NasaParameterSeries | undefined) {
  if (!series) {
    return {
      slope: null,
      intercept: null,
    };
  }

  // Keep the monthly ordering stable so x represents time progression.
  const points = Object.entries(series)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([, value], index) => ({
      x: index,
      y: value,
    }))
    .filter((point) => Number.isFinite(point.y) && point.y > -900);

  if (points.length < 2) {
    return {
      slope: null,
      intercept: null,
    };
  }

  const count = points.length;
  const sumX = points.reduce((total, point) => total + point.x, 0);
  const sumY = points.reduce((total, point) => total + point.y, 0);
  const sumXY = points.reduce((total, point) => total + point.x * point.y, 0);
  const sumXX = points.reduce((total, point) => total + point.x * point.x, 0);

  const denominator = count * sumXX - sumX * sumX;

  if (denominator === 0) {
    return {
      slope: null,
      intercept: null,
    };
  }

  const slope = (count * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / count;

  return {
    slope,
    intercept,
  };
}

export function getEarthDataRegressionCoefficients(earthData: EarthDataResult) {
  const rawData = earthData.data as NasaPowerPayload;
  const parameterData = rawData.properties?.parameter ?? {};

  const coefficients = Object.fromEntries(
    EARTH_DATA_PARAMETERS.map((parameter) => [
      parameter,
      getLinearRegressionCoefficients(parameterData[parameter]),
    ]),
  ) as Record<
    EarthDataParameter,
    {
      slope: number | null;
      intercept: number | null;
    }
  >;

  return {
    location: earthData.location,
    source: earthData.source,
    coefficients,
  };
}
