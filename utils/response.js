export const SuccessResponse = ({
    res,
    data,
    message = "Success",
    status = 200
}) => {
    return res.status(status).json({
        success: true,
        message,
        data
    });
};

export const ErrorResponse = ({
    res, 
    message = "Something went wrong",
    code = "INTERNAL_SERVER_ERROR",
    status = 500,
    details
}) => {
    return res.status(status).json({
        success: false,
        message,
        error: {
            code,
            details
        }
    });
};


export const renderResponse = ({ res, view, data = {}, error = null, success = null }) => {
  return res.render(view, {
    ...data,
    error,
    success
  });
};