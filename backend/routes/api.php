<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/check-username', [AuthController::class, 'checkUsername']);
Route::post('/change-password', [AuthController::class, 'changePassword']);
Route::get('/users', [AuthController::class, 'getUsers']);
Route::patch('/users/{id}/role', [AuthController::class, 'updateRole']);
Route::delete('/users/{id}', [AuthController::class, 'deleteUser']);
Route::get('/committees', [AuthController::class, 'getCommittees']);
Route::post('/committees', [AuthController::class, 'addCommittee']);
Route::delete('/committees/{id}', [AuthController::class, 'deleteCommittee']);
Route::get('/terms', [AuthController::class, 'getTerms']);
Route::post('/terms', [AuthController::class, 'addTerm']);
Route::delete('/terms/{id}', [AuthController::class, 'deleteTerm']);
Route::get('/committee-members', [AuthController::class, 'getCommitteeMembers']);
Route::delete('/committee-members', [AuthController::class, 'deleteCommitteeMembers']);
Route::post('/committee-members', [AuthController::class, 'addCommitteeMember']);
Route::post('/committee-members/batch', [AuthController::class, 'addCommitteeMembersBatch']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    Route::post('/profiles', [AuthController::class, 'updateProfile']);
    Route::post('/add-record', [AuthController::class, 'addRecord']);
    Route::get('/get-record', [AuthController::class, 'getRecords']);
    Route::get('/get-record/{id}', [AuthController::class, 'getRecordById']);
    Route::delete('/delete-record/{id}', [AuthController::class, 'deleteRecord']);
    Route::put('/update-record/{id}', [AuthController::class, 'updateRecord']);
    Route::post('/deletion-request', [AuthController::class, 'submitDeletionRequest']);
    Route::get('/deletion-requests', [AuthController::class, 'getDeletionRequests']);
    Route::put('/deletion-requests/{id}', [AuthController::class, 'handleDeletionRequest']);
    Route::delete('/deletion-requests/{id}', [AuthController::class, 'cancelDeletionRequest']);
    Route::get('/history', [AuthController::class, 'getHistory']);

    // Notification routes
    Route::post('/notifications', [AuthController::class, 'addNotification']);
    Route::get('/notifications', [AuthController::class, 'getNotifications']);
    Route::delete('/notifications/{id}', [AuthController::class, 'deleteNotification']);
    Route::delete('/notifications', [AuthController::class, 'clearNotifications']);
    Route::post('/update-time-notification', [AuthController::class, 'updateTimeNotification']);
});
