<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\ApiLog;

class ApiLoggerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        ApiLog::create([
            'endpoint' => $request->path(),
            'method' => $request->method(),
            'request_body' => json_encode($request->except(['password'])),
            'request_header' => json_encode($request->headers->all()),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'response_status' => $response->getStatusCode(),
        ]);

        return $response;
    }
}
