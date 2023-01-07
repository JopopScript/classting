import { DatabaseStatus } from "../constant/Database.constant";

export class DatabaseError extends Error {
  code: DatabaseStatus;
  describe: string;
  constructor(code?: DatabaseStatus, describe?: string, error?: Error) {
    super();
    this.name = error?.name ?? '';
    this.message = error?.message ?? '';
    this.stack = error?.stack;
    Object.setPrototypeOf(this, DatabaseError.prototype);
    this.code = code ?? DatabaseStatus.UNKNOWN;
    this.describe = describe;
  }
}