export interface Person {
  readonly name: string;
}

export interface PersonWithGender extends Person {
  readonly gender: string;
  readonly probability: string;
}
