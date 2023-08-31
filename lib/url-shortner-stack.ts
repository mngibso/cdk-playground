import * as cdk from 'aws-cdk-lib';
// import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';
import { aws_apigateway as gateway, aws_rds as rds, aws_lambda as lambda, aws_secretsmanager as secretsmanager } from 'aws-cdk-lib';
import { DEFAULT_DB_NAME, DEFAULT_DB_USER_NAME, DB_SECRET_NAME } from './consts';
import path = require('path');

// import * as sqs from 'aws-cdk-lib/aws-sqs';

const URL_SHORTNER_TABLE_NAME = 'mapping-table';
export class UrlShortnerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { DB_NAME = DEFAULT_DB_NAME, DB_USER_NAME = DEFAULT_DB_USER_NAME } = process.env;
    // Create a secret to store the master password for the Aurora instance
    const secret = new rds.DatabaseSecret(this, 'AuroraSecret', {
      username: DB_USER_NAME,
      secretName: DB_SECRET_NAME,
    });

    // Create the Aurora Serverless database cluster
    const cluster = new rds.ServerlessCluster(this, 'AuroraServerlessCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_13_9 }),
      // parameterGroup: rds.ParameterGroup.fromParameterGroupName(
        // this,
        // 'ParameterGroup',
        // 'default.aurora-postgresql10'
      // ),
      defaultDatabaseName: DB_NAME,
      credentials: { username: DB_USER_NAME },
    });

    /*
    const table = new dynamodb.Table(this, URL_SHORTNER_TABLE_NAME, {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });
        // Add a global secondary index on 'url_hash'
        table.addGlobalSecondaryIndex({
          indexName: 'UrlHashIndex',
          partitionKey: { name: 'url_hash', type: dynamodb.AttributeType.STRING },
        });
    
        // Add a global secondary index on 'url'
        table.addGlobalSecondaryIndex({
          indexName: 'UrlIndex',
          partitionKey: { name: 'url', type: dynamodb.AttributeType.STRING },
        });
    
    */
    const redirect = new lambda.Function(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'redirect.redirect',
      //code: lambda.Code.fromAsset('lib/redirect'),
      code: lambda.Code.fromAsset(path.join(__dirname, '/../lib')),
      environment: {
        TABLE_NAME: URL_SHORTNER_TABLE_NAME,
        DB_SECRET_NAME,
      }
    });
    /*
    const fn = new NodejsFunction(this, 'Lambda', {
    entry: './lambda/index.ts',
    runtime: Runtime.NODEJS_16_X,
    handler: 'main',
    bundling: {
      externalModules: ['aws-sdk', 'pg-native'],
      minify: false,
    },
    environment: {
      databaseSecretArn: dbCluster.secret?.secretArn ?? '', // pass the secret arn to the lambda function
    },
  })
  */

    // allow the lambda function to access credentials stored in AWS Secrets Manager
    // the lambda function will be able to access the credentials for the default database in the db cluster
    cluster.secret?.grantRead(redirect)
    cluster.secret?.grantWrite(redirect)

    const api = new gateway.LambdaRestApi(this, 'Api', {
      handler: redirect,
      proxy: false,
    })
    const redirects = api.root.addResource('redirects');
    redirects.addMethod('GET')
    redirects.addMethod('POST')
    /*
    const metric = table.metricThrottledRequestsForOperations({
      operations: [dynamodb.Operation.PUT_ITEM],
      period: Duration.minutes(1),
    });
    
    new cloudwatch.Alarm(this, 'Alarm', {
      metric: metric,
      evaluationPeriods: 1,
      threshold: 1,
    });
    */
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'UrlShortnerQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
