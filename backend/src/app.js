const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Роути
app.use('/auth',     require('./routes/auth'));
app.use('/levels',   require('./routes/levels'));
app.use('/tasks',    require('./routes/tasks'));
app.use('/requests', require('./routes/requests'));
app.use('/admin',    require('./routes/admin'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});