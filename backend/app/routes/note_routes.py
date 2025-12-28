from flask import Blueprint, request
from app.services.note_service import create_note, get_public_note, get_user_note, get_note_by_slug, update_note, delete_note
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.response import response_success, response_error

note_bp = Blueprint("note_bp", __name__)

@note_bp.route("/", methods=["POST"])
@jwt_required()
def create():
    #ambil user id dari token
    user_id = get_jwt_identity()
    #ambil request data
    data = request.get_json()
    
    #jika tidak ada data atau request body
    if not data:
        return response_error("No data provided", 400)
    
    #validasi request password dan password hint
    password = data.get("password") or None
    password_hint = data.get("password_hint") or None
    
    #call service create note
    note, msg = create_note(user_id, data["title"], data["content"], data["status"], password, password_hint)
    
    if not note:
        return response_error(msg, 422)
    
    return response_success(note, msg, 201)

@note_bp.route("/", methods=["GET"])
def public_notes():
    q = request.args.get("q", type=str)
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=10, type=int)
    sort = request.args.get("sort", default="created_at", type=str)
    order = request.args.get("order", default="desc", type=str)
    
    notes, meta, msg = get_public_note(q,page, per_page, sort, order)
    
    return response_success(notes, msg, 200, meta)

@note_bp.route("/me", methods=["GET"])
@jwt_required()
def my_notes():
    user_id = get_jwt_identity()
    q = request.args.get("q", type=str)
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=10, type=int)
    sort = request.args.get("sort", default="created_at", type=str)
    order = request.args.get("order", default="desc", type=str)
    
    notes, meta, msg = get_user_note(user_id,q,page, per_page, sort, order)
    
    return response_success(notes, msg, 200, meta)

@note_bp.route("/<string:slug>", methods=["GET"])
@jwt_required(optional=True)
def get_note_slug(slug):
    #passwordnya bisa di kirim lewat query atau body json
    password =request.args.get("password") #query
    if password is None and request.is_json: #body json
        body = request.get_json(silent=True) or {}
        password = body.get("password")
        
    #ambil user_id
    user_id = get_jwt_identity()
    
    #call service get not by slug
    note, msg, hint = get_note_by_slug(slug, password, user_id)
    
    #jika note tidak ada
    if not note:
        #jika status note protected passwordnya invalid atau tidak di input sama sekali
        if msg in ("Password required", "Invalid password"):
            return response_error(msg, 401, hint)
        return response_error(msg, 404)
    
    return response_success(note, msg)

@note_bp.route("/<string:note_id>", methods=["PUT"])
@jwt_required()
def edit_note(note_id):
    
    data = request.get_json()
    user_id = get_jwt_identity()
    note, msg = update_note(user_id,note_id, data)
    
    if not note:
        return response_error(msg, 400)
    
    return response_success(note, msg)

@note_bp.route("/<string:note_id>", methods=["DELETE"])
@jwt_required()
def remove_note(note_id):
    user_id = get_jwt_identity()
    note, msg = delete_note(user_id, note_id)
    
    if not note:
        response_error(msg, 404)
        
    return response_success(note, msg)