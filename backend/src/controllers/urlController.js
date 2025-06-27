const Url = require('../models/url');
const { 
  generateUniqueShortCode,
  calculateExpiryDate,
  getLocationInfo,
  getReferrerInfo
} = require('../utils/urlUtils');
const Log = require('../utils/logger');

// Create a shortened URL
exports.createShortUrl = async (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;
    
    Log('info', 'controller', `Received request to shorten URL: ${url}`);

    // Generate or validate shortcode
    const shortCode = await generateUniqueShortCode(shortcode);
    
    // Calculate expiry date
    const expiresAt = calculateExpiryDate(validity);
    
    // Create a new URL document
    const urlDoc = new Url({
      originalUrl: url,
      shortCode,
      expiresAt,
    });
    
    // Save to the database
    await urlDoc.save();
    
    // Generate the complete short URL
    const shortLink = `${process.env.BASE_URL}/${shortCode}`;
    
    Log('info', 'controller', `Created short URL: ${shortLink}`);
    
    // Return the short link and expiry date
    return res.status(201).json({
      shortLink,
      expiry: expiresAt.toISOString()
    });
  } catch (error) {
    Log('error', 'controller', `Error creating short URL: ${error.message}`);
    return res.status(500).json({ error: 'Server error while creating short URL' });
  }
};

// Get statistics for a short URL
exports.getUrlStats = async (req, res) => {
  try {
    const { shortcode } = req.params;
    
    Log('info', 'controller', `Fetching statistics for shortcode: ${shortcode}`);
    
    // Find the URL document
    const urlDoc = await Url.findOne({ shortCode: shortcode });
    
    if (!urlDoc) {
      Log('warn', 'controller', `Shortcode not found: ${shortcode}`);
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    // Check if expired
    if (urlDoc.expiresAt < new Date()) {
      Log('warn', 'controller', `Shortcode expired: ${shortcode}`);
      return res.status(410).json({ error: 'Short URL has expired' });
    }
    
    // Compile statistics
    const stats = {
      originalUrl: urlDoc.originalUrl,
      shortCode: urlDoc.shortCode,
      createdAt: urlDoc.createdAt,
      expiresAt: urlDoc.expiresAt,
      totalClicks: urlDoc.clickCount,
      clickDetails: urlDoc.clicks.map(click => ({
        timestamp: click.timestamp,
        referrer: click.referrer,
        location: click.location
      }))
    };
    
    Log('info', 'controller', `Statistics retrieved for ${shortcode}: ${urlDoc.clickCount} clicks`);
    
    return res.status(200).json(stats);
  } catch (error) {
    Log('error', 'controller', `Error retrieving statistics: ${error.message}`);
    return res.status(500).json({ error: 'Server error while retrieving statistics' });
  }
};

// Handle redirection for a shortened URL
exports.redirectToUrl = async (req, res) => {
  try {
    const { shortcode } = req.params;
    
    Log('info', 'controller', `Redirecting shortcode: ${shortcode}`);
    
    // Find the URL document
    const urlDoc = await Url.findOne({ shortCode: shortcode });
    
    if (!urlDoc) {
      Log('warn', 'controller', `Shortcode not found for redirection: ${shortcode}`);
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    // Check if expired
    if (urlDoc.expiresAt < new Date()) {
      Log('warn', 'controller', `Expired shortcode accessed: ${shortcode}`);
      return res.status(410).json({ error: 'Short URL has expired' });
    }
    
    // Get location and referrer info
    const { ip, location } = getLocationInfo(req);
    const referrer = getReferrerInfo(req);
    
    // Record click
    urlDoc.clicks.push({ 
      timestamp: new Date(),
      referrer,
      location,
      ip
    });
    
    // Update click count
    urlDoc.clickCount += 1;
    
    // Save the document
    await urlDoc.save();
    
    Log('info', 'controller', `Redirecting to ${urlDoc.originalUrl} from shortcode: ${shortcode}`);
    
    // Redirect to the original URL
    return res.redirect(urlDoc.originalUrl);
  } catch (error) {
    Log('error', 'controller', `Error during redirection: ${error.message}`);
    return res.status(500).json({ error: 'Server error during redirection' });
  }
};
