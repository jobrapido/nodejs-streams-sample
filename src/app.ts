
import { Container, injectable, Provider, Scope } from "@msiviero/knit";
import * as fs from "fs";
import { ApplicationConfig } from "./config";
import { logger } from "./logger";
import { GenderAssignerPipeline } from "./service/gender-assigner-pipeline";

@injectable()
class Application {

  constructor(
    private readonly pipeline: GenderAssignerPipeline,
    private readonly configs: ApplicationConfig,
  ) { }

  public run() {
    const { CONFIG_EXAMPLE } = this.configs;
    logger.info("Starting pipeline. CONFIG_EXAMPLE is " + CONFIG_EXAMPLE);

    this
      .pipeline
      .assignGender()
      .then(() => logger.info(`AssignGender pipeline processed`))
      .catch((error) => logger.error(`Pipeline error [message=${error.message}]`, error));
  }
}

export const startRunner = () => {
  Container
    .getInstance()
    .registerProvider("fs:input", class implements Provider<fs.ReadStream> {
      public provide = () => fs.createReadStream("data/input/input.csv");
    }, Scope.Singleton)
    .registerProvider("fs:output", class implements Provider<fs.WriteStream> {
      public provide = () => fs.createWriteStream("data/output/output.csv");
    }, Scope.Singleton)
    .resolve(Application)
    .run();
};
