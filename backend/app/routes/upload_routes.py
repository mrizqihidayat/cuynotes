import os
from flask import Blueprint, send_from_directory, current_app, abort
from werkzeug.utils import secure_filename

file_bp = Blueprint("file_bp", __name__)

@file_bp.route("/<path:filename>", methods=["GET"])
def show_file(filename):
    #sanitasi nama file
    safe_name = secure_filename(filename)
    
    #cari tempat folder disimpan
    path = current_app.config.get("UPLOAD_FOLDER", os.path.join(os.getcwd(), "uploads"))\
    
    #cari file
    file_path = os.path.join(path, safe_name)
    
    #jika file tidak ada
    if not os.path.exists(file_path):
        abort(404, description="File not Found")
        
    return send_from_directory(path, safe_name)