/*
import { aws_dynamodb as db } from "aws-cdk-lib"
const dynamodb = new db.DocumentClient();
export const targetUrl = async (url: string): string => {
    const { URL_SHORTNER_TABLE_NAME: tableName } = process.env;
    const params = {
        TableName: tableName, // Replace with your table name
        KeyConditionExpression: 'url_hash = :hashValue',
        ExpressionAttributeValues: {
        ':hashValue': 'desiredUrlHashValue',
        },
    };
    dynamodb.query(params)//
    return '';
}
*/