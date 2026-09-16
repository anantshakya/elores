<?php

namespace App\Controllers\Api;

class Admin extends BaseApi
{
    public function login()
    {
        $data = $this->json();
        $email = strtolower(trim($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        $user = db_connect()->table('admin_users')->where('email', $email)->where('active', 1)->get()->getRowArray();
        if (! $user || ! password_verify($password, $user['password'])) {
            return $this->ok(['message' => 'Invalid email or password'], 401);
        }

        return $this->ok([
            'token' => $this->createAdminToken($user),
            'user' => $this->safeUser($user),
            'permissions' => $this->adminPermissions($user),
        ]);
    }

    public function me()
    {
        $user = $this->adminUser();
        if (! $user) {
            return $this->ok(['message' => 'Unauthorized'], 401);
        }
        return $this->ok([
            'user' => $this->safeUser($user),
            'permissions' => $this->adminPermissions($user),
        ]);
    }

    public function profile()
    {
        $user = $this->adminUser();
        if (! $user) {
            return $this->ok(['message' => 'Unauthorized'], 401);
        }
        $data = $this->json();
        $row = [
            'name' => trim($data['name'] ?? $user['name']),
            'email' => strtolower(trim($data['email'] ?? $user['email'])),
            'updated_at' => date('Y-m-d H:i:s'),
        ];
        if (! empty($data['password'])) {
            $row['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        db_connect()->table('admin_users')->where('id', $user['id'])->update($row);
        return $this->ok(['message' => 'Profile updated']);
    }

    public function dashboard()
    {
        if ($denied = $this->requireAdminPermission('dashboard', 'view')) return $denied;
        $db = db_connect();
        return $this->ok([
            'products' => $db->table('products')->countAllResults(),
            'orders' => $db->table('orders')->countAllResults(),
            'revenue' => (float) ($db->table('orders')->selectSum('total')->where('status !=', 'Cancelled')->get()->getRow('total') ?: 0),
            'pending_orders' => $db->table('orders')->where('status', 'Pending')->countAllResults(),
        ]);
    }

    private function safeUser(array $user): array
    {
        unset($user['password']);
        return $user;
    }
}
