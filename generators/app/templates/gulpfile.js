const gulp = require('gulp')
const os = require('os')
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn

// all the optional gulp targets

try { 
  require('./gulp/compile-contracts.js') 
} catch (e) { 
  if (e.code !== "MODULE_NOT_FOUND") {
    throw e; 
  }
}

try { 
  const createProfiles = require('./gulp/create-profiles.js'); 
  exports.createProfilesSeries = createProfiles.createProfilesSeries;
  exports.inviteToContractsSeries = createProfiles.inviteToContractsSeries;
  exports.addToBusinessCentersSeries = createProfiles.addToBusinessCentersSeries;
  exports.addBookmarksSeries = createProfiles.addBookmarksSeries;
  exports.createProfiles = createProfiles.createProfiles;
  exports.exchangeKeysSeries = createProfiles.exchangeKeysSeries;
} catch (e) { 
  if (e.code !== "MODULE_NOT_FOUND") {
    throw e; 
  }
}

try { 
  const linkAgents = require('./gulp/smart-agents.js');
  exports.linkAgents = linkAgents.linkAgents;
} catch (e) { 
  if (e.code !== "MODULE_NOT_FOUND") {
    throw e; 
  }
}
