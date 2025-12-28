import uuid
from app import db, bcrypt
from datetime import datetime

class User(db.Model):
    #nama table
    __tablename__ = "users"
    
    #field buat table
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(50), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    profile_img = db.Column(db.String(255))
    thumbnail_img = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    #relasi ke model note
    notes = db.relationship("Note", back_populates="users", lazy=True)
    
        #relasi ke model like
    likes = db.relationship("Like", back_populates="user", lazy=True)
    
    #buat decode bcrypt
    def set_password(self, password):
        self.password_hash= bcrypt.generate_password_hash(password).decode("utf-8")
        
    #compare bcrypt
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_json(self, include_note=True, include_likes=False):
        data = {
            "username": self.username,
            "email": self.email,
            "profile_img": self.profile_img,
            "thumbnail_img": self.thumbnail_img,
            "created_at": self.created_at.isoformat()
        }
        #include ke note untuk mengambil data note yang dibuat sama user
        if include_note:
            data["note"] = [note.to_json(include_user=False) for note in self.notes ]
        if include_likes:
            data["likes"] = [like.to_json(include_user=False, include_note=True) for like in self.likes]
        
        return data