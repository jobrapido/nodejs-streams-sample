export interface Record {
  readonly name: string;
}

export interface RecordWithLabel extends Record {
  readonly gender: string;
  readonly probability: string;
}

export interface RecordWithCount extends Record {
  readonly count: number;
}
