<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class AdminController extends ResourceController
{
    protected $format = 'json';

    public function login()
    {
        $data = $this->request->getJSON(true);

        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (
            $email === 'admin@elores.local' &&
            $password === 'Admin@123'
        ) {
            return $this->respond([
                'success' => true,
                'token' => 'elores-admin-token',
                'user' => [
                    'email' => $email,
                    'name' => 'Elores Admin'
                ]
            ]);
        }

        return $this->failUnauthorized('Invalid email or password');
    }
}
