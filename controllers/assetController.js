import Asset from '../models/Asset.js';
import * as assetService from '../services/assetService.js'
import { renderResponse } from "../utils/response.js"
import { CONST_STATUS_CODE } from '../utils/statusCode.js';
import { validateBody } from "../utils/validateRequest.js"


export const getAssetsPage = (req, res) => {
    const user=req.user
    res.render("assets", {
        assetColumns: [
            { field: "asset_ref_no", label: "Ref No", showInForm: true },
            { field: "asset_name", label: "Asset Name", showInForm: true },
            { field: "asset_category_id", label: "Category", showInForm: true, isSelect: true },
            { field: "model", label: "Model", showInForm: true },
            { field: "serial_no", label: "Serial No", showInForm: true },
            { field: "description", label: "Description", showInForm: true },
            { field: "status", label: "Status", showInForm: false }
        ],
        issueActions: ["Issue", "Scrap"],
        assetActions: ["view", "edit", "delete"],
        assetAjaxUrl: "/api/assets/data",
        categoryAjaxUrl: "/api/assets/categories/data",
        models: [],
        user
    });
};

export const getCategoriesPage = (req, res) => {
    res.render("category", {
        title: "Asset Categories",
        categoryAjaxUrl: "/api/assets/categories/data"
    });
};

export const getAssetsData = async (req, res) => {
    try {
        const { model } = req.query;
        const search = req.query["search[value]"] || "";
        const result = await assetService.getAssets({ search: search, model });
        res.json({
            draw: req.query.draw,
            recordsTotal: result.total,
            recordsFiltered: result.total,
            data: result.data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


export async function viewAsset(req, res) {
    try {
        const assetId = req.params.id;

        const result = await assetService.getAssetById(assetId);

        if (!result.success) {
            return res.status(result.statusCode).json(result);
        }

        res.json(result);

    } catch (error) {
        console.error("Error in viewAsset controller:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}


export const createAsset = async (req, res) => {
    try {
        const created_by = req.user.id
        const organization_id=req.user.organization_id
        const asset = await assetService.createAsset({ ...req.body, created_by,organization_id });
        if (asset.statusCode !== CONST_STATUS_CODE.CREATED) {
            return res.json({ success: false, message: asset.message });
        }
        return res.json({ success: true, message: "Asset added successfully", data: asset });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};


export const updateAsset = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, ...data } = req.body;

        if (action === "delete") {
            await assetService.softDeleteAsset(id);
            return res.json({ success: true, message: "Asset deleted successfully" });
        }

        await assetService.updateAsset(id, data);
        res.json({ success: true, message: "Asset updated successfully" });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};



export const getStockPage = async (req, res) => {
    try {
        const stockSummary = await assetService.getStockSummary();
        res.render("stock", {
            columns: [
                { label: "Asset", field: "asset_name" },
                { label: "Available Count", field: "count" },
                { label: "Total Value", field: "total" }
            ],
            stockSummary
        });
    } catch (err) {
        console.error(err);
        // res.redirect("/");
    }
};



export const loadDashboardData = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const stockSummary = await assetService.getStockSummaryBoard(orgId);
        const recentActivity = await assetService.getRecentActivity(orgId);
        const orgSummary = await assetService.getOrganizationSummary(orgId);
        const assetByCate = await assetService.getAssetsByCategory(orgId);
        return res.json({
            success: true,
            data: {
                orgSummary,
                stockSummary,
                assetByCate,
                recentActivity:recentActivity,
            }
        });
    } catch (err) {
        console.error("Failed to load dashboard data:", err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const dashboardPage = async (req, res) => {
  try {
    const user = req.user; 
    res.render('dashboardPage', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

export const getCategoriesData = async (req, res) => {
    try {
        const search = req.query["search[value]"] || "";
        const data = await assetService.getCategories({
            start: req.query.start,
            length: req.query.length,
            search: search,
        });
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const createAssetCategory = async (req, res) => {
    try {
        const { category, description } = req.body;
        if (!category) return res.json({ success: false, message: "Category name is required" });

        const insert = await assetService.createCategory({ category, description });
        res.json({ success: true, message: "Category created successfully", data: insert });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};

export const updateAssetCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, category, description } = req.body;

        if (action === "delete") {
            await assetService.deleteCategory(id);
            return res.json({ success: true, message: "Category deleted successfully" });
        }

        await assetService.updateCategory(id, { category, description });
        res.json({ success: true, message: "Category updated successfully" });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: err.message });
    }
};


export const issueAssettoEmp = async (req, res) => {
    try {

        const issued_by = req.user?.id

        const payload = {
            ...req.body,
            issued_by
        }

        const insert = await assetService.issueAsset(payload)
        res.json(insert)

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

export const scrapAsset = async (req, res) => {
    try {

        const scrapped_by = req.user?.id

        const payload = {
            ...req.body,
            scrapped_by
        }

        const insert = await assetService.scrapAsset(payload)
        res.json(insert)

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}