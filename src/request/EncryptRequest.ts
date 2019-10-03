import Request from "./Request";
import Action from "../Action";
import {HostInterface} from "../app/config/ConfigInterface";
import Host from "../Host";

class EncryptRequest extends Request {
    static fromConfig(config: HostInterface): EncryptRequest {
        return new this(
            new Action(false, false, true),
            '',
            Host.fromConfig(config)
        );
    }
}

export default EncryptRequest;
