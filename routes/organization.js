
import express from 'express'
import { createEmployee, getActiveEmployes, getEmployeeFormPage, getEmployeesData, getEmployeesPage, updateEmployee } from '../controllers/organizationController.js'
import { authMiddleware } from '../middleware/auth.js'
import { isAdmin } from '../middleware/admin.js'
import { dashboardPage, loadDashboardData } from '../controllers/assetController.js'

const router = express.Router()

router.post('/employee/create', [authMiddleware, isAdmin], createEmployee)
router.get('/employees/data', [authMiddleware, isAdmin], getEmployeesData);
router.post('/employee/update/:id', [authMiddleware, isAdmin], updateEmployee);
router.get('/employee/active', [authMiddleware, isAdmin], getActiveEmployes);
router.get('/dashboard-data', [authMiddleware, isAdmin], loadDashboardData)

router.get('/dashboard-page', [authMiddleware, isAdmin],dashboardPage)
router.get('/employees', [authMiddleware, isAdmin], getEmployeesPage);
router.get('/employee/create', [authMiddleware, isAdmin], (req, res) => res.render('employeeForm'))
router.get('/employees/edit/:id', [authMiddleware, isAdmin], getEmployeeFormPage)




export default router