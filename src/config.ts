import { injectable } from "@msiviero/knit";
import * as dotenv from "dotenv";

dotenv.config({ path: "./variables.env" });

@injectable()
export class ApplicationConfig {

  [key: string]: string | number | undefined;

  public static readonly LOG_LEVEL = process.env.LOG_LEVEL || "debug";

  public readonly CONFIG_EXAMPLE = (process.env.CONFIG_EXAMPLE || "config_example").toLowerCase();
  public readonly BUFFER_SIZE = parseInt(process.env.BUFFER_SIZE || "2", 10);
  public readonly LOCAL_INPUT_FILE_NAME = process.env.LOCAL_INPUT_FILE_NAME || "input.csv";
  public readonly LOCAL_OUTPUT_FILE_NAME = process.env.LOCAL_OUTPUT_FILE_NAME || "output.csv";

}
