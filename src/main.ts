#!/usr/bin/env node
import { Container, Provider, Scope } from "@msiviero/knit";
import * as fs from "fs";
import {Application} from "./app";

Container
    .getInstance()
    .registerProvider("fs:input", class implements Provider<fs.ReadStream> {
    public provide = () => fs.createReadStream("data/input/input.csv");
    }, Scope.Singleton)
    .registerProvider("fs:output", class implements Provider<fs.WriteStream> {
    public provide = () => fs.createWriteStream("data/output/output.csv");
    }, Scope.Singleton)
    .resolve(Application)
    .start();
