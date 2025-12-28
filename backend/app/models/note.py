import uuid
from datetime import datetime
from app import db, bcrypt
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import func, select
from app.models.like import Like

class Note(db.Model):
    #nama table
    __tablename__ = "notes"
    
    #field table
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    # column name must match migration (note_status) to avoid ORM/DB mismatch
    status = db.Column(db.Enum("public", "private", "protected"), name="note_status", default="public", nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)
    password_hint = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)
    
    #relasi ke model user
    users = db.relationship("User", back_populates="notes")
    
    #relasi ke model like
    likes = db.relationship("Like", back_populates="note")
    
    #buat decode bcrypt
    def set_password(self, password):
        self.password_hash= bcrypt.generate_password_hash(password).decode("utf-8")
        
    #compare bcrypt
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    @hybrid_property
    def like_count(self):
        return len(self.likes)
    
    @like_count.expression
    def like_count(lc):
        return (
            select([func.count(Like.id)]).where(Like.note_id == lc.id).label("like_count")
        )
    
    #return json
    def to_json(self, include_user=True, include_likes=True):
        data = {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "slug": self.slug,
            "status": self.status,
            "password_hint": self.password_hint,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "like_count": self.like_count
        }
        #mengambil data user yang buatnya
        if include_user and self.users:
            data["user"] = self.users.to_json(include_note=False, include_likes=False)
        if include_likes:
            data["likes"] = [like.to_json(include_user=True, include_note=False) for like in self.likes]
        
        return data