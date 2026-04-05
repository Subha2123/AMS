// routes/assets.js
import express from "express";
import { getAssetsPage, getCategoriesPage, getAssetsData, createAsset, updateAsset, viewAsset, getCategoriesData, createAssetCategory, updateAssetCategory, getStockPage, issueAssettoEmp,scrapAsset, loadDashboardData} from "../controllers/assetController.js";
import { isAdmin } from "../middleware/admin.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();


router.get("/", getAssetsPage);
router.get("/categories", getCategoriesPage);



router.get("/data", [authMiddleware, isAdmin], getAssetsData);
router.post("/create", [authMiddleware, isAdmin], createAsset);
router.post("/update/:id", [authMiddleware, isAdmin], updateAsset);
router.get('/view/:id', [authMiddleware, isAdmin], viewAsset);

router.get("/categories/data", [authMiddleware, isAdmin], getCategoriesData);
router.post("/categories/create", [authMiddleware, isAdmin], createAssetCategory);
router.post("/categories/update/:id", [authMiddleware, isAdmin], updateAssetCategory);

router.get("/stock-view", getStockPage);

router.post("/issue",[authMiddleware,isAdmin],issueAssettoEmp)
router.post("/scrap",[authMiddleware,isAdmin],scrapAsset)


export default router;
