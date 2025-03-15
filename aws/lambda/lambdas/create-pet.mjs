import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from 'crypto'

// Initialize DynamoDB Document Client
const client = new DynamoDB({});
const dynamoDB = DynamoDBDocument.from(client);

// Table names
const PETS_TABLE = "pets";
const STATUSES_TABLE = "statuses";

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { userId, name } = body;


        if (!userId || !name) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing userId or name" })
            };
        }

        // Generate UUIDs
        const petId = crypto.randomUUID();
        const hungerStatusId = crypto.randomUUID();
        const sleepStatusId = crypto.randomUUID();
        const hygieneStatusId = crypto.randomUUID();

        const currentTime = new Date().toISOString();

        // Insert into `pets` table
        const petItem = {
            TableName: PETS_TABLE,
            Item: {
                petId,
                userId,
                name,
                hungerStatusId,
                sleepStatusId,
                hygieneStatusId
            }
        };

        await dynamoDB.put(petItem);

        // Status types
        const statusTypes = [
            { statusId: hungerStatusId, type: "hunger" },
            { statusId: sleepStatusId, type: "sleep" },
            { statusId: hygieneStatusId, type: "hygiene" }
        ];

        // Insert into `statuses` table using batch write
        const batchWriteParams = {
            RequestItems: {
                [STATUSES_TABLE]: statusTypes.map(status => ({
                    PutRequest: {
                        Item: {
                            statusId: status.statusId,
                            petId,
                            type: status.type,
                            lastValue: 100,  // Default value
                            lastTimestamp: currentTime,
                            decrementRate: 0.5 // Example rate
                        }
                    }
                }))
            }
        };

        await dynamoDB.batchWrite(batchWriteParams);

        return {
            statusCode: 200,
            body: JSON.stringify({
                petId,
                statusIds: [hungerStatusId, sleepStatusId, hygieneStatusId]
            })
        };

    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error: error.message })
        };
    }
};
