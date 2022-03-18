# Aspects

## PermissionsBoundaryAspect

As a best practice organizations enforce policies which require all custom IAM Roles created to be defined under
a specific path and permission boundary. Well, this allows better governance and also prevents unintended privilege escalation.

AWS CDK high level constructs and patterns encapsulates the role creation from end users. So it is a laborious and at times impossible to get a handle of newly created roles within a stack.

This aspect will scan all roles within the given scope and will attach the right permission boundary and path to them.

### Usage
```ts
// can be used with any construct, perferred to be applied at the root/application level. 
const app = new App();
const mystack = new MyStack(app, 'MyConstruct'); // assuming this will create a role by name `myCodeBuildRole` with admin access.
Aspects.of(app).add(new PermissionsBoundaryAspect('/my/devroles/', 'boundary/dev-max'));
```
#### Output
```
myCodeBuildRole1A2FE32J:
    Type: 'AWS::IAM::Role'
    Properties:
      AssumeRolePolicyDocument:
        Statement:
          - Action: 'sts:AssumeRole'
            Effect: Allow
            Principal:
              Service: codebuild.amazonaws.com
        Version: 2012-10-17
      ManagedPolicyArns:
        - 'arn:aws:iam::aws:policy/AdministratorAccess'
      RoleName: myCodeBuildRole
      Path: /my/devroles/
      PermissionsBoundary: !Sub >-
        arn:aws:iam::${AWS::AccountId}:policy/boundary/dev-max
```