import { Sequelize } from "sequelize";
import dotenv from 'dotenv'


dotenv.config()

  const connection_url = process.env.DB_CONNECTION
    const sequelize = new Sequelize(connection_url,{
        dialect:'postgres'
    })

export default sequelize;