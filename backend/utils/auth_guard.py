from fastapi import HTTPException

def require_role(role_required, role_provided):
    if role_provided != role_required:
        raise HTTPException(
            status_code=403,
            detail="Unauthorized access"
        )