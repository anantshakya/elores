<?php namespace App\Controllers\Api; use App\Models\CategoryModel;
class Categories extends BaseApi {public function index(){return $this->ok(['data'=>(new CategoryModel())->where('active',1)->orderBy('name')->findAll()]);}}
