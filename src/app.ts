
import { injectable } from "@msiviero/knit";
import { GenderAssignerPipeline } from "./gender-assigner-pipeline";
import { logger } from "./logger";

@injectable()
export class Application {

  constructor(
    private readonly pipeline: GenderAssignerPipeline,
  ) { }

  public start() {
    logger.info("Starting pipeline");

    this
      .pipeline
      .assignGender()
      .then(() => logger.info(`AssignGender pipeline processed`))
      .catch((error) => logger.error(`Pipeline error [message=${error.message}]`, error));
  }
}
