require('./dotenv').config();
const app = require('./app');

const port = Number(process.env.PORT || 3306);
app.listen(port, () => {
  console.log(`API ADADOC disponível em http://localhost:${port}`);
});
