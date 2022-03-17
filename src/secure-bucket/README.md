# SecureBucket
A secure bucket is a bucket that is accessible only to the owner and is encrypted at rest.
Will create a secure bucket with the following features:
 -  Bucket name will be modified to include account and region.
 -  Access limited to the owner
 -  Object Versioning
 -  Encryption at rest
 -  Object expiration max limit to 10 years
 -  Object will transition to IA after 60 days and later to deep archive after 365 days

## Usage

```ts
export class MyStack extends Stack {
  
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    
    // create a secure bucket 
    let aBucket = new SecureBucket(mystack, 'secureBucket', {
      bucketName: 'mybucket',
      objectsExpireInDays: 500,
      enforceSSL: false,
    });
    
    // incase if you want to access the bucket created. 
    let bucket = aBucket.bucket;
    
    
  }
}
```