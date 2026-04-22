export interface QuantityDTO {
  value: number;
  unit: string;
  measurementType: string;
}

export interface QuantityInputDTO {
  thisQuantityDTO: QuantityDTO;
  thatQuantityDTO: QuantityDTO;
}

export interface QuantityMeasurementDTO {
  thisValue: number;
  thisUnit: string;
  thisMeasurementType: string;
  thatValue: number;
  thatUnit: string;
  thatMeasurementType: string;
  operation: string;
  resultString: string;
  resultValue: number;
  resultUnit: string;
  resultMeasurementType: string;
  errorMessage: string;
  error: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface JwtResponse {
  token: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}
