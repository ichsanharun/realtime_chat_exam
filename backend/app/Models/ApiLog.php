<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiLog extends Model
{
    protected $fillable = [
        'endpoint', 'method', 'request_body', 'request_header',
        'ip_address', 'user_agent', 'response_status'
    ];
}
