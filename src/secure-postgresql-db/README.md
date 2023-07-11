# SecurePostgresqlDb
A secure Postgres RDS instance with accompanying resources. Will create an RDS instance with the following features:
 - Configured alarms for CPU, Memory, Free Space, Open Connections
 - Encryption (KMS) key and instance configured for encryption-at-rest
 - Auto-generated database credentials
 - PGAudit logging
 - Optional creation from Snapshot
 - Optional configured backup plan & vault

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

# DB instance from snapshot
 If you want to restore your database from an existing snapshot, specificy the snapshot value. 

 ```
let db = new SecurePostgresqlDb(mystack, 'SecurePostgresqlDb')
  .vpcId('000000')
  .instanceType(InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE))
  .restoreFromSnapshot('foo::bar')
  .assemble();
```
 *Careful, some important notes:* 
- Once you specify a snapshot to restore from, you must not remove it and continue to use that even if you are changing other properties associated with the database. 
- Only during the initial setup, the data present in the snapshot is used, thereafter for all updates the data is not reset. 
- If you remove the snapshotARN you have used previously, the current database will be reset to start from an empty snapshot and you will lose all existing data in the database.
- If you specify a different snapshotARN, your current database will be reset to start from that data present in the newly specified snapshot and you will lose all the existing data in your database.
