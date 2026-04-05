import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Asset from './Asset.js';
import Employee from './Employee.js';
import User from './User.js';

const IssuedAsset = sequelize.define('issued_asset', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  asset_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Asset,
      key: 'id',
    },
  },

  employee_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references:{
        model:Employee,
        key:'id'
    }
  },

  issued_by: {
    type: DataTypes.UUID,
    references:{
        model:User,
        key:'id'
    }
  },

  issued_at: {
    type: DataTypes.DATE,
  },

  returned_at: {
    type: DataTypes.DATE,
  },

  returned_by: {
    type: DataTypes.UUID,
    references:{
        model:Employee,
        key:'id'
    }
  },

  reason_of_return: {
    type: DataTypes.STRING,
  },

  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

}, {
  freezeTableName: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default IssuedAsset;