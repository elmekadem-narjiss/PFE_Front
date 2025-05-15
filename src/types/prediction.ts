export interface Prediction {
    id: number;
    energyproduced: number;
    temperature: number;
    humidity: number;
    month: number;
    week_of_year: number;
    hour: number;
    prediction_day: string;
  }