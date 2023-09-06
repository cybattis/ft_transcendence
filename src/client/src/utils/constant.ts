import "./Config";
import Config from "./Config";

export const apiBaseURL =
  Config.protocol + "://" + Config.host_ip + ":" + Config.api_port + "/";

export const wsBaseURL = Config.ws_protocol + "://" + Config.host_ip + ":" + Config.api_port + "/";

export const clientBaseURL =
  Config.protocol + "://" + Config.host_ip + ":" + Config.client_port + "/";
