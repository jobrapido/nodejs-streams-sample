import { injectable, Scope } from "@msiviero/knit";
import { HttpCodes } from "typed-rest-client/HttpClient";
import { RestClient } from "typed-rest-client/RestClient";
import { PersonWithGender } from "../stream/types";

const GENDERIZE_API_URL = "https://api.genderize.io";

@injectable(Scope.Singleton)
export class GenderizeAPI {

  private client = new RestClient("gender-assigner", undefined, undefined, {
    socketTimeout: 2000,
  });

  public async genderize(name: string) {
    const response = await this.client
      .get<PersonWithGender>(`${GENDERIZE_API_URL}?name=${name}`, { acceptHeader: "application/json" });

    if (response.statusCode !== HttpCodes.OK) {
      throw new Error(`Genederize.io call failed [statusCode=${response.statusCode}]`);
    }
    return response!.result!;
  }
}
