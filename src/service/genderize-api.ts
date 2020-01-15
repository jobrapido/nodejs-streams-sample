import { converters, env, inject, injectable, Scope } from "@msiviero/knit";
import * as stopcock from "stopcock";
import { HttpCodes } from "typed-rest-client/HttpClient";
import { RestClient } from "typed-rest-client/RestClient";
import { PersonWithGender } from "../stream/types";

const GENDERIZE_API_URL = "https://api.genderize.io";

@injectable(Scope.Singleton)
export class GenderizeAPI {

  constructor(
    @inject("rest:client") private readonly client: RestClient,
    @env("MAX_REQUESTS_PER_SECOND", 10, converters.number) private readonly maxRequestPerSecond: number,
    @env("LIMIT_API", true, (envValue) => envValue && envValue === "true") limited: boolean,
  ) {
    if (limited) {
      this.genderize = stopcock(this.genderize, {
        limit: this.maxRequestPerSecond,
        bucketSize: 1,
        interval: 1000,
      });
    }
  }

  public async genderize(name: string) {
    const response = await this
      .client
      .get<PersonWithGender>(`${GENDERIZE_API_URL}?name=${name}`, { acceptHeader: "application/json" });

    if (response.statusCode !== HttpCodes.OK) {
      throw new Error(`Genederize.io call failed [statusCode=${response.statusCode}]`);
    }
    return response!.result!;
  }
}
