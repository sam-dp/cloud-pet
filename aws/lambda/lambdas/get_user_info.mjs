import pkg from "@aws-sdk/client-dynamodb"; 
const { DynamoDBClient, GetItemCommand, BatchGetItemCommand, ScanCommand } = pkg; 

const dynamoDb = new DynamoDBClient({});
const USER_TABLE = "users";
const PETS_TABLE = "pets";
const STATUSES_TABLE = "statuses";

export async function handler(event) {
  try {
    // Hardcoded user ID for testing
    //const userId = "5871b390-3071-70cb-e8f0-34fdcf8c9695";
    const { userId } = event.queryStringParameters || {};
    if (!userId) {
      console.error("Missing userId");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing userId" }),
      };
    }
    
    const params = {
      TableName: USER_TABLE,
      Key: {
        userId: { S: userId },
      },
    };

    const command = new GetItemCommand(params);
    const userResult = await dynamoDb.send(command);

    if (!userResult.Item) {
      return { statusCode: 404, body: JSON.stringify({ error: "User not found" }) };
    }
    // Fetch the pets for the user
    const petsParams = {
      TableName: PETS_TABLE,
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": { S: userId },
      },
    };

    // Use ScanCommand to get multiple pets (or QueryCommand if optimized with GSI)
    const petsCommand = new ScanCommand(petsParams);
    const petsResult = await dynamoDb.send(petsCommand);

    if (!petsResult.Items || petsResult.Items.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: "No pets found" }) };
    }

    // Fetch statuses for each pet using their individual statusIds and petId
    const petsWithStatuses = [];
    const statusKeys = [];

    // Collect all statusIds and petIds
    for (const pet of petsResult.Items) {
      const hungerStatusId = pet.hungerStatusId?.S;
      const sleepStatusId = pet.sleepStatusId?.S;
      const hygieneStatusId = pet.hygieneStatusId?.S;
      const petId = pet.petId?.S;

      if (hungerStatusId && petId) statusKeys.push({ statusId: hungerStatusId, petId });
      if (sleepStatusId && petId) statusKeys.push({ statusId: sleepStatusId, petId });
      if (hygieneStatusId && petId) statusKeys.push({ statusId: hygieneStatusId, petId });
    }

    // Fetch the actual status data using BatchGetItem
    const statusMap = new Map();

    if (statusKeys.length > 0) {
      const statusParams = {
        RequestItems: {
          [STATUSES_TABLE]: {
            Keys: statusKeys.map((key) => ({
              statusId: { S: key.statusId }, // partition key
              petId: { S: key.petId },       // sort key
            })),
          },
        },
      };

      const batchGetCommand = new BatchGetItemCommand(statusParams);
      const statusResult = await dynamoDb.send(batchGetCommand);

      // Map status data to statusId and petId
      for (const item of statusResult.Responses[STATUSES_TABLE]) {
        const statusId = item.statusId.S;
        const petId = item.petId.S;
        //const currentTimeStamp = Date.now();
        //const elapsed = currentTimeStamp - Date.parse(item.lastTimestamp?.S || 0);
        //const currentValue = item.lastValue?.N - elapsed * item.decrement?.N;

        statusMap.set(`${statusId}-${petId}`, {
          statusId: item.statusId?.S,
          petId: item.petId?.S,
          type: item.type?.S,
          decrementRate: item.decrementRate?.N || null,
          incrementValue: item.incrementValue?.N || null,
          lastTimestamp: item.lastTimestamp?.S || null,
          lastValue: item.lastValue?.N || null,
          //currentValue,
        });
      }
    }

    // Attach status data to each pet
    petsWithStatuses.push(
      ...petsResult.Items.map((pet) => {
        const petStatusData = [];
        const hungerStatus = statusMap.get(`${pet.hungerStatusId?.S}-${pet.petId?.S}`);
        const sleepStatus = statusMap.get(`${pet.sleepStatusId?.S}-${pet.petId?.S}`);
        const hygieneStatus = statusMap.get(`${pet.hygieneStatusId?.S}-${pet.petId?.S}`);

        if (hungerStatus) petStatusData.push(hungerStatus);
        if (sleepStatus) petStatusData.push(sleepStatus);
        if (hygieneStatus) petStatusData.push(hygieneStatus);

        return {
          petName: pet.name?.S || null,
          petId: pet.petId?.S,
          statuses: petStatusData || [],
        };
      })
    );


    return {
      statusCode: 200,
      body: JSON.stringify({
        user: userResult.Item,
        pets: petsWithStatuses,
      }),
    };
    return { statusCode: 200, body: JSON.stringify(userResult.Item) };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message}) };
  }
}

