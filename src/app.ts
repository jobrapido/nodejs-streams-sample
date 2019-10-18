
import { Container, injectable, Provider, Scope } from "@msiviero/knit";
import * as fs from "fs";
import { ApplicationConfig } from "./config";
import { logger } from "./logger";
import { LabelAssignerPipeline } from "./service/label-assigner-pipeline";

@injectable()
class Application {

  constructor(
    private readonly pipeline: LabelAssignerPipeline,
    private readonly configs: ApplicationConfig,
  ) { }

  public run() {
    const { CONFIG_EXAMPLE } = this.configs;
    logger.info("Starting pipeline. CONFIG_EXAMPLE is " + CONFIG_EXAMPLE);

    this
      .pipeline
      .assignLabel()
      .then(() => logger.info(`AssignLabel pipeline processed`))
      .catch((error) => logger.error(`Pipeline error [message=${error.message}]`, error));
  }
}

export const runner = () => {
  Container
    .getInstance()
    .registerProvider("fs:input", class implements Provider<fs.ReadStream> {
      public provide = () => fs.createReadStream("input.csv");
    }, Scope.Singleton)
    .registerProvider("fs:output", class implements Provider<fs.WriteStream> {
      public provide = () => fs.createWriteStream("output.csv");
    }, Scope.Singleton)
    .resolve(Application)
    .run();
};
