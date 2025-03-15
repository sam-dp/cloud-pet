import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log("PostConfirmation event:", JSON.stringify(event, null, 2));

  const  userId = event.request.userAttributes.sub; // Cognito user ID
  const email = event.request.userAttributes.email; // User's email
  const username = event.request.userAttributes.preferred_username || email; // Username or email

  const params = {
    TableName: "users",
    Item: {
      userId,
      email,
      username,
      createdAt: new Date().toISOString(),
    },
  };

  try {
    await dynamoDb.send(new PutCommand(params));
    console.log("User saved to DynamoDB");
    return event;
  } catch (error) {
    console.error("Error saving user to DynamoDB:", error);
    throw error;
  }
};

