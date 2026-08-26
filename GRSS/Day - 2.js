// ============================================================
// KUALA LUMPUR VEGETATION AND URBAN CHANGE
// 1990 - 2025
// ============================================================
//
// OBJECTIVE:
// Examine vegetation and urban expansion around
// Kuala Lumpur using Landsat imagery.
//
// 1990  -> Landsat 5 TM
// 2025  -> Landsat 8 + Landsat 9
//
// MAIN ANALYSIS:
// 1. Create clean satellite composites
// 2. Calculate NDVI
// 3. Calculate NDBI
// 4. Calculate NDVI change
// 5. Calculate NDBI change
// 6. Detect significant vegetation loss
// 7. Detect significant built-up increase
// 8. Identify potential vegetation-to-urban conversion
// 9. Prepare layers for QGIS
//
// ============================================================


// ============================================================
// 1. STUDY AREA
// ============================================================

// Greater Kuala Lumpur study area.
// The larger area helps us detect urban expansion
// into surrounding vegetated areas.

var KL_ROI = ee.Geometry.Rectangle([
  101.50, 2.95,
  101.90, 3.40
]);


// Center the map on the study area.

Map.centerObject(
  KL_ROI,
  10
);


// Display the study area boundary.

Map.addLayer(
  KL_ROI,
  {color: 'red'},
  'Kuala Lumpur Study Area'
);


// ============================================================
// 2. LANDSAT 5 COLLECTION
// ============================================================

// Load Landsat 5 Collection 2 Level 2 data.

var landsat5 = ee.ImageCollection(
  'LANDSAT/LT05/C02/T1_L2'
);


// ============================================================
// 3. FIND LANDSAT 5 IMAGES FOR 1990
// ============================================================

var landsat1990 = landsat5
  .filterBounds(KL_ROI)
  .filterDate(
    '1990-01-01',
    '1991-01-01'
  );


// Print all available 1990 images.

print(
  'Landsat 5 images over Kuala Lumpur in 1990:',
  landsat1990
);


// Print number of available images.

print(
  'Number of 1990 Landsat images:',
  landsat1990.size()
);


// Print cloud cover of every image.

print(
  '1990 cloud cover:',
  landsat1990.aggregate_array(
    'CLOUD_COVER'
  )
);


// ============================================================
// 4. SELECT LOWER-CLOUD 1990 IMAGES
// ============================================================

// Keep images having less than 20% cloud cover.

var landsat1990Clean = landsat1990
  .filter(
    ee.Filter.lt(
      'CLOUD_COVER',
      20
    )
  );


// Print selected images.

print(
  '1990 images below 20% cloud cover:',
  landsat1990Clean
);


// Print number of selected images.

print(
  'Number of 1990 images below 20% cloud:',
  landsat1990Clean.size()
);


// Print selected cloud percentages.

print(
  'Selected 1990 cloud cover:',
  landsat1990Clean.aggregate_array(
    'CLOUD_COVER'
  )
);


// ============================================================
// 5. LANDSAT 5 CLOUD MASK FUNCTION
// ============================================================

function maskLandsat5(image) {

  // Select the quality-assurance band.

  var qa = image.select(
    'QA_PIXEL'
  );


  // QA_PIXEL bits:
  //
  // Bit 1 = Dilated cloud
  // Bit 3 = Cloud
  // Bit 4 = Cloud shadow
  // Bit 5 = Snow


  // Remove pixels affected by clouds,
  // cloud shadows and snow.

  var mask = qa
    .bitwiseAnd(1 << 1)
    .eq(0)

    .and(
      qa
        .bitwiseAnd(1 << 3)
        .eq(0)
    )

    .and(
      qa
        .bitwiseAnd(1 << 4)
        .eq(0)
    )

    .and(
      qa
        .bitwiseAnd(1 << 5)
        .eq(0)
    );


  // Apply the cloud mask.

  return image

    .updateMask(mask)


    // Select useful Landsat 5 bands.

    .select(
      [
        'SR_B1',
        'SR_B2',
        'SR_B3',
        'SR_B4',
        'SR_B5',
        'SR_B7'
      ],

      [
        'Blue',
        'Green',
        'Red',
        'NIR',
        'SWIR1',
        'SWIR2'
      ]
    )


    // Convert Landsat stored values
    // into surface reflectance.

    .multiply(0.0000275)
    .add(-0.2);
}


// ============================================================
// 6. CREATE CLEAN 1990 COMPOSITE
// ============================================================

// Apply the cloud mask to all selected images,
// combine them using the median,
// and clip to the study area.

var clean1990 = landsat1990Clean
  .map(maskLandsat5)
  .median()
  .clip(KL_ROI);


// ============================================================
// 7. DISPLAY CLEAN 1990 RGB
// ============================================================

Map.addLayer(
  clean1990,
  {
    bands: [
      'Red',
      'Green',
      'Blue'
    ],

    min: 0.03,
    max: 0.35
  },

  'Kuala Lumpur 1990 CLEAN RGB'
);


// ============================================================
// 8. LANDSAT 8 COLLECTION
// ============================================================

var landsat8 = ee.ImageCollection(
  'LANDSAT/LC08/C02/T1_L2'
);


// ============================================================
// 9. LANDSAT 9 COLLECTION
// ============================================================

var landsat9 = ee.ImageCollection(
  'LANDSAT/LC09/C02/T1_L2'
);


// ============================================================
// 10. COMBINE LANDSAT 8 + LANDSAT 9
// ============================================================

var landsat89 = landsat8.merge(
  landsat9
);


// ============================================================
// 11. FIND LANDSAT 8/9 IMAGES FOR 2025
// ============================================================

var landsat2025 = landsat89
  .filterBounds(KL_ROI)
  .filterDate(
    '2025-01-01',
    '2026-01-01'
  );


// Print all 2025 images.

print(
  'Landsat 8/9 images over Kuala Lumpur in 2025:',
  landsat2025
);


// Print number of images.

print(
  'Number of 2025 Landsat images:',
  landsat2025.size()
);


// Print cloud cover.

print(
  '2025 cloud cover:',
  landsat2025.aggregate_array(
    'CLOUD_COVER'
  )
);


// ============================================================
// 12. SELECT LOWER-CLOUD 2025 IMAGES
// ============================================================

// Keep images with less than 20% cloud cover.

var landsat2025Clean = landsat2025
  .filter(
    ee.Filter.lt(
      'CLOUD_COVER',
      20
    )
  );


// Print selected images.

print(
  '2025 images below 20% cloud cover:',
  landsat2025Clean
);


// Print number of selected images.

print(
  'Number of 2025 images below 20% cloud:',
  landsat2025Clean.size()
);


// Print selected cloud percentages.

print(
  'Selected 2025 cloud cover:',
  landsat2025Clean.aggregate_array(
    'CLOUD_COVER'
  )
);


// ============================================================
// 13. LANDSAT 8/9 CLOUD MASK FUNCTION
// ============================================================

function maskLandsat89(image) {

  // Select quality-assurance band.

  var qa = image.select(
    'QA_PIXEL'
  );


  // QA_PIXEL bits:
  //
  // Bit 1 = Dilated cloud
  // Bit 2 = Cirrus
  // Bit 3 = Cloud
  // Bit 4 = Cloud shadow
  // Bit 5 = Snow


  // Create cloud-free mask.

  var mask = qa

    .bitwiseAnd(1 << 1)
    .eq(0)

    .and(
      qa
        .bitwiseAnd(1 << 2)
        .eq(0)
    )

    .and(
      qa
        .bitwiseAnd(1 << 3)
        .eq(0)
    )

    .and(
      qa
        .bitwiseAnd(1 << 4)
        .eq(0)
    )

    .and(
      qa
        .bitwiseAnd(1 << 5)
        .eq(0)
    );


  // Apply mask and rename bands.

  return image

    .updateMask(mask)


    .select(
      [
        'SR_B2',
        'SR_B3',
        'SR_B4',
        'SR_B5',
        'SR_B6',
        'SR_B7'
      ],

      [
        'Blue',
        'Green',
        'Red',
        'NIR',
        'SWIR1',
        'SWIR2'
      ]
    )


    // Surface reflectance scaling.

    .multiply(0.0000275)
    .add(-0.2);
}


// ============================================================
// 14. CREATE CLEAN 2025 COMPOSITE
// ============================================================

var clean2025 = landsat2025Clean
  .map(maskLandsat89)
  .median()
  .clip(KL_ROI);


// ============================================================
// 15. DISPLAY CLEAN 2025 RGB
// ============================================================

Map.addLayer(
  clean2025,
  {
    bands: [
      'Red',
      'Green',
      'Blue'
    ],

    min: 0.03,
    max: 0.35
  },

  'Kuala Lumpur 2025 CLEAN RGB'
);


// ============================================================
// 16. NDVI 1990
// ============================================================
//
// NDVI = (NIR - Red) / (NIR + Red)
//
// Higher NDVI generally indicates more vegetation.
// Lower NDVI generally indicates less vegetation,
// bare surfaces or built-up areas.
//

var ndvi1990 = clean1990
  .normalizedDifference([
    'NIR',
    'Red'
  ])
  .rename('NDVI_1990');


// Display NDVI 1990.

Map.addLayer(
  ndvi1990,
  {
    min: -0.2,
    max: 0.8,
    palette: [
      'brown',
      'yellow',
      'lightgreen',
      'green'
    ]
  },
  'Kuala Lumpur NDVI 1990'
);


// ============================================================
// 17. NDVI 2025
// ============================================================

var ndvi2025 = clean2025
  .normalizedDifference([
    'NIR',
    'Red'
  ])
  .rename('NDVI_2025');


// Display NDVI 2025.

Map.addLayer(
  ndvi2025,
  {
    min: -0.2,
    max: 0.8,
    palette: [
      'brown',
      'yellow',
      'lightgreen',
      'green'
    ]
  },
  'Kuala Lumpur NDVI 2025'
);


// ============================================================
// 18. NDVI CHANGE 1990 - 2025
// ============================================================
//
// Positive values:
// vegetation increased
//
// Negative values:
// vegetation decreased
//

var ndviChange = ndvi2025
  .subtract(ndvi1990)
  .rename('NDVI_Change');


// Display NDVI change.

Map.addLayer(
  ndviChange,
  {
    min: -0.5,
    max: 0.5,
    palette: [
      'red',
      'white',
      'green'
    ]
  },
  'NDVI Change 1990-2025'
);


// ============================================================
// 19. NDBI 1990
// ============================================================
//
// NDBI = (SWIR - NIR) / (SWIR + NIR)
//
// Higher NDBI generally indicates stronger
// built-up characteristics.
//

var ndbi1990 = clean1990
  .normalizedDifference([
    'SWIR1',
    'NIR'
  ])
  .rename('NDBI_1990');


// Display NDBI 1990.

Map.addLayer(
  ndbi1990,
  {
    min: -0.5,
    max: 0.5,
    palette: [
      'green',
      'white',
      'red'
    ]
  },
  'Kuala Lumpur NDBI 1990'
);


// ============================================================
// 20. NDBI 2025
// ============================================================

var ndbi2025 = clean2025
  .normalizedDifference([
    'SWIR1',
    'NIR'
  ])
  .rename('NDBI_2025');


// Display NDBI 2025.

Map.addLayer(
  ndbi2025,
  {
    min: -0.5,
    max: 0.5,
    palette: [
      'green',
      'white',
      'red'
    ]
  },
  'Kuala Lumpur NDBI 2025'
);


// ============================================================
// 21. NDBI CHANGE 1990 - 2025
// ============================================================
//
// Positive NDBI change:
// increase in built-up characteristics
//
// Negative NDBI change:
// decrease in built-up characteristics
//

var ndbiChange = ndbi2025
  .subtract(ndbi1990)
  .rename('NDBI_Change');


// Display NDBI change.

Map.addLayer(
  ndbiChange,
  {
    min: -0.5,
    max: 0.5,
    palette: [
      'blue',
      'white',
      'red'
    ]
  },
  'NDBI Change 1990-2025'
);


// ============================================================
// 22. SIGNIFICANT VEGETATION LOSS
// ============================================================
//
// Here we identify areas where NDVI decreased
// substantially between 1990 and 2025.
//
// Threshold = NDVI decrease greater than 0.2.
//

var significantVegetationLoss =
  ndviChange.lt(-0.2);


// Display vegetation loss.

Map.addLayer(
  significantVegetationLoss.selfMask(),
  {
    palette: [
      'red'
    ]
  },
  'Significant Vegetation Loss'
);


// ============================================================
// 23. SIGNIFICANT BUILT-UP INCREASE
// ============================================================
//
// Here we identify areas where NDBI increased
// substantially between 1990 and 2025.
//
// Threshold = NDBI increase greater than 0.2.
//

var significantBuiltUpIncrease =
  ndbiChange.gt(0.2);


// Display built-up increase.

Map.addLayer(
  significantBuiltUpIncrease.selfMask(),
  {
    palette: [
      'blue'
    ]
  },
  'Significant Built-up Increase'
);


// ============================================================
// 24. POTENTIAL VEGETATION TO URBAN CONVERSION
// ============================================================
//
// An area is flagged when:
//
// 1. Vegetation decreased significantly
// AND
// 2. Built-up characteristics increased significantly
//
// This is a screening layer.
// It does NOT prove that every pixel was converted
// from vegetation to urban land.
//

var potentialUrbanConversion =
  significantVegetationLoss
    .and(
      significantBuiltUpIncrease
    );


// Display potential conversion.

Map.addLayer(
  potentialUrbanConversion.selfMask(),
  {
    palette: [
      'red'
    ]
  },
  'Potential Vegetation to Urban Conversion'
);


// ============================================================
// 25. PRINT FINAL ANALYSIS LAYERS
// ============================================================

print(
  'NDVI 1990:',
  ndvi1990
);

print(
  'NDVI 2025:',
  ndvi2025
);

print(
  'NDVI Change 1990-2025:',
  ndviChange
);

print(
  'NDBI 1990:',
  ndbi1990
);

print(
  'NDBI 2025:',
  ndbi2025
);

print(
  'NDBI Change 1990-2025:',
  ndbiChange
);

print(
  'Significant Vegetation Loss:',
  significantVegetationLoss
);

print(
  'Significant Built-up Increase:',
  significantBuiltUpIncrease
);

print(
  'Potential Vegetation to Urban Conversion:',
  potentialUrbanConversion
);


// ============================================================
// 26. DIRECT DOWNLOADS FOR QGIS
// ============================================================
//
// IMPORTANT:
//
// Earth Engine has a size limit for direct downloads.
//
// Therefore, the RGB composites are converted to UInt16
// and multiplied by 10,000.
//
// This keeps the three RGB bands together in ONE GeoTIFF
// while reducing the file size.
//
// CRS:
// EPSG:32647
//
// Resolution:
// 30 metres
//
// ============================================================


// ============================================================
// 26A. 1990 RGB - ONE GEO-TIFF
// ============================================================

var rgb1990 = clean1990
  .select([
    'Red',
    'Green',
    'Blue'
  ])
  .clamp(0, 1)
  .multiply(10000)
  .toUint16();


print(
  'DOWNLOAD 1990 RGB',
  rgb1990.getDownloadURL({

    name: 'KL_1990_RGB',

    region: KL_ROI,

    scale: 30,

    crs: 'EPSG:32647',

    format: 'GEO_TIFF',

    filePerBand: false

  })
);


// ============================================================
// 26B. 2025 RGB - ONE GEO-TIFF
// ============================================================

var rgb2025 = clean2025
  .select([
    'Red',
    'Green',
    'Blue'
  ])
  .clamp(0, 1)
  .multiply(10000)
  .toUint16();


print(
  'DOWNLOAD 2025 RGB',
  rgb2025.getDownloadURL({

    name: 'KL_2025_RGB',

    region: KL_ROI,

    scale: 30,

    crs: 'EPSG:32647',

    format: 'GEO_TIFF',

    filePerBand: false

  })
);


// ============================================================
// 26C. NDVI 1990
// ============================================================

print(
  'DOWNLOAD NDVI 1990',

  ndvi1990.getDownloadURL({

    name: 'KL_NDVI_1990',

    region: KL_ROI,

    scale: 30,

    crs: 'EPSG:32647',

    format: 'GEO_TIFF'

  })
);


// ============================================================
// 26D. NDVI 2025
// ============================================================

print(
  'DOWNLOAD NDVI 2025',

  ndvi2025.getDownloadURL({

    name: 'KL_NDVI_2025',

    region: KL_ROI,

    scale: 30,

    crs: 'EPSG:32647',

    format: 'GEO_TIFF'

  })
);


// ============================================================
// 26E. NDVI CHANGE
// ============================================================

print(
  'DOWNLOAD NDVI CHANGE',

  ndviChange.getDownloadURL({

    name: 'KL_NDVI_change',

    region: KL_ROI,

    scale: 30,

    crs: 'EPSG:32647',

    format: 'GEO_TIFF'

  })
);


// ============================================================
// 26F. NDBI 1990
// ============================================================

print(
  'DOWNLOAD NDBI 1990',

  ndbi1990.getDownloadURL({

    name: 'KL_NDBI_1990',

    region: KL_ROI,

    scale: 30,

    crs: 'EPSG:32647',

    format: 'GEO_TIFF'

  })
);


// ============================================================
// 26G. NDBI 2025
// ============================================================

print(
  'DOWNLOAD NDBI 2025',

  ndbi2025.getDownloadURL({

    name: 'KL_NDBI_2025',

    region: KL_ROI,

    scale: 30,

    crs: 'EPSG:32647',

    format: 'GEO_TIFF'

  })
);


// ============================================================
// 26H. NDBI CHANGE
// ============================================================

print(
  'DOWNLOAD NDBI CHANGE',

  ndbiChange.getDownloadURL({

    name: 'KL_NDBI_change',

    region: KL_ROI,

    scale: 30,

    crs: 'EPSG:32647',

    format: 'GEO_TIFF'

  })
);


// ============================================================
// 26I. SIGNIFICANT VEGETATION LOSS
// ============================================================

print(
  'DOWNLOAD VEGETATION LOSS',

  significantVegetationLoss
    .selfMask()
    .toByte()
    .getDownloadURL({

      name: 'KL_vegetation_loss',

      region: KL_ROI,

      scale: 30,

      crs: 'EPSG:32647',

      format: 'GEO_TIFF'

    })
);


// ============================================================
// 26J. SIGNIFICANT BUILT-UP INCREASE
// ============================================================

print(
  'DOWNLOAD BUILT-UP INCREASE',

  significantBuiltUpIncrease
    .selfMask()
    .toByte()
    .getDownloadURL({

      name: 'KL_builtup_increase',

      region: KL_ROI,

      scale: 30,

      crs: 'EPSG:32647',

      format: 'GEO_TIFF'

    })
);


// ============================================================
// 26K. POTENTIAL VEGETATION TO URBAN CONVERSION
// ============================================================

print(
  'DOWNLOAD POTENTIAL URBAN CONVERSION',

  potentialUrbanConversion
    .selfMask()
    .toByte()
    .getDownloadURL({

      name: 'KL_urban_conversion',

      region: KL_ROI,

      scale: 30,

      crs: 'EPSG:32647',

      format: 'GEO_TIFF'

    })
);


// ============================================================
// 27. FINAL CHECKS
// ============================================================

print(
  'Final 1990 clean composite:',
  clean1990
);

print(
  'Final 2025 clean composite:',
  clean2025
);

print(
  'Final NDVI change:',
  ndviChange
);

print(
  'Final NDBI change:',
  ndbiChange
);

print(
  'Final potential urban conversion:',
  potentialUrbanConversion
);


// ============================================================
// END OF KUALA LUMPUR ANALYSIS
// ============================================================

