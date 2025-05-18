import { IncomingMessage } from "http";
import { Request } from 'express';

export interface CustomIncomingMessage extends IncomingMessage {
    authContext?: {
        userId?: string;
        userRole?: string;
    };
}

export interface CustomRequest extends Request {
    authContext?: {
        userId?: string;
        userRole?: string;
    };
}