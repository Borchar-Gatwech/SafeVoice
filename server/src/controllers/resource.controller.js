const Resource = require('../models/resource.model');

/**
 * GET /api/resources
 * Get resources based on location and type
 */
exports.getResources = async (req, res) => {
  try {
    const { country, region, city, type, language, lat, lng, radius = 50 } = req.query;

    const query = {};

    // Location filtering
    if (country) query['location.country'] = country;
    if (region) query['location.region'] = region;
    if (city) query['location.city'] = new RegExp(city, 'i');

    // Type filtering
    if (type) query.type = type;

    // Language filtering
    if (language) query.languages = language;

    // Only verified resources
    query.isVerified = true;

    let resources;

    // Geospatial query if coordinates provided
    if (lat && lng) {
      resources = await Resource.find({
        ...query,
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseInt(radius) * 1000 // Convert km to meters
          }
        }
      }).limit(20);
    } else {
      // Regular query
      resources = await Resource.find(query)
        .sort({ rating: -1, reviewCount: -1 })
        .limit(20);
    }

    return res.json({
      count: resources.length,
      resources: resources.map(r => ({
        id: r._id,
        name: r.name,
        type: r.type,
        description: r.description,
        phone: r.phone,
        email: r.email,
        website: r.website,
        location: r.location,
        languages: r.languages,
        hours: r.hours,
        rating: r.rating,
        services: r.services,
        isFree: r.isFree
      }))
    });

  } catch (error) {
    console.error('Get resources error:', error);
    return res.status(500).json({ message: 'Error retrieving resources' });
  }
};

/**
 * GET /api/resources/:id
 * Get single resource details
 */
exports.getResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    return res.json({ resource });

  } catch (error) {
    console.error('Get resource error:', error);
    return res.status(500).json({ message: 'Error retrieving resource' });
  }
};

/**
 * POST /api/resources/seed
 * Seed database with African resources (for demo)
 */
exports.seedResources = async (req, res) => {
  try {
    // Check if already seeded
    const count = await Resource.countDocuments();
    if (count > 0) {
      return res.json({ message: 'Resources already seeded', count });
    }

    const africanResources = [
      // Kenya
      {
        name: 'Gender Violence Recovery Centre',
        type: 'ngo',
        description: 'Comprehensive support for GBV survivors in Nairobi',
        phone: '+254 709 443 000',
        email: 'info@gvrc.or.ke',
        website: 'https://gvrc.or.ke',
        location: {
          country: 'Kenya',
          region: 'Nairobi',
          city: 'Nairobi',
          coordinates: { lat: -1.2921, lng: 36.8219 }
        },
        languages: ['English', 'Swahili'],
        hours: '24/7',
        isVerified: true,
        services: ['counseling', 'legal_aid', 'shelter', 'medical'],
        isFree: true,
        rating: 4.5,
        reviewCount: 45
      },
      {
        name: 'FIDA Kenya',
        type: 'legal_aid',
        description: 'Free legal aid for women and girls',
        phone: '+254 20 2730400',
        website: 'https://fidakenya.org',
        location: {
          country: 'Kenya',
          region: 'Nairobi',
          city: 'Nairobi',
          coordinates: { lat: -1.2864, lng: 36.8172 }
        },
        languages: ['English', 'Swahili'],
        hours: 'Mon-Fri 8AM-5PM',
        isVerified: true,
        services: ['legal_aid', 'advocacy'],
        isFree: true,
        rating: 4.7,
        reviewCount: 67
      },

      // Nigeria
      {
        name: 'Women at Risk International Foundation (WARIF)',
        type: 'ngo',
        description: 'Support for sexual assault survivors',
        phone: '+234 809 900 3310',
        email: 'info@warifng.org',
        website: 'https://warifng.org',
        location: {
          country: 'Nigeria',
          region: 'Lagos',
          city: 'Lagos',
          coordinates: { lat: 6.5244, lng: 3.3792 }
        },
        languages: ['English', 'Yoruba', 'Igbo', 'Hausa'],
        hours: '24/7 Hotline',
        isVerified: true,
        services: ['counseling', 'medical', 'legal_aid'],
        isFree: true,
        rating: 4.8,
        reviewCount: 120
      },
      {
        name: 'Mirabel Centre',
        type: 'hospital',
        description: 'Medical and counseling services for sexual assault',
        phone: '+234 903 000 9014',
        location: {
          country: 'Nigeria',
          region: 'Lagos',
          city: 'Lagos',
          coordinates: { lat: 6.5355, lng: 3.3087 }
        },
        languages: ['English', 'Yoruba'],
        hours: '24/7',
        isVerified: true,
        services: ['medical', 'counseling', 'forensic'],
        isFree: true,
        rating: 4.6,
        reviewCount: 89
      },

      // South Africa
      {
        name: 'Rape Crisis Cape Town Trust',
        type: 'ngo',
        description: 'Support and advocacy for rape survivors',
        phone: '+27 21 447 9762',
        website: 'https://rapecrisis.org.za',
        location: {
          country: 'South Africa',
          region: 'Western Cape',
          city: 'Cape Town',
          coordinates: { lat: -33.9249, lng: 18.4241 }
        },
        languages: ['English', 'Afrikaans', 'Xhosa'],
        hours: 'Mon-Fri 9AM-5PM',
        isVerified: true,
        services: ['counseling', 'legal_aid', 'advocacy'],
        isFree: true,
        rating: 4.9,
        reviewCount: 156
      },

      // Uganda
      {
        name: 'FIDA Uganda',
        type: 'legal_aid',
        description: 'Free legal services for women',
        phone: '+256 414 267 983',
        website: 'https://fidauganda.org',
        location: {
          country: 'Uganda',
          region: 'Kampala',
          city: 'Kampala',
          coordinates: { lat: 0.3476, lng: 32.5825 }
        },
        languages: ['English', 'Luganda'],
        hours: 'Mon-Fri 8AM-5PM',
        isVerified: true,
        services: ['legal_aid', 'advocacy'],
        isFree: true,
        rating: 4.4,
        reviewCount: 52
      },

      // Ghana
      {
        name: 'Domestic Violence and Victim Support Unit (DOVVSU)',
        type: 'police',
        description: 'Police unit for domestic violence cases',
        phone: '+233 191',
        location: {
          country: 'Ghana',
          region: 'Greater Accra',
          city: 'Accra',
          coordinates: { lat: 5.6037, lng: -0.1870 }
        },
        languages: ['English', 'Twi', 'Ga'],
        hours: '24/7',
        isVerified: true,
        services: ['police', 'emergency'],
        isFree: true,
        rating: 4.2,
        reviewCount: 34
      },

      // Tanzania
      {
        name: 'Tanzania Gender Networking Programme (TGNP)',
        type: 'ngo',
        description: 'Advocacy and support for women',
        phone: '+255 22 2153065',
        website: 'https://www.tgnp.org',
        location: {
          country: 'Tanzania',
          region: 'Dar es Salaam',
          city: 'Dar es Salaam',
          coordinates: { lat: -6.7924, lng: 39.2083 }
        },
        languages: ['English', 'Swahili'],
        hours: 'Mon-Fri 8AM-5PM',
        isVerified: true,
        services: ['advocacy', 'counseling'],
        isFree: true,
        rating: 4.3,
        reviewCount: 28
      },

      // Rwanda
      {
        name: 'Isange One Stop Centre',
        type: 'hospital',
        description: 'Comprehensive GBV services',
        phone: '+250 788 384 943',
        location: {
          country: 'Rwanda',
          region: 'Kigali',
          city: 'Kigali',
          coordinates: { lat: -1.9706, lng: 30.1044 }
        },
        languages: ['English', 'French', 'Kinyarwanda'],
        hours: '24/7',
        isVerified: true,
        services: ['medical', 'counseling', 'legal_aid', 'police'],
        isFree: true,
        rating: 4.7,
        reviewCount: 73
      }
    ];

    await Resource.insertMany(africanResources);

    return res.status(201).json({ 
      message: 'Resources seeded successfully',
      count: africanResources.length 
    });

  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({ message: 'Error seeding resources' });
  }
};