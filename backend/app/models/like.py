import uuid
from datetime import datetime
from app import db

class Like(db.Model):
    __tablename__ = "likes"
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    note_id = db.Column(db.String(36), db.ForeignKey("notes.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    #relasi ke user
    user = db.relationship("User", back_populates="likes")
    
    #relasi ke note
    note = db.relationship("Note", back_populates="likes")
    
    def to_json(self, include_user=False, include_note=False):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "note_id": self.note_id
        }
        if include_user and self.user:
            data['user'] = {
                "username": self.user.username,
                "email": self.user.email
            }
        if include_note and self.note:
            data['note'] = {
                "id": self.note.id,
                "title": self.note.title,
                "content": self.note.content,
                "status": self.note.status
            }
            
        return data