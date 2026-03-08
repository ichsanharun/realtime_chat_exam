<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Chat;

Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
    if (!$user) return false;
    $chat = Chat::find($chatId);
    return $chat && $chat->members()->where('user_id', $user->id)->exists();
});
