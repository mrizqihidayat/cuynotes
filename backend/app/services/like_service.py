from app import db
from app.models.like import Like
from app.models.user import User
from app.models.note import Note
from sqlalchemy import desc  

def toggle_like(user_id, note_id):
    user = User.query.get(user_id)
    if not user:
        return None, "User not found"
    
    note = Note.query.get(note_id)
    if not note:
        return None, "Note not found"
    
    like = Like.query.filter(Like.user_id == user_id, Like.note_id == note_id).first()
    
    if like:
        try:
            db.session.delete(like)
            db.session.commit()
            return True, "Unlike success"
        except Exception as e:
            db.session.rollback()
            return None, f"failed to unlike: {e}"
    else:
        try:
            new_like = Like(user_id=user_id, note_id=note_id)
            db.session.add(new_like)
            db.session.commit()
            return True, "Like success"
        except Exception as e:
            db.session.rollback()
            return None, f"failed to like note: {e}"
        
def list_my_favorites(user_id, page=1, per_page=12):
    base = (
        db.session.query(Like)
        .join(Note, Like.note_id == Note.id)
        .filter(
            Like.user_id == user_id,
            Note.deleted_at.is_(None),
            ((Note.status == "public") | (Note.user_id == user_id)),
        )
        .order_by(desc(Like.created_at))   # atau: .order_by(Like.created_at.desc())
    )

    total = base.count()
    likes = (
        base
        .offset((max(page, 1) - 1) * max(per_page, 1))
        .limit(per_page)
        .all()
    )

    items = []
    for lk in likes:
        n = lk.note
        data = n.to_json(include_user=True)
        data["like"] = True              
        items.append(data)

    meta = {
        "page": page,
        "per_page": per_page,
        "total": total,
        "pages": (total + per_page - 1) // per_page if per_page else 1,
        "sort": "created_at",
        "order": "desc",
        "q": "",
    }
    return items, meta, "get note like"