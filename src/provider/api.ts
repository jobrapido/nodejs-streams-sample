import { Provider } from "@msiviero/knit";
import { RestClient } from "typed-rest-client";

export class RestClientProvider implements Provider<RestClient> {
    public provide = () =>
        new RestClient("genderize-rest-client", undefined, undefined, {
            socketTimeout: 2000,
        })
}
