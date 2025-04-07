const express = require("express");
const cors = require("cors");
const app = express();
const pedidosRoutes = require("./routes/pedidos");

app.use(cors());
app.use(express.json());
app.use("/api/pedidos", pedidosRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
