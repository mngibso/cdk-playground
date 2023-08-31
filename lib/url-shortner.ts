import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export async function urlShorter(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Your logic here
    const responseBody = JSON.stringify({ message: 'Hello from Lambda!' });

    return {
      statusCode: 200,
      body: responseBody,
    };
  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
}