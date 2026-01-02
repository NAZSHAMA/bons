from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta, datetime, timezone
from typing import Optional

from app.database import get_db
from app.models.database import User
from app.models.schemas import (
    UserCreate, UserResponse, Token, UserLogin, TokenData,
    MessageResponse, EmailVerificationRequest, ResendVerificationRequest
)
from app.utils.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
    create_verification_token,
    verify_verification_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.utils.email import send_verification_email
from app.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """Get user by username"""
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email"""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def authenticate_user(db: AsyncSession, username: str, password: str) -> Optional[User]:
    """Authenticate user with username and password"""
    user = await get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token

    This is a dependency that can be used in protected routes
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    username: str = payload.get("sub")
    user_id: int = payload.get("user_id")

    if username is None or user_id is None:
        raise credentials_exception

    user = await get_user_by_username(db, username)
    if user is None:
        raise credentials_exception

    return user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user

    - **email**: Valid email address (must be unique)
    - **username**: Username (3-50 characters, must be unique)
    - **password**: Password (minimum 8 characters)
    """
    # Check if username already exists
    existing_user = await get_user_by_username(db, user.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Check if email already exists
    existing_email = await get_user_by_email(db, user.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        email_verified=False  # Start as unverified
    )

    db.add(db_user)
    await db.flush()
    await db.refresh(db_user)

    # Generate verification token
    verification_token = create_verification_token(db_user.id, db_user.email)

    # Store token in database
    db_user.verification_token = verification_token
    db_user.verification_token_expires = datetime.now(timezone.utc) + timedelta(hours=settings.verification_token_expire_hours)
    await db.flush()

    # Send verification email
    try:
        await send_verification_email(db_user.email, db_user.username, verification_token)
    except Exception as e:
        # Log error but don't fail registration
        print(f"Warning: Failed to send verification email: {e}")

    return db_user

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    Login with username and password to get JWT token

    - **username**: Your username
    - **password**: Your password

    Returns an access token that should be included in subsequent requests
    """
    user = await authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login/json", response_model=Token)
async def login_json(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Login with JSON body (alternative to form data)

    - **username**: Your username
    - **password**: Your password
    """
    user = await authenticate_user(db, credentials.username, credentials.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information

    Requires authentication token
    """
    return current_user

@router.get("/verify")
async def verify_token(current_user: User = Depends(get_current_user)):
    """
    Verify if the provided token is valid

    Returns user information if valid, 401 if invalid
    """
    return {
        "valid": True,
        "user_id": current_user.id,
        "username": current_user.username,
        "email_verified": current_user.email_verified
    }

@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    """
    Verify user's email address with verification token

    - **token**: Email verification token from email link
    """
    # Decode and verify token
    payload = verify_verification_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )

    user_id = payload.get("user_id")
    email = payload.get("sub")

    # Get user from database
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if email matches
    if user.email != email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )

    # Check if already verified
    if user.email_verified:
        return MessageResponse(
            message="Email already verified",
            success=True
        )

    # Check if token is expired
    if user.verification_token_expires and user.verification_token_expires < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired. Please request a new one."
        )

    # Verify the email
    user.email_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    await db.flush()

    return MessageResponse(
        message="Email verified successfully! You can now use all features.",
        success=True
    )

@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification_email(
    request: ResendVerificationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Resend verification email to user

    - **email**: User's email address
    """
    # Get user by email
    user = await get_user_by_email(db, request.email)

    if not user:
        # Don't reveal if email exists for security
        return MessageResponse(
            message="If the email exists, a verification link has been sent.",
            success=True
        )

    # Check if already verified
    if user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified"
        )

    # Generate new verification token
    verification_token = create_verification_token(user.id, user.email)

    # Update token in database
    user.verification_token = verification_token
    user.verification_token_expires = datetime.now(timezone.utc) + timedelta(hours=settings.verification_token_expire_hours)
    await db.flush()

    # Send verification email
    try:
        await send_verification_email(user.email, user.username, verification_token)
    except Exception as e:
        print(f"Warning: Failed to send verification email: {e}")

    return MessageResponse(
        message="Verification email sent. Please check your inbox.",
        success=True
    )
