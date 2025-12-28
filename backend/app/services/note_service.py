import uuid
from app import db
from app.models.user import User
from app.models.note import Note
from sqlalchemy import asc, desc
from datetime import datetime

def create_note(user_id, title, content, status="public", password=None, password_hint=None):
    #get user
    user = User.query.get(user_id)
    #jika user tidak ada
    if not user:
        return None, "User not Found"
    
    #cek status
    if status not in {"public", "private", "protected"}:
        return None, "Invalid Status"
    
    #generate slug
    slug = str(uuid.uuid4())
    
    #create data note baru
    note = Note(
        user_id=user_id,
        title=title,
        content=content,
        slug=slug,
        status=status,
        password_hint=(password_hint or None)
    )
    #jika ada status protected wajib ada password
    if status == "protected" and not password:
        return None, "Required password for status protected"
    if status == "protected" and password:
        note.set_password(password)
        
    try:
        #simpan ke db
        db.session.add(note)
        db.session.commit()
        
        return note.to_json(include_user=True), "Create note success"
    except Exception as e:
        db.session.rollback()
        return None, f"failed create note: {e}"
    
def get_public_note(q=None, page=1, per_page=10, sort="created_at", order="desc"):
    #base query
    notes = Note.query.filter(Note.deleted_at == None, Note.status == "public")
    
    #jika ada q/search
    if q:
        notes = notes.filter(Note.title.ilike(f"%{q}%") | Note.content.ilike(f"%{q}%"))
        
    #mapping field yang boleh di sort
    sort_map = {
        "title": Note.title,
        "created_at": Note.created_at,
        "updated_at": Note.updated_at,
        "user": User.username
    }
    
    #cek sortnya jika tidak valida maka sortnya akan jadi created_at
    sort_column = sort_map.get(sort, Note.created_at)
    
    #order by
    if order == "asc":
        notes = notes.order_by(asc(sort_column))
    else:
        notes = notes.order_by(desc(sort_column))
        
    #pagination
    pagination = db.paginate(notes, page=page, per_page=per_page, error_out=False)
    
    #data note yang sudah pagination
    notes_data = [note.to_json(include_user=True) for note in pagination.items]
    
    #data meta
    meta = {
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
        "sort": sort,
        "order": order,
        "q": q or ""
    }
    
    return notes_data, meta, "Get public notes"

def get_user_note(user_id,q=None, page=1, per_page=10, sort="created_at", order="desc"):
    
    #base query
    notes = Note.query.filter(Note.deleted_at == None, Note.user_id == user_id)
    
    #jika ada q/search
    if q:
        notes = notes.filter(Note.title.ilike(f"%{q}%") | Note.content.ilike(f"%{q}%"))
        
    #mapping field yang boleh di sort
    sort_map = {
        "title": Note.title,
        "created_at": Note.created_at,
        "updated_at": Note.updated_at
    }
    
    #cek sortnya jika tidak valida maka sortnya akan jadi created_at
    sort_column = sort_map.get(sort, Note.created_at)
    
    #order by
    if order == "asc":
        notes = notes.order_by(asc(sort_column))
    else:
        notes = notes.order_by(desc(sort_column))
        
    #pagination
    pagination = db.paginate(notes, page=page, per_page=per_page, error_out=False)
    
    #data note yang sudah pagination
    notes_data = [note.to_json(include_user=True) for note in pagination.items]
    
    #data meta
    meta = {
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
        "sort": sort,
        "order": order,
        "q": q or ""
    }
    
    return notes_data, meta, "Get notes user"

def get_note_by_slug(slug, password=None, user_id=None):
    #get note
    note = Note.query.filter_by(slug=slug).first()
    
    #jika tidak note
    if not note:
        return None, "Note not found", None
    
    #jika status public
    if note.status == "public":
        return note.to_json(include_user=True), "Get note success" , None
    
    #jika status private
    if note.status == "private":
        #cek apakah yang request adalah user yang buatnya
        if user_id != note.user_id:
            return None, "Note not found", None
        
        return note.to_json(include_user=True), "Get note success", None
    
    #jika status protected
    if note.status == "protected":
        #jika passwordnya kosong
        if not password:
            return None, "Password required", note.password_hint
        #cek apakah password benar??????
        if not note.check_password(password):
            return None, "Invalid password", note.password_hint
        
        return note.to_json(include_user=True), "Get note success", None
    
    return None, "Invalid note status", None

def update_note(user_id, note_id, data):
    #cari note by id
    note = Note.query.filter_by(id=note_id, deleted_at=None).first()
    
    if note.user_id != user_id:
        return None, "You are not the owner this note"
    
    #jika note tidak ada
    if not note:
        return None, "Note not found"
    
    try:
        #jika update title
        if "title" in data:
            note.title = data["title"]
        #jika update content
        if "content" in data:
            note.content = data["content"]
        #jika update status
        if "status" in data:
            status = data["status"]
            
            #cek status
            if status not in ["public", "private", "protected"]:
                return None, "Invalid status"
            
            note.status = status
            
            #jika statusnya protected
            if status == "protected":
                password = data.get("password")
                password_hint = data.get("password_hint")
                
                if not password or not password_hint:
                    return None, "Password and password hint required for protected note"
                
                note.set_password(password)
                note.password_hint = password_hint
            else:
                note.password_hash = None
                note.password_hint = None
                
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return None, f"failed update note: {e}"
    
    return note.to_json(include_user=True), "Note updated success"

def delete_note(user_id,noted_id):
    note = Note.query.filter_by(id=noted_id, deleted_at=None).first()

    if note.user_id != user_id:
        return None, "You are not the owner this note"    
    if not note:
        return None, "Note not found"
    
    try:
        note.deleted_at = datetime.utcnow()
        db.session.commit()
        return True, None
    except Exception as e:
        db.session.rollback()
        return None, f"deleted note failed: {e}"