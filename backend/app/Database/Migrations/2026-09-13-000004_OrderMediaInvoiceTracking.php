<?php
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;

class OrderMediaInvoiceTracking extends Migration
{
    public function up()
    {
        if (!$this->db->tableExists('product_images')) {
            $this->forge->addField([
                'id' => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
                'product_id' => ['type'=>'INT','unsigned'=>true],
                'image' => ['type'=>'VARCHAR','constraint'=>500],
                'sort_order' => ['type'=>'INT','default'=>0],
                'is_primary' => ['type'=>'TINYINT','default'=>0],
                'created_at' => ['type'=>'DATETIME','null'=>true],
            ]);
            $this->forge->addKey('id', true);
            $this->forge->addKey('product_id');
            $this->forge->createTable('product_images', true);
            if ($this->db->tableExists('products')) {
                $rows=$this->db->table('products')->select('id,image')->where('image IS NOT NULL',null,false)->where('image !=','')->get()->getResultArray();
                foreach($rows as $r)$this->db->table('product_images')->insert(['product_id'=>$r['id'],'image'=>$r['image'],'sort_order'=>0,'is_primary'=>1,'created_at'=>date('Y-m-d H:i:s')]);
            }
        }
        if ($this->db->tableExists('product_reviews')) {
            $cols=$this->db->getFieldNames('product_reviews');
            if (!in_array('image',$cols,true)) $this->forge->addColumn('product_reviews',['image'=>['type'=>'VARCHAR','constraint'=>500,'null'=>true]]);
        }
        if ($this->db->tableExists('orders')) {
            $cols=$this->db->getFieldNames('orders');
            if (!in_array('invoice_number',$cols,true)) $this->forge->addColumn('orders',['invoice_number'=>['type'=>'VARCHAR','constraint'=>60,'null'=>true,'after'=>'order_number']]);
        }
    }
    public function down()
    {
        $this->forge->dropTable('product_images', true);
    }
}
