
import { inject, injectable } from "@msiviero/knit";
import { Logger } from "winston";
import { GenderAssignerPipeline } from "./gender-assigner-pipeline";

@injectable()
export class Application {

  constructor(
    private readonly pipeline: GenderAssignerPipeline,
    @inject("app:logger") private readonly log: Logger,
  ) { }

  public async start() {
    this.log.info("Starting pipeline");
    try {
      this.pipeline.assignGender();
      this.log.info(`AssignGender pipeline processed`);
    } catch (error) {
      this.log.error(`Pipeline error [message=${error.message}]`, error);
    }
  }
}
