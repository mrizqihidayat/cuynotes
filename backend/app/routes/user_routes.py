from app.services.user_service import get_user_by_id, update_user
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.response import response_success, response_error

user_bp = Blueprint("user_bp", __name__)

@user_bp.route("/", methods=["GET"])
#bearer token
@jwt_required()
def get_user():
    #mengambil user id di token
    user_id = get_jwt_identity()
    
    #call service get user
    user, msg = get_user_by_id(user_id)
    
    #kalau user tidak ada
    if not user:
        return response_error(msg, 404)
    
    return response_success(user, msg, 200)

@user_bp.route("/", methods=["PUT"])
@jwt_required()
def edit_user():
    #mengambil user id di token
    user_id = get_jwt_identity()
    
    #untuk mengambil data request
    data = request.form.to_dict()
    profile_img = request.files.get("profile_img")
    thumbnail_img = request.files.get("thumbnail_img")
    
    #validasi jika tidak ada data sama sekali dari request
    if not data and not profile_img and not thumbnail_img:
        return response_error("No data proived", 400)
    
    #call service update_user
    user, msg = update_user(user_id,data, profile_img, thumbnail_img)
    
    #jika gagal update user
    if not user:
        return response_error(msg, 400)
    
    return response_success(user, msg)