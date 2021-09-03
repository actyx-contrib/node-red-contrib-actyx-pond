"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultFish = void 0;
exports.defaultFish = {
    fishIdType: { value: 'robot', required: true },
    fishIdName: { value: 'name', required: true },
    fishIdVersion: {
        value: 0,
        required: true,
    },
    initState: { value: '{}', required: true },
    where: { value: 'tagA & tagB | tagC:{{payload.name}}', required: true },
    onEvent: {
        value: '(state, event, metaData) => {\n  return state\n}\n',
        required: true,
    },
};
