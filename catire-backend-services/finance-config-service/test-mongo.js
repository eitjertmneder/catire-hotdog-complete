const { PrismaClient } = require("@prisma/client");
const url = "mongodb://catire_config_db:27017/catire_finance_config_db";
console.log("Creating PrismaClient with datasourceUrl...");
const p = new PrismaClient({ datasourceUrl: url });
console.log("Created!");
p.$connect().then(() => {
  console.log("Connected to MongoDB!");
  return p.paymentConfig.findMany();
}).then(r => {
  console.log("Payment configs:", JSON.stringify(r));
  process.exit(0);
}).catch(e => {
  console.error("Error:", e.message);
  process.exit(1);
});
