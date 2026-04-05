


import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Organization from "./Organization.js";
import User from "./User.js"



const Employee = sequelize.define('employee', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    employee_ref_id:{
      type:DataTypes.STRING(20)
    },
    employee_name:{
        type:DataTypes.STRING(255),
        allowNull:false
    },
    user_id: {
       type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: User, key: 'id'
        }
    },
    department: {
        type: DataTypes.STRING(100),
        allowNull: false,
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
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    freezeTableName: true
})

export default Employee
