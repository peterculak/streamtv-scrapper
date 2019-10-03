import Request from "./Request";
import Action from "../Action";
import {Show} from "../app/config/ConfigInterface";
import Host from "../Host";

class ShowsRequest extends Request {
    static fromConfig(config: Show): ShowsRequest {
        return new this(
            new Action(true, false),
            config.url,
            config.host ? new Host(config.host) : undefined,
            '',
            undefined,
            config.concurrency ? config.concurrency : 10,
        );
    }
}

export default ShowsRequest;
