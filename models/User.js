import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Organization from "./Organization.js";



const User = sequelize.define('user', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    username: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate:{
            isEmail:true
        }
    },
    password:{
        type:DataTypes.STRING(255),
        allowNull:false
    },
    role: {
        type: DataTypes.ENUM('admin', 'employee'),
        allowNull: false,
        defaultValue:'admin'
    },
    organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Organization, key: 'id'
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }

}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    freezeTableName: true
})

export default User