import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import AssetCategory from './AssetCategory.js';
import Organization from './Organization.js';

const Asset = sequelize.define('asset', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  asset_ref_no:{
    type:DataTypes.STRING(255),
    allowNull:false
  },

  asset_name: {
    type: DataTypes.STRING(255),
  },

  asset_category_id: {
    type: DataTypes.UUID,
    references:{
        model:AssetCategory , key:'id'
    },
    allowNull: false,
  },

  organization_id: {
    type: DataTypes.UUID,
    references:{
        model:Organization , key:'id'
    },
    allowNull: false,
  },

  model: {
    type: DataTypes.STRING(255),
  },

  serial_no: {
    type: DataTypes.STRING(255),
  },

  description: {
    type: DataTypes.STRING(255),
  },

  status: {
    type: DataTypes.ENUM('available', 'issued', 'maintenance', 'scrapped'),
    defaultValue: 'available',
  },

  scrapped_at: {
    type: DataTypes.DATE,
  },

  scrapped_by: {
    type: DataTypes.UUID,
    allowNull:true,
    references:{
        model:User,
        key:'id'
    }
  },

  scrap_reason: {
    type: DataTypes.STRING,
  },

  created_by: {
    type: DataTypes.UUID,
     references:{
        model:User,
        key:'id'
    }
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

export default Asset;