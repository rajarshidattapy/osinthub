from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import shutil
from pathlib import Path

from ..database import get_db
from ..models import RepositoryFile as RepositoryFileModel, User as UserModel, Repository as RepositoryModel, \
    RepositoryCollaborator
from ..schemas import RepositoryFile
from ..auth import verify_clerk_token, contributor_required
from ..document_parser import DocumentParser, DocumentVersionService
from ..ai_service import EnhancedAIService

router = APIRouter()
document_parser = DocumentParser()
document_service = DocumentVersionService(document_parser)
ai_service = EnhancedAIService()

# Configuration
UPLOAD_DIRECTORY = "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc', '.txt', '.md', '.json', '.csv'}

# Ensure upload directory exists
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)


@router.post("/upload/{repository_id}")
async def upload_file(
        repository_id: str,
        file: UploadFile = File(...),
        path: str = Form("/"),
        current_user: UserModel = Depends(contributor_required),
        db: Session = Depends(get_db)
):
    """Upload a file to a repository"""

    # Validate file
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )

    # Check file extension
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file_extension} not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Check repository exists and permissions
    repo = db.query(RepositoryModel).filter(RepositoryModel.id == repository_id).first()
    if not repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found"
        )

    # Check permissions
    if repo.owner_id != current_user.id:
        is_collaborator = db.query(RepositoryCollaborator).filter(
            RepositoryCollaborator.repository_id == repository_id,
            RepositoryCollaborator.user_id == current_user.id
        ).first()
        if not is_collaborator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to upload files to this repository"
            )

    # Read file content
    file_content = await file.read()

    # Check file size
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024 * 1024):.1f}MB"
        )

    # Reset file pointer for potential re-reading
    await file.seek(0)

    # Check if file already exists at this path
    file_path = f"{path.rstrip('/')}/{file.filename}"
    existing_file = db.query(RepositoryFileModel).filter(
        RepositoryFileModel.repository_id == repository_id,
        RepositoryFileModel.path == file_path
    ).first()

    old_content = None
    if existing_file:
        old_content = existing_file.content

    try:
        # Process the document
        processed_data = document_service.process_file_upload(
            file_content=file_content,
            filename=file.filename,
            repository_id=repository_id,
            old_file_content=old_content
        )

        # Determine file type from MIME type
        file_type_map = {
            'application/pdf': 'pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'text/plain': 'txt',
            'text/markdown': 'markdown',
            'application/json': 'json',
            'text/csv': 'csv'
        }
        file_type = file_type_map.get(processed_data['mime_type'], 'txt')

        # Save file to storage
        file_id = str(uuid.uuid4())
        storage_path = Path(UPLOAD_DIRECTORY) / repository_id / f"{file_id}_{file.filename}"
        storage_path.parent.mkdir(parents=True, exist_ok=True)

        with open(storage_path, "wb") as buffer:
            buffer.write(file_content)

        # Run AI credibility analysis
        credibility_analysis = await ai_service.analyze_document_credibility(
            processed_data['text_content'],
            file.filename
        )

        # Check for sensitive information
        sensitivity_check = await ai_service.detect_sensitive_information(
            processed_data['text_content']
        )

        # Create or update database record
        if existing_file:
            # Update existing file
            existing_file.content = processed_data['text_content']
            existing_file.size = processed_data['file_size']
            existing_file.file_type = file_type
            existing_file.change_info = processed_data['change_info'].__dict__ if processed_data['change_info'] else None
            existing_file.storage_path = str(storage_path)
            db_file = existing_file
        else:
            # Create new file record
            db_file = RepositoryFileModel(
                id=file_id,
                repository_id=repository_id,
                name=file.filename,
                path=file_path,
                content=processed_data['text_content'],
                file_type=file_type,
                size=processed_data['file_size'],
                author_id=current_user.id,
                change_info=processed_data['change_info'].__dict__ if processed_data['change_info'] else None,
                storage_path=str(storage_path)
            )
            db.add(db_file)

        db.commit()
        db.refresh(db_file)

        # Return comprehensive response
        return {
            "file": db_file,
            "processing_info": {
                "mime_type": processed_data['mime_type'],
                "metadata": processed_data['metadata'],
                "change_info": processed_data['change_info'].__dict__ if processed_data['change_info'] else None,
                "credibility_analysis": credibility_analysis,
                "sensitivity_check": sensitivity_check,
                "storage_path": str(storage_path)
            }
        }

    except Exception as e:
        # Clean up any created files on error
        if 'storage_path' in locals() and storage_path.exists():
            storage_path.unlink()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process file: {str(e)}"
        )


@router.post("/batch-upload/{repository_id}")
async def batch_upload_files(
        repository_id: str,
        files: List[UploadFile] = File(...),
        path: str = Form("/"),
        current_user: UserModel = Depends(contributor_required),
        db: Session = Depends(get_db)
):
    """Upload multiple files to a repository"""

    if len(files) > 10:  # Limit batch size
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 files per batch upload"
        )

    results = []
    errors = []

    for file in files:
        try:
            # Process each file individually
            result = await upload_file(repository_id, file, path, current_user, db)
            results.append({
                "filename": file.filename,
                "status": "success",
                "file_id": result["file"].id
            })
        except Exception as e:
            errors.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })

    return {
        "successful_uploads": results,
        "failed_uploads": errors,
        "total_files": len(files),
        "successful_count": len(results),
        "failed_count": len(errors)
    }


@router.get("/download/{file_id}")
async def download_file(
        file_id: str,
        current_user: UserModel = Depends(verify_clerk_token),
        db: Session = Depends(get_db)
):
    """Download a file by ID"""

    file_record = db.query(RepositoryFileModel).filter(
        RepositoryFileModel.id == file_id
    ).first()

    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    # Check repository access
    repo = file_record.repository
    if repo.is_private and repo.owner_id != current_user.id:
        is_collaborator = db.query(RepositoryCollaborator).filter(
            RepositoryCollaborator.repository_id == repo.id,
            RepositoryCollaborator.user_id == current_user.id
        ).first()

        if not is_collaborator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this file."
            )

    # Return file as response
    from fastapi.responses import FileResponse
    import os
    file_path = file_record.storage_path if hasattr(file_record, 'storage_path') else None
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server."
        )
    return FileResponse(
        path=file_path,
        filename=file_record.name if hasattr(file_record, 'name') else os.path.basename(file_path),
        media_type='application/octet-stream'
    )
