# SecurePostgresqlDb
A secure Postgres RDS instance with accompanying resources. Will create an RDS instance with the following features:
 - Configured backup plan & vault
 - Configured alarms for CPU, Memory, Free Space, Open Connections
 - Encryption (KMS) key and instance configured for encryption-at-rest
 - Auto-generated database credentials
 - PGAudit logging
 - Optional creation from Snapshot

## Usage
# Chained methods style
```ts
export class MyStack extends Stack {
  
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    
    // create a secure db 
    let db = new SecurePostgresqlDb(mystack, 'SecurePostgresqlDb')
        .vpcId('000000')
        .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
        .cloudWatchLogRetention(RetentionDays.TWO_YEARS)
        .tag('foo', 'bar')
        .assemble();
  }
}
```

# Standard 'props' style
```ts
export class MyStack extends Stack {
  
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    
    // create a secure db 
    let db = new SecurePostgresqlDb(mystack, 'SecurePostgresqlDb', {
        vpcId: '000000',
        instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE),
        cloudWatchLogRetention: RetentionDays.TWO_YEARS,
    }).assemble();
  }
}
```
