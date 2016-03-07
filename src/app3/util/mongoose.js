"use strict";

import constants from './constants'; 
import mongoose from 'mongoose';

mongoose.Promise = Promise;         //Use ES6 Promises

module.exports = {
    mongoose,
    Schema: mongoose.Schema
};