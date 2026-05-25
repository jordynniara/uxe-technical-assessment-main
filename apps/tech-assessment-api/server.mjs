import {createServer} from 'node:http';

function getRequiredFields(config) {
  const requiredStringFields = ['deliveryName', 'customer', 'deliveryLocation', 'deliveryFileName'];
  const requiredBooleanFields = ['combineFiles', 'specificDirectory', 'virusScan', 'encrypt'];
  const requiredNumberFields = [];
  if (config?.deliveryLocation) {
    const location = config?.deliveryLocation;
    if (location === 'email') {
      requiredStringFields.push(...['subject', 'body', 'recipients']);
    } else if (['email', 'gcloud', 'azure', 's3'].includes(location)) {
      requiredStringFields.push(...['bucket', 'credentialsFile', 'upload_option']);
    }
  }
  if (config?.combineFiles) {
    requiredNumberFields.push('maximumFileSize');
    requiredBooleanFields.push('compression');
  }

  return {requiredStringFields, requiredBooleanFields, requiredNumberFields};
}

const PORT = Number.parseInt(process.env.PORT ?? '3333', 10);
const MAX_BODY_SIZE_BYTES = 1_000_000;

function applyCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, statusCode, body) {
  applyCorsHeaders(res);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function validateThreeVDelivery(payload) {
  const errors = [];

  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return ['Request body must be a JSON object.'];
  }

  const optionalStringFields = ['deliveryFrequency', 'last_file_suffix'];
  const {requiredStringFields, requiredBooleanFields, requiredNumberFields} =
    getRequiredFields(payload);

  for (const field of requiredStringFields) {
    if (typeof payload[field] !== 'string' || payload[field].trim().length === 0) {
      errors.push(`Field "${field}" is required and must be a non-empty string.`);
    }
    if (field === 'deliveryLocation') {
      if (!['email', 'gcloud', 'azure', 's3'].includes(payload[field])) {
        errors.push(`Field "${field}" must be 'email', 'gcloud', 'azure', or 's3'.`);
      }
    }
  }

  for (const field of requiredBooleanFields) {
    if (typeof payload[field] !== 'boolean') {
      errors.push(`Field "${field}" is required and must be a boolean.`);
    }
  }

  for (const field of requiredNumberFields) {
    if (typeof payload[field] !== 'number' || Number.isNaN(payload[field])) {
      errors.push(`Field "${field}" is required and must be a number.`);
    }
  }

  for (const field of optionalStringFields) {
    if (field in payload && typeof payload[field] !== 'string') {
      errors.push(`Field "${field}" must be a string when provided.`);
    }
  }

  return errors;
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_SIZE_BYTES) {
        reject(new Error('Request body exceeds 1 MB.'));
        req.destroy();
        return;
      }

      body += chunk;
    });

    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const acceptedDeliveries = [];
const server = createServer(async (req, res) => {
  const method = req.method ?? 'GET';
  const url = req.url ?? '/';

  if (method === 'OPTIONS') {
    applyCorsHeaders(res);
    res.statusCode = 204;
    res.end();
    return;
  }

  if (method === 'GET' && url === '/api/three-v-deliveries') {
    sendJson(res, 200, {count: acceptedDeliveries.length, data: acceptedDeliveries});
    return;
  }

  if (method === 'POST' && url === '/api/three-v-deliveries?error=true') {
    sendJson(res, 500, {message: 'Internal server error', errors: []});
    return;
  }

  if (method === 'POST' && url === '/api/three-v-deliveries') {
    try {
      const body = await readRequestBody(req);
      const payload = JSON.parse(body || '{}');
      const errors = validateThreeVDelivery(payload);

      if (errors.length > 0) {
        sendJson(res, 400, {message: 'Validation failed.', errors});
        return;
      }

      const record = {
        ...payload,
        acceptedAt: new Date().toISOString(),
        id: acceptedDeliveries.length + 1,
      };

      acceptedDeliveries.push(record);
      sendJson(res, 201, {message: 'ThreeVDelivery accepted.', data: record});
      return;
    } catch (error) {
      const message =
        error instanceof SyntaxError
          ? 'Invalid JSON payload.'
          : error instanceof Error
            ? error.message
            : 'Unknown error while processing request.';

      sendJson(res, 400, {message});
      return;
    }
  }

  sendJson(res, 404, {
    message: 'Route not found.',
    availableRoutes: ['GET /api/three-v-deliveries', 'POST /api/three-v-deliveries'],
  });
});

server.listen(PORT, () => {
  console.log(`tech-assessment-api listening on http://localhost:${PORT}`);
});
