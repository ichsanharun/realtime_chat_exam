<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use App\Models\ApiLog;
use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['auth:api']]);

Route::middleware([\App\Http\Middleware\ApiLoggerMiddleware::class])->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/verify-2fa', [AuthController::class, 'verify2fa']);

    Route::middleware('auth:api')->group(function () {
        Route::get('/chats', [ChatController::class, 'index']);
        Route::post('/chats', [ChatController::class, 'store']);
        Route::get('/chats/{id}/messages', [ChatController::class, 'getMessages']);
        Route::post('/messages', [ChatController::class, 'storeMessage']);
        
        Route::get('/api-logs', function () {
            return response()->json(ApiLog::orderBy('created_at', 'desc')->get());
        });

        Route::get('/users', function() {
            return response()->json(\App\Models\User::all());
        });
    });
});
