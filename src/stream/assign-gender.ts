import { injectable, Scope } from "@msiviero/knit";
import * as stopcock from "stopcock";
import { Transform, TransformCallback } from "stream";
import { logger } from "../logger";
import { GenderizeAPI } from "../service/genderize-api";
import { Person, PersonWithGender } from "./types";

@injectable(Scope.Singleton)
export class AssignGenderTransformStream extends Transform {
  private DEFAULT_GENDER = "NP";
  private DEFAULT_PROBABILITY = "0.0";

  constructor(private readonly genderizeAPI: GenderizeAPI) {
    super({ objectMode: true });
    this.retrieveGender = stopcock(this.retrieveGender, {
      limit: 1,
      bucketSize: 1,
      interval: 100,
    });
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
        logger.error(
          `Error in AssignGenderTransformStream [error=${error.message}]`,
        );
        callback();
      });
  }

  private async retrieveGender(name: string): Promise<PersonWithGender> {
    return new Promise<PersonWithGender>((resolve, _) => {
      this.genderizeAPI.genderize(name)
        .then((result: any) => {
          const person: PersonWithGender = {
            name,
            gender: result.gender || this.DEFAULT_GENDER,
            probability: result.probability || this.DEFAULT_PROBABILITY,
          };

          logger.debug(`Name: ${person.name} - Gender: ${person.gender} - Probability: ${person.probability}`);

          resolve(person);
        })
        .catch((error) => {
          logger.error(`Error while assign gender [message=${error.message}]`);
          resolve({
            name,
            gender: this.DEFAULT_GENDER,
            probability: this.DEFAULT_PROBABILITY,
          });
        });
    });
  }
}
