const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.TABLE_NAME || 'lifemap-planner';

exports.handler = async (event) => {
  // Always log the event for debugging
  console.log('Event:', JSON.stringify(event, null, 2));
  const { httpMethod, path, pathParameters, body } = event;

  // Helper for consistent responses
  const res = (status, data) => ({
    statusCode: status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  try {
    // *** Allow GET / or GET /items for browser/FnURL compatibility ***
    if (httpMethod === 'GET' && (!path || path === '/' || path === '/items')) {
      const result = await db.scan({ TableName: TABLE }).promise();
      return res(200, result.Items || []);
    }

    // Create new item: POST /items
    if (httpMethod === 'POST' && (!path || path === '/' || path === '/items')) {
      const item = JSON.parse(body);
      item.id = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      item.createdAt = Date.now();
      item.completed = !!item.completed;
      await db.put({ TableName: TABLE, Item: item }).promise();
      return res(201, item);
    }

    // Update item: PUT /items/{id}
    if (httpMethod === 'PUT' && pathParameters && pathParameters.id) {
      const updates = JSON.parse(body);
      const params = {
        TableName: TABLE,
        Key: { id: pathParameters.id },
        UpdateExpression: 'set #t = :t, #d = :d, #cm = :cm',
        ExpressionAttributeNames: {
          '#t': 'title',
          '#d': 'description',
          '#cm': 'completed',
        },
        ExpressionAttributeValues: {
          ':t': updates.title,
          ':d': updates.description,
          ':cm': !!updates.completed,
        },
        ReturnValues: 'ALL_NEW',
      };
      const result = await db.update(params).promise();
      return res(200, result.Attributes);
    }

    // Delete item: DELETE /items/{id}
    if (httpMethod === 'DELETE' && pathParameters && pathParameters.id) {
      await db.delete({ TableName: TABLE, Key: { id: pathParameters.id } }).promise();
      return res(204, { message: 'Item deleted' });
    }

    // Handle CORS preflight
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: null,
      };
    }

    // Fallback
    return res(400, { error: 'Invalid request' });

  } catch (err) {
    console.log('Lambda error:', err);
    return res(500, { error: err.message });
  }
};
