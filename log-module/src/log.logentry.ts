export class LogEntryObject {
    id: string;
    sessionId: string;
    requestId: string;
    level: string;
    message: string;
    timestamp: number;
    logger: string;
    tenantId: string;
    messageType: string;
    userId: string;
    duration: number;
    callRoute: string;
}
