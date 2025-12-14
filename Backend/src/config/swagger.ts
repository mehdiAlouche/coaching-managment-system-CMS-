import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Coaching Management System Backend API',
      version: '0.1.0',
      description:
        'Backend API for the Coaching Management System. Manage organizations, users, coaching sessions, goals, and payments.',
      contact: {
        name: 'API Support',
        url: 'https://github.com/mehdiAlouche/coaching-managment-system-backend',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local development server',
      },
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Alternative dev server (port 5000)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'ObjectId', description: 'User unique identifier' },
            email: { type: 'string', format: 'email', description: 'User email address' },
            role: { type: 'string', enum: ['manager', 'coach', 'entrepreneur', 'admin'], description: 'User role' },
            firstName: { type: 'string', description: 'User first name' },
            lastName: { type: 'string', description: 'User last name' },
            organizationId: { type: 'string', format: 'ObjectId', description: 'Organization the user belongs to' },
            hourlyRate: { type: 'number', description: 'Hourly rate (coaches only)' },
            startupName: { type: 'string', description: 'Startup name (entrepreneurs only)' },
            phone: { type: 'string', description: 'User phone number' },
            timezone: { type: 'string', description: 'User timezone' },
            isActive: { type: 'boolean', description: 'Whether the user account is active' },
            createdAt: { type: 'string', format: 'date-time', description: 'Account creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
          },
          required: ['_id', 'email', 'role', 'isActive'],
        },
        Organization: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'ObjectId', description: 'Organization unique identifier' },
            name: { type: 'string', description: 'Organization name' },
            slug: { type: 'string', description: 'Organization URL slug' },
            isActive: { type: 'boolean', description: 'Whether organization is active' },
            subscriptionPlan: { type: 'string', enum: ['free', 'standard', 'premium'], description: 'Subscription tier' },
            subscriptionStatus: {
              type: 'string',
              enum: ['trialing', 'active', 'past_due', 'paused', 'canceled'],
              description: 'Subscription status',
            },
            subscriptionRenewalAt: { type: 'string', format: 'date-time', description: 'Next renewal date' },
            maxUsers: { type: 'number', description: 'Maximum users allowed' },
            maxCoaches: { type: 'number', description: 'Maximum coaches allowed' },
            maxEntrepreneurs: { type: 'number', description: 'Maximum entrepreneurs allowed' },
            billingEmail: { type: 'string', format: 'email', description: 'Billing email address' },
            contact: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                phone: { type: 'string' },
                address: { type: 'string' },
                website: { type: 'string' },
              },
            },
            settings: { type: 'object', description: 'Organization settings' },
            preferences: { type: 'object', description: 'Organization preferences' },
            logoPath: { type: 'string', description: 'Path to organization logo' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
          },
          required: ['_id', 'name', 'slug', 'isActive'],
        },
        OrganizationStats: {
          type: 'object',
          properties: {
            organizationId: { type: 'string' },
            name: { type: 'string' },
            totalUsers: { type: 'number' },
            totalCoaches: { type: 'number' },
            totalEntrepreneurs: { type: 'number' },
            totalSessions: { type: 'number' },
            totalRevenue: { type: 'number' },
            subscriptionPlan: { type: 'string' },
            subscriptionStatus: { type: 'string' },
            quotaUsage: {
              type: 'object',
              properties: {
                users: {
                  type: 'object',
                  properties: {
                    used: { type: 'number' },
                    limit: { type: 'number' },
                    percentage: { type: 'number' },
                  },
                },
                coaches: {
                  type: 'object',
                  properties: {
                    used: { type: 'number' },
                    limit: { type: 'number' },
                    percentage: { type: 'number' },
                  },
                },
                entrepreneurs: {
                  type: 'object',
                  properties: {
                    used: { type: 'number' },
                    limit: { type: 'number' },
                    percentage: { type: 'number' },
                  },
                },
              },
            },
          },
        },
        Session: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'ObjectId' },
            organizationId: { type: 'string', format: 'ObjectId' },
            coachId: { type: 'string', format: 'ObjectId' },
            entrepreneur: { 
              type: 'object',
              description: 'Populated entrepreneur user object',
              properties: {
                _id: { type: 'string', format: 'ObjectId' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                startupName: { type: 'string' },
              },
            },
            manager: { 
              type: 'object',
              description: 'Populated manager user object',
              properties: {
                _id: { type: 'string', format: 'ObjectId' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
              },
            },
            scheduledAt: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            duration: { type: 'number', description: 'Duration in minutes' },
            status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'] },
            agendaItems: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  duration: { type: 'number' },
                },
              },
            },
            notes: { type: 'object' },
            location: { type: 'string' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'Access token (default expiry 7 days)' },
            refreshToken: { type: 'string', description: 'Refresh token (default expiry 30 days)' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        Activity: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'ObjectId', description: 'Activity unique identifier' },
            organizationId: { type: 'string', format: 'ObjectId', description: 'Organization ID' },
            activityType: { 
              type: 'string', 
              enum: ['USER_REGISTERED', 'USER_ACTIVATED', 'USER_DEACTIVATED', 'SESSION_CREATED', 'SESSION_COMPLETED', 'SESSION_CANCELLED', 'PAYMENT_GENERATED', 'PAYMENT_COMPLETED', 'ORGANIZATION_CREATED', 'ORGANIZATION_UPDATED'],
              description: 'Type of activity'
            },
            userId: { type: 'string', format: 'ObjectId', description: 'User involved in activity' },
            userName: { type: 'string', description: 'Name of the user' },
            userEmail: { type: 'string', format: 'email', description: 'Email of the user' },
            userRole: { type: 'string', enum: ['manager', 'coach', 'entrepreneur', 'admin'], description: 'Role of the user' },
            sessionId: { type: 'string', format: 'ObjectId', description: 'Related session ID' },
            paymentId: { type: 'string', format: 'ObjectId', description: 'Related payment ID' },
            amount: { type: 'number', description: 'Amount (for payment activities)' },
            description: { type: 'string', description: 'Human-readable description of the activity' },
            metadata: { 
              type: 'object', 
              description: 'Additional metadata about the activity',
              additionalProperties: true
            },
            createdAt: { type: 'string', format: 'date-time', description: 'Activity timestamp' },
          },
        },
        DashboardStats: {
          type: 'object',
          properties: {
            users: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                coaches: { type: 'number' },
                entrepreneurs: { type: 'number' },
              },
            },
            sessions: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                upcoming: { type: 'number' },
                completed: { type: 'number' },
              },
            },
            revenue: {
              type: 'object',
              properties: {
                total: { type: 'number' },
              },
            },
          },
        },
        Goal: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'ObjectId' },
            organizationId: { type: 'string', format: 'ObjectId' },
            entrepreneurId: { type: 'string', format: 'ObjectId' },
            coachId: { type: 'string', format: 'ObjectId' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['not_started', 'in_progress', 'completed', 'blocked'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            progress: { type: 'number', minimum: 0, maximum: 100 },
            targetDate: { type: 'string', format: 'date-time' },
            isArchived: { type: 'boolean' },
            milestones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string', format: 'ObjectId', description: 'Milestone ID' },
                  title: { type: 'string' },
                  status: { type: 'string' },
                  targetDate: { type: 'string', format: 'date-time' },
                  completedAt: { type: 'string', format: 'date-time' },
                  notes: { type: 'string' },
                },
              },
            },
            linkedSessions: {
              type: 'array',
              items: { type: 'string', format: 'ObjectId' },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'ObjectId' },
            organizationId: { type: 'string', format: 'ObjectId' },
            coachId: { type: 'string', format: 'ObjectId' },
            sessionIds: {
              type: 'array',
              items: { type: 'string', format: 'ObjectId' },
            },
            lineItems: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sessionId: { type: 'string', format: 'ObjectId' },
                  description: { type: 'string' },
                  duration: { type: 'number' },
                  rate: { type: 'number' },
                  amount: { type: 'number' },
                },
              },
            },
            amount: { type: 'number' },
            taxAmount: { type: 'number' },
            totalAmount: { type: 'number' },
            currency: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'paid', 'failed', 'refunded', 'void'] },
            invoiceNumber: { type: 'string' },
            invoiceUrl: { type: 'string' },
            dueDate: { type: 'string', format: 'date-time' },
            paidAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);

// Manual endpoint definitions (since we don't use JSDoc comments in route files)
export const manualEndpoints = {
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        description: 'Create a new user account with email, password, and role.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'role', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  role: { type: 'string', enum: ['manager', 'coach', 'entrepreneur', 'admin'] },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  organizationId: { type: 'string' },
                  hourlyRate: { type: 'number' },
                  startupName: { type: 'string' },
                  phone: { type: 'string' },
                  timezone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: { description: 'Validation error or email already exists' },
          429: { description: 'Too many registration attempts (3 per hour)' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login user',
        description: 'Authenticate with email and password, receive access and refresh tokens.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: { description: 'Invalid credentials or inactive account' },
          429: { description: 'Too many login attempts (5 per 15 min)' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Refresh access token',
        description: 'Exchange a valid refresh token for a new access token pair.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: {
                    type: 'string',
                    description: 'Refresh token issued during login',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Tokens refreshed successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: { description: 'Invalid or expired refresh token' },
          429: { description: 'Too many refresh attempts (5 per 15 min)' },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Logout user',
        description: 'Invalidate the current user\'s refresh token and access tokens.',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized or invalid token' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get current user profile',
        description: 'Retrieve the authenticated user\'s profile information.',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile retrieved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          401: { description: 'Unauthorized or invalid token' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        summary: 'Request password reset',
        description: 'Send a password reset link to the user\'s email. Returns reset token (in production, should be sent via email only).',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', description: 'Email address associated with the account' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password reset email sent (generic response for security)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    resetToken: { type: 'string', description: 'Reset token (for development; in production send via email)' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid email format' },
          429: { description: 'Too many requests' },
        },
      },
    },
    '/auth/verify-reset-token': {
      post: {
        summary: 'Verify password reset token',
        description: 'Verify that a reset token is valid and hasn\'t expired.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'resetToken'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  resetToken: { type: 'string', description: 'The reset token to verify' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Reset token is valid',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid or expired reset token',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          429: { description: 'Too many requests' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        summary: 'Reset password with token',
        description: 'Complete the password reset process by providing the reset token and new password. New password must meet complexity requirements (min 8 chars, uppercase, lowercase, number, special char).',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'resetToken', 'newPassword'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  resetToken: { type: 'string', description: 'The reset token from forgot-password endpoint' },
                  newPassword: {
                    type: 'string',
                    minLength: 8,
                    description: 'New password (min 8 chars, must include uppercase, lowercase, number, special char)',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Password reset successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid reset token, expired token, or weak password',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          429: { description: 'Too many requests' },
        },
      },
    },
    '/sessions': {
      get: {
        summary: 'List all sessions',
        description: 'Get paginated list of sessions for the user\'s organization with optional filters. Available to all roles.',
        tags: ['Sessions'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'number', default: 20, minimum: 1, maximum: 100 },
            description: 'Number of sessions per page',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'number', default: 1, minimum: 1 },
            description: 'Page number (1-based)',
          },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', default: '-createdAt' },
            description: 'Comma-separated sort fields (prefix with - for descending)',
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'] },
            description: 'Filter by session status',
          },
          {
            name: 'upcoming',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filter for upcoming sessions (scheduled or rescheduled)',
          },
        ],
        responses: {
          200: {
            description: 'Sessions retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Session' },
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        total: { type: 'number' },
                        page: { type: 'number' },
                        limit: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - insufficient role permissions' },
        },
      },
      post: {
        summary: 'Create session',
        description: 'Create a new coaching session. Requires admin, manager, or coach role. Checks for scheduling conflicts.',
        tags: ['Sessions'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['coachId', 'entrepreneurId', 'managerId', 'scheduledAt', 'duration'],
                properties: {
                  coachId: { type: 'string', format: 'ObjectId' },
                  entrepreneurId: { type: 'string', format: 'ObjectId' },
                  managerId: { type: 'string', format: 'ObjectId' },
                  scheduledAt: { type: 'string', format: 'date-time' },
                  duration: { type: 'number', description: 'Duration in minutes' },
                  agendaItems: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        duration: { type: 'number' },
                      },
                    },
                  },
                  location: { type: 'string' },
                  videoConferenceUrl: { type: 'string', format: 'uri' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Session created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Session' },
              },
            },
          },
          400: { description: 'Validation error or invalid user IDs' },
          409: { description: 'Coach has a conflicting session at this time' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - insufficient role permissions' },
        },
      },
    },
    '/sessions/check-conflict': {
      post: {
        summary: 'Check for scheduling conflicts',
        description: 'Check if a coach has a conflicting session at the specified time. Returns conflict status and details.',
        tags: ['Sessions'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['coachId', 'scheduledAt', 'duration'],
                properties: {
                  coachId: { type: 'string', format: 'ObjectId', description: 'Coach ID to check' },
                  scheduledAt: { type: 'string', format: 'date-time', description: 'Proposed session start time' },
                  duration: { type: 'number', description: 'Duration in minutes' },
                  excludeSessionId: { type: 'string', format: 'ObjectId', description: 'Optional session ID to exclude (for updates)' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Conflict check completed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        hasConflict: { type: 'boolean' },
                        conflictingSession: { $ref: '#/components/schemas/Session' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - requires admin, manager, or coach role' },
        },
      },
    },
    '/sessions/calendar': {
      get: {
        summary: 'Get calendar view of sessions',
        description: 'Get sessions grouped by date for calendar visualization. Supports filtering by month, year, coach, entrepreneur, and status.',
        tags: ['Sessions'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'month',
            in: 'query',
            schema: { type: 'number', minimum: 1, maximum: 12 },
            description: 'Month (1-12, default: current month)',
          },
          {
            name: 'year',
            in: 'query',
            schema: { type: 'number' },
            description: 'Year (default: current year)',
          },
          {
            name: 'view',
            in: 'query',
            schema: { type: 'string', enum: ['month'], default: 'month' },
            description: 'View type (currently only month supported)',
          },
          {
            name: 'coachId',
            in: 'query',
            schema: { type: 'string', format: 'ObjectId' },
            description: 'Filter by coach',
          },
          {
            name: 'entrepreneurId',
            in: 'query',
            schema: { type: 'string', format: 'ObjectId' },
            description: 'Filter by entrepreneur',
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['scheduled', 'rescheduled', 'in_progress', 'completed', 'cancelled', 'no_show'] },
            description: 'Filter by status',
          },
        ],
        responses: {
          200: {
            description: 'Calendar view retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        calendar: {
                          type: 'object',
                          additionalProperties: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Session' },
                          },
                          description: 'Sessions grouped by date (YYYY-MM-DD)',
                        },
                        month: { type: 'number' },
                        year: { type: 'number' },
                        total: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid month or year' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/sessions/{sessionId}': {
      get: {
        summary: 'Get one session',
        description: 'Retrieve a single session by ID. Available to all roles.',
        tags: ['Sessions'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
            description: 'Session ID',
          },
        ],
        responses: {
          200: {
            description: 'Session retrieved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Session' },
              },
            },
          },
          404: { description: 'Session not found' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      patch: {
        summary: 'Partial update session',
        description: 'Partial update of a session (e.g., status only). Requires admin, manager, or coach role.',
        tags: ['Sessions'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  scheduledAt: { type: 'string', format: 'date-time' },
                  duration: { type: 'number' },
                  status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'] },
                  notes: { type: 'object' },
                  rating: { type: 'object' },
                  agendaItems: { type: 'array' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Session updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Session' },
              },
            },
          },
          404: { description: 'Session not found' },
          409: { description: 'Coach has a conflicting session' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      delete: {
        summary: 'Delete session',
        description: 'Delete a session. Requires admin or manager role.',
        tags: ['Sessions'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
        ],
        responses: {
          204: { description: 'Session deleted successfully' },
          404: { description: 'Session not found' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - requires admin or manager role' },
        },
      },
    },
    '/dashboard/stats': {
      get: {
        summary: 'Get dashboard statistics',
        description: 'Retrieve aggregated organization statistics. Requires admin, manager, or coach role.',
        tags: ['Dashboard'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard statistics retrieved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DashboardStats' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - insufficient role permissions (requires admin, manager, or coach)' },
        },
      },
    },
    '/users': {
      get: {
        summary: 'List users in organization (consolidated)',
        description: 'Get list of active users in the authenticated user\'s organization with optional role filtering. Replaces /coaches and /entrepreneurs endpoints. Only admin and manager roles can access.',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['coach', 'entrepreneur', 'manager', 'admin'] }, description: 'Filter by user role (e.g., ?role=coach)' },
          { name: 'isActive', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filter by active status. By default returns both active and inactive users. Use "true" for active users only, "false" for inactive users only.' },
          { name: 'page', in: 'query', schema: { type: 'number', default: 1, minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'number', default: 20, minimum: 1, maximum: 100 } },
          { name: 'sort', in: 'query', schema: { type: 'string', default: '-createdAt' } },
        ],
        responses: {
          200: {
            description: 'Users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                      description: 'Array of user objects (password field excluded)',
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        total: { type: 'number' },
                        page: { type: 'number' },
                        limit: { type: 'number' },
                      },
                    },
                  },
                },
                example: {
                  data: [
                    {
                      _id: '507f1f77bcf86cd799439011',
                      email: 'john.doe@example.com',
                      role: 'coach',
                      firstName: 'John',
                      lastName: 'Doe',
                      organizationId: '507f1f77bcf86cd799439012',
                      hourlyRate: 75,
                      isActive: true,
                      createdAt: '2024-01-15T10:30:00.000Z',
                      updatedAt: '2024-01-15T10:30:00.000Z',
                    },
                  ],
                  meta: { total: 1, page: 1, limit: 20 },
                },
              },
            },
          },
          400: { description: 'Bad request - Organization ID not found' },
          401: { description: 'Unauthorized - Missing or invalid JWT token' },
          403: { description: 'Forbidden - Only admin and manager roles can access' },
          500: { description: 'Internal server error' },
        },
      },
      post: {
        summary: 'Create user',
        description: 'Create a new user in the organization. Requires admin or manager role.',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'role', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  role: { type: 'string', enum: ['manager', 'coach', 'entrepreneur', 'admin'] },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  hourlyRate: { type: 'number', description: 'Required for coaches' },
                  startupName: { type: 'string', description: 'Required for entrepreneurs' },
                  phone: { type: 'string' },
                  timezone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          400: { description: 'Validation error or missing required fields' },
          409: { description: 'User with this email already exists' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - requires admin or manager role' },
        },
      },
    },
    '/users/{userId}': {
      get: {
        summary: 'Get one user',
        description: 'Retrieve a single user by ID. Requires admin or manager role.',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
        ],
        responses: {
          200: {
            description: 'User retrieved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          404: { description: 'User not found' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      patch: {
        summary: 'Partial update user',
        description: 'Partial update of a user. Requires admin or manager role.',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  hourlyRate: { type: 'number' },
                  startupName: { type: 'string' },
                  phone: { type: 'string' },
                  timezone: { type: 'string' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          404: { description: 'User not found' },
          409: { description: 'Email already exists' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      delete: {
        summary: 'Delete user',
        description: 'Soft delete a user (sets isActive=false). Requires admin or manager role.',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
        ],
        responses: {
          204: { description: 'User deleted successfully' },
          404: { description: 'User not found' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - requires admin or manager role' },
        },
      },
    },
    '/goals': {
      get: {
        summary: 'List all goals',
        description: 'Get list of goals with optional filters. Entrepreneurs see only their goals, coaches see only assigned goals.',
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'priority',
            in: 'query',
            schema: { type: 'string', enum: ['low', 'medium', 'high'] },
            description: 'Filter by priority',
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['not_started', 'in_progress', 'completed', 'blocked'] },
            description: 'Filter by status',
          },
        ],
        responses: {
          200: {
            description: 'Goals retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Goal' },
                    },
                    count: { type: 'number' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      post: {
        summary: 'Create goal',
        description: 'Create a new goal. Requires admin, manager, or coach role.',
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['entrepreneurId', 'coachId', 'title'],
                properties: {
                  entrepreneurId: { type: 'string', format: 'ObjectId' },
                  coachId: { type: 'string', format: 'ObjectId' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['not_started', 'in_progress', 'completed', 'blocked'] },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                  targetDate: { type: 'string', format: 'date-time' },
                  milestones: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string', format: 'ObjectId', description: 'Milestone ID' },
                        title: { type: 'string' },
                        status: { type: 'string' },
                        targetDate: { type: 'string', format: 'date-time' },
                        notes: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Goal created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Goal' },
              },
            },
          },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/goals/{goalId}/progress': {
      patch: {
        summary: 'Update goal progress',
        description: 'Update goal progress percentage (0-100). Logs change in update log. Available to admin, manager, coach, and entrepreneur.',
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'goalId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['progress'],
                properties: {
                  progress: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100,
                    description: 'Progress percentage',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Goal progress updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Goal' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid progress value' },
          404: { description: 'Goal not found' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - access denied' },
        },
      },
    },
    '/goals/{goalId}/milestones/{milestoneId}': {
      patch: {
        summary: 'Update milestone status',
        description: 'Update milestone status. Auto-sets completedAt when marked as completed. Recalculates goal progress based on completed milestones.',
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'goalId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
          {
            name: 'milestoneId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['not_started', 'in_progress', 'completed', 'blocked'],
                    description: 'New milestone status',
                  },
                  notes: {
                    type: 'string',
                    description: 'Optional notes about the status change',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Milestone status updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Goal' },
                  },
                },
              },
            },
          },
          404: { description: 'Goal or milestone not found' },
          400: { description: 'Invalid status' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - access denied' },
        },
      },
    },
    '/goals/{goalId}/comments': {
      post: {
        summary: 'Add comment to goal',
        description: 'Add a comment with timestamp to a goal. Available to all roles with goal access.',
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'goalId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['text'],
                properties: {
                  text: {
                    type: 'string',
                    description: 'Comment text',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Comment added successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Goal' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
          404: { description: 'Goal not found' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - access denied' },
        },
      },
    },
    '/goals/{goalId}/collaborators': {
      post: {
        summary: 'Add collaborator to goal',
        description: 'Add a user as a collaborator on a goal. Prevents duplicate collaborators. Requires admin, manager, or coach role.',
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'goalId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: {
                  userId: {
                    type: 'string',
                    format: 'ObjectId',
                    description: 'User ID to add as collaborator',
                  },
                  role: {
                    type: 'string',
                    default: 'contributor',
                    description: 'Collaborator role',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Collaborator added successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Goal' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error or user not in organization' },
          404: { description: 'Goal or user not found' },
          409: { description: 'User is already a collaborator' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - requires admin, manager, or coach role' },
        },
      },
    },
    '/goals/{goalId}/sessions/{sessionId}': {
      post: {
        summary: 'Link session to goal',
        description: 'Associate a session with a goal. Prevents duplicate links. Requires admin, manager, or coach role.',
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'goalId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
        ],
        responses: {
          201: {
            description: 'Session linked to goal successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Goal' },
                  },
                },
              },
            },
          },
          404: { description: 'Goal or session not found' },
          409: { description: 'Session already linked to this goal' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - requires admin, manager, or coach role' },
        },
      },
    },
    '/payments/generate': {
      post: {
        summary: 'Generate payment from sessions',
        description: 'Auto-generate payment invoice from completed sessions. Validates sessions, calculates totals with 8% tax, auto-generates invoice number. Requires admin or manager role.',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['coachId', 'sessionIds'],
                properties: {
                  coachId: {
                    type: 'string',
                    format: 'ObjectId',
                    description: 'Coach ID to generate payment for',
                  },
                  sessionIds: {
                    type: 'array',
                    items: { type: 'string', format: 'ObjectId' },
                    description: 'Array of completed session IDs',
                  },
                  notes: {
                    type: 'string',
                    description: 'Optional notes for the invoice',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Payment generated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Payment' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error - sessions not completed or belong to different coach' },
          404: { description: 'Coach or sessions not found' },
          409: { description: 'Some sessions are already included in a payment' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - requires admin or manager role' },
        },
      },
    },
    '/payments/{paymentId}/invoice': {
      get: {
        summary: 'Download invoice PDF',
        description: 'Generate and download professional invoice PDF using Puppeteer. Coaches can only download their own invoices. Returns PDF file with proper headers.',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'paymentId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
        ],
        responses: {
          200: {
            description: 'Invoice PDF generated and returned',
            content: {
              'application/pdf': {
                schema: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
            headers: {
              'Content-Type': {
                schema: { type: 'string', example: 'application/pdf' },
              },
              'Content-Disposition': {
                schema: { type: 'string', example: 'attachment; filename="invoice-INV-001.pdf"' },
              },
            },
          },
          404: { description: 'Payment not found' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - coaches can only download their own invoices' },
          500: { description: 'PDF generation failed' },
        },
      },
    },
    '/payments/{paymentId}/send-invoice': {
      post: {
        summary: 'Send invoice via email',
        description: 'Event-driven endpoint to generate invoice PDF and send it to the coach via email. Updates remindersSent array. Requires admin or manager role. Email service must be configured for production use.',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'paymentId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
            description: 'Payment ID whose invoice will be emailed',
          },
        ],
        responses: {
          200: {
            description: 'Invoice email queued successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Invoice email queued for sending' },
                    data: {
                      type: 'object',
                      properties: {
                        paymentId: { type: 'string', format: 'ObjectId' },
                        invoiceNumber: { type: 'string', example: 'INV-001' },
                        recipient: { type: 'string', format: 'email', example: 'coach@example.com' },
                        sentAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: 'Payment or coach not found' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - requires admin or manager role' },
          500: { description: 'Email sending failed' },
        },
      },
    },
    '/payments/stats': {
      get: {
        summary: 'Get payment statistics',
        description: 'Get aggregated payment statistics including counts, totals by status, and revenue metrics. Supports filtering by coach and date range. Available to admin, manager, and coach roles.',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'coachId',
            in: 'query',
            schema: { type: 'string', format: 'ObjectId' },
            description: 'Filter by coach (coaches automatically filtered to their own)',
          },
          {
            name: 'startDate',
            in: 'query',
            schema: { type: 'string', format: 'date-time' },
            description: 'Filter from date',
          },
          {
            name: 'endDate',
            in: 'query',
            schema: { type: 'string', format: 'date-time' },
            description: 'Filter to date',
          },
        ],
        responses: {
          200: {
            description: 'Payment statistics retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        total: { type: 'number', description: 'Total number of payments' },
                        byStatus: {
                          type: 'object',
                          additionalProperties: {
                            type: 'object',
                            properties: {
                              count: { type: 'number' },
                              total: { type: 'number' },
                            },
                          },
                        },
                        revenue: {
                          type: 'object',
                          properties: {
                            totalRevenue: { type: 'number' },
                            totalAmount: { type: 'number' },
                            totalTax: { type: 'number' },
                            averagePayment: { type: 'number' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - requires admin, manager, or coach role' },
        },
      },
    },
    '/goals/{goalId}': {
      get: {
        summary: 'Get one goal',
        description: 'Retrieve a single goal by ID. Role-based access control applies.',
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'goalId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
        ],
        responses: {
          200: {
            description: 'Goal retrieved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Goal' },
              },
            },
          },
          404: { description: 'Goal not found' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - access denied' },
        },
      },
      patch: {
        summary: 'Partial update goal',
        description: 'Partial update of a goal (e.g., progress only). Role-based access control applies.',
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'goalId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['not_started', 'in_progress', 'completed', 'blocked'] },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                  targetDate: { type: 'string', format: 'date-time' },
                  progress: { type: 'number', minimum: 0, maximum: 100 },
                  milestones: { type: 'array' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Goal updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Goal' },
              },
            },
          },
          404: { description: 'Goal not found' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      delete: {
        summary: 'Delete goal',
        description: 'Delete a goal. Requires admin or manager role.',
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'goalId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
        ],
        responses: {
          204: { description: 'Goal deleted successfully' },
          404: { description: 'Goal not found' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - requires admin or manager role' },
        },
      },
    },
    '/payments': {
      get: {
        summary: 'List all payments',
        description: 'Get list of payments/invoices with optional filters. Coaches see only their payments.',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['pending', 'paid', 'failed', 'refunded', 'void'] },
            description: 'Filter by payment status',
          },
          { name: 'page', in: 'query', schema: { type: 'number', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'number', default: 20, minimum: 1, maximum: 100 } },
          { name: 'sort', in: 'query', schema: { type: 'string', default: '-createdAt' } },
        ],
        responses: {
          200: {
            description: 'Payments retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Payment' },
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        total: { type: 'number' },
                        page: { type: 'number' },
                        limit: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      post: {
        summary: 'Create invoice',
        description: 'Create a new payment invoice from completed sessions. Requires admin or manager role.',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['coachId', 'sessionIds'],
                properties: {
                  coachId: { type: 'string', format: 'ObjectId' },
                  sessionIds: {
                    type: 'array',
                    items: { type: 'string', format: 'ObjectId' },
                    description: 'Array of completed session IDs',
                  },
                  amount: { type: 'number', description: 'Subtotal amount (optional, calculated if not provided)' },
                  taxAmount: { type: 'number', default: 0 },
                  currency: { type: 'string', default: 'USD' },
                  dueDate: { type: 'string', format: 'date-time' },
                  period: {
                    type: 'object',
                    properties: {
                      startDate: { type: 'string', format: 'date-time' },
                      endDate: { type: 'string', format: 'date-time' },
                    },
                  },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Payment invoice created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Payment' },
              },
            },
          },
          400: { description: 'Validation error or invalid sessions' },
          409: { description: 'Some sessions are already included in a payment' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - requires admin or manager role' },
        },
      },
    },
    '/payments/{paymentId}': {
      get: {
        summary: 'Get one payment/invoice',
        description: 'Retrieve a single payment/invoice by ID. Coaches can only see their own payments.',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'paymentId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
        ],
        responses: {
          200: {
            description: 'Payment retrieved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Payment' },
              },
            },
          },
          404: { description: 'Payment not found' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      patch: {
        summary: 'Update payment',
        description: 'Update payment status (mark paid, etc.). Requires admin or manager role.',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'paymentId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'ObjectId' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['pending', 'paid', 'failed', 'refunded', 'void'] },
                  invoiceUrl: { type: 'string', format: 'uri' },
                  paidAt: { type: 'string', format: 'date-time' },
                  remindersSent: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        sentAt: { type: 'string', format: 'date-time' },
                        type: { type: 'string', enum: ['email', 'sms', 'in_app'] },
                      },
                    },
                  },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Payment updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Payment' },
              },
            },
          },
          404: { description: 'Payment not found' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/dashboard/sessions': {
      get: {
        summary: 'Session overview chart',
        description: 'Get session data grouped by date for chart visualization. Requires admin, manager, or coach role.',
        tags: ['Dashboard'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'range',
            in: 'query',
            schema: { type: 'string', enum: ['week', 'month', 'year'], default: 'month' },
            description: 'Time range for the chart',
          },
        ],
        responses: {
          200: {
            description: 'Session overview data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      additionalProperties: {
                        type: 'object',
                        properties: {
                          scheduled: { type: 'number' },
                          completed: { type: 'number' },
                          cancelled: { type: 'number' },
                        },
                      },
                    },
                    range: { type: 'string' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/dashboard/goals-category': {
      get: {
        summary: 'Goals by category (pie chart)',
        description: 'Get goals grouped by status and priority for pie chart visualization. Requires admin, manager, or coach role.',
        tags: ['Dashboard'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Goals category data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    byStatus: {
                      type: 'object',
                      properties: {
                        not_started: { type: 'number' },
                        in_progress: { type: 'number' },
                        completed: { type: 'number' },
                        blocked: { type: 'number' },
                      },
                    },
                    byPriority: {
                      type: 'object',
                      properties: {
                        low: { type: 'number' },
                        medium: { type: 'number' },
                        high: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/dashboard/revenue': {
      get: {
        summary: 'Revenue chart',
        description: 'Get revenue data grouped by date for chart visualization. Requires admin, manager, or coach role.',
        tags: ['Dashboard'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'range',
            in: 'query',
            schema: { type: 'string', enum: ['week', 'month', 'year'], default: 'month' },
            description: 'Time range for the chart',
          },
        ],
        responses: {
          200: {
            description: 'Revenue chart data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      additionalProperties: { type: 'number' },
                      description: 'Revenue by date (YYYY-MM-DD format)',
                    },
                    total: { type: 'number' },
                    range: { type: 'string' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/exports/dashboard': {
      get: {
        summary: 'Export dashboard data',
        description: 'Export all dashboard data (users, sessions, goals, payments) in JSON or CSV format. Requires admin or manager role.',
        tags: ['Export'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'format',
            in: 'query',
            schema: { type: 'string', enum: ['json', 'csv'], default: 'json' },
            description: 'Export format',
          },
        ],
        responses: {
          200: {
            description: 'Dashboard data exported',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    exportedAt: { type: 'string', format: 'date-time' },
                    users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    sessions: { type: 'array', items: { $ref: '#/components/schemas/Session' } },
                    goals: { type: 'array', items: { $ref: '#/components/schemas/Goal' } },
                    payments: { type: 'array', items: { $ref: '#/components/schemas/Payment' } },
                    summary: { type: 'object' },
                  },
                },
              },
              'text/csv': {
                schema: { type: 'string' },
              },
            },
          },
          400: { description: 'Unsupported format' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - requires admin or manager role' },
        },
      },
    },
    '/organization': {
      get: {
        summary: 'Get current organization',
        description: 'Retrieve details of the current user\'s organization. Requires manager or admin role.',
        tags: ['Organizations'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Organization details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Organization' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - requires manager or admin role' },
          404: { description: 'Organization not found' },
        },
      },
      patch: {
        summary: 'Update current organization',
        description: 'Update organization settings including name, slug, subscription plan, and quotas. Admin only.',
        tags: ['Organizations'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
                  billingEmail: { type: 'string', format: 'email' },
                  subscriptionPlan: { type: 'string', enum: ['free', 'standard', 'premium'] },
                  subscriptionStatus: { type: 'string', enum: ['trialing', 'active', 'past_due', 'paused', 'canceled'] },
                  maxUsers: { type: 'number', minimum: 1 },
                  maxCoaches: { type: 'number', minimum: 0 },
                  maxEntrepreneurs: { type: 'number', minimum: 0 },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Organization updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Organization' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - admin only' },
          409: { description: 'Slug already exists' },
        },
      },
    },
    '/organization/stats': {
      get: {
        summary: 'Get organization statistics',
        description: 'Retrieve quota usage, member counts, revenue, and subscription info. Requires manager or admin role.',
        tags: ['Organizations'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Organization statistics',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OrganizationStats' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Organization not found' },
        },
      },
    },
    '/organization/settings/manager': {
      patch: {
        summary: 'Update manager settings',
        description: 'Update manager-specific settings like notification preferences and dashboard layout. Manager or admin only.',
        tags: ['Organizations'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  notificationPreferences: {
                    type: 'object',
                    properties: {
                      emailOnNewSession: { type: 'boolean' },
                      emailOnSessionCancel: { type: 'boolean' },
                      emailOnGoalUpdate: { type: 'boolean' },
                      emailOnPaymentReceived: { type: 'boolean' },
                      emailDigestFrequency: { type: 'string', enum: ['daily', 'weekly', 'never'] },
                    },
                  },
                  dashboardLayout: {
                    type: 'object',
                    properties: {
                      defaultView: { type: 'string', enum: ['overview', 'sessions', 'members', 'revenue'] },
                      widgets: { type: 'array', items: { type: 'string' } },
                    },
                  },
                  approvalThresholds: {
                    type: 'object',
                    properties: {
                      sessionPricingApproval: { type: 'boolean' },
                      coachOnboardingApproval: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Manager settings updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Organization' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Organization not found' },
        },
      },
    },
    '/organization/logo': {
      post: {
        summary: 'Upload organization logo',
        description: 'Upload an organization logo image. Supports PNG, JPEG, WebP, SVG (max 5MB). Manager or admin only.',
        tags: ['Organizations'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  logo: { type: 'string', format: 'binary', description: 'Logo file (PNG, JPEG, WebP, SVG)' },
                },
                required: ['logo'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Logo uploaded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    logo: { type: 'string', description: 'Logo file path' },
                    asset: { type: 'object' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid file or missing file' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/organization/admin/create': {
      post: {
        summary: 'Create new organization',
        description: 'Create a new organization with subscription plan and quotas. Admin only.',
        tags: ['Organizations - Admin'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'slug'],
                properties: {
                  name: { type: 'string', minLength: 2 },
                  slug: { type: 'string', minLength: 2, pattern: '^[a-z0-9-]+$' },
                  billingEmail: { type: 'string', format: 'email' },
                  subscriptionPlan: { type: 'string', enum: ['free', 'standard', 'premium'] },
                  maxUsers: { type: 'number', minimum: 1 },
                  maxCoaches: { type: 'number', minimum: 0 },
                  maxEntrepreneurs: { type: 'number', minimum: 0 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Organization created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Organization' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - admin only' },
          409: { description: 'Organization slug already exists' },
        },
      },
    },
    '/organization/admin/list': {
      get: {
        summary: 'List all organizations',
        description: 'Retrieve paginated list of all organizations with optional filtering. Admin only.',
        tags: ['Organizations - Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50, maximum: 500 } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
          { name: 'subscriptionPlan', in: 'query', schema: { type: 'string', enum: ['free', 'standard', 'premium'] } },
          { name: 'subscriptionStatus', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string', description: 'Search by name, slug, or email' } },
        ],
        responses: {
          200: {
            description: 'Paginated list of organizations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Organization' } },
                    total: { type: 'number' },
                    page: { type: 'number' },
                    pages: { type: 'number' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - admin only' },
        },
      },
    },
    '/organization/admin/{organizationId}': {
      get: {
        summary: 'Get organization by ID',
        description: 'Retrieve a specific organization by ID. Admin only.',
        tags: ['Organizations - Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'organizationId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Organization details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Organization' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - admin only' },
          404: { description: 'Organization not found' },
        },
      },
      patch: {
        summary: 'Update organization by ID',
        description: 'Update a specific organization by ID. Admin only.',
        tags: ['Organizations - Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'organizationId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  subscriptionPlan: { type: 'string', enum: ['free', 'standard', 'premium'] },
                  subscriptionStatus: { type: 'string', enum: ['trialing', 'active', 'past_due', 'paused', 'canceled'] },
                  maxUsers: { type: 'number' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Organization updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Organization' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - admin only' },
          409: { description: 'Slug already exists' },
        },
      },
      delete: {
        summary: 'Delete organization',
        description: 'Soft-delete an organization by marking it as inactive. Admin only.',
        tags: ['Organizations - Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'organizationId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Organization deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Organization' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - admin only' },
          404: { description: 'Organization not found' },
        },
      },
    },
    '/organization/admin/{organizationId}/quota': {
      get: {
        summary: 'Get organization quota status',
        description: 'Get quota usage statistics for an organization. Admin only.',
        tags: ['Organizations - Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'organizationId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Quota status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    quotaUsage: { type: 'object' },
                    subscriptionPlan: { type: 'string' },
                    subscriptionStatus: { type: 'string' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Organization not found' },
        },
      },
    },
    '/admin/activity': {
      get: {
        summary: 'Get activity feed',
        description: 'Retrieve platform activity events. Managers see their organization activities, admins see all activities.',
        tags: ['Admin - Activity Feed'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50, maximum: 100 }, description: 'Number of records per page' },
          { name: 'skip', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Pagination offset' },
          { name: 'activityType', in: 'query', schema: { type: 'string', enum: ['USER_REGISTERED', 'USER_ACTIVATED', 'USER_DEACTIVATED', 'SESSION_CREATED', 'SESSION_COMPLETED', 'SESSION_CANCELLED', 'PAYMENT_GENERATED', 'PAYMENT_COMPLETED', 'ORGANIZATION_CREATED', 'ORGANIZATION_UPDATED'] }, description: 'Filter by activity type' },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Filter from date (ISO string)' },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Filter to date (ISO string)' },
        ],
        responses: {
          200: {
            description: 'Activity feed retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Activity' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        limit: { type: 'integer' },
                        skip: { type: 'integer' },
                        hasMore: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - insufficient permissions' },
        },
      },
    },
    '/admin/activity/stats': {
      get: {
        summary: 'Get activity statistics',
        description: 'Get aggregated activity statistics by type for an organization.',
        tags: ['Admin - Activity Feed'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Filter from date (ISO string)' },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Filter to date (ISO string)' },
        ],
        responses: {
          200: {
            description: 'Activity statistics retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      additionalProperties: { type: 'integer' },
                      example: {
                        USER_REGISTERED: 5,
                        SESSION_CREATED: 12,
                        SESSION_COMPLETED: 8,
                        PAYMENT_GENERATED: 3,
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - insufficient permissions' },
        },
      },
    },
  },
};
