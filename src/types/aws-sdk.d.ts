// Type declarations for optional @aws-sdk/client-s3 dependency
// These are stub types to allow TypeScript compilation when AWS SDK is not installed

declare module '@aws-sdk/client-s3' {
  export class S3Client {
    constructor(config: any);
    send(command: any): Promise<any>;
  }

  export class PutObjectCommand {
    constructor(input: any);
  }

  export class HeadBucketCommand {
    constructor(input: any);
  }

  export class ListObjectsV2Command {
    constructor(input: any);
  }

  export class DeleteObjectsCommand {
    constructor(input: any);
  }

  export interface S3ClientConfig {
    region?: string;
    credentials?: {
      accessKeyId: string;
      secretAccessKey: string;
      sessionToken?: string;
    };
    [key: string]: any;
  }
}
