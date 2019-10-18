import { injectable, Scope } from "@msiviero/knit";
import * as stopcock from "stopcock";
import { Transform, TransformCallback } from "stream";
import { HttpCodes } from "typed-rest-client/HttpClient";
import { RestClient } from "typed-rest-client/RestClient";
import { logger } from "../logger";
import { Person, PersonWithGender } from "./types";

@injectable(Scope.Singleton)
export class AssignGenderTransformStream extends Transform {

  private GENDERIZE_API_URL = "https://api.genderize.io";
  private DEFAULT_GENDER = "NP";
  private DEFAULT_PROBABILITY = "0.0";

  private client = new RestClient("gender-assigner", undefined, undefined, { socketTimeout: 2000 });

  constructor() {
    super({ objectMode: true });
    this.retrieveGender = stopcock(this.retrieveGender, {
      limit: 1,
      bucketSize: 1,
      interval: 100,
    });
  }

  public _transform(people: Person[], _: string, callback: TransformCallback) {
    Promise
      .all(people.map((person: Person) => this.retrieveGender(person.name)))
      .then((results: PersonWithGender[]) => {
        results
          .forEach((result) => {
            this.push(result);
          });
        callback();
      })
      .catch((error: any) => {
        logger.error(`Error in AssignGenderTransformStream [error=${error.message}]`);
        callback();
      });
  }

  private async retrieveGender(name: string): Promise<PersonWithGender> {
    return new Promise<PersonWithGender>((resolve, _) => {
      this.httpGet(`${this.GENDERIZE_API_URL}?name=${name}`)
        .then((result: any) => {
          logger.debug(`Name: ${name} - Gender: ${result.gender} - Probability: ${result.probability}`);
          resolve({
            name,
            gender: result.gender || this.DEFAULT_GENDER,
            probability: result.probability || this.DEFAULT_PROBABILITY,
          });
        })
        .catch((error) => {
          logger.error(`Error while assign gender [message=${error.message}]`);
          resolve({ name, gender: this.DEFAULT_GENDER, probability: this.DEFAULT_PROBABILITY });
        });
    });
  }

  private async httpGet(uri: string) {
    const response = await this.client.get(uri, { acceptHeader: "application/json" });
    if (response.statusCode !== HttpCodes.OK) {
      throw new Error(`Invalid status code [uri=${uri},statusCode=${response.statusCode}]`);
    }
    return response!.result;
  }
}
