var ROI = ee.Geometry.Polygon([
  [
    [72.671736, 31.975039],  // Top Left
    [72.732983, 31.981686],  // Top Right
    [72.729194, 31.946222],  // Bottom Right
    [72.677297, 31.938739],  // Bottom Left
    [72.671736, 31.975039]   // Close polygon
  ]
]);

Map.centerObject(ROI, 14);
Map.addLayer(ROI, {color: 'red'}, 'ROI');


// IMAGE FINDING 


var landsat5 = ee.ImageCollection(
  'LANDSAT/LT05/C02/T1_L2'
);


var landsat1990 = landsat5
  .filterBounds(ROI)
  .filterDate(
    '1990-01-01',
    '1991-01-01'
  );

print(
  'Landsat 5 images over ROI in 1990:',
  landsat1990
);

print(
  'Number of 1990 Landsat images:',
  landsat1990.size()
);

print(
  '1990 cloud cover:',
  landsat1990.aggregate_array('CLOUD_COVER')
);


var landsat1990Clean = landsat1990
  .filter(
    ee.Filter.lt(
      'CLOUD_COVER',
      20
    )
  );

print(
  '1990 images below 20% cloud cover:',
  landsat1990Clean
);

print(
  'Number of 1990 images below 20% cloud:',
  landsat1990Clean.size()
);

print(
  'Selected 1990 cloud cover:',
  landsat1990Clean.aggregate_array('CLOUD_COVER')
);


function maskLandsat5(image) {

  var qa = image.select('QA_PIXEL');

  // QA_PIXEL bits:
  //
  // Bit 1 = Dilated cloud
  // Bit 3 = Cloud
  // Bit 4 = Cloud shadow
  // Bit 5 = Snow

  var mask = qa
    .bitwiseAnd(1 << 1)
    .eq(0)
    .and(
      qa.bitwiseAnd(1 << 3).eq(0)
    )
    .and(
      qa.bitwiseAnd(1 << 4).eq(0)
    )
    .and(
      qa.bitwiseAnd(1 << 5).eq(0)
    );

  return image
    .updateMask(mask)

    // Keep useful Landsat 5 bands
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

    // Landsat Collection 2 Level 2
    // surface reflectance scaling
    .multiply(0.0000275)
    .add(-0.2);
}



var clean1990 = landsat1990Clean
  .map(maskLandsat5)
  .median()
  .clip(ROI);

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
  'ROI 1990 CLEAN RGB'
);



// 2015



var sentinel2015 = ee.ImageCollection(
  'COPERNICUS/S2_HARMONIZED'
);


var sentinel2015Images = sentinel2015
  .filterBounds(ROI)
  .filterDate(
    '2015-06-27',
    '2016-01-01'
  );

print(
  'Sentinel-2 images over ROI in 2015:',
  sentinel2015Images
);

print(
  'Number of 2015 Sentinel-2 images:',
  sentinel2015Images.size()
);

print(
  '2015 cloud cover:',
  sentinel2015Images.aggregate_array(
    'CLOUDY_PIXEL_PERCENTAGE'
  )
);


var sentinel2015Clean = sentinel2015Images
  .filter(
    ee.Filter.lt(
      'CLOUDY_PIXEL_PERCENTAGE',
      20
    )
  );

print(
  '2015 Sentinel-2 images below 20% cloud cover:',
  sentinel2015Clean
);

print(
  'Number of 2015 images below 20% cloud:',
  sentinel2015Clean.size()
);

print(
  'Selected 2015 cloud cover:',
  sentinel2015Clean.aggregate_array(
    'CLOUDY_PIXEL_PERCENTAGE'
  )
);


function maskSentinel2015(image) {

  var qa = image.select('QA60');

  // QA60 bits:
  //
  // Bit 10 = Cloud
  // Bit 11 = Cirrus

  var mask = qa
    .bitwiseAnd(1 << 10)
    .eq(0)
    .and(
      qa.bitwiseAnd(1 << 11).eq(0)
    );

  return image
    .updateMask(mask)

    // Keep useful Sentinel-2 bands
    .select(
      [
        'B2',
        'B3',
        'B4',
        'B8',
        'B11',
        'B12'
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

    // Sentinel-2 reflectance scaling
    .divide(10000);
}



var clean2015 = sentinel2015Clean
  .map(maskSentinel2015)
  .median()
  .clip(ROI);

Map.addLayer(
  clean2015,
  {
    bands: [
      'Red',
      'Green',
      'Blue'
    ],
    min: 0.03,
    max: 0.35
  },
  'ROI 2015 SENTINEL-2 CLEAN RGB'
);


// 2025



var sentinel2025 = ee.ImageCollection(
  'COPERNICUS/S2_HARMONIZED'
);


var sentinel2025Images = sentinel2025
  .filterBounds(ROI)
  .filterDate(
    '2025-01-01',
    '2026-01-01'
  );

print(
  'Sentinel-2 images over ROI in 2025:',
  sentinel2025Images
);

print(
  'Number of 2025 Sentinel-2 images:',
  sentinel2025Images.size()
);

print(
  '2025 cloud cover:',
  sentinel2025Images.aggregate_array(
    'CLOUDY_PIXEL_PERCENTAGE'
  )
);


var sentinel2025Clean = sentinel2025Images
  .filter(
    ee.Filter.lt(
      'CLOUDY_PIXEL_PERCENTAGE',
      20
    )
  );

print(
  '2025 Sentinel-2 images below 20% cloud cover:',
  sentinel2025Clean
);

print(
  'Number of 2025 images below 20% cloud:',
  sentinel2025Clean.size()
);

print(
  'Selected 2025 cloud cover:',
  sentinel2025Clean.aggregate_array(
    'CLOUDY_PIXEL_PERCENTAGE'
  )
);


function maskSentinel2025(image) {

  var qa = image.select('QA60');

  // QA60 bits:
  //
  // Bit 10 = Cloud
  // Bit 11 = Cirrus

  var mask = qa
    .bitwiseAnd(1 << 10)
    .eq(0)
    .and(
      qa.bitwiseAnd(1 << 11).eq(0)
    );

  return image
    .updateMask(mask)

    // Keep useful Sentinel-2 bands
    .select(
      [
        'B2',
        'B3',
        'B4',
        'B8',
        'B11',
        'B12'
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

    // Sentinel-2 reflectance scaling
    .divide(10000);
}



var clean2025 = sentinel2025Clean
  .map(maskSentinel2025)
  .median()
  .clip(ROI);

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
  'ROI 2025 SENTINEL-2 CLEAN RGB'
);




// ==========================================
// NDVI 1990
// ==========================================

var ndvi1990 = clean1990
  .normalizedDifference([
    'NIR',
    'Red'
  ])
  .rename('NDVI_1990');


// ==========================================
// NDVI 2015
// ==========================================

var ndvi2015 = clean2015
  .normalizedDifference([
    'NIR',
    'Red'
  ])
  .rename('NDVI_2015');


// ==========================================
// NDVI 2025
// ==========================================

var ndvi2025 = clean2025
  .normalizedDifference([
    'NIR',
    'Red'
  ])
  .rename('NDVI_2025');


// ==========================================
// NDVI VISUALIZATION
// ==========================================

var ndviVis = {
  min: -0.2,
  max: 0.8,
  palette: [
    'brown',
    'yellow',
    'lightgreen',
    'green',
    'darkgreen'
  ]
};


// ==========================================
// DISPLAY ALL THREE
// ==========================================

Map.addLayer(
  ndvi1990,
  ndviVis,
  'ROI NDVI 1990'
);

Map.addLayer(
  ndvi2015,
  ndviVis,
  'ROI NDVI 2015'
);

Map.addLayer(
  ndvi2025,
  ndviVis,
  'ROI NDVI 2025'
);