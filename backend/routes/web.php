<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function (Request $request) {
    return redirect('http://' . $request->getHost() . ':8020/');
});
