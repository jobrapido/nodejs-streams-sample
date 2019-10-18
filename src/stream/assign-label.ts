import { injectable, Scope } from "@msiviero/knit";
import * as stopcock from "stopcock";
import { Transform, TransformCallback } from "stream";
import { HttpCodes } from "typed-rest-client/HttpClient";
import { RestClient } from "typed-rest-client/RestClient";
import { logger } from "../logger";
import { Record, RecordWithLabel } from "./types";

@injectable(Scope.Singleton)
export class AssignLabelTransformStream extends Transform {

  private client = new RestClient("gender-assigner", undefined, undefined, { socketTimeout: 2000 });

  constructor() {
    super({ objectMode: true });
    this.getLabel = stopcock(this.getLabel, {
      limit: 1,
      bucketSize: 1,
      interval: 100,
    });
  }

  public _transform(records: Record[], _: string, callback: TransformCallback) {
    Promise
      .all(records.map((record: Record) => this.getLabel(record.name)))
      .then((results: RecordWithLabel[]) => {
        results
          .forEach((result) => {
            this.push(result);
          });
        callback();
      })
      .catch((error: any) => {
        logger.error(`Error in AssignLabelTransformStream [error=${error.message}]`);
        callback();
      });
  }

  private async getLabel(name: string): Promise<RecordWithLabel> {
    return new Promise<RecordWithLabel>((resolve, _) => {
      this.httpGet("https://api.genderize.io/?name=" + name)
        .then((result: any) => {
          logger.info(`name: ${name} - gender: ${result.gender} - probability: ${result.probability}`);
          resolve({ name, gender: result.gender, probability: result.probability });
        })
        .catch((e) => {
          logger.info("error while get label: " + e);
          resolve({ name, gender: "NP", probability: "0.0" });
        });
    });
  }

  private async httpGet(uri: string) {
    try {
      const response = await this.client.get(uri, { acceptHeader: "application/json" });
      if (response.statusCode !== HttpCodes.OK) {
        throw new Error(`Invalid status code [uri=${uri},statusCode=${response.statusCode}]`);
      }
      return response!.result;
    } catch (error) {
      console.log(`Error while calling serp service error=${error}]`);
      throw error;
    }
  }
}
