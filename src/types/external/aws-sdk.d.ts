// Type declarations for optional @aws-sdk/client-s3 dependency
// These are stub types to allow TypeScript compilation when AWS SDK is not installed

declare module '@aws-sdk/client-s3' {
  export class S3Client {
    constructor(config: S3ClientConfig);
    send(
      command: PutObjectCommand | HeadBucketCommand | ListObjectsV2Command | DeleteObjectsCommand
    ): Promise<unknown>;
  }

  export class PutObjectCommand {
    constructor(input: Record<string, unknown>);
  }

  export class HeadBucketCommand {
    constructor(input: Record<string, unknown>);
  }

  export class ListObjectsV2Command {
    constructor(input: Record<string, unknown>);
  }

  export class DeleteObjectsCommand {
    constructor(input: Record<string, unknown>);
  }

  export interface S3ClientConfig {
    region?: string;
    credentials?: {
      accessKeyId: string;
      secretAccessKey: string;
      sessionToken?: string;
    };
    [key: string]: unknown;
  }
}
