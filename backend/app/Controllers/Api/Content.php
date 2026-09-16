<?php namespace App\Controllers\Api;
class Content extends BaseApi {
 public function banners(){return $this->ok(['data'=>db_connect()->table('banners')->where('active',1)->orderBy('sort_order')->get()->getResultArray()]);}
 public function settings(){ $r=db_connect()->table('store_settings')->get()->getResultArray();$o=[];foreach($r as $x)$o[$x['setting_key']]=$x['setting_value'];return $this->ok(['data'=>$o]);}
}