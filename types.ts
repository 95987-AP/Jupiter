export interface Moon {
  id: string;
  name: string;
  description: string;
  radius: string;
  distance: string;
  imageColor: string;
  texture?: string;
}

export interface Fact {
  id: string;
  title: string;
  value: string;
  description: string;
  icon: 'scale' | 'ruler' | 'clock' | 'thermometer';
}

export interface Mission {
  year: string;
  name: string;
  description: string;
}
