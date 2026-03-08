<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Chat;
use App\Models\Message;
use App\Events\MessageSent;

class ChatController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $chats = Chat::whereHas('members', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })->with('members.user', 'messages')->get();

        return response()->json($chats);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:private,group',
            'member_ids' => 'required|array',
            'member_ids.*' => 'exists:users,id'
        ]);

        $chat = Chat::create(['type' => $request->type]);
        
        $memberIds = $request->member_ids;
        $memberIds[] = auth()->id(); // Add self
        
        foreach (array_unique($memberIds) as $userId) {
            $chat->members()->create(['user_id' => $userId]);
        }

        return response()->json($chat->load('members.user'));
    }

    public function getMessages($id)
    {
        $chat = Chat::findOrFail($id);
        
        // Ensure user is part of the chat
        if (!$chat->members()->where('user_id', auth()->id())->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = $chat->messages()->with('user')->orderBy('created_at', 'asc')->get();
        return response()->json($messages);
    }

    public function storeMessage(Request $request)
    {
        $request->validate([
            'chat_id' => 'required|exists:chats,id',
            'message' => 'required|string'
        ]);

        $chat = Chat::findOrFail($request->chat_id);
        
        if (!$chat->members()->where('user_id', auth()->id())->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message = $chat->messages()->create([
            'user_id' => auth()->id(),
            'message' => $request->message
        ]);

        // Broadcast event
        try {
            broadcast(new MessageSent($message->load('user')))->toOthers();
            \Log::info('Broadcasting succeeded for message ID: ' . $message->id);
        } catch (\Exception $e) {
            \Log::error('Broadcasting failed: ' . $e->getMessage());
        }

        return response()->json($message);
    }
}
