# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### SecureBucket <a name="SecureBucket" id="@savvytools/ez-constructs.SecureBucket"></a>

Will create a secure bucket with the following features: - Bucket name will be modified to include account and region.

Access limited to the owner - Object Versioning - Encryption at rest - Object expiration max limit to 10 years - Object will transition to IA after 60 days and later to deep archive after 365 days

#### Initializers <a name="Initializers" id="@savvytools/ez-constructs.SecureBucket.Initializer"></a>

```typescript
import { SecureBucket } from '@savvytools/ez-constructs'

new SecureBucket(scope: Construct, id: string, props: SecureBucketProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@savvytools/ez-constructs.SecureBucket.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | - the stack in which the construct is defined. |
| <code><a href="#@savvytools/ez-constructs.SecureBucket.Initializer.parameter.id">id</a></code> | <code>string</code> | - a unique identifier for the construct. |
| <code><a href="#@savvytools/ez-constructs.SecureBucket.Initializer.parameter.props">props</a></code> | <code><a href="#@savvytools/ez-constructs.SecureBucketProps">SecureBucketProps</a></code> | - the customized set of properies. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@savvytools/ez-constructs.SecureBucket.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

the stack in which the construct is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="@savvytools/ez-constructs.SecureBucket.Initializer.parameter.id"></a>

- *Type:* string

a unique identifier for the construct.

---

##### `props`<sup>Required</sup> <a name="props" id="@savvytools/ez-constructs.SecureBucket.Initializer.parameter.props"></a>

- *Type:* <a href="#@savvytools/ez-constructs.SecureBucketProps">SecureBucketProps</a>

the customized set of properies.

The `bucketName` property must be set.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@savvytools/ez-constructs.SecureBucket.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@savvytools/ez-constructs.SecureBucket.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@savvytools/ez-constructs.SecureBucket.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |

---

##### `bucket`<sup>Required</sup> <a name="bucket" id="@savvytools/ez-constructs.SecureBucket.property.bucket"></a>

```typescript
public readonly bucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---


## Structs <a name="Structs" id="Structs"></a>

### SecureBucketProps <a name="SecureBucketProps" id="@savvytools/ez-constructs.SecureBucketProps"></a>

Properties for a bucket.

#### Initializer <a name="Initializer" id="@savvytools/ez-constructs.SecureBucketProps.Initializer"></a>

```typescript
import { SecureBucketProps } from '@savvytools/ez-constructs'

const secureBucketProps: SecureBucketProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.accessControl">accessControl</a></code> | <code>aws-cdk-lib.aws_s3.BucketAccessControl</code> | Specifies a canned ACL that grants predefined permissions to the bucket. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.autoDeleteObjects">autoDeleteObjects</a></code> | <code>boolean</code> | Whether all objects should be automatically deleted when the bucket is removed from the stack or when the stack is deleted. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.blockPublicAccess">blockPublicAccess</a></code> | <code>aws-cdk-lib.aws_s3.BlockPublicAccess</code> | The block public access configuration of this bucket. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.bucketKeyEnabled">bucketKeyEnabled</a></code> | <code>boolean</code> | Specifies whether Amazon S3 should use an S3 Bucket Key with server-side encryption using KMS (SSE-KMS) for new objects in the bucket. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.bucketName">bucketName</a></code> | <code>string</code> | Physical name of this bucket. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.cors">cors</a></code> | <code>aws-cdk-lib.aws_s3.CorsRule[]</code> | The CORS configuration of this bucket. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.encryption">encryption</a></code> | <code>aws-cdk-lib.aws_s3.BucketEncryption</code> | The kind of server-side encryption to apply to this bucket. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | External KMS key to use for bucket encryption. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.enforceSSL">enforceSSL</a></code> | <code>boolean</code> | Enforces SSL for requests. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.intelligentTieringConfigurations">intelligentTieringConfigurations</a></code> | <code>aws-cdk-lib.aws_s3.IntelligentTieringConfiguration[]</code> | Inteligent Tiering Configurations. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.inventories">inventories</a></code> | <code>aws-cdk-lib.aws_s3.Inventory[]</code> | The inventory configuration of the bucket. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.lifecycleRules">lifecycleRules</a></code> | <code>aws-cdk-lib.aws_s3.LifecycleRule[]</code> | Rules that define how Amazon S3 manages objects during their lifetime. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.metrics">metrics</a></code> | <code>aws-cdk-lib.aws_s3.BucketMetrics[]</code> | The metrics configuration of this bucket. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.notificationsHandlerRole">notificationsHandlerRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | The role to be used by the notifications handler. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.objectOwnership">objectOwnership</a></code> | <code>aws-cdk-lib.aws_s3.ObjectOwnership</code> | The objectOwnership of the bucket. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.publicReadAccess">publicReadAccess</a></code> | <code>boolean</code> | Grants public read access to all objects in the bucket. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.removalPolicy">removalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | Policy to apply when the bucket is removed from this stack. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.serverAccessLogsBucket">serverAccessLogsBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Destination bucket for the server access logs. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.serverAccessLogsPrefix">serverAccessLogsPrefix</a></code> | <code>string</code> | Optional log file prefix to use for the bucket's access logs. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.transferAcceleration">transferAcceleration</a></code> | <code>boolean</code> | Whether this bucket should have transfer acceleration turned on or not. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.versioned">versioned</a></code> | <code>boolean</code> | Whether this bucket should have versioning turned on or not. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.websiteErrorDocument">websiteErrorDocument</a></code> | <code>string</code> | The name of the error document (e.g. "404.html") for the website. `websiteIndexDocument` must also be set if this is set. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.websiteIndexDocument">websiteIndexDocument</a></code> | <code>string</code> | The name of the index document (e.g. "index.html") for the website. Enables static website hosting for this bucket. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.websiteRedirect">websiteRedirect</a></code> | <code>aws-cdk-lib.aws_s3.RedirectTarget</code> | Specifies the redirect behavior of all requests to a website endpoint of a bucket. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.websiteRoutingRules">websiteRoutingRules</a></code> | <code>aws-cdk-lib.aws_s3.RoutingRule[]</code> | Rules that define when a redirect is applied and the redirect behavior. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.moveToGlacierDeepArchive">moveToGlacierDeepArchive</a></code> | <code>boolean</code> | Use only for buckets that have archiving data. |
| <code><a href="#@savvytools/ez-constructs.SecureBucketProps.property.objectsExpireInDays">objectsExpireInDays</a></code> | <code>number</code> | The number of days that object will be kept. |

---

##### `accessControl`<sup>Optional</sup> <a name="accessControl" id="@savvytools/ez-constructs.SecureBucketProps.property.accessControl"></a>

```typescript
public readonly accessControl: BucketAccessControl;
```

- *Type:* aws-cdk-lib.aws_s3.BucketAccessControl
- *Default:* BucketAccessControl.PRIVATE

Specifies a canned ACL that grants predefined permissions to the bucket.

---

##### `autoDeleteObjects`<sup>Optional</sup> <a name="autoDeleteObjects" id="@savvytools/ez-constructs.SecureBucketProps.property.autoDeleteObjects"></a>

```typescript
public readonly autoDeleteObjects: boolean;
```

- *Type:* boolean
- *Default:* false

Whether all objects should be automatically deleted when the bucket is removed from the stack or when the stack is deleted.

Requires the `removalPolicy` to be set to `RemovalPolicy.DESTROY`.  **Warning** if you have deployed a bucket with `autoDeleteObjects: true`, switching this to `false` in a CDK version *before* `1.126.0` will lead to all objects in the bucket being deleted. Be sure to update your bucket resources by deploying with CDK version `1.126.0` or later **before** switching this value to `false`.

---

##### `blockPublicAccess`<sup>Optional</sup> <a name="blockPublicAccess" id="@savvytools/ez-constructs.SecureBucketProps.property.blockPublicAccess"></a>

```typescript
public readonly blockPublicAccess: BlockPublicAccess;
```

- *Type:* aws-cdk-lib.aws_s3.BlockPublicAccess
- *Default:* CloudFormation defaults will apply. New buckets and objects don't allow public access, but users can modify bucket policies or object permissions to allow public access

The block public access configuration of this bucket.

> [https://docs.aws.amazon.com/AmazonS3/latest/dev/access-control-block-public-access.html](https://docs.aws.amazon.com/AmazonS3/latest/dev/access-control-block-public-access.html)

---

##### `bucketKeyEnabled`<sup>Optional</sup> <a name="bucketKeyEnabled" id="@savvytools/ez-constructs.SecureBucketProps.property.bucketKeyEnabled"></a>

```typescript
public readonly bucketKeyEnabled: boolean;
```

- *Type:* boolean
- *Default:* false

Specifies whether Amazon S3 should use an S3 Bucket Key with server-side encryption using KMS (SSE-KMS) for new objects in the bucket.

Only relevant, when Encryption is set to {@link BucketEncryption.KMS}

---

##### `bucketName`<sup>Optional</sup> <a name="bucketName" id="@savvytools/ez-constructs.SecureBucketProps.property.bucketName"></a>

```typescript
public readonly bucketName: string;
```

- *Type:* string
- *Default:* Assigned by CloudFormation (recommended).

Physical name of this bucket.

---

##### `cors`<sup>Optional</sup> <a name="cors" id="@savvytools/ez-constructs.SecureBucketProps.property.cors"></a>

```typescript
public readonly cors: CorsRule[];
```

- *Type:* aws-cdk-lib.aws_s3.CorsRule[]
- *Default:* No CORS configuration.

The CORS configuration of this bucket.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-cors.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-cors.html)

---

##### `encryption`<sup>Optional</sup> <a name="encryption" id="@savvytools/ez-constructs.SecureBucketProps.property.encryption"></a>

```typescript
public readonly encryption: BucketEncryption;
```

- *Type:* aws-cdk-lib.aws_s3.BucketEncryption
- *Default:* `Kms` if `encryptionKey` is specified, or `Unencrypted` otherwise.

The kind of server-side encryption to apply to this bucket.

If you choose KMS, you can specify a KMS key via `encryptionKey`. If encryption key is not specified, a key will automatically be created.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@savvytools/ez-constructs.SecureBucketProps.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey
- *Default:* If encryption is set to "Kms" and this property is undefined, a new KMS key will be created and associated with this bucket.

External KMS key to use for bucket encryption.

The 'encryption' property must be either not specified or set to "Kms". An error will be emitted if encryption is set to "Unencrypted" or "Managed".

---

##### `enforceSSL`<sup>Optional</sup> <a name="enforceSSL" id="@savvytools/ez-constructs.SecureBucketProps.property.enforceSSL"></a>

```typescript
public readonly enforceSSL: boolean;
```

- *Type:* boolean
- *Default:* false

Enforces SSL for requests.

S3.5 of the AWS Foundational Security Best Practices Regarding S3.

> [https://docs.aws.amazon.com/config/latest/developerguide/s3-bucket-ssl-requests-only.html](https://docs.aws.amazon.com/config/latest/developerguide/s3-bucket-ssl-requests-only.html)

---

##### `intelligentTieringConfigurations`<sup>Optional</sup> <a name="intelligentTieringConfigurations" id="@savvytools/ez-constructs.SecureBucketProps.property.intelligentTieringConfigurations"></a>

```typescript
public readonly intelligentTieringConfigurations: IntelligentTieringConfiguration[];
```

- *Type:* aws-cdk-lib.aws_s3.IntelligentTieringConfiguration[]
- *Default:* No Intelligent Tiiering Configurations.

Inteligent Tiering Configurations.

> [https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering.html](https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering.html)

---

##### `inventories`<sup>Optional</sup> <a name="inventories" id="@savvytools/ez-constructs.SecureBucketProps.property.inventories"></a>

```typescript
public readonly inventories: Inventory[];
```

- *Type:* aws-cdk-lib.aws_s3.Inventory[]
- *Default:* No inventory configuration

The inventory configuration of the bucket.

> [https://docs.aws.amazon.com/AmazonS3/latest/dev/storage-inventory.html](https://docs.aws.amazon.com/AmazonS3/latest/dev/storage-inventory.html)

---

##### `lifecycleRules`<sup>Optional</sup> <a name="lifecycleRules" id="@savvytools/ez-constructs.SecureBucketProps.property.lifecycleRules"></a>

```typescript
public readonly lifecycleRules: LifecycleRule[];
```

- *Type:* aws-cdk-lib.aws_s3.LifecycleRule[]
- *Default:* No lifecycle rules.

Rules that define how Amazon S3 manages objects during their lifetime.

---

##### `metrics`<sup>Optional</sup> <a name="metrics" id="@savvytools/ez-constructs.SecureBucketProps.property.metrics"></a>

```typescript
public readonly metrics: BucketMetrics[];
```

- *Type:* aws-cdk-lib.aws_s3.BucketMetrics[]
- *Default:* No metrics configuration.

The metrics configuration of this bucket.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-metricsconfiguration.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-metricsconfiguration.html)

---

##### `notificationsHandlerRole`<sup>Optional</sup> <a name="notificationsHandlerRole" id="@savvytools/ez-constructs.SecureBucketProps.property.notificationsHandlerRole"></a>

```typescript
public readonly notificationsHandlerRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* a new role will be created.

The role to be used by the notifications handler.

---

##### `objectOwnership`<sup>Optional</sup> <a name="objectOwnership" id="@savvytools/ez-constructs.SecureBucketProps.property.objectOwnership"></a>

```typescript
public readonly objectOwnership: ObjectOwnership;
```

- *Type:* aws-cdk-lib.aws_s3.ObjectOwnership
- *Default:* No ObjectOwnership configuration, uploading account will own the object.

The objectOwnership of the bucket.

> [https://docs.aws.amazon.com/AmazonS3/latest/dev/about-object-ownership.html](https://docs.aws.amazon.com/AmazonS3/latest/dev/about-object-ownership.html)

---

##### `publicReadAccess`<sup>Optional</sup> <a name="publicReadAccess" id="@savvytools/ez-constructs.SecureBucketProps.property.publicReadAccess"></a>

```typescript
public readonly publicReadAccess: boolean;
```

- *Type:* boolean
- *Default:* false

Grants public read access to all objects in the bucket.

Similar to calling `bucket.grantPublicAccess()`

---

##### `removalPolicy`<sup>Optional</sup> <a name="removalPolicy" id="@savvytools/ez-constructs.SecureBucketProps.property.removalPolicy"></a>

```typescript
public readonly removalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* The bucket will be orphaned.

Policy to apply when the bucket is removed from this stack.

---

##### `serverAccessLogsBucket`<sup>Optional</sup> <a name="serverAccessLogsBucket" id="@savvytools/ez-constructs.SecureBucketProps.property.serverAccessLogsBucket"></a>

```typescript
public readonly serverAccessLogsBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket
- *Default:* If "serverAccessLogsPrefix" undefined - access logs disabled, otherwise - log to current bucket.

Destination bucket for the server access logs.

---

##### `serverAccessLogsPrefix`<sup>Optional</sup> <a name="serverAccessLogsPrefix" id="@savvytools/ez-constructs.SecureBucketProps.property.serverAccessLogsPrefix"></a>

```typescript
public readonly serverAccessLogsPrefix: string;
```

- *Type:* string
- *Default:* No log file prefix

Optional log file prefix to use for the bucket's access logs.

If defined without "serverAccessLogsBucket", enables access logs to current bucket with this prefix.

---

##### `transferAcceleration`<sup>Optional</sup> <a name="transferAcceleration" id="@savvytools/ez-constructs.SecureBucketProps.property.transferAcceleration"></a>

```typescript
public readonly transferAcceleration: boolean;
```

- *Type:* boolean
- *Default:* false

Whether this bucket should have transfer acceleration turned on or not.

---

##### `versioned`<sup>Optional</sup> <a name="versioned" id="@savvytools/ez-constructs.SecureBucketProps.property.versioned"></a>

```typescript
public readonly versioned: boolean;
```

- *Type:* boolean
- *Default:* false

Whether this bucket should have versioning turned on or not.

---

##### `websiteErrorDocument`<sup>Optional</sup> <a name="websiteErrorDocument" id="@savvytools/ez-constructs.SecureBucketProps.property.websiteErrorDocument"></a>

```typescript
public readonly websiteErrorDocument: string;
```

- *Type:* string
- *Default:* No error document.

The name of the error document (e.g. "404.html") for the website. `websiteIndexDocument` must also be set if this is set.

---

##### `websiteIndexDocument`<sup>Optional</sup> <a name="websiteIndexDocument" id="@savvytools/ez-constructs.SecureBucketProps.property.websiteIndexDocument"></a>

```typescript
public readonly websiteIndexDocument: string;
```

- *Type:* string
- *Default:* No index document.

The name of the index document (e.g. "index.html") for the website. Enables static website hosting for this bucket.

---

##### `websiteRedirect`<sup>Optional</sup> <a name="websiteRedirect" id="@savvytools/ez-constructs.SecureBucketProps.property.websiteRedirect"></a>

```typescript
public readonly websiteRedirect: RedirectTarget;
```

- *Type:* aws-cdk-lib.aws_s3.RedirectTarget
- *Default:* No redirection.

Specifies the redirect behavior of all requests to a website endpoint of a bucket.

If you specify this property, you can't specify "websiteIndexDocument", "websiteErrorDocument" nor , "websiteRoutingRules".

---

##### `websiteRoutingRules`<sup>Optional</sup> <a name="websiteRoutingRules" id="@savvytools/ez-constructs.SecureBucketProps.property.websiteRoutingRules"></a>

```typescript
public readonly websiteRoutingRules: RoutingRule[];
```

- *Type:* aws-cdk-lib.aws_s3.RoutingRule[]
- *Default:* No redirection rules.

Rules that define when a redirect is applied and the redirect behavior.

---

##### `moveToGlacierDeepArchive`<sup>Optional</sup> <a name="moveToGlacierDeepArchive" id="@savvytools/ez-constructs.SecureBucketProps.property.moveToGlacierDeepArchive"></a>

```typescript
public readonly moveToGlacierDeepArchive: boolean;
```

- *Type:* boolean
- *Default:* false

Use only for buckets that have archiving data.

CAUTION, once the object is archived, a temporary bucket to store the data.

---

##### `objectsExpireInDays`<sup>Optional</sup> <a name="objectsExpireInDays" id="@savvytools/ez-constructs.SecureBucketProps.property.objectsExpireInDays"></a>

```typescript
public readonly objectsExpireInDays: number;
```

- *Type:* number
- *Default:* 3650 - 10 years

The number of days that object will be kept.

---

## Classes <a name="Classes" id="Classes"></a>

### Utils <a name="Utils" id="@savvytools/ez-constructs.Utils"></a>

A utility class that have common functions.

#### Initializers <a name="Initializers" id="@savvytools/ez-constructs.Utils.Initializer"></a>

```typescript
import { Utils } from '@savvytools/ez-constructs'

new Utils()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@savvytools/ez-constructs.Utils.appendIfNecessary">appendIfNecessary</a></code> | Will append the suffix to the given name if the name do not contain the suffix. |

---

##### `appendIfNecessary` <a name="appendIfNecessary" id="@savvytools/ez-constructs.Utils.appendIfNecessary"></a>

```typescript
import { Utils } from '@savvytools/ez-constructs'

Utils.appendIfNecessary(name: string, suffixes: string)
```

Will append the suffix to the given name if the name do not contain the suffix.

###### `name`<sup>Required</sup> <a name="name" id="@savvytools/ez-constructs.Utils.appendIfNecessary.parameter.name"></a>

- *Type:* string

a string.

---

###### `suffixes`<sup>Required</sup> <a name="suffixes" id="@savvytools/ez-constructs.Utils.appendIfNecessary.parameter.suffixes"></a>

- *Type:* string

the string to append.

---




