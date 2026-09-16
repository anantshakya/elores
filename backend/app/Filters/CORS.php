<?php
namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;

class CORS implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        // No action needed before the controller runs
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Adjust origin for dev (frontend runs on :5173) or production
        $origin = 'http://localhost:5173'; // change to your production URL when deploying

        $response->setHeader('Access-Control-Allow-Origin', $origin);
        $response->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        $response->setHeader('Access-Control-Allow-Credentials', 'true');

        // If this is a pre‑flight request, end early with 204
        if (strtoupper($request->getMethod()) === 'OPTIONS') {
            $response->setStatusCode(204);
            $response->setBody('');
        }
    }
}
