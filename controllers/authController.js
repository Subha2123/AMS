import * as authService from '../services/authService.js';
import { ErrorResponse, renderResponse, SuccessResponse } from '../utils/response.js';
import { CONST_STATUS_CODE } from '../utils/statusCode.js';
import { validateBody } from '../utils/validateRequest.js';


export const registerUser = async (req, res) => {
  try {

    const requiredFields = ["email", "password", "username", "organization_name"]

    const validate = validateBody(req.body, requiredFields)

    if (validate.length) {
      return renderResponse({
        view: 'register', error: `Missing Required Fields ${validate.join(', ')}`
      })
    }

    const user = await authService.registerUser(req.body);

    if (user.statusCode && user.statusCode !== CONST_STATUS_CODE.CREATED) {
      return renderResponse({
        view: 'register', error: user.message || "Something went wrong"
      })
    }
    res.redirect('/api/auth/login')
    // return renderResponse({
    //   res, view: 'register', success: "User registered successfully"
    // })

  } catch (err) {
    return renderResponse({
      view: 'register', error: err.message
    })
  }
};


export const login = async (req, res) => {
  try {
    const validate = validateBody(req.body, ["email", "password"])
    if (validate.length) {
      return renderResponse({
        view: 'login', error: `Missing Required Fields ${validate.join(', ')}`
      })
    }

    const data = await authService.loginUser(req.body);
    res.cookie("token", data.token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    });

    if (data.statusCode !== CONST_STATUS_CODE.OK) {
      return renderResponse({
        res,
        view: 'login', error: data.message
      })
    }

    return res.redirect('/api/dashboard-page')
  } catch (err) {
    console.log("Error in login", err)
    return renderResponse({
      view: 'login', error: err.message
    })
  }
};

export const logout = (req,res) => {
  try {
    res.clearCookie('token');
    return res.redirect('/api/auth/login');
  } catch (error) {
    console.log("Error in login", err)
  }
}