import { inject, injectable, Scope } from "@msiviero/knit";
import { Transform, TransformCallback } from "stream";
import { Logger } from "winston";
import { GenderizeAPI } from "../service/genderize-api";
import { Person, PersonWithGender } from "./types";

@injectable(Scope.Singleton)
export class AssignGenderTransformStream extends Transform {
  private DEFAULT_GENDER = "NP";
  private DEFAULT_PROBABILITY = "0.0";

  constructor(
    private readonly genderizeAPI: GenderizeAPI,
    @inject("app:logger") private readonly log: Logger,
  ) {
    super({ objectMode: true });
  }

  public _transform(people: Person[], _: string, callback: TransformCallback) {
    Promise.all(
      people.map((person: Person) => this.retrieveGender(person.name)),
    )
      .then((results: PersonWithGender[]) => {
        results.forEach((result) => {
          this.push(result);
        });
        callback();
      })
      .catch((error: any) => {
        this.log.error(`Error in AssignGenderTransformStream [error=${error.message}]`);
        callback();
      });
  }

  private async retrieveGender(name: string): Promise<PersonWithGender> {
    return new Promise<PersonWithGender>((resolve, _) => {
      this.genderizeAPI
        .genderize(name)
        .then((result) => {
          const person = {
            name,
            gender: result.gender || this.DEFAULT_GENDER,
            probability: result.probability || this.DEFAULT_PROBABILITY,
          };

          this.log.debug(`Name: ${person.name} - Gender: ${person.gender} - Probability: ${person.probability}`);

          resolve(person);
        })
        .catch((error) => {
          this.log.error(`Error while assign gender [message=${error.message}]`);
          resolve({
            name,
            gender: this.DEFAULT_GENDER,
            probability: this.DEFAULT_PROBABILITY,
          });
        });
    });
  }
}
