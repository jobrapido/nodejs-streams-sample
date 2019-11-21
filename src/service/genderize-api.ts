import { inject, injectable, Scope } from "@msiviero/knit";
import * as stopcock from "stopcock";
import { HttpCodes } from "typed-rest-client/HttpClient";
import { RestClient } from "typed-rest-client/RestClient";
import { ApplicationConfig } from "../config";
import { PersonWithGender } from "../stream/types";

const GENDERIZE_API_URL = "https://api.genderize.io";

@injectable(Scope.Singleton)
export class GenderizeAPI {

  constructor(
    @inject("rest:client") private readonly client: RestClient,
    readonly configs: ApplicationConfig,
    @inject("config:search-limited") limited: boolean = true,
    ) {
      if (limited) {
      this.genderize = stopcock(this.genderize, {
        limit:  configs.MAX_REQUESTS_PER_SECONDS,
        bucketSize: 1,
        interval: 1000,
      });
    }
  }

  public async genderize(name: string) {
    const response = await this.client
      .get<PersonWithGender>(`${GENDERIZE_API_URL}?name=${name}`, { acceptHeader: "application/json" });

    if (response.statusCode !== HttpCodes.OK) {
      throw new Error(`Genederize.io call failed [statusCode=${response.statusCode}]`);
    }
    return response!.result!;
  }
}
