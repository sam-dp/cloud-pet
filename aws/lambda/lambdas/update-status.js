const { DynamoDBClient, GetItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamoDbClient = new DynamoDBClient({ region: "us-west-2" }); 
const TABLE_NAME = "statuses"; 

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    const { statusId, petId, incrementValue } = JSON.parse(event.body);

    if (!statusId || !petId || (incrementValue === undefined || incrementValue === null)) {
        console.error("Missing parameters:", event);
        return { statusCode: 400, body: "Missing parameters" };
    }


    try {
        // Fetch current status value
        const getParams = {
            TableName: TABLE_NAME,
            Key: {
                statusId: { S: statusId }, 
                petId: { S: petId }
            }
        };

        console.log("Fetching current status with params:", getParams);
        const result = await dynamoDbClient.send(new GetItemCommand(getParams));

        let currentValue = 0;
        if (result.Item && result.Item.lastValue) {
            currentValue = parseInt(result.Item.lastValue.N); // Convert from DynamoDB number format
        }

        console.log(`Current lastValue: ${currentValue}`);

        // Calculate new status value
        let newValue = parseInt(currentValue) + parseInt(incrementValue);
        if (newValue > 100) {
            console.error("Cannot increment over 100");
            newValue = 100;
        }
        const timestamp = new Date().toISOString();

        // Update the status in DynamoDB
        const updateParams = {
            TableName: TABLE_NAME,
            Key: {
                statusId: { S: statusId }, 
                petId: { S: petId }
            },
            UpdateExpression: "SET lastValue = :val, lastTimestamp = :ts",
            ExpressionAttributeValues: {
                ":val": { N: newValue.toString() }, // DynamoDB stores numbers as strings
                ":ts": { S: timestamp }
            }
        };

        console.log("Updating item with params:", updateParams);
        await dynamoDbClient.send(new UpdateItemCommand(updateParams));

        console.log(`Successfully updated ${statusId} for pet ${petId}`);

        return {
            statusCode: 200,
            body: `Updated ${statusId} for pet ${petId} to ${newValue} at ${timestamp}`
        };

    } catch (error) {
        console.error("Error updating status:", error);
        return { statusCode: 500, body: "Internal server error" };
    }
};
