import sequelize from '../config/database.js';
import Employee from '../models/Employee.js';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import { notFoundError } from '../utils/errors.js';
import { CONST_STATUS_CODE } from '../utils/statusCode.js';
import bcrypt from 'bcrypt';
import { Op } from "sequelize";


export const createOrganization = async (organization_name) => {
    try {
        const orgNameTrim = organization_name.trim()
        const existingOrg = await Organization.findOne({ where: { organization_name: orgNameTrim } });
        if (existingOrg) {
            return notFoundError("Organization already exists in the name")
        }
        const insert = await Organization.create({
            organization_name: orgNameTrim
        });
        return { statusCode: CONST_STATUS_CODE.CREATED, success: true, data: insert.toJSON() }
    } catch (error) {
        console.error("Error in create organization", error.message)
        throw error
    }
};


export const createEmployee = async (payload) => {
    try {
        const { employee_ref_id } = payload
        const existingEmp = await Employee.findOne({ where: { employee_ref_id } });
        if (existingEmp) {
            return notFoundError("Employee already exists in the name")
        }

        const { employee_name, email, password, department, organization_id } = payload

        const userPassword = await bcrypt.hash(password, 10)

        const result = await sequelize.transaction(async (t) => {
            const user = await User.create({
                email,
                password: userPassword,
                username: employee_name,
                role: 'employee',
                organization_id
            }, { transaction: t });

            const employee = await Employee.create({
                user_id: user.id,
                employee_name,
                employee_ref_id,
                department,
                organization_id
            }, { transaction: t });

            return employee
        })

        return { statusCode: CONST_STATUS_CODE.CREATED, success: true, data: result.toJSON() }
    } catch (error) {
        console.error("Error in create Employee", error.message)
        throw error
    }
};


export const getEmployeesByOrgId = async ({
    organization_id,
    start,
    length,
    search,
    status
}) => {
    try {
        const limit = parseInt(length) || 10;
        const offset = parseInt(start) || 0;


        let where = { organization_id };
        if (search) {
            where[Op.or] = [
                { employee_name: { [Op.like]: `%${search}%` } },
                { employee_ref_id: { [Op.like]: `%${search}%` } },
                { department: { [Op.like]: `%${search}%` } }
            ];
        }

        if (status) {
            where.is_active = status === "ACTIVE" ? true : false
        }

        const { rows, count } = await Employee.findAndCountAll({
            where,
            include: [
                {
                    model: Organization,
                    attributes: ["organization_name", "id"]
                }
            ],
            attributes: ["id", "department", "employee_ref_id", "employee_name","is_active"],
            limit,
            offset,
            order: [["created_at", "DESC"]]
        });

        const data = rows.map(emp => {
            const e = emp.toJSON();
            return {
                ...e,
                organization_name: e.organization?.organization_name || "-"
            };
        });
        return {
            statusCode: CONST_STATUS_CODE.OK,
            total: count,
            data
        };

    } catch (error) {
        console.error("Service Error:", error.message);
        throw error;
    }
};


export const updateEmployee = async (employeeId, payload) => {
    try {


        if (!employeeId) {
            throw new Error("Employee ID is required");
        }

        const { employee_name, department, action } = payload;
        const updateData = {};

        // Check if employee exists
        const isExistEmp = await Employee.findOne({ where: { id: employeeId } });
        if (!isExistEmp) {
            return notFoundError("Employee not found");
        }

        // Prepare update data
        if (action === "delete") {
            updateData.is_active = false;
        } else {
            if (employee_name !== undefined) updateData.employee_name = employee_name;
            if (department !== undefined) updateData.department = department;
        }

        // If nothing to update
        if (Object.keys(updateData).length === 0) {
            return notFoundError("No valid fields provided to update");
        }

        // Perform the update
        const [updatedCount] = await Employee.update(updateData, {
            where: { id: employeeId }
        });

        if (updatedCount === 0) {
            return notFoundError("No changes applied");
        }

        return {
            statusCode: CONST_STATUS_CODE.OK,
            success: true,
            message: "Employee updated successfully"
        };

    } catch (err) {
        console.error("Error in updateEmployeeService:", err.message);
        throw err.message
    }
};
