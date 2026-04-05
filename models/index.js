import User from "./User.js";
import Organization from "./Organization.js";
import Employee from "./Employee.js";
import AssetCategory from "./AssetCategory.js";
import Asset from "./Asset.js";
import IssuedAsset from "./IssuedAsset.js";

Asset.belongsTo(AssetCategory, {
  foreignKey: "asset_category_id",
});


AssetCategory.hasMany(Asset, {
  foreignKey: "asset_category_id",
});


Asset.hasMany(IssuedAsset,{
    foreignKey:'asset_id'
})

IssuedAsset.belongsTo(Asset,{
    foreignKey:'asset_id'
})



Employee.belongsTo(Organization, {
  foreignKey: "organization_id"
});

Organization.hasMany(Employee, {
  foreignKey: "organization_id"
});

export { User, Organization , Employee , AssetCategory,Asset,IssuedAsset }