# EZ Constructs 
A collection of heaviliy opinionated AWS CDK highlevel constructs.

## Installation
> The library requires AWS CDK version >= 2.7.0.

` npm install ez-constructs` or ` yarn add ez-constructs`

## Constructs
1. [SecureBucket](src/secure-bucket) - Creates an S3 bucket that is secure, encrypted at rest along with object retention and intelligent transition rules

## Libraries
1. Utils - A collection of utility functions

## Aspects
1. [PermissionsBoundaryAspect](src/aspects) - A custom aspect that can be used to apply a permission boundary to all roles created in the contex. 