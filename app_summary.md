Rancangan Aplikasi Ignitepad v3.0 (Production Ready)
Platform Akademik Kolaboratif - Laravel 12 + Next.js 14
📋 Table of Contents
Arsitektur & Tech Stack
Database Schema (Lengkap)
Backend Architecture (Laravel)
Frontend Architecture (Next.js)
Sistem Breadcrumb
Security & Best Practices
Performance Optimization
Testing Strategy
1. Arsitektur & Tech Stack {#arsitektur}
A. Backend (Laravel 12 - API Only)
Core:
├── Laravel 12 (API-only mode)
├── PHP 8.2+
├── MySQL 8.0+
└── Redis (Cache + Queue + Session)

Authentication & Authorization:
├── Laravel Sanctum (SPA Authentication)
├── spatie/laravel-permission (RBAC)
└── Laravel Policy (Authorization)

Real-time & Jobs:
├── Laravel Echo Server (Self-hosted WebSocket)
├── soketi (Alternative WebSocket - Pusher compatible)
├── Laravel Horizon (Queue monitoring)
└── Laravel Schedule (Cron jobs)

Additional Packages:
├── spatie/laravel-query-builder (API Filtering)
├── spatie/laravel-medialibrary (File uploads)
├── spatie/laravel-sluggable (Auto slug)
├── spatie/laravel-activitylog (Audit trail)
├── league/fractal (API Transformer)
└── barryvdh/laravel-cors (CORS handling)
B. Frontend (Next.js 14 - App Router)
Core:
├── Next.js 14+ (App Router)
├── TypeScript 5+
├── React 18+
└── Node.js 20+

Styling & UI:
├── Tailwind CSS 3+
├── shadcn/ui (Radix UI primitives)
├── lucide-react (Icons)
├── framer-motion (Animations)
└── class-variance-authority (CVA)

State & Data:
├── TanStack Query v5 (Server state)
├── Zustand (Client state)
├── React Hook Form + Zod (Forms)
└── axios (HTTP client)

Real-time & PWA:
├── laravel-echo
├── pusher-js
├── next-pwa (Service worker)
└── firebase (FCM for push notifications)

Additional:
├── next-themes (Dark mode)
├── react-hot-toast (Toast notifications)
├── date-fns (Date utilities)
├── react-markdown + rehype (Markdown render)
└── @tanstack/react-table (Data tables)
2. Database Schema (Lengkap) {#database}
A. Core Tables
users
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    
    -- Profile
    nim VARCHAR(20) UNIQUE NULL,
    nip VARCHAR(20) UNIQUE NULL,
    bio TEXT NULL,
    avatar VARCHAR(255) NULL,
    cover_image VARCHAR(255) NULL,
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    
    -- Social
    github_url VARCHAR(255) NULL,
    linkedin_url VARCHAR(255) NULL,
    website_url VARCHAR(255) NULL,
    
    -- Tokens
    remember_token VARCHAR(100) NULL,
    fcm_token TEXT NULL, -- For push notifications
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_nim (nim),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
projects
CREATE TABLE projects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    content LONGTEXT NOT NULL,
    
    -- Media
    thumbnail VARCHAR(255) NULL,
    featured_image VARCHAR(255) NULL,
    
    -- Metadata
    tags JSON NULL, -- ['web', 'mobile', 'ai']
    tech_stack JSON NULL, -- ['Laravel', 'Next.js']
    category ENUM('web', 'mobile', 'desktop', 'ai-ml', 'iot', 'game', 'other') DEFAULT 'web',
    
    -- Status
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    visibility ENUM('public', 'unlisted', 'private') DEFAULT 'public',
    is_featured BOOLEAN DEFAULT FALSE,
    allow_comments BOOLEAN DEFAULT TRUE,
    
    -- Stats (cached counts)
    view_count INT UNSIGNED DEFAULT 0,
    like_count INT UNSIGNED DEFAULT 0,
    save_count INT UNSIGNED DEFAULT 0,
    comment_count INT UNSIGNED DEFAULT 0,
    share_count INT UNSIGNED DEFAULT 0,
    
    -- SEO
    meta_title VARCHAR(255) NULL,
    meta_description TEXT NULL,
    
    -- Timestamps
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_visibility (visibility),
    INDEX idx_published_at (published_at),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_search (title, description, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
B. Interaction Tables
likes
CREATE TABLE likes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    likeable_type VARCHAR(255) NOT NULL, -- App\Models\Project, App\Models\Comment
    likeable_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_like (user_id, likeable_type, likeable_id),
    INDEX idx_likeable (likeable_type, likeable_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
saves (Bookmarks)
CREATE TABLE saves (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    project_id BIGINT UNSIGNED NOT NULL,
    folder VARCHAR(100) DEFAULT 'default', -- For organizing bookmarks
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_save (user_id, project_id),
    INDEX idx_user_folder (user_id, folder)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
comments
CREATE TABLE comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    parent_id BIGINT UNSIGNED NULL, -- For nested replies
    
    -- Content
    body TEXT NOT NULL,
    
    -- Moderation
    is_approved BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE,
    
    -- Stats
    like_count INT UNSIGNED DEFAULT 0,
    reply_count INT UNSIGNED DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
C. Collaboration Tables
collaborators
CREATE TABLE collaborators (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Role
    role ENUM('pembimbing', 'kolaborator', 'contributor') NOT NULL,
    
    -- Permissions
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    
    -- Status
    status ENUM('invited', 'accepted', 'declined') DEFAULT 'invited',
    invited_by BIGINT UNSIGNED NULL,
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_collaborator (project_id, user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
D. Challenge Tables
challenges
CREATE TABLE challenges (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL, -- Pembuat (Dosen/Admin)
    
    -- Content
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description LONGTEXT NOT NULL,
    rules TEXT NULL,
    
    -- Media
    banner VARCHAR(255) NULL,
    
    -- Requirements
    requirements JSON NULL, -- ['min_team_size' => 1, 'max_team_size' => 5]
    allowed_categories JSON NULL, -- ['web', 'mobile']
    
    -- Timeline
    start_date TIMESTAMP NULL,
    deadline TIMESTAMP NULL,
    announcement_date TIMESTAMP NULL,
    
    -- Winner
    winner_project_id BIGINT UNSIGNED NULL,
    winner_announced_at TIMESTAMP NULL,
    
    -- Stats
    participant_count INT UNSIGNED DEFAULT 0,
    submission_count INT UNSIGNED DEFAULT 0,
    
    -- Settings
    status ENUM('draft', 'open', 'closed', 'completed') DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    max_participants INT UNSIGNED NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_project_id) REFERENCES projects(id) ON DELETE SET NULL,
    
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_deadline (deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
challenge_submissions
CREATE TABLE challenge_submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    challenge_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    project_id BIGINT UNSIGNED NULL,
    
    -- Submission
    status ENUM('joined', 'submitted', 'withdrawn') DEFAULT 'joined',
    submitted_at TIMESTAMP NULL,
    
    -- Evaluation
    score DECIMAL(5,2) NULL,
    rank INT UNSIGNED NULL,
    feedback TEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_submission (challenge_id, user_id),
    INDEX idx_status (status),
    INDEX idx_rank (rank)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
E. System Tables
notifications (Laravel Built-in)
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY, -- UUID
    type VARCHAR(255) NOT NULL,
    notifiable_type VARCHAR(255) NOT NULL,
    notifiable_id BIGINT UNSIGNED NOT NULL,
    
    -- Data
    data JSON NOT NULL,
    
    -- Status
    read_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_notifiable (notifiable_type, notifiable_id),
    INDEX idx_read_at (read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
activity_log (Spatie)
CREATE TABLE activity_log (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    log_name VARCHAR(255) NULL,
    description TEXT NOT NULL,
    subject_type VARCHAR(255) NULL,
    subject_id BIGINT UNSIGNED NULL,
    causer_type VARCHAR(255) NULL,
    causer_id BIGINT UNSIGNED NULL,
    properties JSON NULL,
    batch_uuid CHAR(36) NULL,
    event VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_subject (subject_type, subject_id),
    INDEX idx_causer (causer_type, causer_id),
    INDEX idx_log_name (log_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
media (Spatie Media Library)
CREATE TABLE media (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT UNSIGNED NOT NULL,
    uuid CHAR(36) NULL,
    collection_name VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(255) NULL,
    disk VARCHAR(255) NOT NULL,
    conversions_disk VARCHAR(255) NULL,
    size BIGINT UNSIGNED NOT NULL,
    manipulations JSON NOT NULL,
    custom_properties JSON NOT NULL,
    generated_conversions JSON NOT NULL,
    responsive_images JSON NOT NULL,
    order_column INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_model (model_type, model_id),
    INDEX idx_uuid (uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
3. Backend Architecture (Laravel) {#backend}
A. Folder Structure
app/
├── Actions/              # Single-responsibility actions
│   ├── Project/
│   │   ├── CreateProjectAction.php
│   │   ├── UpdateProjectAction.php
│   │   └── DeleteProjectAction.php
│   └── Challenge/
│       ├── SubmitChallengeAction.php
│       └── AnnounceWinnerAction.php
├── DTOs/                 # Data Transfer Objects
│   ├── ProjectData.php
│   └── ChallengeData.php
├── Enums/                # PHP Enums
│   ├── ProjectStatus.php
│   ├── UserRole.php
│   └── ChallengeStatus.php
├── Events/               # Domain events
│   ├── ProjectPublished.php
│   ├── CommentPosted.php
│   └── ChallengeWinnerAnnounced.php
├── Exceptions/           # Custom exceptions
│   └── Handler.php
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       └── V1/
│   │           ├── Auth/
│   │           ├── Projects/
│   │           ├── Comments/
│   │           ├── Challenges/
│   │           └── Notifications/
│   ├── Middleware/
│   │   ├── EnsureEmailIsVerified.php
│   │   ├── CheckProjectOwnership.php
│   │   └── TrackProjectView.php
│   ├── Requests/
│   │   └── Api/
│   │       ├── StoreProjectRequest.php
│   │       └── UpdateProjectRequest.php
│   └── Resources/
│       └── Api/
│           ├── ProjectResource.php
│           ├── CommentResource.php
│           └── UserResource.php
├── Jobs/                 # Queue jobs
│   ├── SendEmailNotification.php
│   ├── SendPushNotification.php
│   └── ProcessProjectStats.php
├── Listeners/            # Event listeners
│   ├── SendCommentNotification.php
│   └── UpdateProjectStatistics.php
├── Models/
│   ├── User.php
│   ├── Project.php
│   ├── Comment.php
│   ├── Challenge.php
│   └── Traits/
│       ├── HasLikes.php
│       ├── HasSaves.php
│       └── Searchable.php
├── Notifications/
│   ├── CommentPosted.php
│   ├── ProjectLiked.php
│   └── ChallengeWinner.php
├── Observers/            # Model observers
│   ├── ProjectObserver.php
│   └── CommentObserver.php
├── Policies/
│   ├── ProjectPolicy.php
│   └── CommentPolicy.php
├── Repositories/         # Optional: Repository pattern
│   └── ProjectRepository.php
└── Services/             # Business logic services
    ├── NotificationService.php
    ├── StatisticsService.php
    └── SearchService.php
B. API Routes Structure
// routes/api.php

Route::prefix('v1')->group(function () {
    
    // Public routes
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{slug}', [ProjectController::class, 'show']);
    Route::get('/challenges', [ChallengeController::class, 'index']);
    Route::get('/challenges/{slug}', [ChallengeController::class, 'show']);
    
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/fcm-token', [AuthController::class, 'updateFcmToken']);
        });
    });
    
    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        
        // Projects
        Route::prefix('projects')->group(function () {
            Route::post('/', [ProjectController::class, 'store']);
            Route::put('/{slug}', [ProjectController::class, 'update']);
            Route::delete('/{slug}', [ProjectController::class, 'destroy']);
            
            // Project interactions
            Route::post('/{slug}/like', [ProjectController::class, 'like']);
            Route::delete('/{slug}/like', [ProjectController::class, 'unlike']);
            Route::post('/{slug}/save', [ProjectController::class, 'save']);
            Route::delete('/{slug}/save', [ProjectController::class, 'unsave']);
            Route::post('/{slug}/share', [ProjectController::class, 'share']);
            
            // Comments
            Route::get('/{slug}/comments', [CommentController::class, 'index']);
            Route::post('/{slug}/comments', [CommentController::class, 'store']);
            
            // Collaborators
            Route::get('/{slug}/collaborators', [CollaboratorController::class, 'index']);
            Route::post('/{slug}/collaborators', [CollaboratorController::class, 'store']);
            Route::delete('/{slug}/collaborators/{user}', [CollaboratorController::class, 'destroy']);
        });
        
        // Comments
        Route::prefix('comments')->group(function () {
            Route::put('/{comment}', [CommentController::class, 'update']);
            Route::delete('/{comment}', [CommentController::class, 'destroy']);
            Route::post('/{comment}/like', [CommentController::class, 'like']);
        });
        
        // Challenges
        Route::prefix('challenges')->group(function () {
            Route::middleware('role:dosen|admin')->group(function () {
                Route::post('/', [ChallengeController::class, 'store']);
                Route::put('/{slug}', [ChallengeController::class, 'update']);
                Route::delete('/{slug}', [ChallengeController::class, 'destroy']);
                Route::post('/{slug}/announce-winner', [ChallengeController::class, 'announceWinner']);
            });
            
            Route::middleware('role:mahasiswa')->group(function () {
                Route::post('/{slug}/join', [ChallengeController::class, 'join']);
                Route::post('/{slug}/submit', [ChallengeController::class, 'submit']);
                Route::delete('/{slug}/withdraw', [ChallengeController::class, 'withdraw']);
            });
            
            Route::get('/{slug}/submissions', [ChallengeController::class, 'submissions']);
        });
        
        // Notifications
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
            Route::post('/mark-all-read', [NotificationController::class, 'markAllRead']);
            Route::post('/{id}/mark-read', [NotificationController::class, 'markRead']);
            Route::delete('/{id}', [NotificationController::class, 'destroy']);
        });
        
        // Dashboard
        Route::prefix('dashboard')->group(function () {
            Route::get('/stats', [DashboardController::class, 'stats']);
            Route::get('/my-projects', [DashboardController::class, 'myProjects']);
            Route::get('/saved-projects', [DashboardController::class, 'savedProjects']);
            Route::get('/my-challenges', [DashboardController::class, 'myChallenges']);
        });
        
        // Profile
        Route::prefix('profile')->group(function () {
            Route::get('/', [ProfileController::class, 'show']);
            Route::put('/', [ProfileController::class, 'update']);
            Route::post('/avatar', [ProfileController::class, 'updateAvatar']);
            Route::post('/cover', [ProfileController::class, 'updateCover']);
            Route::put('/settings', [ProfileController::class, 'updateSettings']);
        });
        
        // Admin routes
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::apiResource('users', UserController::class);
            Route::post('/projects/{slug}/feature', [AdminProjectController::class, 'feature']);
            Route::post('/challenges/{slug}/feature', [AdminChallengeController::class, 'feature']);
        });
    });
});

// Broadcasting authentication
Broadcast::routes(['middleware' => ['auth:sanctum']]);
C. Key Services Implementation
NotificationService.php
<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\CommentPosted;
use Illuminate\Support\Facades\Notification;

class NotificationService
{
    public function notifyProjectCollaborators($project, $notification, $except = null)
    {
        $recipients = collect([$project->user])
            ->merge($project->collaborators->pluck('user'))
            ->filter(fn($user) => $user->id !== $except?->id)
            ->filter(fn($user) => $user->email_notifications)
            ->unique('id');
        
        Notification::send($recipients, $notification);
    }
    
    public function notifyChallengeParticipants($challenge, $notification)
    {
        $participants = User::whereHas('challengeSubmissions', function ($query) use ($challenge) {
            $query->where('challenge_id', $challenge->id);
        })->where('push_notifications', true)->get();
        
        Notification::send($participants, $notification);
    }
}
D. Real-time Broadcasting Setup
// config/broadcasting.php
'connections' => [
    'pusher' => [
        'driver' => 'pusher',
        'key' => env('PUSHER_APP_KEY'),
        'secret' => env('PUSHER_APP_SECRET'),
        'app_id' => env('PUSHER_APP_ID'),
        'options' => [
            'cluster' => env('PUSHER_APP_CLUSTER'),
            'encrypted' => true,
            'host' => env('SOKETI_HOST', '127.0.0.1'),
            'port' => env('SOKETI_PORT', 6001),
            'scheme' => env('SOKETI_SCHEME', 'http'),
        ],
    ],
],

// Broadcasting Event Example
// app/Events/CommentPosted.php
class CommentPosted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    
    public function __construct(public Comment $comment) {}
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.' . $this->comment->project->user_id),
            new PrivateChannel('project.' . $this->comment->project_id),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'comment.posted';
    }
    
    public function broadcastWith(): array
    {
        return [
            'comment' => new CommentResource($this->comment),
        ];
    }
}
4. Frontend Architecture (Next.js) {#frontend}
A. Folder Structure
src/
├── app/                          # App Router
│   ├── (auth)/                   # Auth layout group
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (main)/                   # Main layout group
│   │   ├── page.tsx              # Home
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       ├── page.tsx
│   │   │       └── loading.tsx
│   │   ├── challenges/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── profile/
│   │   │   └── [username]/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Dashboard layout group
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── my-projects/
│   │   │   ├── saved/
│   │   │   ├── challenges/
│   │   │   └── settings/
│   │   └── layout.tsx
│   ├── (admin)/                  # Admin layout group
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── users/
│   │   │   ├── projects/
│   │   │   └── challenges/
│   │   └── layout.tsx
│   ├── api/                      # API routes (optional)
│   │   └── upload/route.ts
│   ├── error.tsx
│   ├── not-found.tsx
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   ├── footer.tsx
│   │   └── breadcrumb.tsx        # ⭐ Global breadcrumb
│   ├── projects/
│   │   ├── project-card.tsx
│   │   ├── project-detail.tsx
│   │   ├── project-form.tsx
│   │   └── project-stats.tsx
│   ├── comments/
│   │   ├── comment-list.tsx
│   │   ├── comment-item.tsx
│   │   └── comment-form.tsx
│   ├── challenges/
│   │   ├── challenge-card.tsx
│   │   ├── challenge-detail.tsx
│   │   └── submission-list.tsx
│   ├── notifications/
│   │   ├── notification-bell.tsx
│   │   ├── notification-list.tsx
│   │   └── notification-item.tsx
│   └── providers/
│       ├── query-provider.tsx
│       ├── theme-provider.tsx
│       └── echo-provider.tsx     # Real-time provider
├── lib/
│   ├── api/                      # API client
│   │   ├── client.ts             # Axios instance
│   │   ├── endpoints.ts          # API endpoints constants
│   │   ├── projects.ts
│   │   ├── comments.ts
│   │   ├── challenges.ts
│   │   └── notifications.ts
│   ├── echo/                     # Laravel Echo setup
│   │   ├── echo.ts
│   │   └── channels.ts
│   ├── hooks/                    # Custom hooks
│   │   ├── use-auth.ts
│   │   ├── use-project.ts
│   │   ├── use-comments.ts
│   │   ├── use-notifications.ts
│   │   └── use-breadcrumb.ts     # ⭐ Breadcrumb hook
│   ├── stores/                   # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── notification-store.ts
│   │   └── breadcrumb-store.ts   # ⭐ Breadcrumb state
│   ├── utils/
│   │   ├── cn.ts                 # Class merger
│   │   ├── format.ts
│   │   └── validators.ts
│   ├── validations/              # Zod schemas
│   │   ├── project.schema.ts
│   │   ├── comment.schema.ts
│   │   └── challenge.schema.ts
│   └── constants/
│       ├── routes.ts
│       └── breadcrumb-config.ts  # ⭐ Breadcrumb configuration
├── types/
│   ├── index.ts
│   ├── models.ts
│   └── api.ts
└── config/
    ├── site.ts
    └── navigation.ts
5. Sistem Breadcrumb Lengkap {#breadcrumb}
A. Breadcrumb Configuration
// lib/constants/breadcrumb-config.ts

export interface BreadcrumbItem {
  label: string;
  href?: string;
  dynamic?: boolean;
}

export interface BreadcrumbConfig {
  [key: string]: {
    items: BreadcrumbItem[];
    dynamic?: {
      [key: string]: (params: any) => BreadcrumbItem;
    };
  };
}

export const breadcrumbConfig: BreadcrumbConfig = {
  // Home
  '/': {
    items: [{ label: 'Home', href: '/' }],
  },

  // Projects
  '/projects': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Projects' },
    ],
  },
  '/projects/[slug]': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/projects' },
      { label: '', dynamic: true }, // Will be filled with project title
    ],
    dynamic: {
      slug: (project) => ({ label: project.title }),
    },
  },

  // Challenges
  '/challenges': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Challenges' },
    ],
  },
  '/challenges/[slug]': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Challenges', href: '/challenges' },
      { label: '', dynamic: true },
    ],
    dynamic: {
      slug: (challenge) => ({ label: challenge.title }),
    },
  },

  // Dashboard
  '/dashboard': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard' },
    ],
  },
  '/dashboard/my-projects': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My Projects' },
    ],
  },
  '/dashboard/my-projects/create': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My Projects', href: '/dashboard/my-projects' },
      { label: 'Create New' },
    ],
  },
  '/dashboard/my-projects/edit/[slug]': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My Projects', href: '/dashboard/my-projects' },
      { label: '', dynamic: true },
      { label: 'Edit' },
    ],
    dynamic: {
      slug: (project) => ({ label: project.title, href: `/projects/${project.slug}` }),
    },
  },
  '/dashboard/saved': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Saved Projects' },
    ],
  },
  '/dashboard/challenges': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My Challenges' },
    ],
  },
  '/dashboard/settings': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings' },
    ],
  },

  // Profile
  '/profile/[username]': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Profile', dynamic: true },
    ],
    dynamic: {
      username: (user) => ({ label: user.name }),
    },
  },

  // Admin
  '/admin': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Admin Panel' },
    ],
  },
  '/admin/users': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Admin', href: '/admin' },
      { label: 'Users' },
    ],
  },
  '/admin/projects': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Admin', href: '/admin' },
      { label: 'Projects' },
    ],
  },
  '/admin/challenges': {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Admin', href: '/admin' },
      { label: 'Challenges' },
    ],
  },
};
B. Breadcrumb Store (Zustand)
// lib/stores/breadcrumb-store.ts

import { create } from 'zustand';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbStore {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
  reset: () => void;
}

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  reset: () => set({ items: [] }),
}));
C. Breadcrumb Hook
// lib/hooks/use-breadcrumb.ts

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useBreadcrumbStore } from '@/lib/stores/breadcrumb-store';
import { breadcrumbConfig } from '@/lib/constants/breadcrumb-config';

export function useBreadcrumb(dynamicData?: Record<string, any>) {
  const pathname = usePathname();
  const setItems = useBreadcrumbStore((state) => state.setItems);

  useEffect(() => {
    // Find matching route
    let matchedRoute = pathname;
    let config = breadcrumbConfig[pathname];

    // If exact match not found, try dynamic routes
    if (!config) {
      const routes = Object.keys(breadcrumbConfig);
      matchedRoute = routes.find((route) => {
        const pattern = route.replace(/\[([^\]]+)\]/g, '([^/]+)');
        const regex = new RegExp(`^${pattern}# Rancangan Aplikasi Ignitepad v3.0 (Production Ready)
## Platform Akademik Kolaboratif - Laravel 12 + Next.js 14

---

## 📋 Table of Contents
1. [Arsitektur & Tech Stack](#arsitektur)
2. [Database Schema (Lengkap)](#database)
3. [Backend Architecture (Laravel)](#backend)
4. [Frontend Architecture (Next.js)](#frontend)
5. [Sistem Breadcrumb](#breadcrumb)
6. [Security & Best Practices](#security)
7. [Performance Optimization](#performance)
8. [Testing Strategy](#testing)

---

## 1. Arsitektur & Tech Stack {#arsitektur}

### A. Backend (Laravel 12 - API Only)
Core:
├── Laravel 12 (API-only mode)
├── PHP 8.2+
├── MySQL 8.0+
└── Redis (Cache + Queue + Session)
Authentication & Authorization:
├── Laravel Sanctum (SPA Authentication)
├── spatie/laravel-permission (RBAC)
└── Laravel Policy (Authorization)
Real-time & Jobs:
├── Laravel Echo Server (Self-hosted WebSocket)
├── soketi (Alternative WebSocket - Pusher compatible)
├── Laravel Horizon (Queue monitoring)
└── Laravel Schedule (Cron jobs)
Additional Packages:
├── spatie/laravel-query-builder (API Filtering)
├── spatie/laravel-medialibrary (File uploads)
├── spatie/laravel-sluggable (Auto slug)
├── spatie/laravel-activitylog (Audit trail)
├── league/fractal (API Transformer)
└── barryvdh/laravel-cors (CORS handling)


### B. Frontend (Next.js 14 - App Router)
Core:
├── Next.js 14+ (App Router)
├── TypeScript 5+
├── React 18+
└── Node.js 20+
Styling & UI:
├── Tailwind CSS 3+
├── shadcn/ui (Radix UI primitives)
├── lucide-react (Icons)
├── framer-motion (Animations)
└── class-variance-authority (CVA)
State & Data:
├── TanStack Query v5 (Server state)
├── Zustand (Client state)
├── React Hook Form + Zod (Forms)
└── axios (HTTP client)
Real-time & PWA:
├── laravel-echo
├── pusher-js
├── next-pwa (Service worker)
└── firebase (FCM for push notifications)
Additional:
├── next-themes (Dark mode)
├── react-hot-toast (Toast notifications)
├── date-fns (Date utilities)
├── react-markdown + rehype (Markdown render)
└── @tanstack/react-table (Data tables)


---

## 2. Database Schema (Lengkap) {#database}

### A. Core Tables

#### users
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    
    -- Profile
    nim VARCHAR(20) UNIQUE NULL,
    nip VARCHAR(20) UNIQUE NULL,
    bio TEXT NULL,
    avatar VARCHAR(255) NULL,
    cover_image VARCHAR(255) NULL,
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    
    -- Social
    github_url VARCHAR(255) NULL,
    linkedin_url VARCHAR(255) NULL,
    website_url VARCHAR(255) NULL,
    
    -- Tokens
    remember_token VARCHAR(100) NULL,
    fcm_token TEXT NULL, -- For push notifications
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_nim (nim),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
projects
CREATE TABLE projects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    content LONGTEXT NOT NULL,
    
    -- Media
    thumbnail VARCHAR(255) NULL,
    featured_image VARCHAR(255) NULL,
    
    -- Metadata
    tags JSON NULL, -- ['web', 'mobile', 'ai']
    tech_stack JSON NULL, -- ['Laravel', 'Next.js']
    category ENUM('web', 'mobile', 'desktop', 'ai-ml', 'iot', 'game', 'other') DEFAULT 'web',
    
    -- Status
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    visibility ENUM('public', 'unlisted', 'private') DEFAULT 'public',
    is_featured BOOLEAN DEFAULT FALSE,
    allow_comments BOOLEAN DEFAULT TRUE,
    
    -- Stats (cached counts)
    view_count INT UNSIGNED DEFAULT 0,
    like_count INT UNSIGNED DEFAULT 0,
    save_count INT UNSIGNED DEFAULT 0,
    comment_count INT UNSIGNED DEFAULT 0,
    share_count INT UNSIGNED DEFAULT 0,
    
    -- SEO
    meta_title VARCHAR(255) NULL,
    meta_description TEXT NULL,
    
    -- Timestamps
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_visibility (visibility),
    INDEX idx_published_at (published_at),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_search (title, description, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
B. Interaction Tables
likes
CREATE TABLE likes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    likeable_type VARCHAR(255) NOT NULL, -- App\Models\Project, App\Models\Comment
    likeable_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_like (user_id, likeable_type, likeable_id),
    INDEX idx_likeable (likeable_type, likeable_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
saves (Bookmarks)
CREATE TABLE saves (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    project_id BIGINT UNSIGNED NOT NULL,
    folder VARCHAR(100) DEFAULT 'default', -- For organizing bookmarks
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_save (user_id, project_id),
    INDEX idx_user_folder (user_id, folder)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
comments
CREATE TABLE comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    parent_id BIGINT UNSIGNED NULL, -- For nested replies
    
    -- Content
    body TEXT NOT NULL,
    
    -- Moderation
    is_approved BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE,
    
    -- Stats
    like_count INT UNSIGNED DEFAULT 0,
    reply_count INT UNSIGNED DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    
    INDEX idx_project_id (project_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
C. Collaboration Tables
collaborators
CREATE TABLE collaborators (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Role
    role ENUM('pembimbing', 'kolaborator', 'contributor') NOT NULL,
    
    -- Permissions
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    
    -- Status
    status ENUM('invited', 'accepted', 'declined') DEFAULT 'invited',
    invited_by BIGINT UNSIGNED NULL,
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_collaborator (project_id, user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
D. Challenge Tables
challenges
CREATE TABLE challenges (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL, -- Pembuat (Dosen/Admin)
    
    -- Content
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description LONGTEXT NOT NULL,
    rules TEXT NULL,
    
    -- Media
    banner VARCHAR(255) NULL,
    
    -- Requirements
    requirements JSON NULL, -- ['min_team_size' => 1, 'max_team_size' => 5]
    allowed_categories JSON NULL, -- ['web', 'mobile']
    
    -- Timeline
    start_date TIMESTAMP NULL,
    deadline TIMESTAMP NULL,
    announcement_date TIMESTAMP NULL,
    
    -- Winner
    winner_project_id BIGINT UNSIGNED NULL,
    winner_announced_at TIMESTAMP NULL,
    
    -- Stats
    participant_count INT UNSIGNED DEFAULT 0,
    submission_count INT UNSIGNED DEFAULT 0,
    
    -- Settings
    status ENUM('draft', 'open', 'closed', 'completed') DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    max_participants INT UNSIGNED NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_project_id) REFERENCES projects(id) ON DELETE SET NULL,
    
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_deadline (deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
challenge_submissions
CREATE TABLE challenge_submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    challenge_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    project_id BIGINT UNSIGNED NULL,
    
    -- Submission
    status ENUM('joined', 'submitted', 'withdrawn') DEFAULT 'joined',
    submitted_at TIMESTAMP NULL,
    
    -- Evaluation
    score DECIMAL(5,2) NULL,
    rank INT UNSIGNED NULL,
    feedback TEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_submission (challenge_id, user_id),
    INDEX idx_status (status),
    INDEX idx_rank (rank)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
E. System Tables
notifications (Laravel Built-in)
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY, -- UUID
    type VARCHAR(255) NOT NULL,
    notifiable_type VARCHAR(255) NOT NULL,
    notifiable_id BIGINT UNSIGNED NOT NULL,
    
    -- Data
    data JSON NOT NULL,
    
    -- Status
    read_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_notifiable (notifiable_type, notifiable_id),
    INDEX idx_read_at (read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
activity_log (Spatie)
CREATE TABLE activity_log (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    log_name VARCHAR(255) NULL,
    description TEXT NOT NULL,
    subject_type VARCHAR(255) NULL,
    subject_id BIGINT UNSIGNED NULL,
    causer_type VARCHAR(255) NULL,
    causer_id BIGINT UNSIGNED NULL,
    properties JSON NULL,
    batch_uuid CHAR(36) NULL,
    event VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_subject (subject_type, subject_id),
    INDEX idx_causer (causer_type, causer_id),
    INDEX idx_log_name (log_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
media (Spatie Media Library)
CREATE TABLE media (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT UNSIGNED NOT NULL,
    uuid CHAR(36) NULL,
    collection_name VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(255) NULL,
    disk VARCHAR(255) NOT NULL,
    conversions_disk VARCHAR(255) NULL,
    size BIGINT UNSIGNED NOT NULL,
    manipulations JSON NOT NULL,
    custom_properties JSON NOT NULL,
    generated_conversions JSON NOT NULL,
    responsive_images JSON NOT NULL,
    order_column INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_model (model_type, model_id),
    INDEX idx_uuid (uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
3. Backend Architecture (Laravel) {#backend}
A. Folder Structure
app/
├── Actions/              # Single-responsibility actions
│   ├── Project/
│   │   ├── CreateProjectAction.php
│   │   ├── UpdateProjectAction.php
│   │   └── DeleteProjectAction.php
│   └── Challenge/
│       ├── SubmitChallengeAction.php
│       └── AnnounceWinnerAction.php
├── DTOs/                 # Data Transfer Objects
│   ├── ProjectData.php
│   └── ChallengeData.php
├── Enums/                # PHP Enums
│   ├── ProjectStatus.php
│   ├── UserRole.php
│   └── ChallengeStatus.php
├── Events/               # Domain events
│   ├── ProjectPublished.php
│   ├── CommentPosted.php
│   └── ChallengeWinnerAnnounced.php
├── Exceptions/           # Custom exceptions
│   └── Handler.php
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       └── V1/
│   │           ├── Auth/
│   │           ├── Projects/
│   │           ├── Comments/
│   │           ├── Challenges/
│   │           └── Notifications/
│   ├── Middleware/
│   │   ├── EnsureEmailIsVerified.php
│   │   ├── CheckProjectOwnership.php
│   │   └── TrackProjectView.php
│   ├── Requests/
│   │   └── Api/
│   │       ├── StoreProjectRequest.php
│   │       └── UpdateProjectRequest.php
│   └── Resources/
│       └── Api/
│           ├── ProjectResource.php
│           ├── CommentResource.php
│           └── UserResource.php
├── Jobs/                 # Queue jobs
│   ├── SendEmailNotification.php
│   ├── SendPushNotification.php
│   └── ProcessProjectStats.php
├── Listeners/            # Event listeners
│   ├── SendCommentNotification.php
│   └── UpdateProjectStatistics.php
├── Models/
│   ├── User.php
│   ├── Project.php
│   ├── Comment.php
│   ├── Challenge.php
│   └── Traits/
│       ├── HasLikes.php
│       ├── HasSaves.php
│       └── Searchable.php
├── Notifications/
│   ├── CommentPosted.php
│   ├── ProjectLiked.php
│   └── ChallengeWinner.php
├── Observers/            # Model observers
│   ├── ProjectObserver.php
│   └── CommentObserver.php
├── Policies/
│   ├── ProjectPolicy.php
│   └── CommentPolicy.php
├── Repositories/         # Optional: Repository pattern
│   └── ProjectRepository.php
└── Services/             # Business logic services
    ├── NotificationService.php
    ├── StatisticsService.php
    └── SearchService.php
B. API Routes Structure
// routes/api.php

Route::prefix('v1')->group(function () {
    
    // Public routes
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{slug}', [ProjectController::class, 'show']);
    Route::get('/challenges', [ChallengeController::class, 'index']);
    Route::get('/challenges/{slug}', [ChallengeController::class, 'show']);
    
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/fcm-token', [AuthController::class, 'updateFcmToken']);
        });
    });
    
    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        
        // Projects
        Route::prefix('projects')->group(function () {
            Route::post('/', [ProjectController::class, 'store']);
            Route::put('/{slug}', [ProjectController::class, 'update']);
            Route::delete('/{slug}', [ProjectController::class, 'destroy']);
            
            // Project interactions
            Route::post('/{slug}/like', [ProjectController::class, 'like']);
            Route::delete('/{slug}/like', [ProjectController::class, 'unlike']);
            Route::post('/{slug}/save', [ProjectController::class, 'save']);
            Route::delete('/{slug}/save', [ProjectController::class, 'unsave']);
            Route::post('/{slug}/share', [ProjectController::class, 'share']);
            
            // Comments
            Route::get('/{slug}/comments', [CommentController::class, 'index']);
            Route::post('/{slug}/comments', [CommentController::class, 'store']);
            
            // Collaborators
            Route::get('/{slug}/collaborators', [CollaboratorController::class, 'index']);
            Route::post('/{slug}/collaborators', [CollaboratorController::class, 'store']);
            Route::delete('/{slug}/collaborators/{user}', [CollaboratorController::class, 'destroy']);
        });
        
        // Comments
        Route::prefix('comments')->group(function () {
            Route::put('/{comment}', [CommentController::class, 'update']);
            Route::delete('/{comment}', [CommentController::class, 'destroy']);
            Route::post('/{comment}/like', [CommentController::class, 'like']);
        });
        
        // Challenges
        Route::prefix('challenges')->group(function () {
            Route::middleware('role:dosen|admin')->group(function () {
                Route::post('/', [ChallengeController::class, 'store']);
                Route::put('/{slug}', [ChallengeController::class, 'update']);
                Route::delete('/{slug}', [ChallengeController::class, 'destroy']);
                Route::post('/{slug}/announce-winner', [ChallengeController::class, 'announceWinner']);
            });
            
            Route::middleware('role:mahasiswa')->group(function () {
                Route::post('/{slug}/join', [ChallengeController::class, 'join']);
                Route::post('/{slug}/submit', [ChallengeController::class, 'submit']);
                Route::delete('/{slug}/withdraw', [ChallengeController::class, 'withdraw']);
            });
            
            Route::get('/{slug}/submissions', [ChallengeController::class, 'submissions']);
        });
        
        // Notifications
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
            Route::post('/mark-all-read', [NotificationController::class, 'markAllRead']);
            Route::post('/{id}/mark-read', [NotificationController::class, 'markRead']);
            Route::delete('/{id}', [NotificationController::class, 'destroy']);
        });
        
        // Dashboard
        Route::prefix('dashboard')->group(function () {
            Route::get('/stats', [DashboardController::class, 'stats']);
            Route::get('/my-projects', [DashboardController::class, 'myProjects']);
            Route::get('/saved-projects', [DashboardController::class, 'savedProjects']);
            Route::get('/my-challenges', [DashboardController::class, 'myChallenges']);
        });
        
        // Profile
        Route::prefix('profile')->group(function () {
            Route::get('/', [ProfileController::class, 'show']);
            Route::put('/', [ProfileController::class, 'update']);
            Route::post('/avatar', [ProfileController::class, 'updateAvatar']);
            Route::post('/cover', [ProfileController::class, 'updateCover']);
            Route::put('/settings', [ProfileController::class, 'updateSettings']);
        });
        
        // Admin routes
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::apiResource('users', UserController::class);
            Route::post('/projects/{slug}/feature', [AdminProjectController::class, 'feature']);
            Route::post('/challenges/{slug}/feature', [AdminChallengeController::class, 'feature']);
        });
    });
});

// Broadcasting authentication
Broadcast::routes(['middleware' => ['auth:sanctum']]);
C. Key Services Implementation
NotificationService.php
<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\CommentPosted;
use Illuminate\Support\Facades\Notification;

class NotificationService
{
    public function notifyProjectCollaborators($project, $notification, $except = null)
    {
        $recipients = collect([$project->user])
            ->merge($project->collaborators->pluck('user'))
            ->filter(fn($user) => $user->id !== $except?->id)
            ->filter(fn($user) => $user->email_notifications)
            ->unique('id');
        
        Notification::send($recipients, $notification);
    }
    
    public function notifyChallengeParticipants($challenge, $notification)
    {
        $participants = User::whereHas('challengeSubmissions', function ($query) use ($challenge) {
            $query->where('challenge_id', $challenge->id);
        })->where('push_notifications', true)->get();
        
        Notification::send($participants, $notification);
    }
}
D. Real-time Broadcasting Setup
// config/broadcasting.php
'connections' => [
    'pusher' => [
        'driver' => 'pusher',
        'key' => env('PUSHER_APP_KEY'),
        'secret' => env('PUSHER_APP_SECRET'),
        'app_id' => env('PUSHER_APP_ID'),
        'options' => [
            'cluster' => env('PUSHER_APP_CLUSTER'),
            'encrypted' => true,
            'host' => env('SOKETI_HOST', '127.0.0.1'),
            'port' => env('SOKETI_PORT', 6001),
            'scheme' => env('SOKETI_SCHEME', 'http'),
        ],
    ],
],

// Broadcasting Event Example
// app/Events/CommentPosted.php
class CommentPosted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    
    public function __construct(public Comment $comment) {}
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.' . $this->comment->project->user_id),
            new PrivateChannel('project.' . $this->comment->project_id),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'comment.posted';
    }
    
    public function broadcastWith(): array
    {
        return [
            'comment' => new CommentResource($this->comment),
        ];
    }
}
4. Frontend Architecture (Next.js) {#frontend}
A. Folder Structure
src/
├── app/                          # App Router
│   ├── (auth)/                   # Auth layout group
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (main)/                   # Main layout group
│   │   ├── page.tsx              # Home
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       ├── page.tsx
│   │   │       └── loading.tsx
│   │   ├── challenges/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── profile/
│   │   │   └── [username]/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Dashboard layout group
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── my-projects/
│   │   │   ├── saved/
│   │   │   ├── challenges/
│   │   │   └── settings/
│   │   └── layout.tsx
│   ├── (admin)/                  # Admin layout group
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── users/
│   │   │   ├── projects/
│   │   │   └── challenges/
│   │   └── layout.tsx
│   ├── api/                      # API routes (optional)
│   │   └── upload/route.ts
│   ├── error.tsx
│   ├── not-found.tsx
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   ├── footer.tsx
│   │   └── breadcrumb.tsx        # ⭐ Global breadcrumb
│   ├── projects/
│   │   ├── project-card.tsx
│   │   ├── project-detail.tsx
│   │   ├── project-form.tsx
│   │   └── project-stats.tsx
│   ├── comments/
│   │   ├── comment-list.tsx
│   │   ├── comment-item.tsx
│   │   └── comment-form.tsx
│   ├── challenges/
│   │   ├── challenge-card.tsx
│   │   ├── challenge-detail.tsx
│   │   └── submission-list.tsx
│   ├── notifications/
│   │   ├── notification-bell.tsx
│   │   ├── notification-list.tsx
│   │   └── notification-item.tsx
│   └── providers/
│       ├── query-provider.tsx
│       ├── theme-provider.tsx
│       └── echo-provider.tsx     # Real-time provider
);
        return regex.test(pathname);
      }) || pathname;

      config = breadcrumbConfig[matchedRoute];
    }

    if (!config) {
      // Fallback: auto-generate from pathname
      const segments = pathname.split('/').filter(Boolean);
      const autoItems = [
        { label: 'Home', href: '/' },
        ...segments.map((segment, index) => ({
          label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
          href: index === segments.length - 1 ? undefined : '/' + segments.slice(0, index + 1).join('/'),
        })),
      ];
      setItems(autoItems);
      return;
    }

    // Process breadcrumb items
    const items = config.items.map((item) => {
      if (item.dynamic && config.dynamic && dynamicData) {
        const dynamicKey = Object.keys(config.dynamic)[0];
        const dynamicFn = config.dynamic[dynamicKey];
        return dynamicFn(dynamicData);
      }
      return item;
    });

    setItems(items);
  }, [pathname, dynamicData, setItems]);
}
D. Breadcrumb Component
// components/layout/breadcrumb.tsx

'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useBreadcrumbStore } from '@/lib/stores/breadcrumb-store';
import { cn } from '@/lib/utils/cn';

export function Breadcrumb() {
  const items = useBreadcrumbStore((state) => state.items);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}
              
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {index === 0 && <Home className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1.5',
                    isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                >
                  {index === 0 && <Home className="h-4 w-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
E. Usage Examples
// app/(main)/projects/[slug]/page.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { projectApi } from '@/lib/api/projects';
import { useBreadcrumb } from '@/lib/hooks/use-breadcrumb';
import { Breadcrumb } from '@/components/layout/breadcrumb';

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const { data: project } = useQuery({
    queryKey: ['project', params.slug],
    queryFn: () => projectApi.getBySlug(params.slug),
  });

  // Set breadcrumb with dynamic data
  useBreadcrumb(project);

  return (
    <div className="container mx-auto py-8">
      <Breadcrumb />
      {/* Rest of the page */}
    </div>
  );
}
// app/(dashboard)/dashboard/my-projects/edit/[slug]/page.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { projectApi } from '@/lib/api/projects';
import { useBreadcrumb } from '@/lib/hooks/use-breadcrumb';
import { Breadcrumb } from '@/components/layout/breadcrumb';

export default function EditProjectPage({ params }: { params: { slug: string } }) {
  const { data: project } = useQuery({
    queryKey: ['project', params.slug],
    queryFn: () => projectApi.getBySlug(params.slug),
  });

  useBreadcrumb(project);

  return (
    <div className="container mx-auto py-8">
      <Breadcrumb />
      {/* Edit form */}
    </div>
  );
}
6. Security & Best Practices {#security}
A. Backend Security
// 1. API Rate Limiting
// app/Http/Kernel.php

protected $middlewareGroups = [
    'api' => [
        'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],
];

// config/sanctum.php
'limiter' => function (Request $request) {
    return $request->user()
        ? Limit::perMinute(60)->by($request->user()->id)
        : Limit::perMinute(10)->by($request->ip());
},

// 2. CORS Configuration
// config/cors.php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];

// 3. Input Validation & Sanitization
// app/Http/Requests/StoreProjectRequest.php

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'content' => 'required|string|max:50000',
            'tags' => 'nullable|array|max:10',
            'tags.*' => 'string|max:50',
            'tech_stack' => 'nullable|array|max:20',
            'tech_stack.*' => 'string|max:50',
            'category' => 'required|in:web,mobile,desktop,ai-ml,iot,game,other',
            'visibility' => 'required|in:public,unlisted,private',
            'allow_comments' => 'boolean',
            'collaborators' => 'nullable|array|max:10',
            'collaborators.*.user_id' => 'required|exists:users,id',
            'collaborators.*.role' => 'required|in:pembimbing,kolaborator,contributor',
        ];
    }

    protected function prepareForValidation()
    {
        // Sanitize HTML content
        $this->merge([
            'content' => strip_tags(
                $this->content,
                '<p><br><strong><em><ul><ol><li><a><code><pre><h1><h2><h3>'
            ),
        ]);
    }
}

// 4. SQL Injection Prevention (Always use Eloquent/Query Builder)
// ❌ NEVER do this:
DB::raw("SELECT * FROM users WHERE email = '{$email}'");

// ✅ ALWAYS do this:
User::where('email', $email)->first();

// 5. XSS Prevention
// Always escape output in Blade (done automatically)
// For API responses, use Resource classes

// 6. CSRF Protection
// Already handled by Sanctum for SPA

// 7. Authorization Policies
// app/Policies/ProjectPolicy.php

class ProjectPolicy
{
    public function view(User $user, Project $project): bool
    {
        if ($project->visibility === 'public') return true;
        if ($project->visibility === 'unlisted') return true;
        
        return $user->id === $project->user_id
            || $project->collaborators->contains('user_id', $user->id);
    }

    public function update(User $user, Project $project): bool
    {
        if ($user->id === $project->user_id) return true;
        
        return $project->collaborators()
            ->where('user_id', $user->id)
            ->where('can_edit', true)
            ->exists();
    }

    public function delete(User $user, Project $project): bool
    {
        return $user->id === $project->user_id;
    }
}
B. Frontend Security
// 1. Environment Variables
// .env.local (NEVER commit this file)

NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=mt1
# Never expose sensitive keys with NEXT_PUBLIC_ prefix

// 2. API Client with Interceptors
// lib/api/client.ts

import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // For cookies/sessions
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 419) {
      // CSRF token mismatch
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/sanctum/csrf-cookie`);
      return apiClient.request(error.config);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// 3. XSS Prevention
// lib/utils/sanitize.ts

import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'code', 'pre', 'h1', 'h2', 'h3'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

// Usage in component
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.content) }} />

// 4. Protected Routes
// lib/hooks/use-auth.ts

export function useAuth() {
  const router = useRouter();
  const token = localStorage.getItem('auth_token');
  
  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);
  
  return { isAuthenticated: !!token };
}

// Usage in page
export default function DashboardPage() {
  useAuth(); // Will redirect if not authenticated
  // ...
}

// 5. Content Security Policy (CSP)
// next.config.js

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },
};
7. Performance Optimization {#performance}
A. Backend Optimization
// 1. Database Indexing (Already in schema above)
// Monitor with: EXPLAIN SELECT ...

// 2. Eager Loading (N+1 Prevention)
// ❌ BAD
$projects = Project::all();
foreach ($projects as $project) {
    echo $project->user->name; // N+1 query
}

// ✅ GOOD
$projects = Project::with('user', 'collaborators', 'likes')->get();

// 3. Query Optimization
// app/Http/Controllers/Api/V1/Projects/ProjectController.php

public function index(Request $request)
{
    $projects = Project::query()
        ->select([
            'id', 'user_id', 'title', 'slug', 'description',
            'thumbnail', 'category', 'status', 'visibility',
            'view_count', 'like_count', 'comment_count',
            'published_at', 'created_at'
        ]) // Only select needed columns
        ->with([
            'user:id,name,avatar',
            'collaborators:id,project_id,user_id,role',
            'collaborators.user:id,name,avatar',
        ])
        ->where('status', 'published')
        ->where('visibility', 'public')
        ->when($request->category, fn($q, $cat) => $q->where('category', $cat))
        ->when($request->search, function($q, $search) {
            $q->whereFullText(['title', 'description', 'content'], $search);
        })
        ->latest('published_at')
        ->paginate(12);

    return ProjectResource::collection($projects);
}

// 4. Caching Strategy
// app/Services/ProjectService.php

use Illuminate\Support\Facades\Cache;

class ProjectService
{
    public function getFeaturedProjects()
    {
        return Cache::remember('featured_projects', 3600, function () {
            return Project::where('is_featured', true)
                ->where('status', 'published')
                ->with('user:id,name,avatar')
                ->limit(6)
                ->get();
        });
    }
    
    public function getProjectStats(Project $project)
    {
        return Cache::remember("project_stats_{$project->id}", 300, function () use ($project) {
            return [
                'views' => $project->view_count,
                'likes' => $project->likes()->count(),
                'saves' => $project->saves()->count(),
                'comments' => $project->comments()->count(),
            ];
        });
    }
}

// 5. Queue Jobs for Heavy Tasks
// app/Jobs/ProcessProjectStats.php

class ProcessProjectStats implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        Project::chunk(100, function ($projects) {
            foreach ($projects as $project) {
                $project->update([
                    'like_count' => $project->likes()->count(),
                    'save_count' => $project->saves()->count(),
                    'comment_count' => $project->comments()->count(),
                ]);
            }
        });
    }
}

// 6. API Response Optimization
// app/Http/Resources/ProjectResource.php

class ProjectResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'thumbnail' => $this->thumbnail,
            'category' => $this->category,
            'tags' => $this->tags,
            'author' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'avatar' => $this->user->avatar,
            ],
            'stats' => [
                'views' => $this->view_count,
                'likes' => $this->like_count,
                'comments' => $this->comment_count,
            ],
            'published_at' => $this->published_at?->toISOString(),
            
            // Conditional fields
            'content' => $this->when($request->routeIs('projects.show'), $this->content),
            'collaborators' => CollaboratorResource::collection(
                $this->whenLoaded('collaborators')
            ),
        ];
    }
}
B. Frontend Optimization
// 1. Image Optimization
// components/projects/project-card.tsx

import Image from 'next/image';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="card">
      <Image
        src={project.thumbnail || '/placeholder.jpg'}
        alt={project.title}
        width={400}
        height={300}
        className="rounded-t-lg object-cover"
        placeholder="blur"
        blurDataURL="/placeholder-blur.jpg"
        loading="lazy"
      />
      {/* ... */}
    </div>
  );
}

// 2. Code Splitting & Lazy Loading
// app/(main)/projects/[slug]/page.tsx

import dynamic from 'next/dynamic';

const CommentSection = dynamic(
  () => import('@/components/comments/comment-section'),
  {
    loading: () => <div>Loading comments...</div>,
    ssr: false, // Only load on client
  }
);

const ShareButtons = dynamic(
  () => import('@/components/projects/share-buttons'),
  { ssr: false }
);

// 3. Data Fetching Optimization
// lib/api/projects.ts

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export function useProjects(filters?: ProjectFilters) {
  return useInfiniteQuery({
    queryKey: ['projects', filters],
    queryFn: ({ pageParam = 1 }) => 
      projectApi.getAll({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.meta.next_page,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

// 4. Debouncing & Throttling
// components/search/search-input.tsx

import { useDebouncedCallback } from 'use-debounce';

export function SearchInput() {
  const [search, setSearch] = useState('');
  
  const debouncedSearch = useDebouncedCallback((value: string) => {
    // API call here
    searchProjects(value);
  }, 500);

  return (
    <input
      type="search"
      onChange={(e) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
      }}
    />
  );
}

// 5. Virtual Scrolling for Large Lists
// components/projects/project-list.tsx

import { useVirtualizer } from '@tanstack/react-virtual';

export function ProjectList({ projects }: { projects: Project[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: projects.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 350,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ProjectCard project={projects[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}

// 6. Service Worker & PWA
// next.config.js

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.ignitepad\.com\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
});

module.exports = withPWA(nextConfig);
8. Testing Strategy {#testing}
A. Backend Testing
// 1. Feature Tests
// tests/Feature/ProjectTest.php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_project()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/projects', [
                'title' => 'My Project',
                'content' => 'Project content here',
                'category' => 'web',
                'visibility' => 'public',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id', 'title', 'slug', 'author', 'created_at'
                ]
            ]);

        $this->assertDatabaseHas('projects', [
            'title' => 'My Project',
            'user_id' => $user->id,
        ]);
    }

    public function test_user_cannot_update_others_project()
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $project = Project::factory()->for($owner)->create();

        $response = $this->actingAs($other, 'sanctum')
            ->putJson("/api/v1/projects/{$project->slug}", [
                'title' => 'Updated Title',
            ]);

        $response->assertStatus(403);
    }

    public function test_collaborator_can_edit_project_if_permitted()
    {
        $owner = User::factory()->create();
        $collaborator = User::factory()->create();
        $project = Project::factory()->for($owner)->create();
        
        $project->collaborators()->create([
            'user_id' => $collaborator->id,
            'role' => 'kolaborator',
            'can_edit' => true,
            'status' => 'accepted',
        ]);

        $response = $this->actingAs($collaborator, 'sanctum')
            ->putJson("/api/v1/projects/{$project->slug}", [
                'title' => 'Updated by Collaborator',
            ]);

        $response->assertStatus(200);
    }

    public function test_project_view_count_increments()
    {
        $project = Project::factory()->create(['view_count' => 5]);

        $response = $this->getJson("/api/v1/projects/{$project->slug}");

        $response->assertStatus(200);
        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'view_count' => 6,
        ]);
    }
}

// 2. Unit Tests
// tests/Unit/ProjectTest.php

class ProjectTest extends TestCase
{
    public function test_project_generates_slug_from_title()
    {
        $project = new Project();
        $project->title = 'My Awesome Project';
        $project->generateSlug();

        $this->assertEquals('my-awesome-project', $project->slug);
    }

    public function test_project_belongs_to_user()
    {
        $user = User::factory()->create();
        $project = Project::factory()->for($user)->create();

        $this->assertInstanceOf(User::class, $project->user);
        $this->assertEquals($user->id, $project->user->id);
    }

    public function test_project_has_many_comments()
    {
        $project = Project::factory()->create();
        $comments = Comment::factory()->count(3)->for($project)->create();

        $this->assertCount(3, $project->comments);
    }
}

// 3. Integration Tests
// tests/Feature/CommentNotificationTest.php

class CommentNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_owner_receives_notification_on_comment()
    {
        Notification::fake();

        $owner = User::factory()->create();
        $commenter = User::factory()->create();
        $project = Project::factory()->for($owner)->create();

        $this->actingAs($commenter, 'sanctum')
            ->postJson("/api/v1/projects/{$project->slug}/comments", [
                'body' => 'Great project!',
            ]);

        Notification::assertSentTo(
            $owner,
            \App\Notifications\CommentPosted::class
        );
    }

    public function test_collaborators_receive_notification_on_comment()
    {
        Notification::fake();

        $owner = User::factory()->create();
        $collaborator = User::factory()->create();
        $commenter = User::factory()->create();
        
        $project = Project::factory()->for($owner)->create();
        $project->collaborators()->create([
            'user_id' => $collaborator->id,
            'role' => 'pembimbing',
            'status' => 'accepted',
        ]);

        $this->actingAs($commenter, 'sanctum')
            ->postJson("/api/v1/projects/{$project->slug}/comments", [
                'body' => 'Nice work!',
            ]);

        Notification::assertSentTo(
            [$owner, $collaborator],
            \App\Notifications\CommentPosted::class
        );
    }
}

// 4. API Tests
// tests/Feature/Api/ProjectApiTest.php

class ProjectApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_filter_projects_by_category()
    {
        Project::factory()->create(['category' => 'web', 'status' => 'published']);
        Project::factory()->create(['category' => 'mobile', 'status' => 'published']);
        Project::factory()->create(['category' => 'web', 'status' => 'published']);

        $response = $this->getJson('/api/v1/projects?category=web');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_can_search_projects()
    {
        Project::factory()->create([
            'title' => 'Laravel API Tutorial',
            'status' => 'published'
        ]);
        Project::factory()->create([
            'title' => 'React Dashboard',
            'status' => 'published'
        ]);

        $response = $this->getJson('/api/v1/projects?search=Laravel');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.title', 'Laravel API Tutorial');
    }

    public function test_pagination_works()
    {
        Project::factory()->count(25)->create(['status' => 'published']);

        $response = $this->getJson('/api/v1/projects?page=1');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'links',
                'meta' => ['current_page', 'last_page', 'per_page', 'total']
            ]);
    }
}
B. Frontend Testing
// 1. Component Tests (Jest + React Testing Library)
// components/projects/__tests__/project-card.test.tsx

import { render, screen } from '@testing-library/react';
import { ProjectCard } from '../project-card';

const mockProject = {
  id: 1,
  title: 'Test Project',
  slug: 'test-project',
  description: 'Test description',
  thumbnail: '/test.jpg',
  category: 'web',
  author: {
    id: 1,
    name: 'John Doe',
    avatar: '/avatar.jpg',
  },
  stats: {
    views: 100,
    likes: 10,
    comments: 5,
  },
  published_at: '2024-01-01T00:00:00Z',
};

describe('ProjectCard', () => {
  it('renders project information correctly', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays project stats', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText('100')).toBeInTheDocument(); // views
    expect(screen.getByText('10')).toBeInTheDocument(); // likes
    expect(screen.getByText('5')).toBeInTheDocument(); // comments
  });

  it('links to project detail page', () => {
    render(<ProjectCard project={mockProject} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/projects/test-project');
  });
});

// 2. Hook Tests
// lib/hooks/__tests__/use-project.test.tsx

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProject } from '../use-project';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useProject', () => {
  it('fetches project data', async () => {
    const { result } = renderHook(() => useProject('test-slug'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveProperty('title');
    expect(result.current.data).toHaveProperty('slug');
  });

  it('handles error state', async () => {
    const { result } = renderHook(() => useProject('invalid-slug'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// 3. Integration Tests (Playwright)
// e2e/project-flow.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Project Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('user can create a new project', async ({ page }) => {
    await page.goto('/dashboard/my-projects/create');

    await page.fill('[name="title"]', 'E2E Test Project');
    await page.fill('[name="description"]', 'This is a test project');
    await page.fill('[name="content"]', 'Project content goes here');
    await page.selectOption('[name="category"]', 'web');
    
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/projects\/e2e-test-project/);
    await expect(page.locator('h1')).toContainText('E2E Test Project');
  });

  test('user can like a project', async ({ page }) => {
    await page.goto('/projects/test-project');

    const likeButton = page.locator('button:has-text("Like")');
    const initialCount = await likeButton.locator('.count').textContent();

    await likeButton.click();
    await page.waitForTimeout(500);

    const newCount = await likeButton.locator('.count').textContent();
    expect(Number(newCount)).toBe(Number(initialCount) + 1);
  });

  test('user can comment on a project', async ({ page }) => {
    await page.goto('/projects/test-project');

    await page.fill('[name="comment"]', 'Great project!');
    await page.click('button:has-text("Post Comment")');

    await expect(page.locator('.comment-item')).toContainText('Great project!');
  });

  test('breadcrumb navigation works', async ({ page }) => {
    await page.goto('/projects/test-project');

    // Check breadcrumb
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toContainText('Home');
    await expect(breadcrumb).toContainText('Projects');
    await expect(breadcrumb).toContainText('Test Project');

    // Click breadcrumb link
    await breadcrumb.locator('a:has-text("Projects")').click();
    await expect(page).toHaveURL('/projects');
  });
});

// 4. API Mocking (MSW)
// lib/mocks/handlers.ts

import { rest } from 'msw';

export const handlers = [
  rest.get('/api/v1/projects', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: 1,
            title: 'Mock Project 1',
            slug: 'mock-project-1',
            // ... other fields
          },
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 12,
          total: 1,
        },
      })
    );
  }),

  rest.get('/api/v1/projects/:slug', (req, res, ctx) => {
    const { slug } = req.params;
    
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          id: 1,
          title: 'Mock Project',
          slug: slug,
          content: 'Mock content',
          // ... other fields
        },
      })
    );
  }),

  rest.post('/api/v1/projects/:slug/comments', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        data: {
          id: 1,
          body: 'Mock comment',
          user: {
            id: 1,
            name: 'Test User',
          },
          created_at: new Date().toISOString(),
        },
      })
    );
  }),
];

// lib/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// jest.setup.ts
import { server } from './lib/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
9. Deployment & DevOps {#deployment}
A. Backend Deployment
# .github/workflows/backend-deploy.yml

name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, pdo, pdo_mysql, redis
          
      - name: Install Dependencies
        run: composer install --no-interaction --prefer-dist --optimize-autoloader
        
      - name: Run Tests
        run: php artisan test
        env:
          DB_CONNECTION: sqlite
          DB_DATABASE: ':memory:'

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/ignitepad-api
            git pull origin main
            composer install --no-dev --optimize-autoloader
            php artisan migrate --force
            php artisan config:cache
            php artisan route:cache
            php artisan view:cache
            php artisan queue:restart
            sudo systemctl restart php8.2-fpm
            sudo systemctl restart nginx

# Docker Setup
# backend/Dockerfile

FROM php:8.2-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nginx \
    supervisor

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage

# Copy supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose port
EXPOSE 9000

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# docker-compose.yml
version: '3.8'

services:
  app:
    build: ./backend
    container_name: ignitepad-api
    restart: unless-stopped
    environment:
      - DB_HOST=mysql
      - REDIS_HOST=redis
    volumes:
      - ./backend:/var/www
      - ./backend/storage:/var/www/storage
    networks:
      - ignitepad

  mysql:
    image: mysql:8.0
    container_name: ignitepad-mysql
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: ignitepad
      MYSQL_ROOT_PASSWORD: secret
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - ignitepad

  redis:
    image: redis:alpine
    container_name: ignitepad-redis
    restart: unless-stopped
    networks:
      - ignitepad

  soketi:
    image: quay.io/soketi/soketi:latest
    container_name: ignitepad-soketi
    restart: unless-stopped
    ports:
      - "6001:6001"
    environment:
      SOKETI_DEFAULT_APP_ID: app-id
      SOKETI_DEFAULT_APP_KEY: app-key
      SOKETI_DEFAULT_APP_SECRET: app-secret
    networks:
      - ignitepad

  nginx:
    image: nginx:alpine
    container_name: ignitepad-nginx
    restart: unless-stopped
    ports:
      - "8000:80"
    volumes:
      - ./backend:/var/www
      - ./docker/nginx.conf:/etc/nginx/conf.d/default.conf
    networks:
      - ignitepad

volumes:
  mysql_data:

networks:
  ignitepad:
    driver: bridge
B. Frontend Deployment
# .github/workflows/frontend-deploy.yml

name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Run Linter
        run: npm run lint
        
      - name: Run Tests
        run: npm run test
        
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

# Alternative: Docker deployment
# frontend/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]

# next.config.js (for standalone output)
module.exports = {
  output: 'standalone',
  // ... other config
};
10. Monitoring & Logging {#monitoring}
A. Backend Monitoring
// config/logging.php

'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['daily', 'slack'],
        'ignore_exceptions' => false,
    ],

    'daily' => [
        'driver' => 'daily',
        'path' => storage_path('logs/laravel.log'),
        'level' => env('LOG_LEVEL', 'debug'),
        'days' => 14,
    ],

    'slack' => [
        'driver' => 'slack',
        'url' => env('LOG_SLACK_WEBHOOK_URL'),
        'username' => 'Ignitepad Logger',
        'level' => 'error',
    ],
],

// app/Exceptions/Handler.php

use Illuminate\Support\Facades\Log;
use Sentry\Laravel\Integration;

class Handler extends ExceptionHandler
{
    public function register()
    {
        $this->reportable(function (Throwable $e) {
            if (app()->bound('sentry') && $this->shouldReport($e)) {
                app('sentry')->captureException($e);
            }
        });
    }

    public function render($request, Throwable $e)
    {
        if ($request->is('api/*')) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => [],
            ], $this->getStatusCode($e));
        }

        return parent::render($request, $e);
    }
}

// Laravel Telescope (Development)
// composer require laravel/telescope --dev
// php artisan telescope:install
B. Frontend Monitoring
// lib/monitoring/sentry.ts

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// lib/monitoring/analytics.ts

import { Analytics } from '@vercel/analytics/react';

export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    // Google Analytics
    window.gtag?.('event', event, properties);
    
    // Custom analytics
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties, timestamp: new Date() }),
    });
  }
}

// Usage in components
import { trackEvent } from '@/lib/monitoring/analytics';

export function ProjectCard({ project }) {
  const handleClick = () => {
    trackEvent('project_viewed', {
      project_id: project.id,
      project_title: project.title,
    });
  };

  return <div onClick={handleClick}>...</div>;
}
11. Additional Best Practices {#additional}
A. API Versioning
// routes/api.php

Route::prefix('v1')->group(function () {
    // V1 routes
});

Route::prefix('v2')->group(function () {
    // V2 routes (when needed)
});

// app/Http/Controllers/Api/V1/...
// app/Http/Controllers/Api/V2/...
B. Rate Limiting
// app/Http/Kernel.php

protected $middlewareGroups = [
    'api' => [
        \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
    ],
];

// Custom rate limits
// app/Providers/RouteServiceProvider.php

RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

RateLimiter::for('uploads', function (Request $request) {
    return Limit::perMinute(10)->by($request->user()->id);
});

// Usage in routes
Route::middleware(['throttle:uploads'])->post('/upload', ...);
C. Database Backup
# config/backup.php (spatie/laravel-backup)

composer require spatie/laravel-backup

php artisan backup:run --only-db

# Schedule in app/Console/Kernel.php
$schedule->command('backup:clean')->daily()->at('01:00');
$schedule->command('backup:run --only-db')->daily()->at('02:00');
D. Environment Management
# .env.example

APP_NAME=Ignitepad
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://ignitepad.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ignitepad
DB_USERNAME=root
DB_PASSWORD=

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1

MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=

SENTRY_LARAVEL_DSN=
12. Development Workflow {#workflow}
Git Workflow
# Branch naming convention
feature/nama-fitur
bugfix/nama-bug
hotfix/nama-hotfix
release/v1.0.0

# Commit message convention
feat: add comment system
fix: resolve authentication bug
docs: update API documentation
style: format code with prettier
refactor: restructure project service
test: add unit tests for comments
chore: update dependencies
Code Quality Tools
// package.json

{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run type-check && npm run test"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
13. Kesimpulan & Checklist
✅ Backend Checklist
[ ] Setup Laravel 12 dengan API-only mode
[ ] Install & configure Sanctum untuk autentikasi
[ ] Install Spatie packages (permission, media-library, sluggable, activitylog)
[ ] Buat migration untuk semua tabel (users, projects, comments, dll)
[ ] Setup seeder untuk roles & permissions
[ ] Buat Model dengan relations lengkap
[ ] Buat Policy untuk authorization
[ ] Buat Request classes untuk validation
[ ] Buat Resource classes untuk API transformation
[ ] Buat Controller dengan CRUD lengkap
[ ] Setup Laravel Echo + Soketi untuk WebSocket
[ ] Buat Notification classes
[ ] Buat Queue jobs untuk background tasks
[ ] Setup caching strategy
[ ] Implement API rate limiting
[ ] Tulis unit & feature tests
[ ] Setup CI/CD pipeline
[ ] Configure logging & monitoring
✅ Frontend Checklist
[ ] Setup Next.js 14 dengan App Router & TypeScript
[ ] Install shadcn/ui components
[ ] Setup Tailwind CSS & custom theme
[ ] Konfigurasi axios untuk API client
[ ] Setup TanStack Query untuk data fetching
[ ] Setup Zustand untuk client state
[ ] Implement breadcrumb system (config, store, hook, component)
[ ] Buat layout components (navbar, sidebar, footer)
[ ] Buat reusable UI components
[ ] Implement authentication flow
[ ] Buat halaman projects (list, detail, create, edit)
[ ] Buat sistem komentar
[ ] Buat halaman challenges
[ ] Implement notifikasi real-time dengan Laravel Echo
[ ] Setup PWA dengan next-pwa
[ ] Implement image optimization
[ ] Setup error boundary & loading states
[ ] Tulis component & integration tests
[ ] Setup E2E tests dengan Playwright
[ ] Implement analytics tracking
[ ] Configure Sentry untuk error monitoring
[ ] Setup CI/CD pipeline
🎯 Key Features Priority
Phase 1 (MVP):

Autentikasi & Authorization
CRUD Projects
Breadcrumb System
Basic UI/UX
Phase 2:

Sistem Komentar
Like & Save
Kolaborasi (Pembimbing & Kolaborator)
Notifikasi In-App
Phase 3:

Challenges System
Real-time Notifications
PWA & Push Notifications
Search & Filter Advanced
Phase 4:

Analytics Dashboard
Admin Panel
Activity Log
Performance Optimization
📚 Resources & Documentation
Laravel: https://laravel.com/docs
Next.js: https://nextjs.org/docs
Sanctum: https://laravel.com/docs/sanctum
Spatie Packages: https://spatie.be/docs
shadcn/ui: https://ui.shadcn.com
TanStack Query: https://tanstack.com/query/latest
Laravel Echo: https://laravel.com/docs/broadcasting
Soketi: https://docs.soketi.app
14. File Structure Lengkap (Ringkasan)
Backend (Laravel)
ignitepad-backend/
├── app/
│   ├── Actions/              # Single-action classes
│   ├── DTOs/                 # Data Transfer Objects
│   ├── Enums/                # PHP 8.2 Enums
│   ├── Events/               # Event classes
│   ├── Exceptions/           # Custom exceptions
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/V1/
│   │   ├── Middleware/
│   │   ├── Requests/
│   │   └── Resources/
│   ├── Jobs/                 # Queue jobs
│   ├── Listeners/            # Event listeners
│   ├── Models/
│   ├── Notifications/
│   ├── Observers/
│   ├── Policies/
│   └── Services/
├── bootstrap/
├── config/
│   ├── app.php
│   ├── broadcasting.php
│   ├── cors.php
│   ├── database.php
│   ├── permission.php        # Spatie
│   └── sanctum.php
├── database/
│   ├── factories/
│   ├── migrations/
│   │   ├── 2024_01_01_000000_create_users_table.php
│   │   ├── 2024_01_01_000001_create_projects_table.php
│   │   ├── 2024_01_01_000002_create_comments_table.php
│   │   ├── 2024_01_01_000003_create_likes_table.php
│   │   ├── 2024_01_01_000004_create_saves_table.php
│   │   ├── 2024_01_01_000005_create_collaborators_table.php
│   │   ├── 2024_01_01_000006_create_challenges_table.php
│   │   ├── 2024_01_01_000007_create_challenge_submissions_table.php
│   │   ├── 2024_01_01_000008_create_notifications_table.php
│   │   └── 2024_01_01_000009_create_permission_tables.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── RoleSeeder.php
│       └── UserSeeder.php
├── public/
├── resources/
├── routes/
│   ├── api.php
│   ├── channels.php          # Broadcasting channels
│   └── console.php
├── storage/
│   ├── app/
│   │   ├── public/
│   │   └── uploads/
│   ├── framework/
│   └── logs/
├── tests/
│   ├── Feature/
│   │   ├── Api/
│   │   │   ├── ProjectApiTest.php
│   │   │   ├── CommentApiTest.php
│   │   │   └── ChallengeApiTest.php
│   │   ├── ProjectTest.php
│   │   └── CommentNotificationTest.php
│   └── Unit/
│       ├── ProjectTest.php
│       └── UserTest.php
├── .env.example
├── .gitignore
├── artisan
├── composer.json
├── phpunit.xml
└── README.md
Frontend (Next.js)
ignitepad-frontend/
├── public/
│   ├── images/
│   ├── icons/
│   ├── manifest.json
│   └── sw.js                # Service Worker
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (main)/
│   │   │   ├── page.tsx                    # Home
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── loading.tsx
│   │   │   ├── challenges/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── profile/[username]/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── my-projects/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── create/page.tsx
│   │   │   │   │   └── edit/[slug]/page.tsx
│   │   │   │   ├── saved/page.tsx
│   │   │   │   ├── challenges/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (admin)/
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── users/page.tsx
│   │   │   │   ├── projects/page.tsx
│   │   │   │   └── challenges/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   └── upload/route.ts
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                           # shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ... (30+ components)
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── breadcrumb.tsx            # ⭐
│   │   │   └── mobile-nav.tsx
│   │   ├── projects/
│   │   │   ├── project-card.tsx
│   │   │   ├── project-grid.tsx
│   │   │   ├── project-detail.tsx
│   │   │   ├── project-form.tsx
│   │   │   ├── project-stats.tsx
│   │   │   ├── project-sidebar.tsx
│   │   │   └── share-buttons.tsx
│   │   ├── comments/
│   │   │   ├── comment-section.tsx
│   │   │   ├── comment-list.tsx
│   │   │   ├── comment-item.tsx
│   │   │   ├── comment-form.tsx
│   │   │   └── comment-reply.tsx
│   │   ├── challenges/
│   │   │   ├── challenge-card.tsx
│   │   │   ├── challenge-detail.tsx
│   │   │   ├── challenge-form.tsx
│   │   │   ├── submission-list.tsx
│   │   │   └── winner-badge.tsx
│   │   ├── notifications/
│   │   │   ├── notification-bell.tsx
│   │   │   ├── notification-dropdown.tsx
│   │   │   ├── notification-list.tsx
│   │   │   └── notification-item.tsx
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── protected-route.tsx
│   │   └── providers/
│   │       ├── query-provider.tsx
│   │       ├── theme-provider.tsx
│   │       ├── echo-provider.tsx         # Real-time
│   │       └── auth-provider.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                 # Axios instance
│   │   │   ├── endpoints.ts
│   │   │   ├── auth.ts
│   │   │   ├── projects.ts
│   │   │   ├── comments.ts
│   │   │   ├── challenges.ts
│   │   │   └── notifications.ts
│   │   ├── echo/
│   │   │   ├── echo.ts                   # Laravel Echo setup
│   │   │   └── channels.ts
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   ├── use-project.ts
│   │   │   ├── use-projects.ts
│   │   │   ├── use-comments.ts
│   │   │   ├── use-challenges.ts
│   │   │   ├── use-notifications.ts
│   │   │   ├── use-breadcrumb.ts         # ⭐
│   │   │   ├── use-debounce.ts
│   │   │   └── use-media-query.ts
│   │   ├── stores/
│   │   │   ├── auth-store.ts
│   │   │   ├── notification-store.ts
│   │   │   └── breadcrumb-store.ts       # ⭐
│   │   ├── utils/
│   │   │   ├── cn.ts                     # Class merger
│   │   │   ├── format.ts
│   │   │   ├── sanitize.ts
│   │   │   └── validators.ts
│   │   ├── validations/
│   │   │   ├── project.schema.ts
│   │   │   ├── comment.schema.ts
│   │   │   ├── challenge.schema.ts
│   │   │   └── auth.schema.ts
│   │   ├── constants/
│   │   │   ├── routes.ts
│   │   │   ├── navigation.ts
│   │   │   └── breadcrumb-config.ts      # ⭐
│   │   └── monitoring/
│   │       ├── sentry.ts
│   │       └── analytics.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── models.ts
│   │   ├── api.ts
│   │   └── components.ts
│   └── config/
│       ├── site.ts
│       └── navigation.ts
├── e2e/
│   ├── auth.spec.ts
│   ├── project-flow.spec.ts
│   └── challenge-flow.spec.ts
├── .env.local
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── jest.config.js
├── next.config.js
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
15. Quick Start Guide
A. Backend Setup
# 1. Clone & Install
git clone <repo-url> ignitepad-backend
cd ignitepad-backend
composer install

# 2. Environment
cp .env.example .env
php artisan key:generate

# 3. Database
# Edit .env with your database credentials
php artisan migrate
php artisan db:seed

# 4. Sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# 5. Permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"

# 6. Storage
php artisan storage:link

# 7. Start Services
php artisan serve
php artisan queue:work
php artisan websockets:serve  # or use Soketi
B. Frontend Setup
# 1. Clone & Install
git clone <repo-url> ignitepad-frontend
cd ignitepad-frontend
npm install

# 2. Environment
cp .env.example .env.local
# Edit .env.local with your API URL

# 3. Shadcn UI Init
npx shadcn-ui@latest init

# 4. Install Components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
# ... install semua components yang diperlukan

# 5. Start Development
npm run dev
16. Key Implementation Examples
A. Project Detail Page (Complete Example)
// app/(main)/projects/[slug]/page.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { projectApi } from '@/lib/api/projects';
import { useBreadcrumb } from '@/lib/hooks/use-breadcrumb';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { ProjectDetail } from '@/components/projects/project-detail';
import { ProjectSidebar } from '@/components/projects/project-sidebar';
import { CommentSection } from '@/components/comments/comment-section';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => projectApi.getBySlug(slug),
  });

  // Set breadcrumb with dynamic data
  useBreadcrumb(project);

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !project) {
    return <ProjectNotFound />;
  }

  return (
    <div className="container mx-auto py-8">
      <Breadcrumb />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2">
          <ProjectDetail project={project} />
          
          {project.allow_comments && (
            <div className="mt-12">
              <CommentSection projectSlug={slug} />
            </div>
          )}
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="lg:col-span-1">
          <ProjectSidebar project={project} />
        </div>
      </div>
    </div>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="h-4 w-64 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}
B. Real-time Notifications (Complete Example)
// components/notifications/notification-bell.tsx

'use client';

import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '@/lib/api/notifications';
import { useNotificationStore } from '@/lib/stores/notification-store';
import { useEcho } from '@/lib/hooks/use-echo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationList } from './notification-list';

export function NotificationBell() {
  const echo = useEcho();
  const { notifications, addNotification, unreadCount } = useNotificationStore();

  // Fetch initial notifications
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll(),
  });

  // Listen to real-time notifications
  useEffect(() => {
    if (!echo) return;

    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    const channel = echo.private(`App.Models.User.${userId}`);

    channel.notification((notification: any) => {
      addNotification(notification);
      
      // Show toast
      toast({
        title: notification.title,
        description: notification.message,
      });

      // Play sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    });

    return () => {
      channel.stopListening('.notification');
    };
  }, [echo, addNotification]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationList />
      </PopoverContent>
    </Popover>
  );
}
C. Challenge Submission Flow (Backend)
<?php

namespace App\Http\Controllers\Api\V1\Challenges;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Models\Project;
use App\Notifications\ChallengeSubmitted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChallengeSubmissionController extends Controller
{
    public function join(Request $request, string $slug)
    {
        $challenge = Challenge::where('slug', $slug)
            ->where('status', 'open')
            ->firstOrFail();

        // Check if already joined
        if ($challenge->submissions()->where('user_id', $request->user()->id)->exists()) {
            return response()->json([
                'message' => 'You have already joined this challenge'
            ], 400);
        }

        // Check max participants
        if ($challenge->max_participants && 
            $challenge->submissions()->count() >= $challenge->max_participants) {
            return response()->json([
                'message' => 'Challenge is full'
            ], 400);
        }

        // Create submission
        $submission = $challenge->submissions()->create([
            'user_id' => $request->user()->id,
            'status' => 'joined',
        ]);

        // Increment participant count
        $challenge->increment('participant_count');

        return response()->json([
            'message' => 'Successfully joined the challenge',
            'data' => $submission,
        ], 201);
    }

    public function submit(Request $request, string $slug)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
        ]);

        $challenge = Challenge::where('slug', $slug)
            ->where('status', 'open')
            ->firstOrFail();

        // Check if user has joined
        $submission = $challenge->submissions()
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Verify project ownership
        $project = Project::where('id', $request->project_id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Check deadline
        if ($challenge->deadline && now()->isAfter($challenge->deadline)) {
            return response()->json([
                'message' => 'Challenge deadline has passed'
            ], 400);
        }

        DB::transaction(function () use ($submission, $project, $challenge) {
            // Update submission
            $submission->update([
                'project_id' => $project->id,
                'status' => 'submitted',
                'submitted_at' => now(),
            ]);

            // Increment submission count
            if ($submission->wasChanged('status')) {
                $challenge->increment('submission_count');
            }
        });

        // Notify challenge creator
        $challenge->user->notify(new ChallengeSubmitted($challenge, $submission));

        return response()->json([
            'message' => 'Project submitted successfully',
            'data' => $submission->load('project'),
        ]);
    }

    public function announceWinner(Request $request, string $slug)
    {
        $this->authorize('update', Challenge::class);

        $request->validate([
            'winner_project_id' => 'required|exists:projects,id',
        ]);

        $challenge = Challenge::where('slug', $slug)->firstOrFail();

        // Verify winner project is part of submissions
        $winnerSubmission = $challenge->submissions()
            ->where('project_id', $request->winner_project_id)
            ->where('status', 'submitted')
            ->firstOrFail();

        DB::transaction(function () use ($challenge, $winnerSubmission) {
            // Update challenge
            $challenge->update([
                'winner_project_id' => $winnerSubmission->project_id,
                'winner_announced_at' => now(),
                'status' => 'completed',
            ]);

            // Update winner submission rank
            $winnerSubmission->update(['rank' => 1]);
        });

        // Notify all participants
        $participants = $challenge->submissions()
            ->with('user')
            ->get()
            ->pluck('user');

        Notification::send(
            $participants,
            new ChallengeWinnerAnnounced($challenge, $winnerSubmission->project)
        );

        return response()->json([
            'message' => 'Winner announced successfully',
            'data' => $challenge->load('winnerProject'),
        ]);
    }
}
17. Performance Metrics & Goals
Backend Performance Targets
✅ API Response Time:
   - GET /projects: < 200ms
   - GET /projects/{slug}: < 150ms
   - POST /projects: < 300ms
   
✅ Database Queries:
   - Max N+1 queries: 0
   - Average queries per request: < 5
   - Query execution time: < 50ms
   
✅ Caching:
   - Cache hit ratio: > 80%
   - Cache response time: < 10ms
Frontend Performance Targets
✅ Core Web Vitals:
   - LCP (Largest Contentful Paint): < 2.5s
   - FID (First Input Delay): < 100ms
   - CLS (Cumulative Layout Shift): < 0.1
   
✅ Page Load:
   - Time to Interactive: < 3s
   - First Contentful Paint: < 1.5s
   
✅ Bundle Size:
   - Initial JS bundle: < 200KB (gzipped)
   - Total page weight: < 1MB
18. Security Checklist
Backend Security
[x] HTTPS only in production
[x] CORS properly configured
[x] Rate limiting on all endpoints
[x] Input validation on all requests
[x] SQL injection prevention (use Eloquent)
[x] XSS prevention (escape output)
[x] CSRF protection (Sanctum)
[x] Authentication on protected routes
[x] Authorization with Policies
[x] Secure password hashing (bcrypt)
[x] API versioning
[x] Error messages don't leak sensitive info
[x] File upload validation
[x] Database backups scheduled
Frontend Security
[x] Environment variables properly scoped
[x] API keys never exposed in client
[x] XSS prevention (sanitize HTML)
[x] Authentication token stored securely
[x] HTTPS only
[x] Content Security Policy headers
[x] Protected routes implementation
[x] Form validation client & server side
[x] Dependencies regularly updated
[x] No sensitive data in localStorage
🎉 Kesimpulan Final
Rancangan ini sudah mencakup:
✨ Arsitektur yang Solid

Backend API-only dengan Laravel 12
Frontend modern dengan Next.js 14 App Router
Separation of concerns yang jelas
🔐 Security Best Practices

Authentication & Authorization lengkap
Rate limiting & CORS
Input validation & sanitization
📊 Database Design yang Optimal

Normalisasi yang tepat
Indexing untuk performa
Relationship yang jelas
🚀 Performa Terbaik

Caching strategy
Query optimization
Code splitting & lazy loading
🔔 Real-time Features

Laravel Echo + Soketi
PWA dengan push notifications
In-app notifications
🍞 Breadcrumb System ⭐

Configuration-based
Dynamic data support
Auto-generation fallback
Zustand state management
🧪 Testing Lengkap

Unit, Feature, Integration tests
E2E testing dengan Playwright
API mocking dengan MSW
📦 DevOps Ready

Docker setup
CI/CD pipelines
Monitoring & logging
Sekarang tinggal implementasi step-by-step. Mulai dari:

Setup project (backend & frontend)
Database migration & seeding
Authentication system
Breadcrumb system (bisa langsung dari awal!)
Core features (Projects CRUD)
Advanced features (Comments, Challenges)
Real-time & PWA
Testing & optimization
Semoga rancangan ini membantu! 🚀

saya sudah setup banyak nah kamu tinggal melanjutkan dengan benar, tolong abaikan fitur notifikasi apapun itu notifikasi pwa atau apa abaikan dulu, lanjutkan

database:
-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 08, 2025 at 09:42 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ignitepad_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `challenges`
--

CREATE TABLE `challenges` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `rules` text COLLATE utf8mb4_unicode_ci,
  `banner` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requirements` json DEFAULT NULL,
  `allowed_categories` json DEFAULT NULL,
  `start_date` timestamp NULL DEFAULT NULL,
  `deadline` timestamp NULL DEFAULT NULL,
  `announcement_date` timestamp NULL DEFAULT NULL,
  `winner_project_id` bigint UNSIGNED DEFAULT NULL,
  `winner_announced_at` timestamp NULL DEFAULT NULL,
  `participant_count` int UNSIGNED NOT NULL DEFAULT '0',
  `submission_count` int UNSIGNED NOT NULL DEFAULT '0',
  `status` enum('draft','open','closed','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `max_participants` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `challenge_submissions`
--

CREATE TABLE `challenge_submissions` (
  `id` bigint UNSIGNED NOT NULL,
  `challenge_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `project_id` bigint UNSIGNED DEFAULT NULL,
  `status` enum('joined','submitted','withdrawn') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'joined',
  `submitted_at` timestamp NULL DEFAULT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `rank` int UNSIGNED DEFAULT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `collaborators`
--

CREATE TABLE `collaborators` (
  `id` bigint UNSIGNED NOT NULL,
  `project_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `role` enum('pembimbing','kolaborator','contributor') COLLATE utf8mb4_unicode_ci NOT NULL,
  `can_edit` tinyint(1) NOT NULL DEFAULT '0',
  `can_delete` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('invited','accepted','declined') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'invited',
  `invited_by` bigint UNSIGNED DEFAULT NULL,
  `invited_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` bigint UNSIGNED NOT NULL,
  `project_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT '1',
  `is_pinned` tinyint(1) NOT NULL DEFAULT '0',
  `like_count` int UNSIGNED NOT NULL DEFAULT '0',
  `reply_count` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `likeable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `likeable_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_11_07_035720_create_personal_access_tokens_table', 1),
(5, '2025_11_07_043954_create_projects_table', 1),
(6, '2025_11_07_061400_create_likes_table', 1),
(7, '2025_11_07_061430_create_saves_table', 1),
(8, '2025_11_07_063105_create_comments_table', 1),
(9, '2025_11_07_065441_create_collaborators_table', 1),
(10, '2025_11_07_074919_create_challenges_table', 1),
(11, '2025_11_07_074920_create_challenge_submissions_table', 1),
(12, '2025_11_07_101842_create_permission_tables', 1),
(13, '2025_11_08_064649_add_username_to_users_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 1),
(2, 'App\\Models\\User', 2),
(3, 'App\\Models\\User', 3),
(3, 'App\\Models\\User', 4);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(3, 'App\\Models\\User', 1, 'auth_token', '80a0a7ae714e5ca35e4d92934d29dc0afb0eb2d1889e10e6ec10ee085ce04485', '[\"*\"]', '2025-11-08 02:38:19', NULL, '2025-11-08 02:34:38', '2025-11-08 02:38:19');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `featured_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `tech_stack` json DEFAULT NULL,
  `category` enum('web','mobile','desktop','ai-ml','iot','game','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'web',
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `visibility` enum('public','unlisted','private') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `allow_comments` tinyint(1) NOT NULL DEFAULT '1',
  `view_count` int UNSIGNED NOT NULL DEFAULT '0',
  `like_count` int UNSIGNED NOT NULL DEFAULT '0',
  `save_count` int UNSIGNED NOT NULL DEFAULT '0',
  `comment_count` int UNSIGNED NOT NULL DEFAULT '0',
  `share_count` int UNSIGNED NOT NULL DEFAULT '0',
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'web', '2025-11-08 02:12:58', '2025-11-08 02:12:58'),
(2, 'dosen', 'web', '2025-11-08 02:12:58', '2025-11-08 02:12:58'),
(3, 'mahasiswa', 'web', '2025-11-08 02:12:58', '2025-11-08 02:12:58');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `saves`
--

CREATE TABLE `saves` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `project_id` bigint UNSIGNED NOT NULL,
  `folder` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('kc4eeT6qOeZ8lNk3A8ovRxLdX6IMrCa9UhmZn1qf', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiSUl3YjByZFhEVW5UdWptQzNRQjZkdTFBbmFvZ3dHRGhNbEhpZFNDZCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1762594163),
('vd21R8oWUcGEm7o6Q5wyAzifrn1ql5uVpyTA1MUK', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiWnZQNnBhM0w5aW9SMkx3NzZmWEc3N1lORFRuT2laaVVhOG84T2lvQiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1762594477),
('Y2FFX2gMDXG9nki3EBkcBRR5yV9zJh3KLHV5hVOs', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiYU9sdlllWXRVV09yTUhGV1hIeTNKbmV5Q2RxTlpJelJZVkR3M2FsViI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1762593302);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nim` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nidn` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `niyp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cover_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `email_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `push_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `github_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedin_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fcm_token` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `username`, `nim`, `nidn`, `niyp`, `bio`, `avatar`, `cover_image`, `is_active`, `email_notifications`, `push_notifications`, `github_url`, `linkedin_url`, `website_url`, `remember_token`, `fcm_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Admin Ignitepad', 'admin@ignitepad.com', '2025-11-08 02:12:58', '$2y$12$JtNAZjIBWXQMD9aywr/B3e4w3STbO6q0UiPn5NPXP0fgSH5mtMWuq', 'admin', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, NULL, 'cC7gz14grK', NULL, '2025-11-08 02:12:58', '2025-11-08 02:12:58', NULL),
(2, 'Dosen Penguji', 'dosen@ignitepad.com', '2025-11-08 02:12:58', '$2y$12$tgSHrp7F0nwA8C8JBAUx8eP8cLMXAbTxn88BDBwU0JhmeTbNMQjmG', 'dosen', NULL, '1234567890', NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, NULL, 'sqyWPYkOWf', NULL, '2025-11-08 02:12:58', '2025-11-08 02:12:58', NULL),
(3, 'Mahasiswa Uji', 'mahasiswa@ignitepad.com', '2025-11-08 02:12:59', '$2y$12$wibaQMWuhKAR9TfdDdpbAucSQ5yEt/1/z/cOJArQdR4N04ZDxK67C', 'mahasiswa', '0987654321', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, NULL, 'G8h49mWhty', NULL, '2025-11-08 02:12:59', '2025-11-08 02:12:59', NULL),
(4, 'Miftakhul Rahman', 'miftakhulrahman03@gmail.com', NULL, '$2y$12$OgVGt5eKfnGi.7I6y4cgb.Q97ZqjuWLOWX2jEQ.mKRmcfb7uTsKcO', 'miftakhulrahman', '2255202048', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, '2025-11-08 02:29:24', '2025-11-08 02:29:24', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `challenges`
--
ALTER TABLE `challenges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `challenges_slug_unique` (`slug`),
  ADD KEY `challenges_user_id_foreign` (`user_id`),
  ADD KEY `challenges_winner_project_id_foreign` (`winner_project_id`),
  ADD KEY `challenges_slug_index` (`slug`),
  ADD KEY `challenges_status_index` (`status`),
  ADD KEY `challenges_deadline_index` (`deadline`);

--
-- Indexes for table `challenge_submissions`
--
ALTER TABLE `challenge_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_submission` (`challenge_id`,`user_id`),
  ADD KEY `challenge_submissions_user_id_foreign` (`user_id`),
  ADD KEY `challenge_submissions_project_id_foreign` (`project_id`),
  ADD KEY `challenge_submissions_status_index` (`status`),
  ADD KEY `challenge_submissions_rank_index` (`rank`);

--
-- Indexes for table `collaborators`
--
ALTER TABLE `collaborators`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_collaborator` (`project_id`,`user_id`),
  ADD KEY `collaborators_invited_by_foreign` (`invited_by`),
  ADD KEY `collaborators_user_id_index` (`user_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `comments_project_id_foreign` (`project_id`),
  ADD KEY `comments_user_id_foreign` (`user_id`),
  ADD KEY `comments_parent_id_foreign` (`parent_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_like` (`user_id`,`likeable_type`,`likeable_id`),
  ADD KEY `likes_likeable_type_likeable_id_index` (`likeable_type`,`likeable_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `projects_slug_unique` (`slug`),
  ADD KEY `projects_user_id_index` (`user_id`),
  ADD KEY `projects_status_index` (`status`),
  ADD KEY `projects_visibility_index` (`visibility`),
  ADD KEY `projects_published_at_index` (`published_at`);
ALTER TABLE `projects` ADD FULLTEXT KEY `idx_search` (`title`,`description`,`content`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `saves`
--
ALTER TABLE `saves`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_save` (`user_id`,`project_id`),
  ADD KEY `saves_project_id_foreign` (`project_id`),
  ADD KEY `saves_user_id_folder_index` (`user_id`,`folder`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_nim_unique` (`nim`),
  ADD UNIQUE KEY `users_nidn_unique` (`nidn`),
  ADD UNIQUE KEY `users_niyp_unique` (`niyp`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD KEY `users_nim_index` (`nim`),
  ADD KEY `users_nidn_index` (`nidn`),
  ADD KEY `users_niyp_index` (`niyp`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `challenges`
--
ALTER TABLE `challenges`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `challenge_submissions`
--
ALTER TABLE `challenge_submissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `collaborators`
--
ALTER TABLE `collaborators`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `saves`
--
ALTER TABLE `saves`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `challenges`
--
ALTER TABLE `challenges`
  ADD CONSTRAINT `challenges_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `challenges_winner_project_id_foreign` FOREIGN KEY (`winner_project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `challenge_submissions`
--
ALTER TABLE `challenge_submissions`
  ADD CONSTRAINT `challenge_submissions_challenge_id_foreign` FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `challenge_submissions_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `challenge_submissions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `collaborators`
--
ALTER TABLE `collaborators`
  ADD CONSTRAINT `collaborators_invited_by_foreign` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `collaborators_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `collaborators_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `saves`
--
ALTER TABLE `saves`
  ADD CONSTRAINT `saves_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `saves_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

lengkapi semua fitur yang belum kecuali notifikasi. backend nya berjalan di http://ignitepad-backend.test/

tolong kerjakan dengan lengkap dan coding yang benar