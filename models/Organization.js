import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Organization = sequelize.define('organization', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    organization_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
   timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    freezeTableName:true
})

export default Organization