import Employee from '../models/Employee.js';
import Organization from '../models/Organization.js';
import * as orgService from '../services/organizationService.js'
import { renderResponse } from "../utils/response.js"
import { validateBody } from "../utils/validateRequest.js"



export const createEmployee = async (req, res) => {
    try {
        const validate = validateBody(req.body, ['employee_ref_id', 'employee_name', 'department', 'email', 'password'])
        if (validate.length) {
            return renderResponse({
                res,
                view: 'employeeForm', error: `Missing Required Fields ${validate.join(', ')}`
            })
        }
        const org_id = req.user?.organization_id ?? null
        const formatPayload = {
            ...req.body,
            organization_id: org_id
        }
        const insertEmp = await orgService.createEmployee(formatPayload)
        res.redirect('/api/employees')

    } catch (err) {
        console.log("Err", err)
        return renderResponse({
            view: 'employeeForm', error: err.message
        })
    }
}


export const getEmployeesData = async (req, res) => {
    try {
        const orgId = req.user.organization_id;

        if (!orgId) {
            return res.json({
                draw: req.query.draw,
                recordsTotal: 0,
                recordsFiltered: 0,
                data: []
            });
        }

        const search = req.query["search[value]"] || "";

        const result = await orgService.getEmployeesByOrgId({
            organization_id: orgId,
            start: req.query.start,
            length: req.query.length,
            search: search,
            status: req.query.status
        });

        return res.json({
            draw: req.query.draw,
            recordsTotal: result.total,
            recordsFiltered: result.total,
            data: result.data
        });

    } catch (error) {
        console.error("Controller Error:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};


export const getEmployeesPage = (req, res) => {
    res.render("employees", {
        columns: [
            { label: "Employee ID", field: "employee_ref_id" },
            { label: "Name", field: "employee_name" },
            { label: "Department", field: "department" },
            { label: "Organization", field: "organization_name" }
        ],
        ajaxUrl: "/api/employees/data",
        baseUrl: "/api/employees",
        actions: ["view", "edit", "delete"]
    });
};


export const getEmployeeFormPage = async (req, res) => {
    try {
        const employeeId = req.params.id;
        let employee = null;

        if (employeeId) {
            employee = await Employee.findOne({
                where: { id: employeeId },
                include: [{ model: Organization, attributes: ['organization_name'] }]
            });
            if (!employee) return res.redirect('/employees');
        }

        res.render('employeeForm', {
            employee: employee ? employee.toJSON() : null,
            actionUrl: employee ? `/employees/update/${employeeId}` : '/employee/create'
        });

    } catch (err) {
        console.error(err);
        res.redirect('/api/employees');
    }
};


export const updateEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const payload = req.body;
        const result = await orgService.updateEmployee(employeeId, payload);
        res.redirect("/api/employees");
    } catch (err) {
        console.error("Error in updateEmployeeController:", err.message);
        res.redirect("/api/employees");
    }
};

export const getStockPage = async (req, res) => {
    try {
        const stockSummary = await AssetService.getStockSummary();
        const grandTotal = AssetService.calculateGrandTotal(stockSummary);

        res.render("stock", {
            columns: [
                { label: "Asset", field: "asset_name" },
                { label: "Available Count", field: "count" },
                { label: "Total Value", field: "total" }
            ],
            stockSummary,
            grandTotal
        });
    } catch (err) {
        console.error(err);
        res.redirect("/");
    }
};

export const getActiveEmployes = async (req,res) => {
    try {
        const employees = await Employee.findAll({
            where: { is_active: true },
            raw: true,
            attributes:["id","employee_name"]
        });
        return res.json({ success: true, data: employees })
    } catch (err) {
        console.error(err);
    }
}