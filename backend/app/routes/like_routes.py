from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.like_service import toggle_like, list_my_favorites
from app.utils.response import response_success, response_error

like_bp = Blueprint("like_bp", __name__)

@like_bp.route("/<string:note_id>", methods=["POST"])
@jwt_required()
def like_note(note_id):
    user_id = get_jwt_identity()
    like, msg = toggle_like(user_id, note_id)
    
    if not like:
        return response_error(msg, 404)
    
    return response_success(like, msg)

@like_bp.route("/", methods=["GET"])
@jwt_required()
def my_favorites():
    user_id = get_jwt_identity()
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=12, type=int)
    items, meta, msg = list_my_favorites(user_id, page=page, per_page=per_page)
    return response_success(items, msg, meta)