import { injectable, Scope } from "@msiviero/knit";
import { HttpCodes } from "typed-rest-client/HttpClient";
import { RestClient } from "typed-rest-client/RestClient";
import { logger } from "../logger";
import { Person, PersonWithGender } from "../stream/types";

const GENDERIZE_API_URL = "https://api.genderize.io";
const DEFAULT_GENDER = "NP";
const DEFAULT_PROBABILITY = "0.0";

@injectable(Scope.Singleton)
export class GenderizeAPI {

  private client = new RestClient("gender-assigner", undefined, undefined, {
    socketTimeout: 2000,
  });

  public async genderize(person: Person): Promise<PersonWithGender> {
    const defaultPerson = {
      name: person.name,
      gender: DEFAULT_GENDER,
      probability: DEFAULT_PROBABILITY,
    };
    try {
      const response = await this.client
        .get<PersonWithGender>(`${GENDERIZE_API_URL}?name=${person.name}`, { acceptHeader: "application/json" });

      if (response.statusCode !== HttpCodes.OK) {
        throw new Error(`Genederize.io call failed [statusCode=${response.statusCode}]`);
      }
      return {
        name: person.name,
        gender: response!.result!.gender || DEFAULT_GENDER,
        probability: response!.result!.probability || DEFAULT_PROBABILITY,
      };
    } catch (error) {
      logger.error(`Error while assign gender [message=${error.message}]`);
      return defaultPerson;
    }
  }
}
