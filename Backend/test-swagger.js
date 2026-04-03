const express = require('express');
const swaggerUi = require('swagger-ui-express');
const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup({ openapi: '3.0.0', info: { title: 'test', version: '1' } }));
app.listen(3001, () => console.log('Listening on 3001'));
