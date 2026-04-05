import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { conflictError, notFoundError, validationError } from '../utils/errors.js';
import { createOrganization } from './organizationService.js';
import { CONST_STATUS_CODE } from '../utils/statusCode.js';
import dotenv from 'dotenv'

dotenv.config()




export const registerUser = async (payload) => {
  try {

    const { username, email, password, organization_name } = payload

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return conflictError("User already exists in the email")
    }

    let organization_id = null;

    const createOrg = await createOrganization(organization_name)

    if (createOrg.statusCode !== CONST_STATUS_CODE.CREATED) {
      return createOrg
    }
    organization_id = createOrg.data?.id
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      organization_id
    });
    const { password: pwd, ...userData } = user.toJSON();
    return {
      statusCode: CONST_STATUS_CODE.CREATED, data: userData
    }
  } catch (error) {
    console.error("Error in registerUser", error.message)
    throw error
  }
};


export const loginUser = async ({ email, password }) => {

  try {

    const user = await User.findOne({ where: { email } })
    const parsedUser = user.toJSON()

    if (!user) {
      return notFoundError('User in this email not found')
    }
    const isMatch = await bcrypt.compare(password, parsedUser.password);

    if (!isMatch) {
      return validationError('Invalid email or password');
    }
    const token = jwt.sign(
      { id: parsedUser.id, email: parsedUser.email, username:parsedUser.username, organization_id: parsedUser.organization_id, role: parsedUser.role },
      process.env.JWT_SECRET_KEY || 'ams77898',
      { expiresIn: '1h' }
    );

    const { password: pwd, ...userData } = user.toJSON();

    return { statusCode: CONST_STATUS_CODE.OK, user: userData, token };
  } catch (error) {
    console.error("Error in loginUser", error.message)
    throw error
  }
};