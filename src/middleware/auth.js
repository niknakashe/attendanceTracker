"use strict";
var jwt = require("jsonwebtoken");
var config = require("../config/config");
var _ = require("underscore");

function authMiddleWare(req, res, next) {
  var token = req.headers.token || req.cookies.token;
  if (!token) {
    res.status(401).send({ status: false, message: "Not Authorized" });
  } else {
    jwt.verify(token, config.jwt.secret, function (err, decoded) {
      if (err) {
        res.status(401).send({ status: false, message: "Invalid token" });
      } else {
        req.jwt = decoded;
        next();
      }
    });
  }
}

/* let isAdmin = (req,res,next)=>{
    if(req.jwt.role === 'admin'){
        next();
    }else{
        res.status(401).json({status:false,message:"Access Denied for this operation",data:null});
    }
}


let reqiuresBody = (req,res,next)=>{
    if(req.body && _.isObject(req.body) && !_.isEmpty(req.body)){
        next();
    }else{
        res.status(400).json({status:false,message:"Invalid or empty data",data:null});
    }
} */

module.exports = authMiddleWare;
