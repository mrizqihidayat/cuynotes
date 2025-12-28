from flask import jsonify

def response_success(data=None, message="Success", status_code=200, meta=None):
    response = {
        "status": "success",
        "message": message,
        "data": data
    }
    if meta is not None:
        response["meta"] = meta
    return jsonify(response), status_code

def response_error(message="Error", status_code=400, hint=None):
    response = {
        "status": "success",
        "message": message
    }
    
    if hint is not None:
        response["password hint"] = hint
    return jsonify(response), status_code