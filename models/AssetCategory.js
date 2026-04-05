import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AssetCategory = sequelize.define('asset_category', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    category: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description:{
        type: DataTypes.STRING(255),
        allowNull: true
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

export default AssetCategory