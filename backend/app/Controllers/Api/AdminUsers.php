<?php

namespace App\Controllers\Api;

class AdminUsers extends BaseApi
{
    private array $modules = [
        'dashboard', 'products', 'categories', 'orders', 'customers', 'carousel',
        'coupons', 'reviews', 'pages', 'messages', 'analytics', 'settings', 'admin_users'
    ];

    public function index()
    {
        if ($denied = $this->requireAdminPermission('admin_users', 'view')) return $denied;
        $db = db_connect();
        $rows = $db->table('admin_users')->select('id,name,email,role,active,created_at,updated_at')->orderBy('id', 'DESC')->get()->getResultArray();
        foreach ($rows as &$row) {
            $row['permissions'] = $this->permissionsFor((int) $row['id'], $row['role']);
        }
        return $this->ok(['data' => $rows, 'modules' => $this->modules]);
    }

    public function show($id = null)
    {
        if ($denied = $this->requireAdminPermission('admin_users', 'view')) return $denied;
        $user = db_connect()->table('admin_users')->select('id,name,email,role,active,created_at,updated_at')->where('id', (int) $id)->get()->getRowArray();
        if (! $user) return $this->ok(['message' => 'Admin user not found'], 404);
        $user['permissions'] = $this->permissionsFor((int) $id, $user['role']);
        return $this->ok(['data' => $user, 'modules' => $this->modules]);
    }

    public function create()
    {
        if ($denied = $this->requireAdminPermission('admin_users', 'add')) return $denied;
        $data = $this->json();
        foreach (['name', 'email', 'password'] as $key) {
            if (empty($data[$key])) return $this->ok(['message' => ucfirst($key) . ' is required'], 422);
        }
        $email = strtolower(trim($data['email']));
        if (db_connect()->table('admin_users')->where('email', $email)->countAllResults()) {
            return $this->ok(['message' => 'Email already exists'], 409);
        }
        $db = db_connect();
        $db->table('admin_users')->insert([
            'name' => trim($data['name']),
            'email' => $email,
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
            'role' => $data['role'] ?? 'staff',
            'active' => isset($data['active']) ? (int) $data['active'] : 1,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ]);
        $id = (int) $db->insertID();
        $this->savePermissions($id, $data['permissions'] ?? [], $data['role'] ?? 'staff');
        return $this->ok(['message' => 'Admin user created', 'id' => $id], 201);
    }

    public function update($id = null)
    {
        if ($denied = $this->requireAdminPermission('admin_users', 'edit')) return $denied;
        $db = db_connect();
        $user = $db->table('admin_users')->where('id', (int) $id)->get()->getRowArray();
        if (! $user) return $this->ok(['message' => 'Admin user not found'], 404);
        $data = $this->json();
        $row = [
            'name' => trim($data['name'] ?? $user['name']),
            'email' => strtolower(trim($data['email'] ?? $user['email'])),
            'role' => $data['role'] ?? $user['role'],
            'active' => isset($data['active']) ? (int) $data['active'] : (int) $user['active'],
            'updated_at' => date('Y-m-d H:i:s'),
        ];
        if (! empty($data['password'])) $row['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        $db->table('admin_users')->where('id', (int) $id)->update($row);
        $this->savePermissions((int) $id, $data['permissions'] ?? [], $row['role']);
        return $this->ok(['message' => 'Admin user updated']);
    }

    public function delete($id = null)
    {
        if ($denied = $this->requireAdminPermission('admin_users', 'delete')) return $denied;
        $current = $this->adminUser();
        if ((int) ($current['id'] ?? 0) === (int) $id) return $this->ok(['message' => 'You cannot delete your own account'], 422);
        $db = db_connect();
        $db->table('admin_permissions')->where('admin_user_id', (int) $id)->delete();
        $db->table('admin_users')->where('id', (int) $id)->delete();
        return $this->ok(['message' => 'Admin user deleted']);
    }

    private function permissionsFor(int $id, string $role): array
    {
        if ($role === 'super_admin') {
            $out = [];
            foreach ($this->modules as $module) $out[$module] = ['view' => true, 'add' => true, 'edit' => true, 'delete' => true];
            return $out;
        }
        $rows = db_connect()->table('admin_permissions')->where('admin_user_id', $id)->get()->getResultArray();
        $out = [];
        foreach ($this->modules as $module) $out[$module] = ['view' => false, 'add' => false, 'edit' => false, 'delete' => false];
        foreach ($rows as $row) {
            $out[$row['module']] = [
                'view' => (bool) $row['can_view'],
                'add' => (bool) $row['can_add'],
                'edit' => (bool) $row['can_edit'],
                'delete' => (bool) $row['can_delete'],
            ];
        }
        return $out;
    }

    private function savePermissions(int $id, array $permissions, string $role): void
    {
        $db = db_connect();
        $db->table('admin_permissions')->where('admin_user_id', $id)->delete();
        if ($role === 'super_admin') return;
        foreach ($this->modules as $module) {
            $p = $permissions[$module] ?? [];
            $db->table('admin_permissions')->insert([
                'admin_user_id' => $id,
                'module' => $module,
                'can_view' => ! empty($p['view']) ? 1 : 0,
                'can_add' => ! empty($p['add']) ? 1 : 0,
                'can_edit' => ! empty($p['edit']) ? 1 : 0,
                'can_delete' => ! empty($p['delete']) ? 1 : 0,
            ]);
        }
    }
}
