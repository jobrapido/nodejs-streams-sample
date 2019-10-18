import { injectable, Scope } from "@msiviero/knit";
import * as stopcock from "stopcock";
import { Transform, TransformCallback } from "stream";
import { logger } from "../logger";
import { GenderizeAPI } from "../service/genderize-api";
import { Person, PersonWithGender } from "./types";

@injectable(Scope.Singleton)
export class AssignGenderTransformStream extends Transform {

  constructor(private readonly genderizeAPI: GenderizeAPI) {
    super({ objectMode: true });
    this.retrieveGender = stopcock(this.retrieveGender, {
      limit: 1,
      bucketSize: 1,
      interval: 100,
    });
  }

  public _transform(people: Person[], _: string, callback: TransformCallback) {
    Promise.all(people.map((person: Person) => this.retrieveGender(person)))
      .then((results: PersonWithGender[]) => {
        results.forEach((result) => {
          this.push(result);
        });
        callback();
      })
      .catch((error) => {
        logger.error(`Error in AssignGenderTransformStream [error=${error.message}]`);
        callback();
      });
  }

  private async retrieveGender(person: Person): Promise<PersonWithGender> {
    return new Promise<PersonWithGender>((resolve, _) => {
      this.genderizeAPI.genderize(person)
        .then((withGender: PersonWithGender) => {
          // tslint:disable-next-line:max-line-length
          logger.debug(`Name: ${withGender.name} - Gender: ${withGender.gender} - Probability: ${withGender.probability}`);
          resolve(withGender);
        });
    });
  }
}
