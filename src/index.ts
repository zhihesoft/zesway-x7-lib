import { X7Instance } from "./libs/x7";
import fs = require("fs");

export function createX7(configpath: string): X7Instance {
    const text = fs.readFileSync(configpath, { encoding: "utf-8" });
    return new X7Instance(JSON.parse(text));
}

