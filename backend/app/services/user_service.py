import os, uuid
from werkzeug.utils import secure_filename
from app.models.user import User
from app import db

def is_valid_image(filename):
    #ext yang di perbolehkan
    valid_text = {".jpg", ".jpeg", ".png"}
    #split nama file sama ext
    _, ext = os.path.splitext(filename.lower())
    return ext in valid_text

def random_name(filename):
    #ambil ext dari filename
    ext = os.path.splitext(filename)[1].lower()
    #random filename
    name = f"{uuid.uuid4()}{ext}"
    return name
    
def get_user_by_id(user_id):
    #get user
    user = User.query.get(user_id)
    
    #cek
    if not user:
        return None, "User not Found"
    
    return user.to_json(), "get user success"

def update_user(user_id,data, profile_img_file=None, thumbnail_img_file=None):
    #get user
    user = User.query.get(user_id)
    
    #cek
    if not user:
        return None, "User not Found"
    
    try:
        #update password (opsional)
        if "password" in data and data["password"]:
            user.set_password(data["password"])
        
        #update username sama email
        for field in ["username", "email"]:
            if field in data and data[field]:
                setattr(user, field, data[field])
        
        #buat folder uploads        
        os.makedirs("uploads", exist_ok=True)
        
        #update profile img
        if profile_img_file and is_valid_image(profile_img_file.filename):
            name = random_name(profile_img_file.filename)
            filename = secure_filename(name)
            path = os.path.join("uploads", filename)
            profile_img_file.save(path)
            #cek jika ada file sebelumnya
            if user.profile_img:
                filename_old = user.profile_img.replace("/uploads/", "")
                path_old = os.path.join("uploads", filename_old)
                #untuk menghapus file profile yang sebelumnya
                if os.path.exists(path_old):
                    os.remove(path_old)
                    
            setattr(user, "profile_img", f"/uploads/{filename}")
            
        #update thumbnail img
        if thumbnail_img_file and is_valid_image(thumbnail_img_file.filename):
            name = random_name(thumbnail_img_file.filename)
            filename = secure_filename(name)
            path = os.path.join("uploads", filename)
            thumbnail_img_file.save(path)
            #cek jika ada file sebelumnya
            if user.thumbnail_img:
                filename_old = user.thumbnail_img.replace("/uploads/", "")
                path_old = os.path.join("uploads", filename_old)
                #untuk menghapus file thumbnail yang sebelumnya
                if os.path.exists(path_old):
                    os.remove(path_old)
                    
            setattr(user, "thumbnail_img", f"/uploads/{filename}")
            
        db.session.add(user)
        db.session.commit()
        
        return user.to_json(), f"update user {user.username} success"
    
    except Exception as e:
        db.session.rollback()
        return None, f"failed update user: {e}"