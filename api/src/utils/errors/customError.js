import logger from '../../config/logger';

class CustomError extends Error {
    constructor(codeError, message, uuid, metadata) {
        super(message);
        this.name = codeError.name;
        this.codeError = codeError;
        this.message = message;
        this.uuid = uuid;
        this.metadata = metadata;
        this.log();
    }

    log() {
        const meta = {
            uuid: this.uuid,
            codeError: this.codeError,
            name: this.name,
            message: this.message,
            metadata: this.metadata,
           // stacktrace: this.stack
        };
        logger.error(meta);
    }

    toJSON() {
        return {
            uuid: this.uuid,
            message: this.message,
            error: {
                code: this.codeError.code,
                description: this.codeError.name,
            },
        }
    }
}

export default CustomError;