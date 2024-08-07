import Request from "./Request";
import Action from "../Action";
import {Show} from "../app/config/ConfigInterface";
import Host from "../Host";

class ShowsRequest extends Request {
    static fromConfig(config: Show, options: any): ShowsRequest {
        return new this(
            new Action(true, true),
            config.url,
            config.host ? new Host(config.host) : undefined,
            '',
            options.maxLoadMorePages,
            config.concurrency ? config.concurrency : 10,
        );
    }
}

export default ShowsRequest;
