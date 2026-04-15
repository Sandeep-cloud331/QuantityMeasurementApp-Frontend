export interface Quantity {
  value: number;
  unit: string;
  measurementType: string;
}

export interface CompareRequest {
  thisQuantity: Quantity;
  thatQuantity: Quantity;
}

export interface ArithmeticRequest {
  thisQuantity: Quantity;
  thatQuantity: Quantity;
  targetUnit?: string;
}

export interface HistoryRecord {
  operation: string;
  thisMeasurementType: string;
  thisValue: number;
  thisUnit: string;
  thatValue: number;
  thatUnit: string;
  resultString: string;
  resultValue: number;
  resultUnit: string;
  errorMessage: string;
}

export interface StatCount {
  operation: string;
  count: number;
}

export const UNITS: Record<string, { type: string; units: string[] }> = {
  length:      { type: 'LengthUnit',      units: ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'] },
  weight:      { type: 'WeightUnit',       units: ['MILLIGRAM', 'GRAM', 'KILOGRAM', 'POUND', 'TONNE'] },
  volume:      { type: 'VolumeUnit',       units: ['LITRE', 'MILLILITRE', 'GALLON'] },
  temperature: { type: 'TemperatureUnit',  units: ['CELSIUS', 'FAHRENHEIT', 'KELVIN'] }
};

export const OPERATIONS = ['COMPARE', 'CONVERT', 'ADD', 'SUBTRACT', 'DIVIDE'];
