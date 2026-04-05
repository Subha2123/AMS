import sequelize from "../config/database.js";
import { Asset, AssetCategory, Employee, IssuedAsset, Organization } from "../models/index.js";
import { conflictError, notFoundError } from "../utils/errors.js";
import { CONST_STATUS_CODE } from "../utils/statusCode.js";
import { Op, literal, fn, col, where } from "sequelize";


export const createAsset = async (payload) => {
    try {
        const { asset_name, asset_ref_no, model, asset_category_id, serial_no, description, created_by,organization_id } = payload;

        if (!asset_name) {
            return notFoundError("Missing required fields: asset_name or asset_ref_id");
        }

        const existingAsset = await Asset.findOne({ where: { asset_ref_no } });
        if (existingAsset) return notFoundError("Asset with this reference ID already exists");

        const insert = await Asset.create({
            asset_ref_no,
            asset_name: asset_name.trim(),
            model: model?.trim() || null,
            asset_category_id: asset_category_id || null,
            serial_no: serial_no,
            description: description,
            created_by,
            organization_id
        });

        return { statusCode: CONST_STATUS_CODE.CREATED, data: insert.toJSON() };
    } catch (error) {
        console.error("Error in createAsset:", error.message);
        throw error;
    }
};

export const updateAsset = async (id, payload) => {
    try {
        const asset = await Asset.findByPk(id);
        if (!asset) return notFoundError("Asset not found");

        const { asset_name, model, categoryId, serial_no, description } = payload;

        // await Asset.update({
        //     asset_name: asset_name?.trim() || asset.asset_name,
        //     model: model?.trim() || asset.model,
        //     categoryId: categoryId || asset.categoryId,
        //     serial_no:serial_no || asset.serial_no
        //     description
        // });

        return { statusCode: CONST_STATUS_CODE.OK, data: asset.toJSON() }
    } catch (error) {
        console.error("Error in updateAsset:", error.message);
        throw error;
    }
};

export const softDeleteAsset = async (id) => {
    try {
        const asset = await Asset.findByPk(id);
        if (!asset) return notFoundError("Asset not found");

        await asset.update({ is_active: false });

        return { statusCode: CONST_STATUS_CODE.OK, id };
    } catch (error) {
        console.error("Error in softDeleteAsset:", error.message);
        throw error;
    }
};


export const getAssets = async (filters) => {
    try {
        const { search, model, draw, start = 0, length = 10 } = filters || {};
        const where = { is_active: true };

        const limit = parseInt(length) || 10;
        const offset = parseInt(start) || 0;

        if (search) {
            where[Op.or] = [
                { asset_name: { [Op.like]: `%${search}%` } },
                { model: { [Op.like]: `%${search}%` } },
                { serial_no: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        if (model) where.model = model;

        const { rows, count } = await Asset.findAndCountAll({
            where,
            include: [
                {
                    model: AssetCategory,
                    attributes: ["category", "id"]
                }
            ],
            attributes: ["id", "asset_name", "model", "serial_no", "description", "status", "created_at", "asset_ref_no"],
            limit: limit,
            offset: offset,
            order: [["created_at", "DESC"]]
        });


        const data = rows.map(emp => {
            const e = emp.toJSON();
            return {
                ...e,
                asset_category_id: e.asset_category?.category || "-"
            };
        });

        return {
            statusCode: CONST_STATUS_CODE.OK,
            total: count,
            data: data
        };
    } catch (error) {
        console.error("Error in getAssets:", error.message);
        throw error;
    }
};


export async function getAssetById(id) {
    try {
        const asset = await Asset.findOne({
            where: { id },
            include: [
                {
                    model: AssetCategory,
                    attributes: ['id', 'category']
                }
            ],
            attributes: [
                'id',
                'asset_ref_no',
                'asset_name',
                'asset_category_id',
                'model',
                'serial_no',
                'description',
                'status',
                'created_at'
            ]
        });

        if (!asset) {
            return { statusCode: CONST_STATUS_CODE.NOT_FOUND, success: false, message: "Asset not found" };
        }
        return { statusCode: CONST_STATUS_CODE.OK, success: true, data: asset.toJSON() };

    } catch (error) {
        console.error("Error in getAssetById:", error.message);
        throw error;
    }
}


export const createCategory = async (payload) => {
    try {
        const { category, description } = payload;
        if (!category) return notFoundError("Category name is required");


        const categoryTrim = category.trim()

     

        const existingCategory = await AssetCategory.findOne({ where: { category: categoryTrim } });

    

        if (existingCategory) return conflictError("Category already exists");

        const insert = await AssetCategory.create({
            category: category.trim(),
            description: description?.trim() || null,
        });

        return { statusCode: CONST_STATUS_CODE.CREATED, data: insert.toJSON() };
    } catch (error) {
        console.error("Error in createCategory:", error.message);
        throw error;
    }
};

export const updateCategory = async (id, payload) => {
    try {
        const category = await AssetCategory.findByPk(id);
        if (!category) return notFoundError("Category not found");

        const { category: name, description } = payload;
        if (!name) return notFoundError("Category name is required");

        await category.update({
            category: name.trim(),
            description: description?.trim() || category.description,
        });

        return { statusCode: CONST_STATUS_CODE.OK, data: category.toJSON() };
    } catch (error) {
        console.error("Error in updateCategory:", error.message);
        throw error;
    }
};

export const deleteCategory = async (id) => {
    try {
        const category = await AssetCategory.findByPk(id);
        if (!category) return notFoundError("Category not found");

        await category.destroy();
        return { statusCode: CONST_STATUS_CODE.OK, id };
    } catch (error) {
        console.error("Error in deleteCategory:", error.message);
        throw error;
    }
};

export const getCategories = async (params) => {
    try {
        const start = parseInt(params.start) || 0;
        const length = parseInt(params.length) || 10;
        const searchValue = params.search || "";


        const recordsTotal = await AssetCategory.count();

        let where = {};
        if (searchValue) {
            where = {
                [Op.or]: [
                    { category: { [Op.iLike]: `%${searchValue}%` } },
                    { description: { [Op.iLike]: `%${searchValue}%` } }
                ]
            };
        }

        const recordsFiltered = await AssetCategory.count({ where });

        const categories = await AssetCategory.findAll({
            where,
            offset: start,
            limit: length,
            order: [['id', 'ASC']]
        });

        const formatted = categories.map((c) => ({
            id: c.id,
            category: c.category,
            description: c.description
        }));

        return {
            draw: parseInt(params.draw) || 0,
            recordsTotal,
            recordsFiltered,
            data: formatted
        };
    } catch (error) {
        console.error("Error in getCategories:", error.message);
        throw error;
    }
};

export const getStockSummary = async () => {

    try {
        const assets = await Asset.findAll({
            where: { status: "available", is_active: true },
            attributes: [
                [literal(`asset_name`), 'asset_display'],
                [fn('COUNT', col('id')), 'count'],
            ],
            group: ['asset_name', 'model'],
            raw: true
        });

        const countStatus = await Asset.findAll({
            attributes: [
                'status',
                [fn('UPPER', literal(`status::text`)), 'displayName'],
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        return countStatus;
    } catch (error) {
        console.error("Error in getCategories:", error.message);
        throw error;
    }
}

export const getStockSummaryBoard = async (orgId) => {

    const result = await Asset.findAll({
        attributes: [
            'status',
            [Asset.sequelize.fn('COUNT', Asset.sequelize.col('id')), 'count'],
        ],
        group: ['status'],
        raw: true
    });

    const summary = {};
    result.forEach(r => {
        summary[r.status.toLowerCase()] = {
            count: parseInt(r.count),
        };
    });

    return summary;
}

export const getOrganizationSummary = async (orgId) => {
    try {

        const org = await Organization.findOne({
            where: { id: orgId },
            attributes: ['id', 'organization_name'],
            raw: true
        });



        const totalEmployees = await Employee.count();

        return {
            organization_name: org?.organization_name,
            total_employees: totalEmployees
        };
    } catch (error) {
        console.error("Error in get Org:", error.message);
        throw error;
    }

}

export const getAssetsByCategory = async (orgId) => {
    try {

        const result = await Asset.findAll({
            attributes: [
                [Asset.sequelize.fn('COUNT', Asset.sequelize.col('asset.id')), 'count']
            ],

            include: [
                {
                    model: AssetCategory,
                    attributes: ['category']
                }
            ],
            group: ['asset_category_id', 'asset_category.id'],
            raw: true,
            nest: true
        });
        return result.map(r => ({
            category: r.asset_category?.category,
            count: parseInt(r.count)
        }));
    } catch (error) {
        console.error("Error in get Category:", error.message);
        throw error;
    }

}

export const getRecentActivity = async () => {
    try {

        const query = `SELECT 
    TO_CHAR(ia.issued_at, 'DD-MM-YYYY') AS activity_date,
    a.asset_name,
    CONCAT('Issued to ', e.employee_name) AS activity
FROM issued_asset ia
JOIN asset a 
    ON a.id = ia.asset_id
JOIN employee e
    ON e.id = ia.employee_id

UNION ALL

SELECT 
    TO_CHAR(a.updated_at, 'DD-MM-YYYY') AS activity_date,
    a.asset_name,
    CONCAT('Deleted by ', u.username) AS activity
FROM asset a
JOIN "user" u 
    ON u.id = a.created_by
WHERE a.is_active = false

UNION ALL

SELECT 
    TO_CHAR(a.updated_at, 'DD-MM-YYYY') AS activity_date,
    a.asset_name,
    CONCAT('Scrapped by ', u.username) AS activity
FROM asset a
JOIN "user" u 
    ON u.id = a.created_by
WHERE a.status = 'scrapped'

ORDER BY activity_date;`

        const [results] = await sequelize.query(query)
        return results
    }
    catch (error) {
     console.error("Error in get Activity",error.message)
    }
}

export const issueAsset = async (payload) => {
    const transaction = await sequelize.transaction();

    try {
        const { asset_id, employee_id } = payload;

        if (!asset_id || !employee_id) {
            throw notFoundError("asset_id and employee_id are required");
        }
        const issuedRecord = await IssuedAsset.create(
            { ...payload, issued_at: new Date() },
            { transaction }
        );


        const [updatedCount] = await Asset.update(
            { status: "issued" },
            { where: { id: asset_id, status: "available" }, transaction }
        );

        if (updatedCount === 0) {
            await transaction.rollback();
            return {
                statusCode: 400,
                success: false,
                message: "Asset is already issued or does not exist",
            };
        }


        await transaction.commit();

        return {
            statusCode: CONST_STATUS_CODE.CREATED,
            success: true,
            data: issuedRecord.toJSON(),
            message: "Asset issued successfully",
        };

    } catch (error) {
        await transaction.rollback();
        console.error("Error in issueAsset:", error);
        throw error;
    }
};

export const scrapAsset = async (payload) => {
    try {
        const { asset_id, reason, scrapped_by } = payload;

        if (!asset_id) {
            throw notFoundError("asset_id is required");
        }

        const [updatedCount] = await Asset.update(
            { status: "scrapped", scrap_reason: reason, scrapped_by, scrapped_at: new Date() },
            { where: { id: asset_id } }
        );

        if (updatedCount === 0) {
            return {
                statusCode: 400,
                success: false,
                message: "Asset is already issued or does not exist",
            };
        }

        return {
            statusCode: CONST_STATUS_CODE.CREATED,
            success: true,
            message: "Asset issued successfully",
        };

    } catch (error) {
        console.error("Error in issueAsset:", error);
        throw error;
    }
};