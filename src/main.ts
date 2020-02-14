#!/usr/bin/env node
import { Container, Scope } from "@msiviero/knit";
import * as dotenv from "dotenv";
import { Application } from "./app";
import { RestClientProvider } from "./provider/api";
import { CsvParserProvider, CsvStringifier, ReadStreamProvider, WriteStreamProvider } from "./provider/io";
import { LoggerProvider } from "./provider/logger";

dotenv.config({ path: "./variables.env" });

Container
  .getInstance()
  .registerTokenProvider("fs:input", ReadStreamProvider)
  .registerTokenProvider("fs:output", WriteStreamProvider)
  .registerTokenProvider("rest:client", RestClientProvider)
  .registerTokenProvider("app:logger", LoggerProvider, Scope.Singleton)
  .registerTokenProvider("csv:parser", CsvParserProvider)
  .registerTokenProvider("csv:stringifier", CsvStringifier)
  .resolve(Application)
  .start();
