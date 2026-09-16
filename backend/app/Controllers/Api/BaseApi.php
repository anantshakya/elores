<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class BaseApi extends ResourceController
{
    protected function cors()
    {
        return $this->response
            ->setHeader('Access-Control-Allow-Origin', '*')
            ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    }

    public function options($path = null)
    {
        return $this->cors()->setStatusCode(204);
    }

    protected function ok($data, $code = 200)
    {
        return $this->cors()->setStatusCode($code)->setJSON($data);
    }

    protected function json(): array
    {
        return $this->request->getJSON(true) ?: [];
    }

    protected function adminSecret(): string
    {
        return getenv('ELORES_ADMIN_SECRET') ?: 'change-this-secret-in-production';
    }

    protected function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    protected function base64UrlDecode(string $value): string|false
    {
        $padding = strlen($value) % 4;
        if ($padding) {
            $value .= str_repeat('=', 4 - $padding);
        }
        return base64_decode(strtr($value, '-_', '+/'), true);
    }

    protected function createAdminToken(array $user): string
    {
        $payload = $this->base64UrlEncode(json_encode([
            'id' => (int) $user['id'],
            'email' => $user['email'],
            'iat' => time(),
        ]));
        $sig = hash_hmac('sha256', $payload, $this->adminSecret());
        return $payload . '.' . $sig;
    }

    protected function adminUser(): ?array
    {
        $header = $this->request->getHeaderLine('Authorization');
        if (! preg_match('/Bearer\s+(.+)/i', $header, $match)) {
            return null;
        }

        $token = trim($match[1]);
        if (! str_contains($token, '.')) {
            // Backward compatibility with old single-admin token during migration.
            $legacy = hash_hmac('sha256', 'admin@elores.local', $this->adminSecret());
            if (hash_equals($legacy, $token)) {
                return db_connect()->table('admin_users')->where('email', 'admin@elores.local')->where('active', 1)->get()->getRowArray();
            }
            return null;
        }

        [$payload, $sig] = explode('.', $token, 2);
        if (! hash_equals(hash_hmac('sha256', $payload, $this->adminSecret()), $sig)) {
            return null;
        }

        $decoded = $this->base64UrlDecode($payload);
        $data = $decoded ? json_decode($decoded, true) : null;
        if (! is_array($data) || empty($data['id'])) {
            return null;
        }

        return db_connect()->table('admin_users')
            ->where('id', (int) $data['id'])
            ->where('active', 1)
            ->get()->getRowArray();
    }

    protected function adminPermissions(array $user): array
    {
        if (($user['role'] ?? '') === 'super_admin') {
            return ['*' => ['view' => true, 'add' => true, 'edit' => true, 'delete' => true]];
        }

        $rows = db_connect()->table('admin_permissions')
            ->where('admin_user_id', (int) $user['id'])
            ->get()->getResultArray();

        $out = [];
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

    protected function adminCan(string $module, string $action = 'view'): bool
    {
        $user = $this->adminUser();
        if (! $user) {
            return false;
        }
        if (($user['role'] ?? '') === 'super_admin') {
            return true;
        }
        $permissions = $this->adminPermissions($user);
        return ! empty($permissions[$module][$action]);
    }

    protected function adminOrFail(): bool
    {
        return $this->adminUser() !== null;
    }

    protected function requireAdminPermission(string $module, string $action = 'view')
    {
        if (! $this->adminCan($module, $action)) {
            return $this->ok(['message' => 'You do not have permission for this action.'], 403);
        }
        return null;
    }
}
