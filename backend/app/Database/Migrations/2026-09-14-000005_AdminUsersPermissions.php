<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AdminUsersPermissions extends Migration
{
    public function up()
    {
        if (! $this->db->tableExists('admin_users')) {
            $this->forge->addField([
                'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
                'name' => ['type' => 'VARCHAR', 'constraint' => 120],
                'email' => ['type' => 'VARCHAR', 'constraint' => 160],
                'password' => ['type' => 'VARCHAR', 'constraint' => 255],
                'role' => ['type' => 'VARCHAR', 'constraint' => 60, 'default' => 'staff'],
                'active' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
                'created_at' => ['type' => 'DATETIME', 'null' => true],
                'updated_at' => ['type' => 'DATETIME', 'null' => true],
            ]);
            $this->forge->addKey('id', true);
            $this->forge->addUniqueKey('email');
            $this->forge->createTable('admin_users');
        }

        if (! $this->db->tableExists('admin_permissions')) {
            $this->forge->addField([
                'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
                'admin_user_id' => ['type' => 'INT', 'unsigned' => true],
                'module' => ['type' => 'VARCHAR', 'constraint' => 80],
                'can_view' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
                'can_add' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
                'can_edit' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
                'can_delete' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
            ]);
            $this->forge->addKey('id', true);
            $this->forge->addUniqueKey(['admin_user_id', 'module']);
            $this->forge->createTable('admin_permissions');
        }

        $table = $this->db->table('admin_users');
        if (! $table->where('email', 'admin@elores.local')->countAllResults()) {
            $table->insert([
                'name' => 'Elores Super Admin',
                'email' => 'admin@elores.local',
                'password' => password_hash('Admin@123', PASSWORD_DEFAULT),
                'role' => 'super_admin',
                'active' => 1,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
        }
    }

    public function down()
    {
        $this->forge->dropTable('admin_permissions', true);
        $this->forge->dropTable('admin_users', true);
    }
}
