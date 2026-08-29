import "dotenv/config"
import app from "./app.js";
import Prisma from "./config/prisma.js";

const PORT = Number(process.env.PORT) || 5000;

async function startServer(){
    try{
        await Prisma.$connect();

        app.listen(PORT, ()=>{
            console.log(`app is running at port http://localhost:${PORT}`)
        });
    }
    catch(error){
        console.error("Database connection failed", error);
        process.exit(1);
    }
}

startServer();