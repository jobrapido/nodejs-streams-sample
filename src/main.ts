#!/usr/bin/env node
import { Container, Provider, Scope } from "@msiviero/knit";
import * as fs from "fs";
import { RestClient } from "typed-rest-client";
import {Application} from "./app";

Container
    .getInstance()
    .registerProvider("fs:input", class implements Provider<fs.ReadStream> {
    public provide = () => fs.createReadStream("data/input/input.csv");
    }, Scope.Singleton)
    .registerProvider("fs:output", class implements Provider<fs.WriteStream> {
    public provide = () => fs.createWriteStream("data/output/output.csv");
    }, Scope.Singleton)
    .registerProvider("rest:client", class implements Provider<RestClient> {
    public provide = () => new RestClient("genderize-rest-client", undefined, undefined, {socketTimeout: 2000});
    }, Scope.Singleton)
    .registerProvider("config:search-limited", class implements Provider<boolean> {
    public provide = () => true;
    }, Scope.Singleton)
    .resolve(Application)
    .start();
