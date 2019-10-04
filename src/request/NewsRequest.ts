import Request from "./Request";
import Action from "../Action";
import {NewsItem} from "../app/config/ConfigInterface";
import Host from "../Host";

class NewsRequest extends Request {
    static fromConfig(config: NewsItem): NewsRequest {
        return new this(
            new Action(true, true),
            config.url,
            config.host ? new Host(config.host) : undefined,
            '',
            config.maxLoadMorePages ? config.maxLoadMorePages : 3,
            config.concurrency ? config.concurrency : 5,
        );
    }
}

export default NewsRequest;
