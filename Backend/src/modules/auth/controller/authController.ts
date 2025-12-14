import { Request, Response, NextFunction } from 'express';
import { AuthenticationError, registerUser, authenticateUser, getCurrentUser, refreshAccessToken, logout, requestPasswordReset, verifyResetToken, resetPassword } from '../service/authService';
import { RegisterUserDto, LoginUserDto, RefreshTokenDto } from '../types/auth.types';
import { AuthRequest } from '../../../middleware/auth';
import { ErrorFactory } from '../../../_shared/errors/AppError';
import { asyncHandler } from '../../../middleware/errorHandler';
import { HttpStatus } from '../../../_shared/enums/httpStatus';

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userData: RegisterUserDto = req.body;
  
  try {
    const result = await registerUser(userData);
    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw ErrorFactory.badRequest(error.message, 'REGISTRATION_ERROR');
    }
    throw error;
  }
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const credentials: LoginUserDto = req.body;
  
  try {
    const result = await authenticateUser(credentials);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw ErrorFactory.unauthorized(error.message, 'AUTHENTICATION_FAILED');
    }
    throw error;
  }
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.userId) {
    throw ErrorFactory.unauthorized('Not authenticated', 'NOT_AUTHENTICATED');
  }

  try {
    const user = await getCurrentUser(req.user.userId);
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        firstName: user.firstName,
        lastName: user.lastName,
        startupName: user.startupName,
        hourlyRate: user.hourlyRate,
        phone: user.phone,
        timezone: user.timezone,
      },
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw ErrorFactory.unauthorized(error.message, 'USER_NOT_FOUND');
    }
    throw error;
  }
});

export const refresh = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken }: RefreshTokenDto = req.body;

  if (!refreshToken) {
    throw ErrorFactory.badRequest('Refresh token is required', 'MISSING_REFRESH_TOKEN');
  }

  try {
    const result = await refreshAccessToken(refreshToken);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw ErrorFactory.unauthorized(error.message, 'REFRESH_TOKEN_INVALID');
    }
    throw error;
  }
});

export const logoutUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.userId) {
    throw ErrorFactory.unauthorized('Not authenticated', 'NOT_AUTHENTICATED');
  }

  try {
    await logout(req.user.userId);
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    throw error;
  }
});

export const requestReset = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  if (!email) {
    throw ErrorFactory.badRequest('Email is required', 'MISSING_EMAIL');
  }

  try {
    const result = await requestPasswordReset(email);
    // Note: In production, send email with resetToken
    // For now, return token in response (should be sent via email instead)
    res.json({
      success: true,
      message: result.message,
      resetToken: result.resetToken, // Remove this in production, send via email instead
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      // Return generic message for security (don't reveal if email exists)
      res.json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent',
      });
    } else {
      throw error;
    }
  }
});

export const verifyReset = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, resetToken } = req.body;

  if (!email || !resetToken) {
    throw ErrorFactory.badRequest('Email and reset token are required', 'MISSING_FIELDS');
  }

  try {
    await verifyResetToken(email, resetToken);
    res.json({
      success: true,
      message: 'Reset token is valid',
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw ErrorFactory.badRequest(error.message, 'INVALID_RESET_TOKEN');
    }
    throw error;
  }
});

export const resetPasswordHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, resetToken, newPassword } = req.body;

  if (!email || !resetToken || !newPassword) {
    throw ErrorFactory.badRequest('Email, reset token, and new password are required', 'MISSING_FIELDS');
  }

  try {
    const result = await resetPassword(email, resetToken, newPassword);
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw ErrorFactory.badRequest(error.message, 'PASSWORD_RESET_FAILED');
    }
    throw error;
  }
});
