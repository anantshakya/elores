<?php
use CodeIgniter\Router\RouteCollection;
/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');
$routes->options('api/(:any)', 'Api\\BaseApi::options/$1');
$routes->group('api', static function($routes){
 $routes->get('products','Api\\Products::index'); $routes->get('products/(:segment)','Api\\Products::show/$1'); $routes->get('categories','Api\\Categories::index'); $routes->post('orders','Api\\Orders::create');
 $routes->get('orders/track','Api\\Orders::track');
 $routes->get('banners','Api\\Content::banners'); $routes->get('settings','Api\\Content::settings');
 $routes->post('register','Api\\Auth::register'); $routes->post('login','Api\\Auth::login'); $routes->post('forgot-password','Api\\Auth::forgot'); $routes->post('reset-password','Api\\Auth::reset'); $routes->get('account','Api\\Auth::me'); $routes->get('account/orders','Api\\Auth::orders');
 $routes->post('admin/login','Api\\Admin::login'); $routes->get('admin/me','Api\\Admin::me'); $routes->put('admin/profile','Api\\Admin::profile'); $routes->get('admin/dashboard','Api\\Admin::dashboard');
 $routes->get('admin/users','Api\\AdminUsers::index');$routes->get('admin/users/(:num)','Api\\AdminUsers::show/$1');$routes->post('admin/users','Api\\AdminUsers::create');$routes->put('admin/users/(:num)','Api\\AdminUsers::update/$1');$routes->delete('admin/users/(:num)','Api\\AdminUsers::delete/$1');
 $routes->get('admin/products','Api\\AdminProducts::index');$routes->post('admin/products','Api\\AdminProducts::create');$routes->put('admin/products/(:num)','Api\\AdminProducts::update/$1');$routes->delete('admin/products/(:num)','Api\\AdminProducts::delete/$1');
 $routes->post('admin/categories','Api\\AdminCategories::create');$routes->put('admin/categories/(:num)','Api\\AdminCategories::update/$1');$routes->delete('admin/categories/(:num)','Api\\AdminCategories::delete/$1');$routes->get('admin/orders','Api\\AdminOrders::index');$routes->put('admin/orders/(:num)','Api\\AdminOrders::update/$1');$routes->get('admin/orders/(:num)/invoice','Api\\AdminOrders::invoice/$1');

 $routes->get('search/suggestions','Api\Commerce::suggestions');
 $routes->post('reviews/upload','Api\Commerce::reviewUpload');
 $routes->get('products/(:num)/reviews','Api\Commerce::reviews/$1');$routes->post('products/(:num)/reviews','Api\Commerce::reviewCreate/$1');
 $routes->get('pages/(:segment)','Api\Commerce::page/$1');$routes->post('contact','Api\Commerce::contact');$routes->post('newsletter','Api\Commerce::newsletter');$routes->post('coupon/validate','Api\Commerce::coupon');
 $routes->post('analytics','Api\Commerce::track');$routes->post('cart/save','Api\Commerce::cart');
 $routes->get('account/addresses','Api\Commerce::addresses');$routes->post('account/addresses','Api\Commerce::addressSave');
 $routes->get('admin/reviews','Api\Commerce::adminReviews');$routes->put('admin/reviews/(:num)','Api\Commerce::adminReview/$1');
 $routes->get('admin/pages','Api\Commerce::adminPages');$routes->post('admin/pages','Api\Commerce::adminPage');$routes->put('admin/pages/(:num)','Api\Commerce::adminPage/$1');
 $routes->get('admin/messages','Api\Commerce::adminMessages');$routes->get('admin/analytics','Api\Commerce::adminAnalytics');$routes->post('admin/upload','Api\Commerce::adminUpload');
 $routes->get('admin/customers','Api\\AdminManage::customers');$routes->get('admin/banners','Api\\AdminManage::banners');$routes->post('admin/banners','Api\\AdminManage::saveBanner');$routes->put('admin/banners/(:num)','Api\\AdminManage::saveBanner/$1');$routes->delete('admin/banners/(:num)','Api\\AdminManage::deleteBanner/$1');$routes->put('admin/settings','Api\\AdminManage::settings');$routes->get('admin/coupons','Api\\AdminManage::coupons');$routes->post('admin/coupons','Api\\AdminManage::saveCoupon');$routes->put('admin/coupons/(:num)','Api\\AdminManage::saveCoupon/$1');$routes->delete('admin/coupons/(:num)','Api\\AdminManage::deleteCoupon/$1');
});
