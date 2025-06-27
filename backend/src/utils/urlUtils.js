const { nanoid } = require('nanoid');
const Url = require('../models/url');
const Log = require('./logger');

// Function to generate a unique short code
exports.generateUniqueShortCode = async (preferredCode = null, length = 6) => {
  try {
    // If user provided a custom shortcode, check if it's available
    if (preferredCode) {
      const existing = await Url.findOne({ shortCode: preferredCode });
      if (!existing) {
        Log('debug', 'utils', `Custom shortcode ${preferredCode} is available`);
        return preferredCode;
      }
      Log('info', 'utils', `Custom shortcode ${preferredCode} already exists, generating a new one`);
    }

    // Generate a unique short code
    let shortCode;
    let isUnique = false;
    
    while (!isUnique) {
      shortCode = nanoid(length);
      // Check if this code already exists
      const existing = await Url.findOne({ shortCode });
      if (!existing) {
        isUnique = true;
      }
    }
    
    Log('debug', 'utils', `Generated unique shortcode: ${shortCode}`);
    return shortCode;
  } catch (error) {
    Log('error', 'utils', `Error generating unique shortcode: ${error.message}`);
    throw error;
  }
};

// Function to calculate expiry date
exports.calculateExpiryDate = (validityMinutes = 30) => {
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + validityMinutes);
  return expiryDate;
};

// Function to get IP and location info from a request
exports.getLocationInfo = (req) => {
  const geoip = require('geoip-lite');
  
  // Get client IP address
  const ip = req.headers['x-forwarded-for'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress;
  
  // Get geo location (if available)
  let location = 'unknown';
  if (ip) {
    const geo = geoip.lookup(ip);
    if (geo) {
      location = `${geo.country || ''}, ${geo.city || ''}`.trim();
      if (location === ',') location = 'unknown';
    }
  }
  
  return { ip, location };
};

// Function to get referrer info from a request
exports.getReferrerInfo = (req) => {
  return req.headers.referer || req.headers.referrer || 'direct';
};
